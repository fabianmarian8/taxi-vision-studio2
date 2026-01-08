import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { PartnerEditor } from './PartnerEditor';
import citiesData from '@/data/cities.json';
import { DEFAULT_PARTNER_SKIN } from '@/lib/partner-skins';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper to find service data from cities.json
function findOriginalServiceData(partnerSlug: string, citySlug: string) {
  const city = citiesData.cities.find((c) => c.slug === citySlug);
  if (!city) return null;

  // Find the taxi service that matches (using createServiceSlug logic)
  const createServiceSlug = (name: string, cityName: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const cityPart = cityName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return slug.includes(cityPart) ? slug : `${slug}-${cityPart}`;
  };

  const service = city.taxiServices.find((s) => {
    const serviceSlug = createServiceSlug(s.name, city.name);
    return serviceSlug === partnerSlug;
  });

  if (!service) return null;

  // Return the original data in the format expected by the editor
  // Using type assertions for optional properties that may not exist on all TaxiService variants
  const serviceAny = service as Record<string, unknown>;
  const partnerData = (serviceAny.partnerData || {}) as Record<string, unknown>;

  return {
    company_name: service.name,
    description: (serviceAny.description as string) || (partnerData.description as string) || '',
    phone: service.phone || '',
    email: '',
    website: (serviceAny.website as string) || '',
    hero_image_url: (partnerData.heroImage as string) || '',
    hero_image_zoom: 100,
    hero_image_pos_x: 50,
    hero_image_pos_y: 50,
    hero_title: service.name,
    hero_subtitle: '',
    banner_title: '',
    banner_subtitle: '',
    template_variant: DEFAULT_PARTNER_SKIN,
    services: ((partnerData.services || []) as string[]),
    gallery: ((serviceAny.gallery || []) as string[]),
    social_facebook: '',
    social_instagram: '',
  };
}

export default async function PartnerEditPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/partner/login');
  }

  // Get partner by slug with drafts ordered by updated_at DESC
  const { data: partner, error } = await supabase
    .from('partners')
    .select(`
      *,
      partner_drafts (*)
    `)
    .eq('slug', slug)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false, referencedTable: 'partner_drafts' })
    .single();

  if (error || !partner) {
    notFound();
  }

  // Get the latest draft
  const latestDraft = partner.partner_drafts?.[0] || null;

  // Check if draft was rejected
  const wasRejected = latestDraft?.status === 'rejected';
  const rejectionNotes = wasRejected ? latestDraft?.admin_notes : null;

  // If rejected, load original data from cities.json and reset draft
  let initialDraft = latestDraft;
  if (wasRejected && latestDraft) {
    const originalData = findOriginalServiceData(partner.slug, partner.city_slug);

    if (originalData) {
      // Reset the draft to original data with 'draft' status
      const { data: resetDraft } = await supabase
        .from('partner_drafts')
        .update({
          status: 'draft',
          company_name: originalData.company_name,
          description: originalData.description,
          phone: originalData.phone,
          email: originalData.email,
          website: originalData.website,
          hero_image_url: originalData.hero_image_url,
          hero_image_zoom: originalData.hero_image_zoom,
          hero_image_pos_x: originalData.hero_image_pos_x,
          hero_image_pos_y: originalData.hero_image_pos_y,
          hero_title: originalData.hero_title,
          hero_subtitle: originalData.hero_subtitle,
          banner_title: originalData.banner_title,
          banner_subtitle: originalData.banner_subtitle,
          template_variant: originalData.template_variant,
          services: originalData.services,
          gallery: originalData.gallery,
          social_facebook: originalData.social_facebook,
          social_instagram: originalData.social_instagram,
          admin_notes: latestDraft.admin_notes, // Keep rejection notes for display
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq('id', latestDraft.id)
        .select()
        .single();

      if (resetDraft) {
        initialDraft = resetDraft;
      }
    } else {
      // Fallback: If original data not found, just reset status to 'draft'
      // so user can at least continue editing their current data
      console.warn(`Original data not found for partner ${partner.slug} in city ${partner.city_slug}`);
      const { data: resetDraft } = await supabase
        .from('partner_drafts')
        .update({
          status: 'draft',
          admin_notes: latestDraft.admin_notes,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq('id', latestDraft.id)
        .select()
        .single();

      if (resetDraft) {
        initialDraft = resetDraft;
      }
    }
  }

  return (
    <PartnerEditor
      partner={partner}
      initialDraft={initialDraft}
      userEmail={user.email || ''}
      rejectionMessage={wasRejected ? rejectionNotes : null}
    />
  );
}
