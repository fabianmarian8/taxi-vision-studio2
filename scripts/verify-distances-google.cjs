/**
 * Verifikácia VŠETKÝCH vzdialeností cez Google Distance Matrix API
 * Použitie: GOOGLE_API_KEY=xxx node scripts/verify-distances-google.cjs
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

// Load data
const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));

// Build lookup maps
const cityMap = new Map();
citiesData.cities.forEach(city => {
  cityMap.set(city.slug, {
    name: city.name,
    lat: city.latitude,
    lng: city.longitude
  });
});

function toSlugSimple(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const munMap = new Map();
municipalitiesData.forEach(mun => {
  if (!mun.name) return;

  // Try simple slug first
  let slug = toSlugSimple(mun.name);

  // Check for duplicates
  const duplicates = municipalitiesData.filter(m => m.name && toSlugSimple(m.name) === slug);
  if (duplicates.length > 1) {
    const districtSlug = toSlugSimple(mun.district);
    slug = `${slug}-${districtSlug}`;
  }

  munMap.set(slug, {
    name: mun.name,
    lat: mun.x,  // x = latitude
    lng: mun.y   // y = longitude
  });
});

async function getGoogleDistance(fromLat, fromLng, toLat, toLng) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&mode=driving&language=sk&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
    return null;
  }

  const element = data.rows[0].elements[0];
  if (element.status !== 'OK') {
    return null;
  }

  return {
    distance: Math.round(element.distance.value / 100) / 10, // km s 1 desatinným miestom
    duration: Math.round(element.duration.value / 60) // minúty
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== PLNÁ Verifikácia vzdialeností cez Google Distance Matrix API ===\n');
  console.log(`Celkový počet párov: ${precomputed.distances.length}`);
  console.log(`Mestá v databáze: ${cityMap.size}`);
  console.log(`Obce v databáze: ${munMap.size}`);

  const allPairs = precomputed.distances;

  const results = {
    timestamp: new Date().toISOString(),
    totalPairs: allPairs.length,
    verified: [],
    problems: [],
    apiErrors: [],
    skipped: []
  };

  let processedCount = 0;
  let okCount = 0;
  let problemCount = 0;

  for (let i = 0; i < allPairs.length; i++) {
    const pair = allPairs[i];
    const mun = munMap.get(pair.municipalitySlug);
    const city = cityMap.get(pair.citySlug);

    if (!mun || !city) {
      results.skipped.push({
        from: pair.municipalitySlug,
        to: pair.citySlug,
        reason: !mun ? 'municipality not found' : 'city not found'
      });
      continue;
    }

    processedCount++;

    // Progress každých 100 párov
    if (processedCount % 100 === 0) {
      console.log(`[${processedCount}/${allPairs.length}] OK: ${okCount}, Problémy: ${problemCount}`);
    }

    const google = await getGoogleDistance(mun.lat, mun.lng, city.lat, city.lng);

    if (!google) {
      results.apiErrors.push({
        from: pair.municipalitySlug,
        to: pair.citySlug
      });
      await sleep(100);
      continue;
    }

    const distDiff = Math.abs(google.distance - pair.roadDistance);
    const distDiffPercent = pair.roadDistance > 0 ? (distDiff / pair.roadDistance) * 100 : 0;
    const durDiff = Math.abs(google.duration - pair.duration);

    const result = {
      from: pair.municipalitySlug,
      fromName: mun.name,
      to: pair.citySlug,
      toName: city.name,
      precomputed: {
        road: pair.roadDistance,
        duration: pair.duration,
        air: pair.airDistance
      },
      google: {
        road: google.distance,
        duration: google.duration
      },
      diff: {
        road: Math.round(distDiff * 10) / 10,
        roadPercent: Math.round(distDiffPercent * 10) / 10,
        duration: durDiff
      }
    };

    // Problém ak rozdiel > 20% alebo > 5 km
    if (distDiffPercent > 20 || distDiff > 5) {
      results.problems.push(result);
      problemCount++;
    } else {
      results.verified.push(result);
      okCount++;
    }

    // Rate limiting - 50ms medzi requestami
    await sleep(50);
  }

  // Report
  console.log('\n' + '='.repeat(60));
  console.log('VÝSLEDKY VERIFIKÁCIE');
  console.log('='.repeat(60));
  console.log(`✅ OK (rozdiel < 20% a < 5km): ${results.verified.length}`);
  console.log(`⚠️  PROBLÉMY (rozdiel > 20% alebo > 5km): ${results.problems.length}`);
  console.log(`❌ API chyby: ${results.apiErrors.length}`);
  console.log(`⏭️  Preskočené (nenájdené): ${results.skipped.length}`);

  if (results.problems.length > 0) {
    console.log('\n--- TOP 20 NAJVÄČŠÍCH PROBLÉMOV ---');
    const sorted = results.problems.sort((a, b) => b.diff.roadPercent - a.diff.roadPercent);
    sorted.slice(0, 20).forEach((p, i) => {
      console.log(`${i + 1}. ${p.fromName} -> ${p.toName}: precomputed=${p.precomputed.road}km, google=${p.google.road}km (${p.diff.roadPercent}%)`);
    });
  }

  // Ulož report
  const reportPath = path.join(__dirname, 'google-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport uložený do: ${reportPath}`);
}

main().catch(console.error);
