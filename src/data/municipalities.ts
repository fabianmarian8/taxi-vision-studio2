// Czech municipalities - data to be populated from czech-obce source
// This file was cleared to remove Slovak data dependencies

export interface Municipality {
  name: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
  slug: string;
  isVillage?: boolean;
}

// Empty array - Czech municipalities data to be added
export const allMunicipalities: Municipality[] = [];

/**
 * Get municipality by slug
 */
export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return allMunicipalities.find((m) => m.slug === slug);
}

/**
 * Get municipalities by district name
 */
export function getMunicipalitiesByDistrict(district: string): Municipality[] {
  return allMunicipalities.filter((m) => m.district === district);
}

/**
 * Check if slug is a municipality (not in main cities list)
 */
export function isMunicipality(slug: string): boolean {
  return allMunicipalities.some((m) => m.slug === slug);
}

/**
 * Find nearby municipalities by geographic distance
 * Returns empty array until Czech data is populated
 */
export function findNearbyMunicipalities(
  municipality: Municipality,
  limit: number = 12,
  sameDistrictOnly: boolean = false
): Municipality[] {
  return [];
}

// Re-export TaxiService type for compatibility
import { type TaxiService, type CityData } from './cities';

/**
 * Find nearest cities with taxi services
 * Returns empty array until properly integrated with Czech data
 */
export function findNearestCitiesWithTaxis(
  municipality: Municipality,
  limit: number = 3
): Array<{ city: CityData; distance: number; roadDistance: number; duration: number }> {
  return [];
}

/**
 * Get precomputed distance between municipality and city
 * Returns null - no precomputed data available
 */
export function getPrecomputedDistance(
  municipalitySlug: string,
  citySlug: string
): null {
  return null;
}
