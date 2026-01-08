import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ClickStat {
  city_slug: string;
  service_name: string;
  event_type: string;
  total_clicks: number;
}

interface DailyClickStat {
  date: string;
  total_clicks: number;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get total clicks by service (top 50)
    const { data: clicksByService, error: serviceError } = await supabase
      .from('click_events')
      .select('city_slug, service_name, event_type')
      .order('created_at', { ascending: false });

    if (serviceError) throw serviceError;

    // Aggregate clicks by service
    const serviceStats: Record<string, ClickStat> = {};
    for (const click of clicksByService || []) {
      const key = `${click.city_slug}|${click.service_name}|${click.event_type}`;
      if (!serviceStats[key]) {
        serviceStats[key] = {
          city_slug: click.city_slug,
          service_name: click.service_name,
          event_type: click.event_type,
          total_clicks: 0
        };
      }
      serviceStats[key].total_clicks++;
    }

    // Sort by total clicks and take top 50
    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.total_clicks - a.total_clicks)
      .slice(0, 50);

    // Get clicks per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClicks, error: recentError } = await supabase
      .from('click_events')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) throw recentError;

    // Aggregate by day
    const dailyStats: Record<string, number> = {};
    for (const click of recentClicks || []) {
      const date = click.created_at.split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    }

    // Fill in missing days with 0
    const dailyData: DailyClickStat[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.push({
        date: dateStr,
        total_clicks: dailyStats[dateStr] || 0
      });
    }

    // Get total counts
    const totalPhoneClicks = (clicksByService || []).filter(c => c.event_type === 'phone_click').length;
    const totalWhatsAppClicks = (clicksByService || []).filter(c => c.event_type === 'whatsapp_click').length;
    const totalClicks = (clicksByService || []).length;

    // Get unique cities and services
    const uniqueCities = new Set((clicksByService || []).map(c => c.city_slug)).size;
    const uniqueServices = new Set((clicksByService || []).map(c => `${c.city_slug}|${c.service_name}`)).size;

    return NextResponse.json({
      summary: {
        total_clicks: totalClicks,
        phone_clicks: totalPhoneClicks,
        whatsapp_clicks: totalWhatsAppClicks,
        unique_cities: uniqueCities,
        unique_services: uniqueServices
      },
      topServices,
      dailyTrend: dailyData
    });

  } catch (error) {
    console.error('[admin/stats/clicks] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
