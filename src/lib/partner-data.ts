import { createClient } from '@supabase/supabase-js';

// Create a read-only client for fetching approved partner data
function getReadOnlyClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export interface ApprovedPartnerData {
  company_name: string | null;
  description: string | null;
  show_description: boolean | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hero_image_url: string | null;
  hero_image_zoom: number | null;
  hero_image_pos_x: number | null;
  hero_image_pos_y: number | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  banner_title: string | null;
  banner_subtitle: string | null;
  services: string[] | null;
  services_description: string | null;
  show_services: boolean | null;
  gallery: string[] | null;
  social_facebook: string | null;
  social_instagram: string | null;
  whatsapp: string | null;
  booking_url: string | null;
  pricelist_url: string | null;
  transport_rules_url: string | null;
  contact_url: string | null;
  template_variant: string | null;
}

/**
 * Fetch approved partner data from Supabase using SECURITY DEFINER RPC function
 * This bypasses RLS to allow public reading of approved partner data
 * Returns null if no approved draft exists
 *
 * NOTE: No in-memory caching is used because:
 * 1. Vercel serverless functions are stateless - cache doesn't persist across instances
 * 2. We use on-demand revalidation (revalidatePath) in admin API after approval
 * 3. Next.js ISR with revalidate=60 provides the caching layer
 */
export async function getApprovedPartnerData(partnerSlug: string): Promise<ApprovedPartnerData | null> {
  try {
    const supabase = getReadOnlyClient();

    // Use SECURITY DEFINER function to bypass RLS
    const { data, error } = await supabase.rpc('get_approved_partner_data', {
      p_slug: partnerSlug
    });

    if (error) {
      console.error('[getApprovedPartnerData] RPC error:', error.message);
      return null;
    }

    // RPC returns an array, get first result
    const draft = Array.isArray(data) ? data[0] : data;

    if (!draft) {
      console.log('[getApprovedPartnerData] No approved draft found for:', partnerSlug);
      return null;
    }

    console.log('[getApprovedPartnerData] Found approved data with gallery:', draft.gallery?.length || 0, 'images');

    return {
      company_name: draft.company_name,
      description: draft.description,
      show_description: draft.show_description,
      phone: draft.phone,
      email: draft.email,
      website: draft.website,
      hero_image_url: draft.hero_image_url,
      hero_image_zoom: draft.hero_image_zoom,
      hero_image_pos_x: draft.hero_image_pos_x,
      hero_image_pos_y: draft.hero_image_pos_y,
      hero_title: draft.hero_title,
      hero_subtitle: draft.hero_subtitle,
      banner_title: draft.banner_title,
      banner_subtitle: draft.banner_subtitle,
      services: draft.services,
      services_description: draft.services_description,
      show_services: draft.show_services,
      gallery: draft.gallery,
      social_facebook: draft.social_facebook,
      social_instagram: draft.social_instagram,
      whatsapp: draft.whatsapp,
      booking_url: draft.booking_url,
      pricelist_url: draft.pricelist_url,
      transport_rules_url: draft.transport_rules_url,
      contact_url: draft.contact_url,
      template_variant: draft.template_variant,
    };
  } catch (error) {
    console.error('[getApprovedPartnerData] Error:', error);
    return null;
  }
}
