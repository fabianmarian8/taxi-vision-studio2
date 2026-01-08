/**
 * Oprava všetkých problémov s Place ID a slugmi
 *
 * 1. Hosťovce - opraviť Place ID na okres Košice-okolie
 * 2. Konská - premenovať slug z konska-zilina na konska-liptovsky-mikulas
 * 3. Ploské - opraviť Place ID na okres Revúca
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

// Paths
const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const placeIdsCachePath = path.join(__dirname, 'place-ids-cache-full.json');

// Load data
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

async function main() {
  console.log('=== OPRAVA PROBLÉMOV ===\n');

  // 1. HOSŤOVCE - opraviť Place ID
  console.log('1. HOSŤOVCE');
  console.log('   Pôvodné:', JSON.stringify(placeIdsCache['hostovce']));

  const hostovceNew = await getPlaceId('Hosťovce, okres Košice-okolie, Slovensko');
  if (hostovceNew) {
    placeIdsCache['hostovce'] = {
      placeId: hostovceNew.placeId,
      name: hostovceNew.name
    };
    console.log('   Nové:', JSON.stringify(placeIdsCache['hostovce']));
    console.log('   Adresa:', hostovceNew.address);
  }

  // 2. KONSKÁ - premenovať slug
  console.log('\n2. KONSKÁ');
  let renamedCount = 0;

  precomputed.distances.forEach(d => {
    if (d.municipalitySlug === 'konska-zilina') {
      d.municipalitySlug = 'konska-liptovsky-mikulas';
      renamedCount++;
    }
    if (d.citySlug === 'konska-zilina') {
      d.citySlug = 'konska-liptovsky-mikulas';
      renamedCount++;
    }
  });

  console.log(`   Premenovaných záznamov: ${renamedCount}`);

  // Aktualizuj aj Place ID cache
  if (placeIdsCache['konska-zilina']) {
    delete placeIdsCache['konska-zilina'];
  }

  const konskaNew = await getPlaceId('Konská, okres Liptovský Mikuláš, Slovensko');
  if (konskaNew) {
    placeIdsCache['konska-liptovsky-mikulas'] = {
      placeId: konskaNew.placeId,
      name: konskaNew.name
    };
    console.log('   Nové Place ID:', JSON.stringify(placeIdsCache['konska-liptovsky-mikulas']));
    console.log('   Adresa:', konskaNew.address);
  }

  // 3. PLOSKÉ - opraviť Place ID
  console.log('\n3. PLOSKÉ');
  console.log('   Pôvodné:', JSON.stringify(placeIdsCache['ploske-revuca']));

  // Skúsime rôzne varianty hľadania
  let ploskeNew = await getPlaceId('Ploské 982 65, Slovensko');
  if (!ploskeNew || ploskeNew.address.includes('044')) {
    ploskeNew = await getPlaceId('obec Ploské, Revúca, Slovensko');
  }
  if (!ploskeNew || ploskeNew.address.includes('044')) {
    ploskeNew = await getPlaceId('Ploské, Banskobystrický kraj, Slovensko');
  }

  if (ploskeNew && !ploskeNew.address.includes('044')) {
    placeIdsCache['ploske-revuca'] = {
      placeId: ploskeNew.placeId,
      name: ploskeNew.name
    };
    console.log('   Nové:', JSON.stringify(placeIdsCache['ploske-revuca']));
    console.log('   Adresa:', ploskeNew.address);
  } else {
    console.log('   ⚠️ Nepodarilo sa nájsť správne Ploské pri Revúcej');
    console.log('   Posledný výsledok:', ploskeNew?.address);
  }

  // Ulož zmeny
  console.log('\n=== UKLADÁM ZMENY ===');

  fs.writeFileSync(precomputedPath, JSON.stringify(precomputed, null, 2));
  console.log('✅ precomputed-distances.json uložené');

  fs.writeFileSync(placeIdsCachePath, JSON.stringify(placeIdsCache, null, 2));
  console.log('✅ place-ids-cache-full.json uložené');

  console.log('\n=== HOTOVO ===');
}

main().catch(console.error);
