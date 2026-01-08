import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Superadmin emails - can edit ALL city pages
const SUPERADMIN_EMAILS = [
  'fabianmarian8@gmail.com',
  'fabianmarian8@users.noreply.github.com',
];

// Whitelist of allowed fields
const ALLOWED_FIELDS = [
  'description',
  'meta_description',
  'keywords',
  'hero_image',
];

// POST /api/city/save
// Save city field changes (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Check if user is superadmin
    const isSuperadmin = user.email && SUPERADMIN_EMAILS.includes(user.email.toLowerCase());
    if (!isSuperadmin) {
      return NextResponse.json({
        success: false,
        error: 'Only superadmins can edit cities'
      }, { status: 403 });
    }

    const body = await request.json();
    const { city_slug, changes } = body;

    if (!city_slug) {
      return NextResponse.json({
        success: false,
        error: 'city_slug is required'
      }, { status: 400 });
    }

    if (!changes || Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No changes provided'
      }, { status: 400 });
    }

    // Sanitize - only allowed fields
    const sanitizedChanges: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(changes as Record<string, unknown>)) {
      if (ALLOWED_FIELDS.includes(key)) {
        if (key === 'keywords') {
          // Keywords must be an array of strings
          if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
            sanitizedChanges[key] = value;
          }
        } else {
          sanitizedChanges[key] = value;
        }
      }
    }

    if (Object.keys(sanitizedChanges).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    // Update city in Supabase
    const { data, error } = await supabase
      .from('cities')
      .update({
        ...sanitizedChanges,
        updated_at: new Date().toISOString()
      })
      .eq('slug', city_slug)
      .select('id, slug, updated_at')
      .single();

    if (error) {
      console.error('[city/save] Update error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'City not found'
      }, { status: 404 });
    }

    console.log('[city/save] Saved:', {
      city_slug,
      fields: Object.keys(sanitizedChanges),
      user: user.email
    });

    return NextResponse.json({
      success: true,
      city_id: data.id,
      updated_at: data.updated_at
    });

  } catch (error) {
    console.error('[city/save] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
