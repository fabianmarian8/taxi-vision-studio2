import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { slovakCities } from '@/data/cities';

// GET - zoznam všetkých miest
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[API] Cities list requested, total:', slovakCities.length);

  return NextResponse.json({
    cities: slovakCities,
    total: slovakCities.length,
  });
}
