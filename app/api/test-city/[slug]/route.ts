import { NextRequest, NextResponse } from 'next/server';
import { getCityBySlug, slovakCities } from '@/data/cities';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Simple test endpoint without auth to diagnose routing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log('[TEST] GET /api/test-city/[slug] - START');

    const { slug } = await params;
    console.log('[TEST] Looking for city:', slug);

    const city = getCityBySlug(slug);

    return NextResponse.json({
      success: true,
      found: !!city,
      slug,
      cityName: city?.name,
      totalCities: slovakCities.length,
      message: city ? 'City found!' : 'City not found',
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
