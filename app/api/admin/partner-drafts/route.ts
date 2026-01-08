import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with anon key - we use SECURITY DEFINER functions to bypass RLS
function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

// GET - List drafts by status for admin
export async function GET(request: NextRequest) {
  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // Parse status from query parameter (default: pending)
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  // Validate status
  if (!['pending', 'approved', 'rejected', 'draft'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
  }

  // Use SECURITY DEFINER function with status parameter
  const { data: drafts, error } = await supabase.rpc('get_all_partner_drafts_admin', {
    p_status: status
  });

  if (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform the data to match the expected format
  const formattedDrafts = (drafts || []).map((d: Record<string, unknown>) => ({
    id: d.draft_id,
    partner_id: d.partner_id,
    status: d.status,
    company_name: d.company_name,
    description: d.description,
    phone: d.phone,
    email: d.email,
    website: d.website,
    hero_image_url: d.hero_image_url,
    hero_image_zoom: d.hero_image_zoom,
    hero_image_pos_x: d.hero_image_pos_x,
    hero_image_pos_y: d.hero_image_pos_y,
    hero_title: d.hero_title,
    hero_subtitle: d.hero_subtitle,
    banner_title: d.banner_title,
    banner_subtitle: d.banner_subtitle,
    services: d.services,
    vehicles: d.vehicles,
    prices: d.prices,
    gallery: d.gallery,
    social_facebook: d.social_facebook,
    social_instagram: d.social_instagram,
    admin_notes: d.admin_notes,
    submitted_at: d.submitted_at,
    reviewed_at: d.reviewed_at,
    reviewed_by: d.reviewed_by,
    created_at: d.draft_created_at,
    updated_at: d.draft_updated_at,
    partners: {
      name: d.partner_name,
      slug: d.partner_slug,
      city_slug: d.partner_city_slug,
      email: d.partner_email,
    },
  }));

  return NextResponse.json({ drafts: formattedDrafts });
}
