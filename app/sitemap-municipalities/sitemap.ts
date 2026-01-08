/**
 * Sitemap - Prioritné obce (Smart Sitemap)
 *
 * STRATÉGIA: Do sitemapy idú len obce s preukázaným dopytom
 * - Obce s GSC impressions > 0 (~187)
 * - Turisticky významné obce (~50)
 *
 * Zvyšok obcí (~2700) zostáva INDEXOVATEĽNÝ, ale nie je v sitemape.
 * Google ich nájde cez interné linky ak uzná že si to zaslúžia.
 *
 * Dôvod: Pri ~4900 URL v sitemape Google ignoroval ~93% obcí.
 * Sitemap má byť "prioritná fronta", nie "zoznam všetkého".
 */

import { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';
import { allMunicipalities } from '@/data/municipalities';
import { getDistrictForMunicipality } from '@/data/districts';
import { isPriorityMunicipality } from '@/data/priority-municipalities';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const revalidate = 86400; // 24 hours
export const runtime = 'nodejs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_CONSTANTS.siteUrl;
  const currentDate = new Date();

  const sitemap: MetadataRoute.Sitemap = [];

  // Filtrujeme obce, ktoré už sú pokryté v mestách (majú taxi)
  const existingSlugs = new Set(citiesData.cities.map((c) => c.slug));

  allMunicipalities.forEach((obec) => {
    // Pridať iba ak:
    // 1. Nie je pokryté v hlavnom zozname miest (má taxi)
    // 2. JE prioritná obec (má impressions alebo je turisticky významná)
    if (!existingSlugs.has(obec.slug) && isPriorityMunicipality(obec.slug)) {
      const district = getDistrictForMunicipality(obec);

      if (district) {
        // Hierarchický formát: /taxi/[regionSlug]/[districtSlug]/[municipalitySlug]
        sitemap.push({
          url: `${baseUrl}/taxi/${district.regionSlug}/${district.slug}/${obec.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly', // Prioritné obce crawlovať častejšie
          priority: 0.5, // Vyššia priorita pre prioritné obce
        });
      }
    }
  });

  return sitemap;
}
