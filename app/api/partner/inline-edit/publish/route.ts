import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// POST /api/partner/inline-edit/publish
// Publikovanie zmien (status -> approved)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Overenie autentifikácie
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { partner_id, draft_id } = body;

    if (!partner_id || !draft_id) {
      return NextResponse.json({
        success: false,
        error: 'partner_id and draft_id are required'
      }, { status: 400 });
    }

    // Overenie vlastníctva + načítanie partnera
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, slug, city_slug')
      .eq('id', partner_id)
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({
        success: false,
        error: 'Not owner or partner not found'
      }, { status: 403 });
    }

    // Aktualizácia statusu na approved - verify that row was actually updated
    const { data: updatedDraft, error: updateError } = await supabase
      .from('partner_drafts')
      .update({
        status: 'approved',
        submitted_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString() // Self-approved (inline editor)
      })
      .eq('id', draft_id)
      .eq('partner_id', partner_id)
      .select('id')
      .single();

    if (updateError) {
      console.error('[inline-edit/publish] Update error:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 });
    }

    // Verify that we actually updated a row
    if (!updatedDraft) {
      console.error('[inline-edit/publish] No draft found to update:', { draft_id, partner_id });
      return NextResponse.json({
        success: false,
        error: 'Draft not found or already published'
      }, { status: 404 });
    }

    // Revalidácia stránky
    const pagePath = `/taxi/${partner.city_slug}/${partner.slug}`;
    revalidatePath(pagePath);

    console.log('[inline-edit/publish] Published:', {
      partner_id,
      draft_id,
      path: pagePath
    });

    return NextResponse.json({
      success: true,
      revalidated: true,
      path: pagePath
    });

  } catch (error) {
    console.error('[inline-edit/publish] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
