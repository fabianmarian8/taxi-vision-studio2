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
  servicesDescription?: string; // Popis služeb (pro inline editor)
  services?: string[];
  workingHours?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  pricelist?: PricelistItem[]; // Ceník taxislužby
  pricePerKm?: string; // Cena za km (např. "0.80€/km")
  paymentMethods?: string[]; // Způsoby platby
  whatsapp?: string; // WhatsApp číslo
  bookingUrl?: string; // URL na časovou objednávku
  secondaryCity?: string; // Druhé město působení (pro CTA sekci)
  customCtaTitle?: string; // Vlastní text pro CTA sekci (např. "do okolních obcí")
  pricelistUrl?: string; // Externí odkaz na ceník
  transportRulesUrl?: string; // Externí odkaz na přepravní řád
  contactUrl?: string; // Externí odkaz na kontaktní informace
}

export interface TaxiService {
  name: string;
  website?: string;
  phone?: string;
  phone2?: string; // Druhé telefonní číslo
  phone3?: string; // Třetí telefonní číslo
  address?: string; // Adresa taxislužby z Google Places API
  placeId?: string; // Google Places ID pro budoucí využití
  description?: string;
  customDescription?: string; // Vlastní text pro detail stránku (místo generování)
  logo?: string; // Cesta k logu taxislužby (např. /logos/fast-taxi-zvolen.webp)
  gallery?: string[]; // Pole cest k fotkám taxislužby (zobrazí se jako galerie)
  isPremium?: boolean;
  isPartner?: boolean;
  isPromotional?: boolean; // Flag pro marketingové promo premium (neplatí)
  premiumExpiresAt?: string; // ISO date string pro expiraci
  partnerData?: PartnerData;
  redirectTo?: string; // Přesměrování na jinou stránku (např. partner stránku v jiném městě)
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
  isVillage?: boolean; // true pro obce, které mají taxi ale nejsou města
}

// Načtení dat z JSON souboru
export const czechCities: CityData[] = citiesDataJson.cities as CityData[];

export const getCityBySlug = (slug: string): CityData | undefined => {
  return czechCities.find(city => city.slug === slug);
};

// Získání jedinečného seznamu krajů
export const getUniqueRegions = (): string[] => {
  const regions = czechCities.map(city => city.region);
  return Array.from(new Set(regions)).sort();
};

// Funkce na vytvoření slug z názvu kraje
export const createRegionSlug = (regionName: string): string => {
  return regionName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Odstranění diakritiky
    .replace(/\s+/g, '-'); // Nahrazení mezer pomlčkami
};

// Získání měst v daném kraji (vyloučí obce s isVillage: true)
export const getCitiesByRegion = (regionName: string): CityData[] => {
  return czechCities
    .filter(city => city.region === regionName && !city.isVillage)
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
};

// Získání kraje podle slug
export const getRegionBySlug = (slug: string): string | undefined => {
  const regions = getUniqueRegions();
  return regions.find(region => createRegionSlug(region) === slug);
};

// Export regionu s daty
export interface RegionData {
  name: string;
  slug: string;
  citiesCount: number;
}

// Získání všech regionů s daty
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

