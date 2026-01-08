/**
 * Oprava Horná Lehota - okres Dolný Kubín
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const placeIdsCachePath = path.join(__dirname, 'place-ids-cache-full.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
let placeIdsCache = JSON.parse(fs.readFileSync(placeIdsCachePath, 'utf-8'));

async function getPlaceId(query) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=sk&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results && data.results[0]) {
    return {
      placeId: data.results[0].place_id,
      name: data.results[0].name,
      address: data.results[0].formatted_address
    };
  }
  return null;
}

async function getDistance(fromPlaceId, toPlaceId) {
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
  console.log('=== OPRAVA HORNÁ LEHOTA (Dolný Kubín) ===\n');

  // 1. Získaj správne Place ID pre Horná Lehota, okres Dolný Kubín
  console.log('Hľadám Place ID pre Horná Lehota, okres Dolný Kubín...');
  const hlDK = await getPlaceId('Horná Lehota, okres Dolný Kubín, Slovensko');

  if (!hlDK) {
    console.log('CHYBA: Nepodarilo sa nájsť Place ID!');
    return;
  }

  console.log('Nájdené: ' + hlDK.name);
  console.log('Adresa: ' + hlDK.address);
  console.log('Place ID: ' + hlDK.placeId);

  // 2. Aktualizuj cache
  const oldPlaceId = placeIdsCache['horna-lehota'];
  placeIdsCache['horna-lehota'] = {
    placeId: hlDK.placeId,
    name: hlDK.name
  };

  console.log('\nPôvodné Place ID: ' + oldPlaceId?.placeId);
  console.log('Nové Place ID: ' + hlDK.placeId);

  // 3. Prepočítaj všetky páry s horna-lehota
  const hlPairs = precomputed.distances.filter(d => d.municipalitySlug === 'horna-lehota');
  console.log('\nPrepočítavam ' + hlPairs.length + ' párov...\n');

  for (let i = 0; i < hlPairs.length; i++) {
    const pair = hlPairs[i];
    const toCityPlaceId = placeIdsCache[pair.citySlug];

    if (!toCityPlaceId) {
      console.log('⚠️ Chýba Place ID pre: ' + pair.citySlug);
      continue;
    }

    const dist = await getDistance(hlDK.placeId, toCityPlaceId.placeId);
    if (dist) {
      const oldDist = pair.roadDistance;
      pair.roadDistance = dist.distanceKm;
      pair.duration = dist.durationMin;
      console.log('[' + (i+1) + '/' + hlPairs.length + '] horna-lehota -> ' + pair.citySlug + ': ' + oldDist + 'km → ' + dist.distanceKm + 'km');
    } else {
      console.log('❌ Chyba pre: ' + pair.citySlug);
    }

    await sleep(100);
  }

  // 4. Ulož zmeny
  console.log('\n=== UKLADÁM ZMENY ===');
  fs.writeFileSync(precomputedPath, JSON.stringify(precomputed, null, 2));
  fs.writeFileSync(placeIdsCachePath, JSON.stringify(placeIdsCache, null, 2));
  console.log('✅ Hotovo!');
}

main().catch(console.error);
