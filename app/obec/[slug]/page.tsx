import { redirect, notFound } from 'next/navigation';
import municipalityData from '@/data/municipality-data.json';

// Typy pre municipality data
interface Municipality {
  name: string;
  slug: string;
  district: string;
  region: string;
  postalCode?: string;
  population?: number;
  area?: number;
}

interface MunicipalityData {
  lastUpdated: string;
  source: string;
  count: number;
  municipalities: Record<string, Municipality>;
}

// Helper na vytvorenie slug pre kraj
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getRegionSlug(region: string): string {
  // "Banskobystrický kraj kraj" -> "banskobystricky-kraj"
  let slug = toSlug(region.replace(/ kraj kraj$/i, ' kraj').replace(/ kraj$/i, ''));
  if (!slug.endsWith('-kraj')) {
    slug = slug + '-kraj';
  }
  return slug;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ObecRedirectPage({ params }: PageProps) {
  const { slug } = await params;

  // Nájdi obec v databáze
  const data = municipalityData as unknown as MunicipalityData;
  const municipalities = data.municipalities;
  const obec = municipalities[slug];

  if (!obec) {
    // Skús nájsť bez diakritiky
    const found = Object.values(municipalities).find((m: Municipality) =>
      toSlug(m.name) === slug || m.slug === slug
    );

    if (found) {
      const regionSlug = getRegionSlug(found.region);
      const districtSlug = toSlug(found.district);
      redirect(`/taxi/${regionSlug}/${districtSlug}/${found.slug}`);
    }

    notFound();
  }

  // Presmeruj na správnu URL
  const regionSlug = getRegionSlug(obec.region);
  const districtSlug = toSlug(obec.district);

  redirect(`/taxi/${regionSlug}/${districtSlug}/${obec.slug}`);
}
