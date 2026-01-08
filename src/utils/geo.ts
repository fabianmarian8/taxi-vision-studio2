/**
 * Geographic utility functions for distance calculations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate taxi price based on distance
 * Formula: distance * 1€ (no boarding fee)
 * @param distanceKm Distance in kilometers
 * @returns Estimated price range {min, max}
 */
export function estimateTaxiPrice(distanceKm: number): { min: number; max: number } {
  const pricePerKm = 1.0;

  const basePrice = distanceKm * pricePerKm;

  // Add ±10% variance for min/max
  const min = Math.ceil(basePrice * 0.9);
  const max = Math.ceil(basePrice * 1.1);

  return { min, max };
}
