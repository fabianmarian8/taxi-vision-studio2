/**
 * Skript na získanie Place ID pre slovenské obce
 * Používa Google Places API Text Search
 *
 * Použitie: GOOGLE_API_KEY=xxx node scripts/get-place-ids.cjs
 *
 * Place ID je stabilný identifikátor, ktorý Google používa na presné určenie miesta.
 * Na rozdiel od súradníc, Place ID vráti správnu vzdialenosť cez Routes API.
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

// Problémové páry z verifikácie - na testovanie
const PROBLEM_PAIRS = [
  { from: 'gemer', to: 'tornala', fromName: 'Gemer', toName: 'Tornaľa', expected: 3.7 },
  { from: 'kovacova', to: 'sliac', fromName: 'Kováčová', toName: 'Sliač', expected: 2.0 },
  { from: 'benus', to: 'podbrezova', fromName: 'Beňuš', toName: 'Podbrezová', expected: 19 },
];

/**
 * Získa Place ID pre dané miesto
 */
async function getPlaceId(placeName, district = null) {
  // Pridaj "Slovensko" pre lepšie výsledky
  let query = `${placeName}, Slovensko`;
  if (district) {
    query = `${placeName}, okres ${district}, Slovensko`;
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log(`  ⚠️ Nenájdené: ${query} (status: ${data.status})`);
      return null;
    }

    const result = data.results[0];
    return {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      location: result.geometry.location
    };
  } catch (error) {
    console.error(`  ❌ Chyba pre ${query}:`, error.message);
    return null;
  }
}

/**
 * Získa vzdialenosť cez Routes API s Place ID
 * https://developers.google.com/maps/documentation/routes/compute_route_matrix
 */
async function getDistanceWithPlaceId(fromPlaceId, toPlaceId) {
  const url = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

  const body = {
    origins: [{
      waypoint: { placeId: fromPlaceId }
    }],
    destinations: [{
      waypoint: { placeId: toPlaceId }
    }],
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,duration'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (Array.isArray(data) && data[0]) {
      const result = data[0];
      return {
        distanceKm: Math.round(result.distanceMeters / 100) / 10,
        durationMin: Math.round(parseInt(result.duration.replace('s', '')) / 60)
      };
    }

    console.log('  Routes API odpoveď:', JSON.stringify(data).substring(0, 200));
    return null;
  } catch (error) {
    console.error('  ❌ Routes API chyba:', error.message);
    return null;
  }
}

/**
 * Získa vzdialenosť cez Distance Matrix API s Place ID (fallback)
 */
async function getDistanceMatrixWithPlaceId(fromPlaceId, toPlaceId) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${fromPlaceId}&destinations=place_id:${toPlaceId}&mode=driving&language=sk&key=${GOOGLE_API_KEY}`;

  try {
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
      distanceKm: Math.round(element.distance.value / 100) / 10,
      durationMin: Math.round(element.duration.value / 60)
    };
  } catch (error) {
    console.error('  ❌ Distance Matrix chyba:', error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testProblemPairs() {
  console.log('=== TEST: Place ID na problémových pároch ===\n');

  for (const pair of PROBLEM_PAIRS) {
    console.log(`\n📍 ${pair.fromName} → ${pair.toName} (očakávaná: ${pair.expected} km)`);

    // Získaj Place ID pre obe miesta
    const fromPlace = await getPlaceId(pair.fromName);
    await sleep(200);
    const toPlace = await getPlaceId(pair.toName);
    await sleep(200);

    if (!fromPlace || !toPlace) {
      console.log('  ⚠️ Nepodarilo sa získať Place ID');
      continue;
    }

    console.log(`  From: ${fromPlace.name} (${fromPlace.placeId.substring(0, 20)}...)`);
    console.log(`  To: ${toPlace.name} (${toPlace.placeId.substring(0, 20)}...)`);

    // Skús Routes API
    console.log('\n  📊 Routes API:');
    const routesResult = await getDistanceWithPlaceId(fromPlace.placeId, toPlace.placeId);
    await sleep(200);

    if (routesResult) {
      const diff = Math.abs(routesResult.distanceKm - pair.expected);
      const ok = diff < 2 ? '✅' : '⚠️';
      console.log(`    ${ok} ${routesResult.distanceKm} km, ${routesResult.durationMin} min (rozdiel: ${diff.toFixed(1)} km)`);
    } else {
      console.log('    ❌ Nedostupné');
    }

    // Skús Distance Matrix API s Place ID
    console.log('\n  📊 Distance Matrix API (s Place ID):');
    const dmResult = await getDistanceMatrixWithPlaceId(fromPlace.placeId, toPlace.placeId);
    await sleep(200);

    if (dmResult) {
      const diff = Math.abs(dmResult.distanceKm - pair.expected);
      const ok = diff < 2 ? '✅' : '⚠️';
      console.log(`    ${ok} ${dmResult.distanceKm} km, ${dmResult.durationMin} min (rozdiel: ${diff.toFixed(1)} km)`);
    } else {
      console.log('    ❌ Nedostupné');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('TEST DOKONČENÝ');
}

// Spusti test
testProblemPairs().catch(console.error);
