import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import {
  fetchPageAnalytics,
  fetchQueryAnalytics,
  fetchDailyTrends,
  extractCitySlugFromUrl,
  extractCityFromQuery,
  getDateDaysAgo,
} from '@/lib/gsc';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  // Verify admin session
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // Check if GSC credentials are configured
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      {
        error: 'GSC not configured',
        message: 'GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add your Google Service Account credentials.',
      },
      { status: 400 }
    );
  }

  try {
    const endDate = getDateDaysAgo(2); // GSC data has 2-day delay
    const startDate = getDateDaysAgo(32); // Last 30 days

    console.log(`Syncing GSC data from ${startDate} to ${endDate}`);

    const syncTimestamp = new Date().toISOString();

    // Fetch data from GSC
    const [pageData, queryData, trendData] = await Promise.all([
      fetchPageAnalytics(startDate, endDate, 100),
      fetchQueryAnalytics(startDate, endDate, 200),
      fetchDailyTrends(startDate, endDate),
    ]);

    console.log(`Fetched: ${pageData.length} pages, ${queryData.length} keywords, ${trendData.length} days`);

    // Process and insert page snapshots
    let pagesInserted = 0;
    for (const page of pageData) {
      const citySlug = extractCitySlugFromUrl(page.page);

      const { error } = await supabase.from('seo_snapshots').upsert(
        {
          page_url: page.page,
          city_slug: citySlug,
          clicks: page.clicks,
          impressions: page.impressions,
          ctr: page.ctr,
          position: page.position,
          date_start: startDate,
          date_end: endDate,
          synced_at: syncTimestamp,
        },
        {
          onConflict: 'page_url,date_start,date_end',
        }
      );

      if (!error) pagesInserted++;
    }

    // Process and insert keyword rankings
    let keywordsInserted = 0;
    for (const query of queryData) {
      const citySlug = extractCityFromQuery(query.query);

      // Get previous position for comparison
      const { data: existing } = await supabase
        .from('keyword_rankings')
        .select('position')
        .eq('keyword', query.query)
        .lt('snapshot_date', endDate)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase.from('keyword_rankings').upsert(
        {
          keyword: query.query,
          city_slug: citySlug,
          position: query.position,
          previous_position: existing?.position || null,
          clicks: query.clicks,
          impressions: query.impressions,
          ctr: query.ctr,
          snapshot_date: endDate,
        },
        {
          onConflict: 'keyword,snapshot_date',
        }
      );

      if (!error) keywordsInserted++;
    }

    // Store daily trend data (for charts)
    let trendsInserted = 0;
    for (const day of trendData) {
      const { error } = await supabase.from('seo_snapshots').upsert(
        {
          page_url: 'https://www.taxinearme.cz/', // Aggregate for whole site
          city_slug: null,
          clicks: day.clicks,
          impressions: day.impressions,
          ctr: day.ctr,
          position: day.position,
          date_start: day.date,
          date_end: day.date,
          synced_at: syncTimestamp,
        },
        {
          onConflict: 'page_url,date_start,date_end',
        }
      );

      if (!error) trendsInserted++;
    }

    return NextResponse.json({
      success: true,
      synced_at: new Date().toISOString(),
      period: { start: startDate, end: endDate },
      pages_synced: pagesInserted,
      keywords_synced: keywordsInserted,
      trends_synced: trendsInserted,
      totals: {
        pages: pageData.length,
        keywords: queryData.length,
        days: trendData.length,
      },
    });
  } catch (error) {
    console.error('Error syncing GSC data:', error);

    // Return helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: errorMessage,
        hint: errorMessage.includes('not set')
          ? 'Please configure GOOGLE_SERVICE_ACCOUNT_KEY in your environment variables.'
          : errorMessage.includes('permission')
          ? 'The Service Account may not have access to the Search Console property. Please verify permissions.'
          : 'Check the server logs for more details.',
      },
      { status: 500 }
    );
  }
}
