import { czechCities } from "@/data/cities";

// Haversine formula to calculate distance between two GPS coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

// Map OSM region/state names to our Czech region names
const regionMapping: Record<string, string> = {
  "Hlavní město Praha": "Praha",
  "Středočeský kraj": "Středočeský kraj",
  "Jihočeský kraj": "Jihočeský kraj",
  "Plzeňský kraj": "Plzeňský kraj",
  "Karlovarský kraj": "Karlovarský kraj",
  "Ústecký kraj": "Ústecký kraj",
  "Liberecký kraj": "Liberecký kraj",
  "Královéhradecký kraj": "Královéhradecký kraj",
  "Pardubický kraj": "Pardubický kraj",
  "Kraj Vysočina": "Kraj Vysočina",
  "Jihomoravský kraj": "Jihomoravský kraj",
  "Olomoucký kraj": "Olomoucký kraj",
  "Moravskoslezský kraj": "Moravskoslezský kraj",
  "Zlínský kraj": "Zlínský kraj",
};

// Find the nearest city from the database based on user's coordinates
export const findNearestCity = async (
  userLatitude: number,
  userLongitude: number,
  detectedRegion?: string,
  excludeCityName?: string
): Promise<string | null> => {
  // Filter cities that have GPS coordinates and exclude detected city if specified
  let citiesToCheck = czechCities.filter(
    (city) => {
      const hasCoordinates = city.latitude !== undefined && city.longitude !== undefined;
      const notExcluded = !excludeCityName || city.name.toLowerCase() !== excludeCityName.toLowerCase();
      return hasCoordinates && notExcluded;
    }
  );

  if (citiesToCheck.length === 0) {
    console.error("No cities with GPS coordinates found in database");
    return null;
  }

  // If we have a detected region, filter cities by that region first
  if (detectedRegion) {
    const mappedRegion = regionMapping[detectedRegion] || detectedRegion;
    const citiesInRegion = citiesToCheck.filter(
      (city) => city.region === mappedRegion
    );

    // Only use region filtering if we found cities in that region
    if (citiesInRegion.length > 0) {
      citiesToCheck = citiesInRegion;
    }
  }

  // Calculate distances for all cities (this is now fast since we have coordinates in the database)
  const citiesWithDistance = citiesToCheck.map((city) => {
    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      city.latitude!,
      city.longitude!
    );

    return {
      name: city.name,
      distance,
    };
  });

  // Sort by distance and return the nearest city
  citiesWithDistance.sort((a, b) => a.distance - b.distance);

  return citiesWithDistance[0]?.name || null;
};
