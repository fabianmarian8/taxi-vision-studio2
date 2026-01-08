/**
 * Script to verify precomputed distances against OSRM
 *
 * Usage: npx ts-node scripts/verify-distances-osrm.ts
 *
 * This script:
 * 1. Loads precomputed distances
 * 2. Samples or checks all municipality-city pairs
 * 3. Compares ORS distances with OSRM distances
 * 4. Reports significant discrepancies (>20% difference)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data
const precomputedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/precomputed-distances.json'), 'utf-8')
);

const municipalitiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../slovenske-obce-main/obce.json'), 'utf-8')
);

const citiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/cities.json'), 'utf-8')
);

interface PrecomputedDistance {
  municipalitySlug: string;
  citySlug: string;
  airDistance: number;
  roadDistance: number;
  duration: number;
}

interface Discrepancy {
  municipalitySlug: string;
  citySlug: string;
  orsDistance: number;
  osrmDistance: number;
  orsDuration: number;
  osrmDuration: number;
  differenceKm: number;
  differencePercent: number;
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

// Build coordinate lookup maps
const municipalityCoords = new Map<string, { lat: number; lon: number }>();
municipalitiesData.forEach((m: { name: string; x: number; y: number }) => {
  const slug = createSlug(m.name);
  municipalityCoords.set(slug, { lat: m.x, lon: m.y });
});

const cityCoords = new Map<string, { lat: number; lon: number }>();
citiesData.cities.forEach((c: { slug: string; latitude: number; longitude: number }) => {
  if (c.latitude && c.longitude) {
    cityCoords.set(c.slug, { lat: c.latitude, lon: c.longitude });
  }
});

// Get road distance from OSRM API
async function getOSRMDistance(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number
): Promise<{ distance: number; duration: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    return {
      distance: Math.round(data.routes[0].distance / 100) / 10, // meters to km
      duration: Math.round(data.routes[0].duration / 60), // seconds to minutes
    };
  } catch (error) {
    console.error('OSRM fetch error:', error);
    return null;
  }
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const distances: PrecomputedDistance[] = precomputedData.distances;
  const discrepancies: Discrepancy[] = [];

  // Configuration
  const THRESHOLD_PERCENT = 20; // Report if difference > 20%
  const SAMPLE_SIZE = parseInt(process.env.SAMPLE_SIZE || '100'); // How many to check
  const DELAY_MS = 200; // Delay between requests to avoid rate limiting

  console.log('=== OSRM Distance Verification ===');
  console.log(`Total pairs: ${distances.length}`);
  console.log(`Sample size: ${SAMPLE_SIZE}`);
  console.log(`Threshold: ${THRESHOLD_PERCENT}%`);
  console.log('');

  // Sample random pairs or check all if SAMPLE_SIZE >= total
  let samplesToCheck: PrecomputedDistance[];
  if (SAMPLE_SIZE >= distances.length) {
    samplesToCheck = distances;
  } else {
    // Random sampling
    const shuffled = [...distances].sort(() => Math.random() - 0.5);
    samplesToCheck = shuffled.slice(0, SAMPLE_SIZE);
  }

  let checked = 0;
  let errors = 0;

  for (const record of samplesToCheck) {
    const mCoords = municipalityCoords.get(record.municipalitySlug);
    const cCoords = cityCoords.get(record.citySlug);

    if (!mCoords || !cCoords) {
      console.log(`Skip: Missing coords for ${record.municipalitySlug} -> ${record.citySlug}`);
      continue;
    }

    const osrmResult = await getOSRMDistance(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);

    if (osrmResult) {
      const diffKm = Math.abs(osrmResult.distance - record.roadDistance);
      const diffPercent = (diffKm / record.roadDistance) * 100;

      if (diffPercent > THRESHOLD_PERCENT) {
        discrepancies.push({
          municipalitySlug: record.municipalitySlug,
          citySlug: record.citySlug,
          orsDistance: record.roadDistance,
          osrmDistance: osrmResult.distance,
          orsDuration: record.duration,
          osrmDuration: osrmResult.duration,
          differenceKm: diffKm,
          differencePercent: diffPercent,
        });
        console.log(`! ${record.municipalitySlug} -> ${record.citySlug}: ORS=${record.roadDistance}km, OSRM=${osrmResult.distance}km (${diffPercent.toFixed(1)}% diff)`);
      }
    } else {
      errors++;
    }

    checked++;
    if (checked % 20 === 0) {
      console.log(`Progress: ${checked}/${samplesToCheck.length} (${discrepancies.length} discrepancies found)`);
    }

    await delay(DELAY_MS);
  }

  // Sort discrepancies by difference
  discrepancies.sort((a, b) => b.differencePercent - a.differencePercent);

  // Output results
  console.log('\n=== RESULTS ===');
  console.log(`Checked: ${checked}`);
  console.log(`Errors: ${errors}`);
  console.log(`Discrepancies (>${THRESHOLD_PERCENT}%): ${discrepancies.length}`);

  if (discrepancies.length > 0) {
    console.log('\n=== TOP DISCREPANCIES ===');
    discrepancies.slice(0, 20).forEach((d, i) => {
      console.log(`${i + 1}. ${d.municipalitySlug} -> ${d.citySlug}`);
      console.log(`   ORS: ${d.orsDistance}km (${d.orsDuration}min)`);
      console.log(`   OSRM: ${d.osrmDistance}km (${d.osrmDuration}min)`);
      console.log(`   Diff: ${d.differenceKm.toFixed(1)}km (${d.differencePercent.toFixed(1)}%)`);
    });
  }

  // Save full report
  const reportPath = path.join(__dirname, 'distance-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    checked,
    errors,
    thresholdPercent: THRESHOLD_PERCENT,
    discrepancies,
  }, null, 2));

  console.log(`\nFull report saved to: ${reportPath}`);
}

main().catch(console.error);
