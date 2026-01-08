/**
 * Sitemap - Mesta s taxi sluzbami (NEJVYSSI PRIORITA)
 *
 * Obsahuje mesta + jejich taxisluzby
 * Tyto stranky maji realni obsah a meli by byt indexovane prednostne
 */

import { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const revalidate = 86400; // 24 hours
export const runtime = 'nodejs';

// Typ pro city data
interface CityDataItem {
  name: string;
  slug: string;
  region: string;
  district?: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  taxiServices: Array<{ name: string; phone?: string; website?: string }>;
  latitude: number;
  longitude: number;
  isVillage?: boolean;
}

// Helper funkce pro vytvoreni slug
const createServiceSlug = (serviceName: string): string => {
  return serviceName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_CONSTANTS.siteUrl;
  const currentDate = new Date();

  const sitemap: MetadataRoute.Sitemap = [];

  // Stranky mest s taxi sluzbami - NEJVYSSI PRIORITA
  (citiesData.cities as CityDataItem[]).forEach((city) => {
    const hasTaxi = city.taxiServices && city.taxiServices.length > 0;

    if (hasTaxi) {
      // Jednoducha URL pro vsechna mesta
      const cityUrl = `${baseUrl}/taxi/${city.slug}`;

      // Mesto s taxi
      sitemap.push({
        url: cityUrl,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
      });

      // Jednotlive taxisluzby
      city.taxiServices.forEach((service) => {
        const serviceSlug = createServiceSlug(service.name);
        sitemap.push({
          url: `${cityUrl}/${serviceSlug}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      });
    }
  });

  return sitemap;
}
