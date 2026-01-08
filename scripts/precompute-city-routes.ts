/**
 * Script na predpočítanie vzdialeností medzi TOP 30 mestami
 *
 * Použitie:
 * ORS_API_KEY=your_key npx ts-node scripts/precompute-city-routes.ts
 *
 * Alebo s Google API:
 * GOOGLE_API_KEY=your_key npx ts-node scripts/precompute-city-routes.ts --google
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TOP 30 miest podľa počtu taxi služieb
const TOP_CITIES = [
  { name: 'Bratislava', slug: 'bratislava', lat: 48.1486, lng: 17.1077 },
  { name: 'Žilina', slug: 'zilina', lat: 49.2231, lng: 18.7394 },
  { name: 'Dunajská Streda', slug: 'dunajska-streda', lat: 47.9931, lng: 17.6183 },
  { name: 'Košice', slug: 'kosice', lat: 48.7164, lng: 21.2611 },
  { name: 'Poprad', slug: 'poprad', lat: 49.0600, lng: 20.2975 },
  { name: 'Trenčín', slug: 'trencin', lat: 48.8945, lng: 18.0444 },
  { name: 'Lučenec', slug: 'lucenec', lat: 48.3308, lng: 19.6669 },
  { name: 'Považská Bystrica', slug: 'povazska-bystrica', lat: 49.1217, lng: 18.4214 },
  { name: 'Prešov', slug: 'presov', lat: 48.9986, lng: 21.2392 },
  { name: 'Banská Bystrica', slug: 'banska-bystrica', lat: 48.7360, lng: 19.1461 },
  { name: 'Liptovský Mikuláš', slug: 'liptovsky-mikulas', lat: 49.0839, lng: 19.6119 },
  { name: 'Michalovce', slug: 'michalovce', lat: 48.7547, lng: 21.9178 },
  { name: 'Nitra', slug: 'nitra', lat: 48.3069, lng: 18.0864 },
  { name: 'Nové Mesto nad Váhom', slug: 'nove-mesto-nad-vahom', lat: 48.7578, lng: 17.8303 },
  { name: 'Spišská Nová Ves', slug: 'spisska-nova-ves', lat: 48.9461, lng: 20.5592 },
  { name: 'Zvolen', slug: 'zvolen', lat: 48.5744, lng: 19.1236 },
  { name: 'Dolný Kubín', slug: 'dolny-kubin', lat: 49.2094, lng: 19.3014 },
  { name: 'Martin', slug: 'martin', lat: 49.0636, lng: 18.9236 },
  { name: 'Piešťany', slug: 'piestany', lat: 48.5917, lng: 17.8336 },
  { name: 'Ružomberok', slug: 'ruzomberok', lat: 49.0794, lng: 19.3061 },
  { name: 'Senec', slug: 'senec', lat: 48.2192, lng: 17.3997 },
  { name: 'Trnava', slug: 'trnava', lat: 48.3775, lng: 17.5883 },
  { name: 'Bardejov', slug: 'bardejov', lat: 49.2922, lng: 21.2767 },
  { name: 'Galanta', slug: 'galanta', lat: 48.1900, lng: 17.7267 },
  { name: 'Humenné', slug: 'humenne', lat: 48.9356, lng: 21.9064 },
  { name: 'Prievidza', slug: 'prievidza', lat: 48.7744, lng: 18.6247 },
  { name: 'Rimavská Sobota', slug: 'rimavska-sobota', lat: 48.3828, lng: 20.0219 },
  { name: 'Štúrovo', slug: 'sturovo', lat: 47.7986, lng: 18.7172 },
  { name: 'Topoľčany', slug: 'topolcany', lat: 48.5617, lng: 18.1783 },
  { name: 'Levice', slug: 'levice', lat: 48.2167, lng: 18.6000 },
];

interface RouteData {
  from: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
  };
  to: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
  };
  slug: string; // abecedne zoradený slug: "bratislava-zilina"
  distance_km: number;
  duration_min: number;
  geometry?: number[][]; // polyline pre mapu
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch route from OpenRouteService
async function fetchORS(from: typeof TOP_CITIES[0], to: typeof TOP_CITIES[0]): Promise<RouteData | null> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    console.error('ORS_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${from.lng},${from.lat}&end=${to.lng},${to.lat}`
    );

    if (!response.ok) {
      console.error(`ORS Error for ${from.name}-${to.name}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const distance_km = Math.round(feature.properties.summary.distance / 1000);
    const duration_min = Math.round(feature.properties.summary.duration / 60);
    const geometry = feature.geometry?.coordinates;

    // Zoradiť abecedne pre kanonický slug
    const [first, second] = [from, to].sort((a, b) => a.slug.localeCompare(b.slug));
    const slug = `${first.slug}-${second.slug}`;

    return {
      from: { name: from.name, slug: from.slug, lat: from.lat, lng: from.lng },
      to: { name: to.name, slug: to.slug, lat: to.lat, lng: to.lng },
      slug,
      distance_km,
      duration_min,
      geometry,
    };
  } catch (error) {
    console.error(`Error fetching ${from.name}-${to.name}:`, error);
    return null;
  }
}

// Fetch route from Google Directions API
async function fetchGoogle(from: typeof TOP_CITIES[0], to: typeof TOP_CITIES[0]): Promise<RouteData | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error(`Google Error for ${from.name}-${to.name}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) return null;

    const leg = route.legs[0];
    const distance_km = Math.round(leg.distance.value / 1000);
    const duration_min = Math.round(leg.duration.value / 60);

    // Zoradiť abecedne pre kanonický slug
    const [first, second] = [from, to].sort((a, b) => a.slug.localeCompare(b.slug));
    const slug = `${first.slug}-${second.slug}`;

    return {
      from: { name: from.name, slug: from.slug, lat: from.lat, lng: from.lng },
      to: { name: to.name, slug: to.slug, lat: to.lat, lng: to.lng },
      slug,
      distance_km,
      duration_min,
    };
  } catch (error) {
    console.error(`Error fetching ${from.name}-${to.name}:`, error);
    return null;
  }
}

async function main() {
  const useGoogle = process.argv.includes('--google');
  const fetchFn = useGoogle ? fetchGoogle : fetchORS;
  const apiName = useGoogle ? 'Google' : 'OpenRouteService';

  console.log(`Using ${apiName} API`);
  console.log(`Processing ${TOP_CITIES.length} cities...`);

  const routes: RouteData[] = [];
  const processedSlugs = new Set<string>();

  // Generovať všetky kombinácie (len unikátne - abecedne)
  for (let i = 0; i < TOP_CITIES.length; i++) {
    for (let j = i + 1; j < TOP_CITIES.length; j++) {
      const from = TOP_CITIES[i];
      const to = TOP_CITIES[j];

      // Slug je už abecedne zoradený
      const [first, second] = [from, to].sort((a, b) => a.slug.localeCompare(b.slug));
      const slug = `${first.slug}-${second.slug}`;

      if (processedSlugs.has(slug)) continue;
      processedSlugs.add(slug);

      console.log(`Fetching: ${from.name} -> ${to.name}`);

      const route = await fetchFn(from, to);
      if (route) {
        routes.push(route);
        console.log(`  ✓ ${route.distance_km} km, ${route.duration_min} min`);
      } else {
        console.log(`  ✗ Failed`);
      }

      // Rate limiting - 1 request per second for ORS free tier
      await delay(useGoogle ? 100 : 1000);
    }
  }

  // Uložiť výsledky
  const outputPath = path.join(__dirname, '../src/data/city-routes.json');
  const output = {
    generatedAt: new Date().toISOString(),
    api: apiName,
    citiesCount: TOP_CITIES.length,
    routesCount: routes.length,
    cities: TOP_CITIES,
    routes: routes.sort((a, b) => a.slug.localeCompare(b.slug)),
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved ${routes.length} routes to ${outputPath}`);
}

main().catch(console.error);
