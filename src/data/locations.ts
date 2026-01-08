import locationsData from './locations.json';
import { Municipality } from './municipalities';

export interface Location {
  name: string;
  slug: string;
  region: string;
  district: string;
  latitude: number;
  longitude: number;
  nearestCitySlug: string;
  description: string;
  metaDescription: string;
  content?: {
    intro: string;
    transport: string;
    attractions: string;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export const locations: Location[] = locationsData as Location[];

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

// Helper to convert Location to Municipality interface for compatibility
export function locationToMunicipality(location: Location): Municipality {
  return {
    name: location.name,
    slug: location.slug,
    region: location.region,
    district: location.district,
    latitude: location.latitude,
    longitude: location.longitude,
    isVillage: true // Locations behave like villages (no own taxi service usually)
  };
}
