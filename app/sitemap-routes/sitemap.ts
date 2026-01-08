/**
 * Sitemap - Taxi trasy medzi mestami
 *
 * Obsahuje ~870 trás (oba smery)
 * Stredná priorita - majú mapy a kalkulácie cien
 */

import { MetadataRoute } from 'next';
import routePagesData from '@/data/route-pages.json';
import cityRoutesData from '@/data/city-routes.json';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const revalidate = 86400; // 24 hours
export const runtime = 'nodejs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_CONSTANTS.siteUrl;
  // Trasy boli vytvorené pred mesiacom - starší lastmod
  const routesDate = new Date('2024-11-15');

  const sitemap: MetadataRoute.Sitemap = [];

  // Hub stránka pre taxi trasy
  sitemap.push({
    url: `${baseUrl}/taxi-trasa`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // Specialni trasy (letiste, atd.) - vyssi priorita
  if (routePagesData.routes.length > 0) {
    (routePagesData.routes as Array<{slug: string}>).forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/trasa/${route.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  }

  // City-to-city routes - oba smery
  cityRoutesData.routes.forEach((route: { from: string; to: string; distanceKm: number; durationMin: number; durationText: string }) => {
    // Originalni smer
    const slug = `${route.from}-${route.to}`;
    sitemap.push({
      url: `${baseUrl}/taxi-trasa/${slug}`,
      lastModified: routesDate,
      changeFrequency: 'monthly',
      priority: 0.55,
    });

    // Opacny smer
    const reversedSlug = `${route.to}-${route.from}`;
    sitemap.push({
      url: `${baseUrl}/taxi-trasa/${reversedSlug}`,
      lastModified: routesDate,
      changeFrequency: 'monthly',
      priority: 0.55,
    });
  });

  return sitemap;
}
