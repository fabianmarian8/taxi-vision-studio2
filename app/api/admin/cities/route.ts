import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { czechCities } from '@/data/cities';

// GET - zoznam všetkých miest
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[API] Cities list requested, total:', czechCities.length);

  return NextResponse.json({
    cities: czechCities,
    total: czechCities.length,
  });
}
