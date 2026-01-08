/**
 * Sitemap - Mestá s taxi službami (NAJVYŠŠIA PRIORITA)
 *
 * Obsahuje ~155 miest + ich taxislužby (~884)
 * Tieto stránky majú reálny obsah a mali by byť indexované prednostne
 *
 * Pre obce (isVillage: true) sa používa hierarchická URL štruktúra:
 * /taxi/{regionSlug}/{districtSlug}/{slug}
 */

import { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';
import { getMunicipalityBySlug } from '@/data/municipalities';
import { getDistrictForMunicipality } from '@/data/districts';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const revalidate = 86400; // 24 hours
export const runtime = 'nodejs';

// Helper funkcia pre vytvorenie slug
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

  // Stránky miest s taxi službami - NAJVYŠŠIA PRIORITA
  citiesData.cities.forEach((city) => {
    const hasTaxi = city.taxiServices && city.taxiServices.length > 0;

    if (hasTaxi) {
      let cityUrl: string;

      // Pre obce (isVillage: true) použiť hierarchickú URL
      if (city.isVillage) {
        const municipality = getMunicipalityBySlug(city.slug);
        const district = municipality ? getDistrictForMunicipality(municipality) : null;

        if (district) {
          cityUrl = `${baseUrl}/taxi/${district.regionSlug}/${district.slug}/${city.slug}`;
        } else {
          // Fallback na jednoduchú URL ak sa nenájde okres
          cityUrl = `${baseUrl}/taxi/${city.slug}`;
        }
      } else {
        // Štandardné mestá - jednoduchá URL
        cityUrl = `${baseUrl}/taxi/${city.slug}`;
      }

      // Mesto/obec s taxi
      sitemap.push({
        url: cityUrl,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
      });

      // Jednotlivé taxislužby - používame rovnakú base URL ako mesto
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
