/**
 * Pridanie chýbajúcich Podbrezová párov pre obce v okrese Brezno
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const placeIdsCachePath = path.join(__dirname, 'place-ids-cache-full.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
let placeIdsCache = JSON.parse(fs.readFileSync(placeIdsCachePath, 'utf-8'));
const municipalities = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));

function toSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  console.log('=== PRIDÁVANIE CHÝBAJÚCICH PODBREZOVÁ PÁROV ===\n');

  // Obce v okrese Brezno
  const breznoMunicipalities = municipalities.filter(m => m.district === 'Brezno');
  console.log(`Počet obcí v okrese Brezno: ${breznoMunicipalities.length}`);

  // Nájdi obce, ktoré NEMAJÚ pár s podbrezova
  const missingPodbrezova = [];

  for (const mun of breznoMunicipalities) {
    let slug = toSlug(mun.name);
    // Skontroluj či nie je duplicitný názov
    const duplicates = municipalities.filter(m => m.name === mun.name);
    if (duplicates.length > 1) {
      slug = `${slug}-${toSlug(mun.district)}`;
    }

    const hasPair = precomputed.distances.some(
      d => d.municipalitySlug === slug && d.citySlug === 'podbrezova'
    );

    if (!hasPair) {
      missingPodbrezova.push({ name: mun.name, slug, district: mun.district });
    }
  }

  console.log(`Obce bez Podbrezová páru: ${missingPodbrezova.length}`);
  console.log(missingPodbrezova.map(m => m.name).join(', '));
  console.log('');

  if (missingPodbrezova.length === 0) {
    console.log('Všetky obce už majú Podbrezová pár!');
    return;
  }

  // Získaj Place ID pre Podbrezová
  let podbrezovaPID = placeIdsCache['podbrezova'];
  if (!podbrezovaPID) {
    console.log('Hľadám Place ID pre Podbrezová...');
    const result = await getPlaceId('Podbrezová, okres Brezno, Slovensko');
    if (result) {
      podbrezovaPID = { placeId: result.placeId, name: result.name };
      placeIdsCache['podbrezova'] = podbrezovaPID;
      console.log(`Podbrezová: ${result.address}`);
    } else {
      console.log('CHYBA: Nepodarilo sa nájsť Place ID pre Podbrezová!');
      return;
    }
  }
  console.log(`Podbrezová Place ID: ${podbrezovaPID.placeId}\n`);

  // Pre každú chýbajúcu obec získaj Place ID a vzdialenosť
  let added = 0;
  let errors = 0;

  for (let i = 0; i < missingPodbrezova.length; i++) {
    const mun = missingPodbrezova[i];
    console.log(`[${i + 1}/${missingPodbrezova.length}] ${mun.name}...`);

    // Získaj Place ID pre obec
    let munPID = placeIdsCache[mun.slug];
    if (!munPID) {
      const query = `${mun.name}, okres ${mun.district}, Slovensko`;
      const result = await getPlaceId(query);
      if (result) {
        munPID = { placeId: result.placeId, name: result.name };
        placeIdsCache[mun.slug] = munPID;
        console.log(`  Place ID nájdené: ${result.name}`);
      } else {
        console.log(`  CHYBA: Nepodarilo sa nájsť Place ID!`);
        errors++;
        continue;
      }
      await sleep(100);
    }

    // Získaj vzdialenosť
    const dist = await getDistance(munPID.placeId, podbrezovaPID.placeId);
    if (dist) {
      // Pridaj nový pár
      precomputed.distances.push({
        municipalitySlug: mun.slug,
        citySlug: 'podbrezova',
        airDistance: 0, // Nepoužívame
        roadDistance: dist.distanceKm,
        duration: dist.durationMin
      });
      console.log(`  ✅ ${mun.name} → Podbrezová: ${dist.distanceKm}km, ${dist.durationMin}min`);
      added++;
    } else {
      console.log(`  ❌ CHYBA pri získavaní vzdialenosti!`);
      errors++;
    }

    await sleep(100);
  }

  // Ulož zmeny
  console.log('\n=== UKLADÁM ZMENY ===');
  fs.writeFileSync(precomputedPath, JSON.stringify(precomputed, null, 2));
  fs.writeFileSync(placeIdsCachePath, JSON.stringify(placeIdsCache, null, 2));

  console.log(`\n✅ Pridaných párov: ${added}`);
  console.log(`❌ Chýb: ${errors}`);
  console.log(`📊 Celkový počet párov: ${precomputed.distances.length}`);
}

main().catch(console.error);
