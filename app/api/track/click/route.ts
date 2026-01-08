import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use anon key for public insert (RLS allows anyone to insert)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// POST /api/track/click
// Track a click event (phone, website, whatsapp)
export async function POST(request: NextRequest) {
  // Don't track if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: true, message: 'Tracking disabled' });
  }

  try {
    const body = await request.json();
    const { event_type, city_slug, service_name, phone_number } = body;

    // Validate required fields
    if (!city_slug || !service_name) {
      return NextResponse.json({
        success: false,
        error: 'city_slug and service_name are required'
      }, { status: 400 });
    }

    // Get user context from headers
    const userAgent = request.headers.get('user-agent') || null;
    const referer = request.headers.get('referer') || null;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Insert click event
    const { error } = await supabase
      .from('click_events')
      .insert({
        event_type: event_type || 'phone_click',
        city_slug,
        service_name,
        phone_number: phone_number || null,
        user_agent: userAgent,
        referer: referer,
      });

    if (error) {
      console.error('[track/click] Insert error:', error);
      // Don't fail the request - tracking is non-critical
      return NextResponse.json({ success: true, tracked: false });
    }

    return NextResponse.json({ success: true, tracked: true });

  } catch (error) {
    console.error('[track/click] Error:', error);
    // Don't fail - tracking is non-critical
    return NextResponse.json({ success: true, tracked: false });
  }
}
