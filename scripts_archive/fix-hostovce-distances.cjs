/**
 * Prepočítanie všetkých 103 vzdialeností pre Hosťovce
 * Používa správne Place ID pre Hosťovce (okres Košice-okolie, PSČ 044 02)
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const placeIdsCachePath = path.join(__dirname, 'place-ids-cache-full.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const placeIdsCache = JSON.parse(fs.readFileSync(placeIdsCachePath, 'utf-8'));

// Hosťovce Place ID (správne - okres Košice-okolie, PSČ 044 02)
const HOSTOVCE_PLACE_ID = placeIdsCache['hostovce']?.placeId;

async function getDistanceWithPlaceId(fromPlaceId, toPlaceId) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${fromPlaceId}&destinations=place_id:${toPlaceId}&mode=driving&language=sk&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
    const el = data.rows[0].elements[0];
    return {
      distanceKm: Math.round(el.distance.value / 100) / 10,
      durationMin: Math.round(el.duration.value / 60)
    };
  }
  return null;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== PREPOČÍTANIE VZDIALENOSTÍ PRE HOSŤOVCE ===\n');
  console.log('Hosťovce Place ID:', HOSTOVCE_PLACE_ID);

  // Nájdi všetky páry s hostovce
  const hostovceIndices = [];
  precomputed.distances.forEach((d, i) => {
    if (d.citySlug === 'hostovce') {
      hostovceIndices.push(i);
    }
  });

  console.log(`Počet párov na prepočítanie: ${hostovceIndices.length}\n`);

  let fixed = 0;
  let errors = 0;

  for (let i = 0; i < hostovceIndices.length; i++) {
    const idx = hostovceIndices[i];
    const pair = precomputed.distances[idx];
    const fromSlug = pair.municipalitySlug;

    // Získaj Place ID pre zdrojovú obec
    const fromPlace = placeIdsCache[fromSlug];
    if (!fromPlace) {
      console.log(`⚠️ Chýba Place ID pre: ${fromSlug}`);
      errors++;
      continue;
    }

    // Získaj vzdialenosť
    const result = await getDistanceWithPlaceId(fromPlace.placeId, HOSTOVCE_PLACE_ID);

    if (result) {
      const oldDist = pair.roadDistance;
      pair.roadDistance = result.distanceKm;
      pair.duration = result.durationMin;

      console.log(`${i + 1}/${hostovceIndices.length} ${fromSlug} -> hostovce: ${oldDist}km → ${result.distanceKm}km`);
      fixed++;
    } else {
      console.log(`❌ Chyba pre: ${fromSlug}`);
      errors++;
    }

    // Rate limiting - 10 req/s
    await sleep(100);
  }

  // Ulož zmeny
  console.log('\n=== UKLADÁM ZMENY ===');
  fs.writeFileSync(precomputedPath, JSON.stringify(precomputed, null, 2));

  console.log(`\n✅ Opravených: ${fixed}`);
  console.log(`❌ Chýb: ${errors}`);
}

main().catch(console.error);
