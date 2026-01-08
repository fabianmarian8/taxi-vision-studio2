import citiesDataJson from './cities.json';

export interface PricelistItem {
  destination: string;
  distance?: number; // km
  price: string;
  note?: string;
}

export interface PartnerData {
  heroImage?: string;
  shortDescription?: string;
  description?: string;
  servicesDescription?: string; // Popis služieb (pre inline editor)
  services?: string[];
  workingHours?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  pricelist?: PricelistItem[]; // Cenník taxislužby
  pricePerKm?: string; // Cena za km (napr. "0.80€/km")
  paymentMethods?: string[]; // Spôsoby platby
  whatsapp?: string; // WhatsApp číslo
  bookingUrl?: string; // URL na časovú objednávku
  secondaryCity?: string; // Druhé mesto pôsobenia (pre CTA sekciu)
  customCtaTitle?: string; // Vlastný text pre CTA sekciu (napr. "do okolitých obcí")
  pricelistUrl?: string; // Externý odkaz na cenník
  transportRulesUrl?: string; // Externý odkaz na prepravný poriadok
  contactUrl?: string; // Externý odkaz na kontaktné informácie
}

export interface TaxiService {
  name: string;
  website?: string;
  phone?: string;
  phone2?: string; // Druhé telefónne číslo
  phone3?: string; // Tretie telefónne číslo
  address?: string; // Adresa taxislužby z Google Places API
  placeId?: string; // Google Places ID pre budúce využitie
  description?: string;
  customDescription?: string; // Vlastný text pre detail stránku (namiesto generovania)
  logo?: string; // Cesta k logu taxislužby (napr. /logos/fast-taxi-zvolen.webp)
  gallery?: string[]; // Pole ciest k fotkám taxislužby (zobrazí sa ako galéria)
  isPremium?: boolean;
  isPartner?: boolean;
  isPromotional?: boolean; // Flag pre marketingové promo premium (neplatia)
  premiumExpiresAt?: string; // ISO date string pre expiráciu
  partnerData?: PartnerData;
  redirectTo?: string; // Presmerovanie na inú stránku (napr. partner stránku v inom meste)
  nonstop?: boolean; // 24/7 služba
}

export interface CityData {
  name: string;
  slug: string;
  region: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  taxiServices: TaxiService[];
  latitude?: number;
  longitude?: number;
  heroImage?: string;
  isVillage?: boolean; // true pre obce, ktoré majú taxi ale nie sú mestá
}

// Načítanie dát z JSON súboru
export const czechCities: CityData[] = citiesDataJson.cities as CityData[];

// Backward compatibility alias
export const slovakCities = czechCities;

export const getCityBySlug = (slug: string): CityData | undefined => {
  return czechCities.find(city => city.slug === slug);
};

// Získanie jedinečného zoznamu krajů
export const getUniqueRegions = (): string[] => {
  const regions = czechCities.map(city => city.region);
  return Array.from(new Set(regions)).sort();
};

// Funkcia na vytvorenie slug z názvu kraja
export const createRegionSlug = (regionName: string): string => {
  return regionName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Odstránenie diakritiky
    .replace(/\s+/g, '-'); // Nahradenie medzier pomlčkami
};

// Získanie miest v daném kraji (vylúči obce s isVillage: true)
export const getCitiesByRegion = (regionName: string): CityData[] => {
  return czechCities
    .filter(city => city.region === regionName && !city.isVillage)
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
};

// Získanie kraja podľa slug
export const getRegionBySlug = (slug: string): string | undefined => {
  const regions = getUniqueRegions();
  return regions.find(region => createRegionSlug(region) === slug);
};

// Export regiónu s dátami
export interface RegionData {
  name: string;
  slug: string;
  citiesCount: number;
}

// Získanie všetkých regiónov s dátami
export const getRegionsData = (): RegionData[] => {
  const regions = getUniqueRegions();
  return regions.map(region => ({
    name: region,
    slug: createRegionSlug(region),
    citiesCount: getCitiesByRegion(region).length
  }));
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistanceBetweenCities = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find nearby cities with taxi services
 * @param currentCity The city to search from
 * @param limit How many nearby cities to return (default 5)
 * @returns Array of cities sorted by distance
 */
export const findNearbyCitiesWithTaxis = (
  currentCity: CityData,
  limit: number = 5
): Array<{ city: CityData; distance: number }> => {
  if (!currentCity.latitude || !currentCity.longitude) {
    return [];
  }

  // Get cities with taxi services and coordinates, excluding current city
  const citiesWithTaxis = czechCities.filter(
    (city) =>
      city.slug !== currentCity.slug &&
      city.taxiServices &&
      city.taxiServices.length > 0 &&
      city.latitude &&
      city.longitude
  );

  // Calculate distances
  const citiesWithDistances = citiesWithTaxis.map((city) => ({
    city,
    distance: Math.round(
      calculateDistanceBetweenCities(
        currentCity.latitude!,
        currentCity.longitude!,
        city.latitude!,
        city.longitude!
      )
    ),
  }));

  // Sort by distance and return limited results
  return citiesWithDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

