import { NextResponse } from 'next/server';
import { allMunicipalities } from '@/data/municipalities';

export interface MunicipalityListItem {
  name: string;
  district: string;
  region: string;
  slug: string;
}

export async function GET() {
  // Use municipalities from the data module
  const simplified: MunicipalityListItem[] = allMunicipalities.map((mun) => ({
    name: mun.name,
    district: mun.district,
    region: mun.region,
    slug: mun.slug,
  }));

  return NextResponse.json(simplified, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
