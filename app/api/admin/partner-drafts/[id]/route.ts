import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with anon key - we use SECURITY DEFINER functions to bypass RLS
function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

interface Props {
  params: Promise<{ id: string }>;
}

// GET - Get single draft (using direct query for single item)
export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // For single draft, we can query directly since admin page doesn't require RLS bypass for read
  const { data: draft, error } = await supabase
    .from('partner_drafts')
    .select(`
      *,
      partners (
        id,
        name,
        slug,
        city_slug,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

// PATCH - Approve or reject draft
export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const body = await request.json();
  const { action, admin_notes } = body;

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve" or "reject".' },
      { status: 400 }
    );
  }

  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  // Use SECURITY DEFINER function to bypass RLS
  const { data: result, error } = await supabase.rpc('update_partner_draft_admin', {
    p_draft_id: id,
    p_status: newStatus,
    p_admin_notes: admin_notes || null,
  });

  if (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Fetch the updated draft to return full data
  const { data: draft } = await supabase
    .from('partner_drafts')
    .select(`
      *,
      partners (
        id,
        name,
        slug,
        city_slug,
        email
      )
    `)
    .eq('id', id)
    .single();

  // Invalidate Next.js cache for partner pages (on-demand revalidation)
  // This immediately refreshes the public pages after approval
  if (action === 'approve' && draft?.partners?.slug && draft?.partners?.city_slug) {
    const partnerPath = `/taxi/${draft.partners.city_slug}/${draft.partners.slug}`;
    const cityPath = `/taxi/${draft.partners.city_slug}`;

    revalidatePath(partnerPath);
    revalidatePath(cityPath);
    console.log('[Admin] Revalidated paths:', partnerPath, cityPath);
  }

  return NextResponse.json({
    success: true,
    draft,
    message: action === 'approve' ? 'Draft approved successfully' : 'Draft rejected',
  });
}
