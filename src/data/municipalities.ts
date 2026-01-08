import municipalitiesData from '../../slovenske-obce-main/obce.json';
import { slovakCities, CityData } from './cities';
import { calculateDistance } from '@/utils/geo';
import precomputedDistancesData from './precomputed-distances.json';

export interface Municipality {
  name: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
  slug: string;
  isVillage?: boolean;
}

interface PrecomputedDistance {
  municipalitySlug: string;
  citySlug: string;
  airDistance: number;
  roadDistance: number;
  duration: number;
}

// Build lookup map for precomputed distances: "municipalitySlug:citySlug" -> distance data
const precomputedDistanceMap = new Map<string, PrecomputedDistance>();
(precomputedDistancesData.distances as PrecomputedDistance[]).forEach((d) => {
  precomputedDistanceMap.set(`${d.municipalitySlug}:${d.citySlug}`, d);
});

// Helper function to generate slug from text
const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// First pass: count occurrences of each BASE SLUG to detect duplicates
// This catches cases like "Lukáčovce" and "Lukačovce" which have different names
// but produce the same slug "lukacovce" after normalization
const slugCount = new Map<string, number>();
municipalitiesData.forEach((item: { name: string }) => {
  const baseSlug = toSlug(item.name);
  slugCount.set(baseSlug, (slugCount.get(baseSlug) || 0) + 1);
});

// Transform obce.json format (x,y) to our format (latitude, longitude)
// For duplicate slugs, include district in slug to make it unique
const allMunicipalities: Municipality[] = municipalitiesData.map((item: { name: string; district: string; region: string; x: number; y: number }) => {
  const baseSlug = toSlug(item.name);
  const isDuplicateSlug = (slugCount.get(baseSlug) || 0) > 1;

  // For duplicate slugs, create slug with district (e.g., "lukacovce-nitra", "lukacovce-humenne")
  const slug = isDuplicateSlug
    ? toSlug(`${item.name}-${item.district}`)
    : baseSlug;

  return {
    name: item.name,
    district: item.district,
    region: item.region,
    latitude: item.x,
    longitude: item.y,
    slug,
  };
});

/**
 * Get municipality by slug
 */
export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return allMunicipalities.find((m) => m.slug === slug);
}

/**
 * Get precomputed road distance between municipality and city
 * Returns null if not found in precomputed data
 */
export function getPrecomputedDistance(
  municipalitySlug: string,
  citySlug: string
): PrecomputedDistance | null {
  return precomputedDistanceMap.get(`${municipalitySlug}:${citySlug}`) || null;
}

/**
 * Find nearest cities with taxi services using precomputed road distances
 * @param municipality The municipality to search from
 * @param limit How many nearest cities to return
 * @returns Array of cities sorted by road distance
 */
export function findNearestCitiesWithTaxis(
  municipality: Municipality,
  limit: number = 3
): Array<{ city: CityData; distance: number; roadDistance: number; duration: number }> {
  // Only consider cities that have taxi services
  const citiesWithTaxis = slovakCities.filter(
    (city) => city.taxiServices && city.taxiServices.length > 0 && city.latitude && city.longitude
  );

  // Calculate distances - prefer precomputed road distances
  const citiesWithDistances = citiesWithTaxis.map((city) => {
    const precomputed = getPrecomputedDistance(municipality.slug, city.slug);
    const airDistance = calculateDistance(
      { latitude: municipality.latitude, longitude: municipality.longitude },
      { latitude: city.latitude!, longitude: city.longitude! }
    );

    if (precomputed && precomputed.roadDistance > 0) {
      return {
        city,
        distance: precomputed.airDistance, // Keep air distance for compatibility
        roadDistance: precomputed.roadDistance,
        duration: precomputed.duration,
      };
    }

    // Fallback to estimate if no precomputed data or same city (0km)
    const estimatedRoadDistance = Math.round(airDistance * 2.0 * 10) / 10;
    return {
      city,
      distance: airDistance,
      roadDistance: estimatedRoadDistance,
      duration: Math.round(estimatedRoadDistance * 1.5),
    };
  });

  // Sort by road distance and filter out 0km (same city)
  return citiesWithDistances
    .filter((c) => c.roadDistance > 0)
    .sort((a, b) => a.roadDistance - b.roadDistance)
    .slice(0, limit);
}

/**
 * Check if slug is a municipality (not in main cities list)
 */
export function isMunicipality(slug: string): boolean {
  const isMainCity = slovakCities.some((city) => city.slug === slug);
  const isMunicipality = allMunicipalities.some((m) => m.slug === slug);
  return !isMainCity && isMunicipality;
}

/**
 * Find nearby municipalities by geographic distance
 * Returns municipalities sorted by air distance from the current one
 * @param municipality The current municipality
 * @param limit How many nearby municipalities to return
 * @param sameDistrictOnly If true, only return municipalities from the same district
 */
export function findNearbyMunicipalities(
  municipality: Municipality,
  limit: number = 12,
  sameDistrictOnly: boolean = false
): Municipality[] {
  return allMunicipalities
    .filter((m) => {
      if (m.slug === municipality.slug) return false;
      if (sameDistrictOnly && m.district !== municipality.district) return false;
      return true;
    })
    .map((m) => ({
      municipality: m,
      distance: calculateDistance(
        { latitude: municipality.latitude, longitude: municipality.longitude },
        { latitude: m.latitude, longitude: m.longitude }
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((item) => item.municipality);
}

export { allMunicipalities };
