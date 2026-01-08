import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PARTNER_SKIN } from '@/lib/partner-skins';

// Superadmin emails - can edit ALL partner pages
const SUPERADMIN_EMAILS = [
  'fabianmarian8@gmail.com',
  'fabianmarian8@users.noreply.github.com',
];

export interface PartnerDraftData {
  id: string;
  status: string;
  company_name: string | null;
  description: string | null;
  show_description: boolean | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_image_zoom: number | null;
  hero_image_pos_x: number | null;
  hero_image_pos_y: number | null;
  services: string[] | null;
  show_services: boolean | null;
  gallery: string[] | null;
  social_facebook: string | null;
  social_instagram: string | null;
  whatsapp: string | null;
  booking_url: string | null;
  pricelist_url: string | null;
  transport_rules_url: string | null;
  contact_url: string | null;
  services_description: string | null;
  template_variant: string | null;
  updated_at: string | null;
}

export interface PartnerOwnershipResult {
  isOwner: boolean;
  draftData: PartnerDraftData | null;
  partnerId: string | null;
  draftId: string | null;
  partnerSlug: string | null;
  citySlug: string | null;
}

/**
 * Skontroluje či je aktuálne prihlásený user vlastníkom partnera
 * a vráti jeho draft dáta ak existujú
 */
export async function checkPartnerOwnership(partnerSlug: string): Promise<PartnerOwnershipResult> {
  const defaultResult: PartnerOwnershipResult = {
    isOwner: false,
    draftData: null,
    partnerId: null,
    draftId: null,
    partnerSlug: null,
    citySlug: null
  };

  try {
    // During static generation, cookies() will throw - return default
    let supabase;
    try {
      supabase = await createClient();
    } catch (e) {
      // Static generation - no cookies available
      console.log('[checkPartnerOwnership] Static generation, returning default');
      return defaultResult;
    }

    // Získaj aktuálneho usera
    const { data: { user } } = await supabase.auth.getUser();

    console.log('[checkPartnerOwnership] Looking for slug:', partnerSlug);
    console.log('[checkPartnerOwnership] Current user:', user?.id || 'not logged in');

    if (!user) {
      console.log('[checkPartnerOwnership] No user, returning default');
      return defaultResult;
    }

    // Nájdi partnera podľa slugu
    // NOTE: Niektoré stĺpce (whatsapp, booking_url, etc.) nemusia existovať v starších DB
    const { data: partner, error } = await supabase
      .from('partners')
      .select(`
        id,
        user_id,
        slug,
        city_slug,
        partner_drafts (
          id,
          status,
          company_name,
          description,
          show_description,
          phone,
          email,
          website,
          hero_title,
          hero_subtitle,
          hero_image_url,
          hero_image_zoom,
          hero_image_pos_x,
          hero_image_pos_y,
          services,
          show_services,
          services_description,
          gallery,
          social_facebook,
          social_instagram,
          whatsapp,
          booking_url,
          pricelist_url,
          transport_rules_url,
          contact_url,
          template_variant,
          updated_at
        )
      `)
      .eq('slug', partnerSlug)
      .single();

    if (error || !partner) {
      console.log('[checkPartnerOwnership] Partner not found or error:', error?.message);
      return defaultResult;
    }

    console.log('[checkPartnerOwnership] Found partner:', partner.id, 'user_id:', partner.user_id);

    // Check if user is superadmin (can edit all pages)
    const isSuperadmin = user.email && SUPERADMIN_EMAILS.includes(user.email.toLowerCase());

    // Kontrola vlastníctva alebo superadmin
    if (partner.user_id !== user.id && !isSuperadmin) {
      console.log('[checkPartnerOwnership] User mismatch - partner.user_id:', partner.user_id, 'user.id:', user.id);
      return defaultResult;
    }

    console.log('[checkPartnerOwnership] User IS owner!', isSuperadmin ? '(superadmin)' : '');

    // Nájdi najnovší draft (preferuj draft status, potom approved)
    const drafts = (partner.partner_drafts || []) as PartnerDraftData[];

    // Najprv skús nájsť draft s status='draft'
    let latestDraft = drafts
      .filter((d) => d.status === 'draft')
      .sort((a, b) =>
        new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      )[0];

    // Ak nie je draft, použi approved
    if (!latestDraft) {
      latestDraft = drafts
        .filter((d) => d.status === 'approved')
        .sort((a, b) =>
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        )[0];
    }

    return {
      isOwner: true,
      draftData: latestDraft || null,
      partnerId: partner.id,
      draftId: latestDraft?.id || null,
      partnerSlug: partner.slug,
      citySlug: partner.city_slug
    };

  } catch (error) {
    console.error('[checkPartnerOwnership] Error:', error);
    return defaultResult;
  }
}

interface BaseData {
  company_name?: string;
  description?: string;
  show_description?: boolean;
  phone?: string;
  email?: string;
  website?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_image_zoom?: number;
  hero_image_pos_x?: number;
  hero_image_pos_y?: number;
  services?: string[];
  show_services?: boolean;
  services_description?: string;
  gallery?: string[];
  whatsapp?: string;
  booking_url?: string;
  pricelist_url?: string;
  transport_rules_url?: string;
  contact_url?: string;
  facebook?: string;
  instagram?: string;
  template_variant?: string;
}

/**
 * Transformuje draft dáta do formátu pre InlineEditorProvider
 */
export function transformDraftToEditorData(draftData: PartnerDraftData | null, baseData: BaseData = {}) {
  if (!draftData) {
    return baseData;
  }

  return {
    // Základné info
    company_name: draftData.company_name || baseData.company_name || '',
    description: draftData.description || baseData.description || '',
    show_description: draftData.show_description ?? baseData.show_description ?? true,
    phone: draftData.phone || baseData.phone || '',
    email: draftData.email || baseData.email || '',
    website: draftData.website || baseData.website || '',

    // Hero sekcia
    hero_title: draftData.hero_title || baseData.hero_title || '',
    hero_subtitle: draftData.hero_subtitle || baseData.hero_subtitle || '',
    hero_image_url: draftData.hero_image_url || baseData.hero_image_url || '',
    hero_image_zoom: draftData.hero_image_zoom ?? baseData.hero_image_zoom ?? 100,
    hero_image_pos_x: draftData.hero_image_pos_x ?? baseData.hero_image_pos_x ?? 50,
    hero_image_pos_y: draftData.hero_image_pos_y ?? baseData.hero_image_pos_y ?? 50,

    // Služby
    services: draftData.services || baseData.services || [],
    show_services: draftData.show_services ?? baseData.show_services ?? false,
    services_description: draftData.services_description || baseData.services_description || '',

    // Galéria
    gallery: draftData.gallery || baseData.gallery || [],

    // Kontaktné tlačidlá
    whatsapp: draftData.whatsapp || baseData.whatsapp || '',
    booking_url: draftData.booking_url || baseData.booking_url || '',
    pricelist_url: draftData.pricelist_url || baseData.pricelist_url || '',
    transport_rules_url: draftData.transport_rules_url || baseData.transport_rules_url || '',
    contact_url: draftData.contact_url || baseData.contact_url || '',

    // Social
    social_facebook: draftData.social_facebook || baseData.facebook || '',
    social_instagram: draftData.social_instagram || baseData.instagram || '',

    // Vzhlad sablony
    template_variant: draftData.template_variant || baseData.template_variant || DEFAULT_PARTNER_SKIN,

    // Metadata
    status: draftData.status || 'draft',
    updated_at: draftData.updated_at || null
  };
}
