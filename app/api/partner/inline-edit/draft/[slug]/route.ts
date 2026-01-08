import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/partner/inline-edit/draft/[slug]
// Načítanie draft dát pre vlastníka
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Overenie autentifikácie
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        isOwner: false
      }, { status: 401 });
    }

    // Načítanie partnera + overenie vlastníctva
    const { data: partner, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        slug,
        city_slug,
        user_id,
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
          gallery,
          social_facebook,
          social_instagram,
          template_variant,
          whatsapp,
          booking_url,
          pricelist_url,
          transport_rules_url,
          contact_url,
          updated_at,
          created_at
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('[inline-edit/draft] Error fetching partner:', error);
      return NextResponse.json({
        success: false,
        error: 'Partner not found',
        isOwner: false
      }, { status: 404 });
    }

    // Kontrola vlastníctva
    if (partner.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Not owner',
        isOwner: false
      }, { status: 403 });
    }

    // Nájdi najnovší draft
    interface DraftRecord {
      id: string;
      updated_at: string;
      [key: string]: unknown;
    }
    const drafts = (partner.partner_drafts || []) as DraftRecord[];
    const latestDraft = drafts.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0] || null;

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

  } catch (error) {
    console.error('[inline-edit/draft] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
