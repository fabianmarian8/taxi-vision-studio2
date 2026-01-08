import { NextResponse } from 'next/server';
import municipalitiesData from '../../../slovenske-obce-main/obce.json';

export interface MunicipalityListItem {
  name: string;
  district: string;
  region: string;
  slug: string;
}

// Helper function to generate slug from text
const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Count occurrences of each BASE SLUG to detect duplicates
const slugCount = new Map<string, number>();
municipalitiesData.forEach((item: { name: string }) => {
  const baseSlug = toSlug(item.name);
  slugCount.set(baseSlug, (slugCount.get(baseSlug) || 0) + 1);
});

export async function GET() {
  const simplified: MunicipalityListItem[] = municipalitiesData.map(
    (item: { name: string; district: string; region: string }) => {
      const baseSlug = toSlug(item.name);
      const isDuplicateSlug = (slugCount.get(baseSlug) || 0) > 1;

      // For duplicate slugs, create slug with district
      const slug = isDuplicateSlug
        ? toSlug(`${item.name}-${item.district}`)
        : baseSlug;

      return {
        name: item.name,
        district: item.district,
        region: item.region,
        slug,
      };
    }
  );

  return NextResponse.json(simplified, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
