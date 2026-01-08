import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  // Verify admin session
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Get latest SEO snapshots (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: snapshots, error: snapError } = await supabase
      .from('seo_snapshots')
      .select('*')
      .gte('date_end', thirtyDaysAgo.toISOString().split('T')[0])
      .order('clicks', { ascending: false })
      .limit(100);

    if (snapError) throw snapError;

    // Get keyword rankings
    const { data: keywords, error: kwError } = await supabase
      .from('keyword_rankings')
      .select('*')
      .gte('snapshot_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('clicks', { ascending: false })
      .limit(50);

    if (kwError) throw kwError;

    // Calculate totals
    const totalClicks = (snapshots || []).reduce((sum, s) => sum + (s.clicks || 0), 0);
    const totalImpressions = (snapshots || []).reduce((sum, s) => sum + (s.impressions || 0), 0);
    const avgPosition =
      (snapshots || []).length > 0
        ? (snapshots || []).reduce((sum, s) => sum + (s.position || 0), 0) / (snapshots || []).length
        : 0;
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Group snapshots by date for trend chart
    const trendData = groupByDate(snapshots || []);

    // Identify weak cities (low clicks but high impressions = opportunity)
    const weakCities = (snapshots || [])
      .filter((s) => s.impressions > 100 && s.clicks < 10 && s.city_slug)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10);

    // Top performing pages (exclude homepage - those are trend records)
    const topPages = (snapshots || [])
      .filter((s) => s.page_url !== 'https://www.taxinearme.cz/')
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalClicks,
        totalImpressions,
        avgPosition: Math.round(avgPosition * 10) / 10,
        avgCtr: Math.round(avgCtr * 100) / 100,
      },
      trend: trendData,
      topPages,
      keywords: keywords || [],
      weakCities,
      // Get latest synced_at from existing data (no extra query needed)
      lastSync: snapshots?.length
        ? snapshots.reduce((latest, s) => {
            const syncTime = s.synced_at || s.created_at;
            return syncTime > latest ? syncTime : latest;
          }, '')
        : null,
    });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

function groupByDate(snapshots: { date_end: string; clicks: number; impressions: number; position: number }[]) {
  const grouped: Record<string, { clicks: number; impressions: number; position: number; count: number }> = {};

  snapshots.forEach((s) => {
    const date = s.date_end;
    if (!grouped[date]) {
      grouped[date] = { clicks: 0, impressions: 0, position: 0, count: 0 };
    }
    grouped[date].clicks += s.clicks || 0;
    grouped[date].impressions += s.impressions || 0;
    grouped[date].position += s.position || 0;
    grouped[date].count += 1;
  });

  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      clicks: data.clicks,
      impressions: data.impressions,
      position: data.count > 0 ? Math.round((data.position / data.count) * 10) / 10 : 0,
      ctr: data.impressions > 0 ? Math.round((data.clicks / data.impressions) * 10000) / 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
