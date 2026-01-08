# PLAN: Live Inline Editor pre Partner Stranky

## Datum vytvorenia: 2025-12-20
## Status: PRIPRAVENE NA IMPLEMENTACIU

---

## 1. ANALYZA AKTUALNEHO STAVU

### 1.1 Demo Inline Editor (funkcny)
**Lokacia:** `/app/demo/inline-editor/page.tsx`

**Komponenty:**
| Komponent | Subor | Ucel |
|-----------|-------|------|
| `InlineEditorProvider` | `/src/components/inline-editor/InlineEditorProvider.tsx` | Context provider, state management |
| `EditableField` | `/src/components/inline-editor/EditableField.tsx` | Wrapper pre editovatelne elementy |
| `EditorDrawer` | `/src/components/inline-editor/EditorDrawer.tsx` | Slideover panel pre editaciu textu |
| `ImageCropEditor` | `/src/components/inline-editor/ImageCropEditor.tsx` | Editor hero obrazka (zoom, pozicia) |
| `GalleryEditor` | `/src/components/inline-editor/GalleryEditor.tsx` | Sprava galerie obrazkov |
| `ServiceTagsEditor` | `/src/components/inline-editor/ServiceTagsEditor.tsx` | Editor sluzieb (tagy) |
| `ButtonLinksEditor` | `/src/components/inline-editor/ButtonLinksEditor.tsx` | Editor kontaktnych tlacidiel |
| `FloatingAdminBar` | `/src/components/inline-editor/FloatingAdminBar.tsx` | Plovuci panel s akciami |

**Limitacie aktualneho stavu:**
- Zmeny sa ukladaju len do React state (in-memory)
- Po refreshi stranky sa vsetko strati
- Nepouziva realne API volania
- Obraky su len lokalne URL (bez uploadu)

### 1.2 Existujuci Partner Portal
**Lokacia:** `/app/partner/*`

**Architektura:**
```
/partner/login          -> Prihlasenie (Supabase Auth magic link)
/partner/page.tsx       -> Dashboard s listom partnerskych taxisluzieb
/partner/edit/[slug]    -> Tradicny formularovy editor (PartnerEditor)
```

**PartnerEditor Features:**
- 4 taby: Zakladne info, Hero sekcia, Galeria, Socialne siete
- Upload obrazkov do Supabase Storage
- Ukladanie do `partner_drafts` tabulky
- Publikovanie zmien (status: approved)
- Revalidacia stranky po publikovani

### 1.3 Produkcne Stranky
**Lokacia:** `/app/taxi/[...slug]/page.tsx`

**Typy stránok:**
- `/taxi/[citySlug]` - Zoznam taxisluzieb v meste
- `/taxi/[citySlug]/[serviceSlug]` - Detail taxisluzby (PARTNER STRANKA)

**Partner stranka aktualne:**
```tsx
// Riadok 1269
const approvedData = await getApprovedPartnerData(serviceSlug);

// Merguje data z cities.json s approved datami zo Supabase
const mergedGallery = approvedData?.gallery || service.gallery;
const heroImage = approvedData?.hero_image_url || partnerData?.heroImage;
// ... atd
```

### 1.4 Databazova Schema (existujuca)

**Tabulka `partners`:**
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Tabulka `partner_drafts`:**
```sql
CREATE TABLE partner_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending, approved, rejected

  -- Editovatelne polia
  company_name TEXT,
  description TEXT,
  show_description BOOLEAN DEFAULT true,
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Hero sekcia
  hero_image_url TEXT,
  hero_image_zoom INTEGER DEFAULT 100,
  hero_image_pos_x INTEGER DEFAULT 50,
  hero_image_pos_y INTEGER DEFAULT 50,
  hero_title TEXT,
  hero_subtitle TEXT,

  -- Banner
  banner_title TEXT,
  banner_subtitle TEXT,

  -- Sluzby a vozidla
  services TEXT[], -- pole stringov
  show_services BOOLEAN DEFAULT false,
  vehicles TEXT[],

  -- Ceny
  prices JSONB, -- [{destination, price, note}]

  -- Galeria
  gallery TEXT[], -- pole URL

  -- Socialne siete
  social_facebook TEXT,
  social_instagram TEXT,

  -- Schvalovanie
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policy + RPC Funkcia:**
```sql
-- Funkcia pre citanie approved dat (bypasses RLS)
CREATE OR REPLACE FUNCTION get_approved_partner_data(p_slug TEXT)
RETURNS TABLE(...)
SECURITY DEFINER
AS $$
  SELECT ... FROM partner_drafts pd
  JOIN partners p ON p.id = pd.partner_id
  WHERE p.slug = p_slug AND pd.status = 'approved'
