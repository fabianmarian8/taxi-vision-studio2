/**
 * Script na získanie Google Place IDs pre taxi služby
 *
 * Použitie:
 * GOOGLE_PLACES_API_KEY=your_key npx ts-node scripts/fetch-place-ids.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routePagesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/route-pages.json'), 'utf-8')
);

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const DELAY_MS = 200; // Delay medzi requestami aby sme neprekročili rate limit

interface TextSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}

/**
 * Získa Place ID cez Text Search API
 */
async function searchPlaceId(query: string): Promise<TextSearchResult | null> {
  if (!API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY nie je nastavený');
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=sk`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]; // Prvý výsledok
      return {
        place_id: result.place_id,
        name: result.name,
        formatted_address: result.formatted_address,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total
      };
    }

    console.warn(`❌ Nenašlo sa: ${query} (${data.status})`);
    return null;
  } catch (error) {
    console.error(`Error pri hľadaní ${query}:`, error);
    return null;
  }
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Začínam získavanie Place IDs...\n');

  const updatedRoutes = [];

  for (const route of routePagesData.routes) {
    console.log(`\n📍 Trasa: ${route.slug}`);
    console.log(`   ${route.origin} → ${route.destination}`);

    const updatedCarriers = [];

    for (const carrier of route.carriers) {
      // Skip ak už má Place ID
      if ((carrier as any).googlePlaceId) {
        console.log(`   ✓ ${carrier.name} (už má Place ID)`);
        updatedCarriers.push(carrier);
        continue;
      }

      // Vytvor search query
      const query = `${carrier.name} ${route.origin} taxi`;
      console.log(`   🔍 Hľadám: ${query}`);

      const result = await searchPlaceId(query);

      if (result) {
        console.log(`   ✅ ${carrier.name}:`);
        console.log(`      Place ID: ${result.place_id}`);
        console.log(`      Rating: ${result.rating || 'N/A'} (${result.user_ratings_total || 0} recenzií)`);

        updatedCarriers.push({
          ...carrier,
          googlePlaceId: result.place_id,
          googleRating: result.rating,
          googleReviewsCount: result.user_ratings_total
        });
      } else {
        console.log(`   ⚠️  ${carrier.name} - nenašlo sa`);
        updatedCarriers.push(carrier);
      }

      // Delay medzi requestami
      await delay(DELAY_MS);
    }

    updatedRoutes.push({
      ...route,
      carriers: updatedCarriers
    });
  }

  // Ulož aktualizované dáta
  const updatedData = {
    routes: updatedRoutes,
    disclaimer: routePagesData.disclaimer
  };

  const outputPath = path.join(__dirname, '../src/data/route-pages.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), 'utf-8');

  console.log('\n✨ Hotovo! route-pages.json bol aktualizovaný.');
  console.log(`📝 Celkom trás: ${updatedRoutes.length}`);

  // Štatistiky
  let totalCarriers = 0;
  let carriersWithPlaceId = 0;

  for (const route of updatedRoutes) {
    totalCarriers += route.carriers.length;
    carriersWithPlaceId += route.carriers.filter((c: any) => c.googlePlaceId).length;
  }

  console.log(`📊 Prepravcovia s Place ID: ${carriersWithPlaceId}/${totalCarriers}`);
}

main().catch(console.error);
