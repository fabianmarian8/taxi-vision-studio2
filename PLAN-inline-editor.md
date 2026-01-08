# Live Inline Editor - Implementačný Plán (V1)

**Dátum:** 2025-12-20
**Status:** Schválený, čaká na implementáciu

---

## Koncept

"Stránka je Editor" - Partner (majiteľ taxislužby) edituje obsah priamo na svojej verejnej stránke `/taxi/[city]/[slug]` bez potreby admin panelu.

### Kľúčové rozhodnutia
- **Partner publikuje sám** - žiadny admin approval flow
- **Len inline editor** - starý `/partner/edit` sa odstráni
- **Click & Drawer pattern** - klik na element otvorí Bottom Sheet (Vaul)

---

## 1. Databáza

### 1.1 Enum status
```sql
ALTER TYPE partner_status ADD VALUE IF NOT EXISTS 'draft';
```

### 1.2 Unique constraint (1× draft + 1× approved na partnera)
```sql
ALTER TABLE partner_drafts
ADD CONSTRAINT unique_partner_status UNIQUE (partner_id, status);
```

### 1.3 Nové stĺpce pre šablóny
```sql
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'classic';
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#FACC15';
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1a1a1a';
```

### 1.4 RLS politiky
```sql
-- Čítanie vlastných draftov
CREATE POLICY "Partner can read own drafts" ON partner_drafts
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Vkladanie/úprava vlastných draftov
CREATE POLICY "Partner can upsert own drafts" ON partner_drafts
  FOR INSERT WITH CHECK (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Partner can update own drafts" ON partner_drafts
  FOR UPDATE USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  ) WITH CHECK (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );
```

### 1.5 Nový RPC pre draft dáta
```sql
CREATE OR REPLACE FUNCTION get_partner_draft_data(p_partner_id UUID)
RETURNS TABLE (...) AS $$
  SELECT * FROM partner_drafts
  WHERE partner_id = p_partner_id AND status = 'draft'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 2. Server-side (SSR)

### 2.1 Pravidlá
- SSR **vždy** renderuje `approved` dáta (cache-safe)
- JSON-LD a metadata **výhradne** z approved
- CSS variables default hodnoty zo server-side approved configu
- Dáta preferovať z `partner_drafts` (approved), nie zo `service.*`

### 2.2 Súbory na úpravu
- `app/taxi/[...slug]/page.tsx` - pridať client wrapper pre edit overlay
- `src/lib/partner-data.ts` - rozšíriť typy o template/farby

---

## 3. Client-side

### 3.1 Ownership check
```typescript
// Server Action - bezpečné získanie partner_id
async function getEditablePartner(slug: string) {
  const user = await getUser();
  const partner = await getPartnerBySlug(slug);

  if (partner.user_id !== user.id) {
    return null; // Nie je vlastník
  }

  return partner.id; // Bezpečné partner_id
}
```

### 3.2 Draft overlay
- Client-only komponent (`'use client'`)
- Načíta draft až po ownership checku
- Neprekrýva SSR obsah až do načítania

### 3.3 Autosave
```typescript
// Throttle 5s + Debounce 2s kombinácia
const throttledSave = throttle(saveDraft, 5000);
const debouncedSave = debounce(saveDraft, 2000);

// Upsert, nie insert - zabraňuje duplicitám
await supabase
  .from('partner_drafts')
  .upsert({ partner_id, status: 'draft', ...data }, { onConflict: 'partner_id,status' });
```

### 3.4 Komponenty
- **Floating Admin Bar** - spodná lišta s "Režim úprav" a "Publikovať"
- **Vaul Bottom Sheet** - univerzálny editor
- **EditableField** - wrapper pre editovateľné zóny

---

## 4. Bezpečnosť

### 4.1 Validácia
- **Zod schéma** na serveri pre všetky vstupy
- **Čistý text** - zakázať HTML na vstupe
- **Jednoduchý allowlist** namiesto DOMPurify

### 4.2 Príklad Zod schémy
```typescript
const partnerDraftSchema = z.object({
  hero_title: z.string().min(3).max(60).regex(/^[^<>]*$/),
  phone: z.string().regex(/^\+?[0-9\s-]{9,15}$/),
  description: z.string().max(2000).regex(/^[^<>]*$/),
});
```

---

## 5. Navigácia a Redirecty

### 5.1 Redirect starého editora
```typescript
// app/partner/edit/[slug]/page.tsx
import { redirect } from 'next/navigation';

