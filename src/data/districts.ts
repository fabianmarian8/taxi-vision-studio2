import { allMunicipalities, Municipality } from './municipalities';
import { createRegionSlug } from './cities';

export interface District {
  name: string;
  slug: string;
  region: string;
  regionSlug: string;
  municipalitiesCount: number;
}

/**
 * Create slug from district name
 */
export function createDistrictSlug(districtName: string): string {
  return districtName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Get all unique districts with their data
 */
export function getAllDistricts(): District[] {
  const districtMap = new Map<string, { region: string; count: number }>();

  allMunicipalities.forEach((mun) => {
    const existing = districtMap.get(mun.district);
    if (existing) {
      existing.count++;
    } else {
      districtMap.set(mun.district, { region: mun.region, count: 1 });
    }
  });

  const districts: District[] = [];
  districtMap.forEach((data, name) => {
    districts.push({
      name,
      slug: createDistrictSlug(name),
      region: data.region,
      regionSlug: createRegionSlug(data.region),
      municipalitiesCount: data.count,
    });
  });

  return districts.sort((a, b) => a.name.localeCompare(b.name, 'sk'));
}

/**
 * Get districts by region name
 */
export function getDistrictsByRegion(regionName: string): District[] {
  return getAllDistricts().filter((d) => d.region === regionName);
}

/**
 * Get districts by region slug
 */
export function getDistrictsByRegionSlug(regionSlug: string): District[] {
  return getAllDistricts().filter((d) => d.regionSlug === regionSlug);
}

/**
 * Get district by slug and region slug
 */
export function getDistrictBySlugAndRegion(
  districtSlug: string,
  regionSlug: string
): District | undefined {
  return getAllDistricts().find(
    (d) => d.slug === districtSlug && d.regionSlug === regionSlug
  );
}

/**
 * Get district by slug only (may return first match if multiple regions have same district name)
 */
export function getDistrictBySlug(districtSlug: string): District | undefined {
  return getAllDistricts().find((d) => d.slug === districtSlug);
}

/**
 * Get all municipalities in a district
 */
export function getMunicipalitiesByDistrict(districtName: string): Municipality[] {
  return allMunicipalities
    .filter((m) => m.district === districtName)
    .sort((a, b) => a.name.localeCompare(b.name, 'sk'));
}

/**
 * Get all municipalities in a district by slug
 */
export function getMunicipalitiesByDistrictSlug(districtSlug: string): Municipality[] {
  const district = getDistrictBySlug(districtSlug);
  if (!district) return [];
  return getMunicipalitiesByDistrict(district.name);
}

/**
 * Get district for a municipality
 */
export function getDistrictForMunicipality(municipality: Municipality): District | undefined {
  return getAllDistricts().find((d) => d.name === municipality.district);
}

/**
 * Check if a slug is a valid district slug
 */
export function isValidDistrictSlug(slug: string): boolean {
  return getAllDistricts().some((d) => d.slug === slug);
}

/**
 * Check if a slug is a valid region slug
 */
export function isValidRegionSlug(slug: string): boolean {
  const regions = new Set(getAllDistricts().map((d) => d.regionSlug));
  return regions.has(slug);
}
