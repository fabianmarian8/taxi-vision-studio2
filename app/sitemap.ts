/**
 * Sitemap - Základné stránky (Homepage, Legal, Blog, Kraje, Okresy)
 *
 * Next.js automaticky generuje /sitemap.xml z tohto súboru
 * Ďalšie sitemapy:
 * - /sitemap-cities/sitemap.xml - Mestá s taxi (~1000 URL)
 * - /sitemap-routes/sitemap.xml - Taxi trasy (~870 URL)
 * - /sitemap-municipalities/sitemap.xml - Obce (~2900 URL)
 */

import { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';
import { getAllDistricts } from '@/data/districts';
import { createRegionSlug } from '@/data/cities';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const revalidate = 86400; // 24 hours
export const runtime = 'nodejs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_CONSTANTS.siteUrl;
  const currentDate = new Date();

  // Získanie unikátnych regiónov
  const regions = [...new Set(citiesData.cities.map((city) => city.region))].sort();

  const sitemap: MetadataRoute.Sitemap = [];

  // Homepage - NAJVYŠŠIA PRIORITA
  sitemap.push({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Stránky krajov
  regions.forEach((region) => {
    const regionSlug = createRegionSlug(region);
    sitemap.push({
      url: `${baseUrl}/kraj/${regionSlug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // Stránky okresov - /taxi/[regionSlug]/[districtSlug]
  const districts = getAllDistricts();
  districts.forEach((district) => {
    sitemap.push({
      url: `${baseUrl}/taxi/${district.regionSlug}/${district.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Právne stránky a info stránky
  const legalPages = [
    { path: '/ochrana-sukromia', priority: 0.3 },
    { path: '/cookies', priority: 0.3 },
    { path: '/podmienky-pouzivania', priority: 0.3 },
    { path: '/obchodne-podmienky', priority: 0.3 },
    { path: '/kontakt', priority: 0.5 },
    { path: '/pre-taxiky', priority: 0.6 },
    { path: '/o-nas', priority: 0.6 },
  ];

  legalPages.forEach((page) => {
    sitemap.push({
      url: `${baseUrl}${page.path}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: page.priority,
    });
  });

  // Blog články
  const blogArticles = [
    '/hodnotenie-vodicov',
    '/alkohol-nocny-zivot',
    '/co-musi-zniest-vodic',
    '/elektrifikacia-taxi',
    '/komunikacia-taxikar-zakaznik',
    '/navigacia',
    '/psychologia-zakaznikov',
    '/taxi-ceny',
    '/komplexny-sprievodca-taxi',
    '/temna-strana-bolt-uber',
    '/porovnanie-cien-taxi-2024-2025',
    '/koncesia-taxisluzba-2025',
    '/kontrola-financna-sprava-taxi',
  ];

  blogArticles.forEach((article) => {
    sitemap.push({
      url: `${baseUrl}${article}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  return sitemap;
}