export default async function EditRedirect({ params }) {
  const partner = await getPartnerBySlug(params.slug);
  redirect(`/taxi/${partner.city}/${params.slug}?edit=true`);
}
```

### 5.2 Dashboard linky
- Upraviť `app/partner/page.tsx` - linky smerujú na `/taxi/[city]/[slug]`

---

## 6. Revalidácia pri Publish

```typescript
async function publishChanges(partnerId: string, city: string, slug: string) {
  // 1. Preklopiť draft → approved
  await supabase.rpc('publish_partner_draft', { p_partner_id: partnerId });

  // 2. Revalidácia
  revalidatePath(`/taxi/${city}/${slug}`);  // Detail
  revalidatePath(`/taxi/${city}`);           // City list
  revalidatePath(`/kraj/${getRegionSlug(city)}`); // Kraj

  // 3. Sitemapy
  revalidatePath('/sitemap.xml');
  revalidatePath('/sitemap-cities/sitemap.xml');
}
```

---

## 7. CSS Variables Refaktor

### 7.1 Nahradenia v `app/taxi/[...slug]/page.tsx`
| Pôvodné | Nové |
|---------|------|
| `bg-purple-600` | `bg-[var(--primary)]` |
| `from-yellow-400` | `from-[var(--accent)]` |
| `text-purple-600` | `text-[var(--primary)]` |
| `border-purple-600` | `border-[var(--primary)]` |

### 7.2 Default hodnoty v `app/globals.css`
```css
:root {
  --primary: #FACC15;
  --secondary: #1a1a1a;
  --accent: #FACC15;
}
```

### 7.3 Inline override
```tsx
<div style={{
  '--primary': approvedData.primary_color || '#FACC15',
  '--secondary': approvedData.secondary_color || '#1a1a1a',
} as React.CSSProperties}>
```

---

## 8. UX Funkcie

### 8.1 Indikácia stavu
- Oranžový badge "Nepublikované zmeny" pri existencii draftu
- Cloud ikona "Ukladanie..." → "Uložené"

### 8.2 Exit Guard
- `onbeforeunload` pre browser close
- Vlastný modal pre App Router navigáciu

### 8.3 Zahodiť zmeny
```typescript
async function discardDraft(partnerId: string) {
  await supabase
    .from('partner_drafts')
    .delete()
    .eq('partner_id', partnerId)
    .eq('status', 'draft');
}
```

---

## 9. Odhad času

| Fáza | Popis | Hodiny |
|------|-------|--------|
| 1 | DB migrácia + RPC | 3h |
| 2 | CSS Variables refaktor | 3h |
| 3 | Floating Admin Bar + ownership | 2h |
| 4 | Vaul drawer + EditableField | 4h |
| 5 | Server Actions (autosave, publish) | 3h |
| 6 | Galéria + Hero crop v inline | 3h |
| 7 | Redirecty + zmazanie starého | 1h |
| 8 | Testovanie (mobile, edge cases) | 3h |

**Celkom: ~22 hodín**

---

## 10. Poradie implementácie

1. **DB migrácia** - základ pre všetko ostatné
2. **CSS Variables** - aby šablóny fungovali
3. **Floating Admin Bar** - základný UI
4. **Server Actions** - autosave, publish
5. **Vaul drawer** - editovacie UI
6. **Galéria + Hero** - kompletná funkcionalita
7. **Redirecty** - finálne upratanie
8. **Testovanie** - mobile, edge cases

---

## 11. Rizikové body

| Riziko | Mitigácia |
|--------|-----------|
| Race condition pri publish | `updated_at` guard v RPC |
| Duplicitné drafty | UNIQUE constraint + upsert |
| Cache leak (draft v SSR) | Draft len client-side overlay |
| Session expiry | Refresh token mechanizmus |
| Strata zmien pri close | beforeunload + localStorage fallback |

---

## 12. Čo sa zmaže

- `app/partner/edit/` - celý adresár (nahradí redirect)
- Admin approval flow - `pending` status sa nebude používať
- Staré API endpointy pre approval (ak existujú)

---

**Schválené:** 2025-12-20
**Implementácia:** Čaká na pokyn