$$;
```

### 1.5 Supabase Storage
**Bucket:** `partner-images`
**Struktura:** `{user_id}/{type}-{timestamp}-{randomId}.webp`
**Typy:** hero, logo, gallery
**Thumbnail:** `{user_id}/{type}-{timestamp}-{randomId}-thumb.webp`

---

## 2. NAVRHOVANA ARCHITEKTURA

### 2.1 High-Level Overview

```
+-------------------+     +------------------+     +------------------+
|   Partner Page    |     |   API Routes     |     |    Supabase      |
|   /taxi/[slug]    |---->| /api/partner/*   |---->|   - Auth         |
|                   |     |                  |     |   - Database     |
| InlineEditor      |     | - save-draft     |     |   - Storage      |
| Provider          |     | - publish        |     |                  |
+-------------------+     | - upload-image   |     +------------------+
        ^                 +------------------+
        |
        | isOwner=true
        |
+-------------------+
|   Supabase Auth   |
|   (magic link)    |
+-------------------+
```

### 2.2 Data Flow

```
1. ZOBRAZENIE STRANKY
   User otvori /taxi/brezno/rst-taxi
   -> Server zisti ci je user prihlaseny
   -> Server zisti ci user vlastni partnera (user_id match)
   -> Ak ano: isOwner=true, nacita draft data
   -> Ak nie: isOwner=false, nacita approved data

2. EDITACIA (isOwner=true)
   User klikne na editovatelny element
   -> InlineEditorProvider otvori EditorDrawer
   -> User upravi hodnotu
   -> Klikne "Ulozit"
   -> API POST /api/partner/inline-edit/save
   -> Uklada do partner_drafts (status: draft)
   -> Lokalne sa aktualizuje React state

3. PUBLIKOVANIE
   User klikne "Publikovat zmeny" vo FloatingAdminBar
   -> API POST /api/partner/inline-edit/publish
   -> Aktualizuje partner_drafts (status: approved)
   -> Revaliduje stranku (revalidatePath)
   -> Zmeny su viditelne pre vsetkych
```

---

## 3. POTREBNE ZMENY - DETAILNY ROZPIS

### 3.1 Rozsirenie DraftData Interface

**Subor:** `/src/components/inline-editor/InlineEditorProvider.tsx`

**Aktualne:**
```typescript
export interface DraftData {
  company_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  services_description: string;
  [key: string]: string;
}
```

**Navrhované rozšírenie:**
```typescript
export interface DraftData {
  // Identifikacia
  partner_id: string;
  draft_id: string | null;

  // Zakladne info
  company_name: string;
  description: string;
  show_description: boolean;
  phone: string;
  email: string;
  website: string;

  // Hero sekcia
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  hero_image_zoom: number;
  hero_image_pos_x: number;
  hero_image_pos_y: number;

  // Sluzby
  services: string[];
  show_services: boolean;
  services_description: string;

  // Galeria
  gallery: string[];

  // Kontaktne tlacidla
  button_links: {
    whatsapp?: string;
    booking_url?: string;
    pricelist_url?: string;
    transport_rules_url?: string;
    contact_url?: string;
  };

  // Social
  social_facebook: string;
  social_instagram: string;

  // Metadata
  status: 'draft' | 'approved';
  updated_at: string;
}
```

### 3.2 Nove API Routes

#### 3.2.1 GET /api/partner/inline-edit/draft/[slug]
**Ucel:** Nacitanie draft dat pre vlastnika

**Request:**
```
GET /api/partner/inline-edit/draft/rst-taxi-podbrezova
Authorization: Bearer {supabase_session}
```

**Response:**
```json
{
  "success": true,
  "draft": {
    "id": "uuid",
    "partner_id": "uuid",
    "company_name": "R.S.T. Taxi",
    "description": "...",
    "hero_image_url": "https://...",
    "gallery": ["url1", "url2"],
    "services": ["Nonstop", "Platba kartou"],
    "status": "draft",
    "updated_at": "2025-12-20T10:00:00Z"
  },
  "isOwner": true
}
```

**Implementacia:**
```typescript
// /app/api/partner/inline-edit/draft/[slug]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // Overenie autentifikacie
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Nacitanie partnera + overenie vlastnictva
  const { data: partner, error } = await supabase
    .from('partners')
    .select('*, partner_drafts(*)')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single();

  if (error || !partner) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  // Najdi najnovsi draft
  const drafts = partner.partner_drafts || [];
  const latestDraft = drafts.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0];

  return NextResponse.json({
    success: true,
    draft: latestDraft,
    isOwner: true,
    partner: {
      id: partner.id,
      name: partner.name,
      slug: partner.slug,
      city_slug: partner.city_slug
    }
  });
}
```

#### 3.2.2 POST /api/partner/inline-edit/save
**Ucel:** Ulozenie zmeny jedneho alebo viacerych poli

**Request:**
```json
POST /api/partner/inline-edit/save
{
  "partner_id": "uuid",
  "draft_id": "uuid | null",
  "changes": {
    "company_name": "Novy nazov",
    "hero_image_url": "https://...",
    "hero_image_zoom": 120,
    "hero_image_pos_x": 45,
    "hero_image_pos_y": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "draft_id": "uuid",
  "updated_at": "2025-12-20T10:05:00Z"
}
```

**Implementacia:**
```typescript
// /app/api/partner/inline-edit/save/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { partner_id, draft_id, changes } = body;

  // Overenie vlastnictva
  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('id', partner_id)
    .eq('user_id', user.id)
    .single();

  if (!partner) {
    return NextResponse.json({ error: 'Not owner' }, { status: 403 });
  }

  // Whitelist povolených polí
  const allowedFields = [
    'company_name', 'description', 'show_description',
    'phone', 'email', 'website',
    'hero_title', 'hero_subtitle',
    'hero_image_url', 'hero_image_zoom', 'hero_image_pos_x', 'hero_image_pos_y',
    'services', 'show_services',
    'gallery',
    'social_facebook', 'social_instagram'
  ];

  const sanitizedChanges = Object.fromEntries(
    Object.entries(changes).filter(([key]) => allowedFields.includes(key))
  );

  let result;
  if (draft_id) {
    // Update existujuci draft
    result = await supabase
      .from('partner_drafts')
      .update({
        ...sanitizedChanges,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', draft_id)
      .eq('partner_id', partner_id)
      .select('id, updated_at')
      .single();
  } else {
    // Vytvor novy draft
    result = await supabase
      .from('partner_drafts')
      .insert({
        partner_id,
        ...sanitizedChanges,
        status: 'draft'
      })
      .select('id, updated_at')
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    draft_id: result.data.id,
    updated_at: result.data.updated_at
  });
}
```

#### 3.2.3 POST /api/partner/inline-edit/publish
**Ucel:** Publikovanie zmien (approved status)

**Request:**
```json
POST /api/partner/inline-edit/publish
{
  "partner_id": "uuid",
  "draft_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "revalidated": true
}
```

**Implementacia:**
```typescript
// /app/api/partner/inline-edit/publish/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partner_id, draft_id } = await request.json();

  // Overenie vlastnictva + nacitanie partnera
  const { data: partner } = await supabase
    .from('partners')
    .select('id, slug, city_slug')
    .eq('id', partner_id)
    .eq('user_id', user.id)
    .single();

  if (!partner) {
    return NextResponse.json({ error: 'Not owner' }, { status: 403 });
  }

  // Aktualizacia statusu na approved
  const { error } = await supabase
    .from('partner_drafts')
    .update({
      status: 'approved',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString() // Self-approved
    })
    .eq('id', draft_id)
    .eq('partner_id', partner_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Revalidacia stranky
  revalidatePath(`/taxi/${partner.city_slug}/${partner.slug}`);

  return NextResponse.json({
    success: true,
    revalidated: true
  });
}
```

### 3.3 Modifikacia InlineEditorProvider

**Subor:** `/src/components/inline-editor/InlineEditorProvider.tsx`

**Nove props:**
```typescript
interface InlineEditorProviderProps {
  children: ReactNode;
  initialData: Partial<DraftData>;
  isOwner: boolean;
  // NOVE:
  partnerId?: string;
  partnerSlug?: string;
  citySlug?: string;
  onSaveSuccess?: (draftId: string) => void;
  onPublishSuccess?: () => void;
}
```

**Implementacia API volani:**
```typescript
export function InlineEditorProvider({
  children,
  initialData,
  isOwner,
  partnerId,
  partnerSlug,
  citySlug,
  onSaveSuccess,
  onPublishSuccess
}: InlineEditorProviderProps) {
  const [draftId, setDraftId] = useState<string | null>(initialData.draft_id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced auto-save
  const saveChanges = useCallback(async (changes: Partial<DraftData>) => {
    if (!partnerId) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/partner/inline-edit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          draft_id: draftId,
          changes
        })
      });

      const result = await response.json();

      if (result.success) {
        setDraftId(result.draft_id);
        setLastSaved(new Date(result.updated_at));
        onSaveSuccess?.(result.draft_id);
      }
    } catch (error) {
      console.error('[InlineEditor] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [partnerId, draftId, onSaveSuccess]);

  // Publikovanie
  const publishChanges = useCallback(async () => {
    if (!partnerId || !draftId) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/partner/inline-edit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          draft_id: draftId
        })
      });

      const result = await response.json();

      if (result.success) {
        onPublishSuccess?.();
        // Refresh page to show published version
        window.location.reload();
      }
    } catch (error) {
      console.error('[InlineEditor] Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [partnerId, draftId, onPublishSuccess]);

  // ... rest of implementation
}
```

### 3.4 Integrácia do Produkčných Stránok

**Subor:** `/app/taxi/[...slug]/page.tsx`

**Zmeny v ServicePage funkcii (okolo riadku 1252):**

```typescript
async function ServicePage({ city, service, serviceSlug }: {
  city: CityData;
  service: TaxiService;
  serviceSlug: string
}) {
  // ... existujuci kod ...

  if (isPartner) {
    // NOVE: Zistenie ci je user vlastnik
    const { isOwner, draftData, partnerId, draftId } = await checkPartnerOwnership(serviceSlug);

    // Fetch approved data (pre vsetkych)
    const approvedData = await getApprovedPartnerData(serviceSlug);

    // Merge data - ak je vlastnik, pouzi draft, inak approved
    const displayData = isOwner && draftData ? draftData : approvedData;

    return (
      <InlineEditorProvider
        initialData={{
          ...displayData,
          partner_id: partnerId,
          draft_id: draftId
        }}
        isOwner={isOwner}
        partnerId={partnerId}
        partnerSlug={serviceSlug}
        citySlug={city.slug}
      >
        <PartnerPageContent
          service={service}
          city={city}
          displayData={displayData}
          isOwner={isOwner}
        />
      </InlineEditorProvider>
    );
  }

  // ... rest of non-partner service page ...
}
```

**Nova helper funkcia:**
```typescript
// /src/lib/partner-ownership.ts
import { createClient } from '@/lib/supabase/server';

export async function checkPartnerOwnership(partnerSlug: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isOwner: false, draftData: null, partnerId: null, draftId: null };
  }

  // Najdi partnera podla slugu
  const { data: partner } = await supabase
    .from('partners')
    .select('id, user_id, partner_drafts(*)')
    .eq('slug', partnerSlug)
    .single();

  if (!partner || partner.user_id !== user.id) {
    return { isOwner: false, draftData: null, partnerId: null, draftId: null };
  }

  // Najdi najnovsi draft
  const drafts = partner.partner_drafts || [];
  const latestDraft = drafts.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0] || null;

  return {
    isOwner: true,
    draftData: latestDraft,
    partnerId: partner.id,
    draftId: latestDraft?.id || null
  };
}
```

### 3.5 Upload Obrazkov - Integracia

**Existujuce API:** `/api/partner/upload-image/route.ts`
- Uz podporuje typy: hero, logo, gallery
- Automaticka konverzia na WebP
- Generuje thumbnails pre gallery

**Uprava ImageCropEditor:**
```typescript
// V komponente ImageCropEditor pridat upload funkcionalitu
const handleImageUpload = async (file: File) => {
  setUploading(true);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'hero');

  const response = await fetch('/api/partner/upload-image', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    setCurrentImage(result.url);
    onSave(result.url, zoom, posX, posY);
  }

  setUploading(false);
};
```

**Uprava GalleryEditor:**
```typescript
const handleGalleryUpload = async (files: FileList) => {
  setUploading(true);
  const uploadedUrls: string[] = [];

  for (const file of Array.from(files)) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'gallery');

    const response = await fetch('/api/partner/upload-image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      uploadedUrls.push(result.url);
    }
  }

  setImages(prev => [...prev, ...uploadedUrls]);
  setUploading(false);
};
```

---

## 4. DATABAZOVE ZMENY

### 4.1 Nova RLS Policy pre inline editaciu
```sql
-- Policy: Partner moze citat/editovat vlastne drafty
CREATE POLICY "partner_drafts_owner_all" ON partner_drafts
FOR ALL
USING (
  partner_id IN (
    SELECT id FROM partners WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  partner_id IN (
    SELECT id FROM partners WHERE user_id = auth.uid()
  )
);

-- Policy: Partner moze citat vlastneho partnera
CREATE POLICY "partners_owner_select" ON partners
FOR SELECT
USING (user_id = auth.uid());
```

### 4.2 Nova kolumna pre button_links (OPTIONAL)
```sql
-- Ak chceme ukladat button_links ako JSON
ALTER TABLE partner_drafts
ADD COLUMN button_links JSONB DEFAULT '{}';

-- Alebo jednotlive stlpce
ALTER TABLE partner_drafts
ADD COLUMN whatsapp TEXT,
ADD COLUMN booking_url TEXT,
ADD COLUMN pricelist_url TEXT,
ADD COLUMN transport_rules_url TEXT,
ADD COLUMN contact_url TEXT;
```

---

## 5. BEZPECNOSTNE OPATRENIA

### 5.1 Autorizacia
| Vrstva | Kontrola |
|--------|----------|
| Middleware | Supabase auth pre `/partner/*` a `/api/partner/*` routes |
| API Route | `user_id === partner.user_id` kontrola |
| RLS | Policies na databazovej urovni |
| Frontend | `isOwner` prop pre UI elementy |

### 5.2 Validacia
- Whitelist povolenych poli v API
- Sanitizacia URL (XSS prevencia)
- Max velkost obrazkov (5MB)
- Max pocet obrazkov v galerii (10)
- Rate limiting na upload endpoint

### 5.3 Audit Log (OPTIONAL)
```sql
CREATE TABLE partner_edit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT, -- 'save', 'publish', 'upload'
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. RIZIKA A EDGE CASES

### 6.1 Konkurentne Editacie
**Problem:** Dva taby edituju tu istu stranku
**Riesenie:**
- Optimistic UI s last-write-wins
- Optional: WebSocket pre real-time sync
- Upozornenie ak je draft starsi ako server

### 6.2 Strata Dat
**Problem:** User zatvori tab bez ulozenia
**Riesenie:**
- Auto-save po kazdej zmene (debounced 2s)
- `beforeunload` event warning
- Draft sa nikdy nestrati (vzdy v DB)

### 6.3 Upload Failures
**Problem:** Upload obrazku zlyhá
**Riesenie:**
- Retry logika (3x)
- Progress indicator
- Error toast s "Skusit znova" tlacidlom

### 6.4 Race Condition pri Publish
**Problem:** User publikuje pocas save
**Riesenie:**
- Disable publish button pocas save
- Queue publish az po save dokonceni

### 6.5 Velka Galeria
**Problem:** 10 obrazkov = pomaly load
**Riesenie:**
- Thumbnails pre preview (uz implementovane)
- Lazy loading v GalleryEditor
- Progressive image loading

---

## 7. IMPLEMENTACNY PLAN - FAZY

### FAZA 1: API Routes (4h)
1. Vytvorit `/api/partner/inline-edit/draft/[slug]/route.ts`
2. Vytvorit `/api/partner/inline-edit/save/route.ts`
3. Vytvorit `/api/partner/inline-edit/publish/route.ts`
4. Pridat RLS policies do Supabase
5. Testovat API cez curl/Postman

### FAZA 2: Provider Upgrade (4h)
1. Rozsirit DraftData interface
2. Pridat API volania do InlineEditorProvider
3. Implementovat debounced auto-save
4. Pridat loading/error states
5. Testovat v demo stranke

### FAZA 3: Upload Integration (3h)
1. Integrovat upload do ImageCropEditor
2. Integrovat upload do GalleryEditor
3. Pridat progress indicators
4. Testovat upload flow

### FAZA 4: Produkcna Integracia (4h)
1. Vytvorit `checkPartnerOwnership` helper
2. Modifikovat ServicePage v catch-all route
3. Vytvorit PartnerPageContent komponent
4. Wrapnut do InlineEditorProvider
5. Testovat na realnej partner stranke

### FAZA 5: Polish & Testing (3h)
1. Error handling a toast notifikacie
2. Loading states a skeletons
3. Mobile responsiveness
4. E2E testing
5. Performance audit

**Celkovy odhad: 18-20 hodin**

---

## 8. SUBORY NA VYTVORENIE/MODIFIKACIU

### Nove subory:
```
/app/api/partner/inline-edit/
  draft/[slug]/route.ts       <- GET draft data
  save/route.ts               <- POST save changes
  publish/route.ts            <- POST publish changes

/src/lib/
  partner-ownership.ts        <- Helper pre overenie vlastnictva
```

### Modifikovane subory:
```
/src/components/inline-editor/
  InlineEditorProvider.tsx    <- API integration
  ImageCropEditor.tsx         <- Upload integration
  GalleryEditor.tsx           <- Upload integration
  index.ts                    <- Export updates

/app/taxi/[...slug]/page.tsx  <- Integracia InlineEditor do ServicePage
/src/lib/supabase/types.ts    <- Rozsirenie typov
```

### Supabase migracny script:
```
/supabase/migrations/
  20251220_inline_editor_policies.sql
```

---

## 9. TESTOVACI SCENAR

### Manual Testing Checklist:
- [ ] Neprihlaseny user nevidi edit mode
- [ ] Prihlaseny ne-vlastnik nevidi edit mode
- [ ] Prihlaseny vlastnik vidi FloatingAdminBar
- [ ] Kliknutie na EditableField otvori drawer
- [ ] Zmena textu sa ulozi do DB (skontrolovat v Supabase)
- [ ] Upload hero obrazku funguje
- [ ] Upload gallery obrazkov funguje (viacero naraz)
- [ ] Zoom/pozicia hero obrazku sa uklada
- [ ] Publikovanie zmeni status na approved
- [ ] Po publikovani sa stranka refreshne s novymi datami
- [ ] Refresh stranky zachova posledne ulozene zmeny
- [ ] Chybove stavy zobrazuju toast notifikacie

---

## 10. DEPENDENCIES

### Existujuce (uz nainstalovane):
- `@supabase/supabase-js` - DB client
- `@supabase/ssr` - Server-side auth
- `sharp` - Image processing
- `react-image-crop` - Crop UI

### Potrebne pridat:
- Ziadne - vsetko je uz v projekte

---

## 11. ROLLBACK PLAN

V pripade problemov:
1. Zmeny v InlineEditorProvider su izolovaně (props-based)
2. API routes su nove, neovplyvnuju existujuce
3. ServicePage zmeny su za `isOwner` podmienkou
4. Moze bezat paralelne s existujucim PartnerEditor

---

*Dokument pripraveny na implementaciu. Pred zacatim potvrdit s vlastnikom projektu.*
