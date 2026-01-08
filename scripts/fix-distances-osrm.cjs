/**
 * Script to fix incorrect distances using OSRM
 *
 * Usage: node scripts/fix-distances-osrm.cjs
 *
 * This script:
 * 1. Checks all distances against OSRM
 * 2. Fixes records with >20% discrepancy
 * 3. Saves corrected data
 */

const fs = require('fs');
const path = require('path');

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');

const precomputedData = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Build municipality lookup - FIRST ONE wins (this is what precompute script does)
const municipalityMap = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, { lat: m.x, lon: m.y, district: m.district });
  }
});

// Build city lookup
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

async function getOSRMDistance(fromLat, fromLon, toLat, toLon) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    return {
      distance: Math.round(data.routes[0].distance / 100) / 10,
      duration: Math.round(data.routes[0].duration / 60)
    };
  } catch (error) {
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const THRESHOLD_PERCENT = 20;
  const DELAY_MS = 150;

  console.log('=== OPRAVA VZDIALENOSTÍ POMOCOU OSRM ===');
  console.log(`Prahová hodnota: ${THRESHOLD_PERCENT}%`);
  console.log(`Celkom záznamov: ${precomputedData.distances.length}\n`);

  const fixes = [];
  let checked = 0;
  let fixed = 0;
  let errors = 0;

  for (const record of precomputedData.distances) {
    const mCoords = municipalityMap.get(record.municipalitySlug);
    const cCoords = cityMap.get(record.citySlug);

    if (!mCoords || !cCoords) {
      errors++;
      continue;
    }

    const osrmResult = await getOSRMDistance(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);

    if (osrmResult) {
      const diffKm = Math.abs(osrmResult.distance - record.roadDistance);
      const diffPercent = record.roadDistance > 0 ? (diffKm / record.roadDistance) * 100 : 100;

      if (diffPercent > THRESHOLD_PERCENT) {
        console.log(`! ${record.municipalitySlug} -> ${record.citySlug}: ${record.roadDistance}km -> ${osrmResult.distance}km (${diffPercent.toFixed(0)}%)`);

        // Update record
        record.roadDistance = osrmResult.distance;
        record.duration = osrmResult.duration;

        fixes.push({
          municipalitySlug: record.municipalitySlug,
          citySlug: record.citySlug,
          oldDistance: record.roadDistance,
          newDistance: osrmResult.distance,
          diffPercent
        });

        fixed++;
      }
    } else {
      errors++;
    }

    checked++;

    if (checked % 100 === 0) {
      console.log(`Progress: ${checked}/${precomputedData.distances.length} (${fixed} opravených)`);
    }

    await delay(DELAY_MS);
  }

  // Save corrected data
  precomputedData.generatedAt = new Date().toISOString();
  precomputedData.lastFixed = new Date().toISOString();
  precomputedData.fixedRecords = fixed;

  fs.writeFileSync(precomputedPath, JSON.stringify(precomputedData, null, 2));

  // Save fix report
  const reportPath = path.join(__dirname, 'distance-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    checked,
    fixed,
    errors,
    fixes
  }, null, 2));

  console.log('\n=== VÝSLEDKY ===');
  console.log(`Skontrolovaných: ${checked}`);
  console.log(`Opravených: ${fixed}`);
  console.log(`Chýb: ${errors}`);
  console.log(`\nDáta uložené do: ${precomputedPath}`);
  console.log(`Report uložený do: ${reportPath}`);
}

main().catch(console.error);
