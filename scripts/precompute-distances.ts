/**
 * Script to precompute road distances between municipalities and nearest cities with taxis
 *
 * Usage: ORS_API_KEY=your_key npm run precompute-distances
 *
 * This script:
 * 1. Loads all municipalities from obce.json
 * 2. For each municipality, finds 3 nearest cities with taxis (by air distance)
 * 3. Calls ORS API to get real road distance
 * 4. Saves results to src/data/precomputed-distances.json
 *
 * Progress is saved periodically, so you can resume if interrupted.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data
const municipalitiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../slovenske-obce-main/obce.json'), 'utf-8')
);

const citiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/cities.json'), 'utf-8')
);

const OUTPUT_FILE = path.join(__dirname, '../src/data/precomputed-distances.json');
const PROGRESS_FILE = path.join(__dirname, 'precompute-progress.json');

// ORS API settings
const ORS_API_KEY = process.env.ORS_API_KEY;
const REQUESTS_PER_MINUTE = 35; // Stay under 40 limit
const DELAY_MS = Math.ceil(60000 / REQUESTS_PER_MINUTE);

interface Municipality {
  name: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
  slug: string;
}

interface City {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  taxiServices: unknown[];
}

interface PrecomputedDistance {
  municipalitySlug: string;
  citySlug: string;
  airDistance: number;
  roadDistance: number;
  duration: number; // minutes
}

// Calculate air distance using Haversine formula
function calculateAirDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Get road distance from ORS API
async function getRoadDistance(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<{ distance: number; duration: number } | null> {
  if (!ORS_API_KEY) {
    console.error('ORS_API_KEY not set!');
    return null;
  }

  try {
    const authHeader = ORS_API_KEY.startsWith('ey') ? `Bearer ${ORS_API_KEY}` : ORS_API_KEY;

    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [[fromLng, fromLat], [toLng, toLat]],
        radiuses: [5000, 5000],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ORS API error: ${response.status} ${errorText}`);
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    return {
      distance: Math.round(route.summary.distance / 100) / 10, // meters to km
      duration: Math.round(route.summary.duration / 60), // seconds to minutes
    };
  } catch (error) {
    console.error('ORS fetch error:', error);
    return null;
  }
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load progress
function loadProgress(): Set<string> {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      return new Set(data.completed || []);
    }
  } catch {
    console.log('No progress file found, starting fresh');
  }
  return new Set();
}

// Save progress
function saveProgress(completed: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    completed: Array.from(completed),
    lastUpdated: new Date().toISOString(),
  }, null, 2));
}

// Load existing results
function loadResults(): PrecomputedDistance[] {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      return data.distances || [];
    }
  } catch {
    console.log('No existing results file found');
  }
  return [];
}

// Save results
function saveResults(distances: PrecomputedDistance[]) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalPairs: distances.length,
    distances,
  }, null, 2));
}

async function main() {
  if (!ORS_API_KEY) {
    console.error('Error: ORS_API_KEY environment variable is not set!');
    console.error('Usage: ORS_API_KEY=your_key npm run precompute-distances');
    process.exit(1);
  }

  console.log('Starting distance precomputation...');
  console.log(`Rate limit: ${REQUESTS_PER_MINUTE} requests/minute (${DELAY_MS}ms delay)`);

  // Transform municipalities
  const municipalities: Municipality[] = municipalitiesData.map((item: { name: string; district: string; region: string; x: number; y: number }) => ({
    name: item.name,
    district: item.district,
    region: item.region,
    latitude: item.x,
    longitude: item.y,
    slug: createSlug(item.name),
  }));

  // Get cities with taxis
  const citiesWithTaxis: City[] = citiesData.cities.filter(
    (city: City) => city.taxiServices && city.taxiServices.length > 0 && city.latitude && city.longitude
  );

  console.log(`Found ${municipalities.length} municipalities`);
  console.log(`Found ${citiesWithTaxis.length} cities with taxis`);

  // Load progress and existing results
  const completed = loadProgress();
  const results = loadResults();

  console.log(`Resuming from ${completed.size} completed pairs`);
  console.log(`Existing results: ${results.length} pairs`);

  let processedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < municipalities.length; i++) {
    const municipality = municipalities[i];

    // Find 10 nearest cities by air distance (to account for road vs air differences)
    const nearestCities = citiesWithTaxis
      .map(city => ({
        city,
        airDistance: calculateAirDistance(
          municipality.latitude, municipality.longitude,
          city.latitude, city.longitude
        ),
      }))
      .sort((a, b) => a.airDistance - b.airDistance)
      .slice(0, 10);

    for (const { city, airDistance } of nearestCities) {
      const pairKey = `${municipality.slug}:${city.slug}`;

      // Skip if already completed
      if (completed.has(pairKey)) {
        continue;
      }

      // Get road distance from ORS
      const roadData = await getRoadDistance(
        municipality.latitude, municipality.longitude,
        city.latitude, city.longitude
      );

      if (roadData) {
        results.push({
          municipalitySlug: municipality.slug,
          citySlug: city.slug,
          airDistance,
          roadDistance: roadData.distance,
          duration: roadData.duration,
        });
        processedCount++;
      } else {
        // Use estimate as fallback
        results.push({
          municipalitySlug: municipality.slug,
          citySlug: city.slug,
          airDistance,
          roadDistance: Math.round(airDistance * 2.0 * 10) / 10,
          duration: Math.round(airDistance * 2.0 * 1.5),
        });
        errorCount++;
        processedCount++;
      }

      completed.add(pairKey);

      // Save progress every 50 pairs
      if (processedCount % 50 === 0) {
        saveProgress(completed);
        saveResults(results);

        const elapsed = (Date.now() - startTime) / 1000 / 60;
        const rate = processedCount / elapsed;
        const remaining = (municipalities.length * 3 - completed.size) / rate;

        console.log(`Progress: ${completed.size}/${municipalities.length * 3} pairs (${(completed.size / (municipalities.length * 3) * 100).toFixed(1)}%)`);
        console.log(`  Processed: ${processedCount}, Errors: ${errorCount}`);
        console.log(`  Rate: ${rate.toFixed(1)} pairs/min, ETA: ${remaining.toFixed(0)} min`);
      }

      // Rate limiting
      await delay(DELAY_MS);
    }
  }

  // Final save
  saveProgress(completed);
  saveResults(results);

  const totalTime = (Date.now() - startTime) / 1000 / 60;
  console.log('\n=== Completed ===');
  console.log(`Total pairs: ${results.length}`);
  console.log(`Processed: ${processedCount}`);
  console.log(`Errors (used estimates): ${errorCount}`);
  console.log(`Time: ${totalTime.toFixed(1)} minutes`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
