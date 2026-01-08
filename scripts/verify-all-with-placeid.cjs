/**
 * KOMPLETNÁ VERIFIKÁCIA VŠETKÝCH VZDIALENOSTÍ s Place ID
 *
 * Rýchle paralelné spracovanie - Google API zvládne 100+ req/s
 *
 * Použitie: node scripts/verify-all-with-placeid.cjs
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

// RÝCHLOSŤ - paralelné requesty
const PARALLEL_REQUESTS = 20;  // 20 súčasne
const DELAY_BETWEEN_BATCHES = 100; // 100ms medzi dávkami = ~200 req/s

// Paths
const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');
const placeIdsCachePath = path.join(__dirname, 'place-ids-cache-full.json');
const progressPath = path.join(__dirname, 'verification-progress.json');
const reportPath = path.join(__dirname, 'full-verification-report.json');

// Load data
const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

// Helper: Create slug from name
function toSlugSimple(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build lookup: slug -> {name, district}
const munLookup = new Map();
municipalitiesData.forEach(mun => {
  if (!mun.name) return;
  let slug = toSlugSimple(mun.name);
  const duplicates = municipalitiesData.filter(m => m.name && toSlugSimple(m.name) === slug);
  if (duplicates.length > 1) {
    slug = `${slug}-${toSlugSimple(mun.district)}`;
  }
  munLookup.set(slug, { name: mun.name, district: mun.district });
});

citiesData.cities.forEach(city => {
  munLookup.set(city.slug, { name: city.name, district: city.name });
});

// Load or create caches
let placeIdsCache = {};
if (fs.existsSync(placeIdsCachePath)) {
  placeIdsCache = JSON.parse(fs.readFileSync(placeIdsCachePath, 'utf-8'));
}

let progress = { lastIndex: 0, results: [] };
if (fs.existsSync(progressPath)) {
  progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
}

function savePlaceIdsCache() {
  fs.writeFileSync(placeIdsCachePath, JSON.stringify(placeIdsCache, null, 2));
}

function saveProgress() {
  fs.writeFileSync(progressPath, JSON.stringify(progress));
}

/**
 * Získa Place ID pre miesto
 */
async function getPlaceId(slug) {
  if (placeIdsCache[slug]) {
    return placeIdsCache[slug];
  }

  const info = munLookup.get(slug);
  if (!info) return null;

  let query = info.district && info.district !== info.name
    ? `${info.name}, okres ${info.district}, Slovensko`
    : `${info.name}, Slovensko`;

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.[0]) {
      const result = {
        placeId: data.results[0].place_id,
        name: data.results[0].name
      };
      placeIdsCache[slug] = result;
      return result;
    }
  } catch (e) {}
  return null;
}

/**
 * Získa vzdialenosť s Place ID
 */
async function getDistanceWithPlaceId(fromPlaceId, toPlaceId) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${fromPlaceId}&destinations=place_id:${toPlaceId}&mode=driving&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const el = data.rows[0].elements[0];
      return {
        distanceKm: Math.round(el.distance.value / 100) / 10,
        durationMin: Math.round(el.duration.value / 60)
      };
    }
  } catch (e) {}
  return null;
}

/**
 * Spracuj jeden pár
 */
async function processPair(pair, index) {
  const fromPlace = await getPlaceId(pair.municipalitySlug);
  const toPlace = await getPlaceId(pair.citySlug);

  if (!fromPlace || !toPlace) {
    return { index, status: 'skip', reason: 'no_place_id' };
  }

  const result = await getDistanceWithPlaceId(fromPlace.placeId, toPlace.placeId);

  if (!result) {
    return { index, status: 'error', reason: 'api_error' };
  }

  const diff = Math.abs(result.distanceKm - pair.roadDistance);
  const diffPercent = pair.roadDistance > 0 ? (diff / pair.roadDistance) * 100 : 0;

  return {
    index,
    status: diffPercent > 20 || diff > 5 ? 'problem' : 'ok',
    from: pair.municipalitySlug,
    to: pair.citySlug,
    fromName: fromPlace.name,
    toName: toPlace.name,
    precomputed: pair.roadDistance,
    placeId: result.distanceKm,
    diff: Math.round(diff * 10) / 10,
    diffPercent: Math.round(diffPercent)
  };
}

/**
 * Spracuj dávku paralelne
 */
async function processBatch(pairs, startIndex) {
  const promises = pairs.map((pair, i) => processPair(pair, startIndex + i));
  return Promise.all(promises);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const allPairs = precomputed.distances;
  const total = allPairs.length;
  const startIndex = progress.lastIndex;

  console.log('=== KOMPLETNÁ VERIFIKÁCIA S PLACE ID ===\n');
  console.log(`Celkom párov: ${total}`);
  console.log(`Pokračujem od: ${startIndex}`);
  console.log(`Paralelných requestov: ${PARALLEL_REQUESTS}`);
  console.log(`Place ID v cache: ${Object.keys(placeIdsCache).length}`);
  console.log('');

  const startTime = Date.now();
  let okCount = 0;
  let problemCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Spracuj existujúce výsledky
  progress.results.forEach(r => {
    if (r.status === 'ok') okCount++;
    else if (r.status === 'problem') problemCount++;
    else if (r.status === 'skip') skipCount++;
    else errorCount++;
  });

  for (let i = startIndex; i < total; i += PARALLEL_REQUESTS) {
    const batch = allPairs.slice(i, i + PARALLEL_REQUESTS);
    const results = await processBatch(batch, i);

    results.forEach(r => {
      progress.results.push(r);
      if (r.status === 'ok') okCount++;
      else if (r.status === 'problem') problemCount++;
      else if (r.status === 'skip') skipCount++;
      else errorCount++;
    });

    progress.lastIndex = Math.min(i + PARALLEL_REQUESTS, total);

    // Progress
    const elapsed = (Date.now() - startTime) / 1000;
    const processed = progress.lastIndex - startIndex;
    const rate = processed / elapsed;
    const remaining = (total - progress.lastIndex) / rate;

    process.stdout.write(`\r[${progress.lastIndex}/${total}] OK: ${okCount} | PROBLÉM: ${problemCount} | Skip: ${skipCount} | ${rate.toFixed(1)} req/s | ETA: ${Math.round(remaining)}s    `);

    // Ukladaj priebežne každých 500
    if (progress.lastIndex % 500 === 0) {
      savePlaceIdsCache();
      saveProgress();
    }

    await sleep(DELAY_BETWEEN_BATCHES);
  }

  console.log('\n\n=== HOTOVO ===\n');

  // Ulož výsledky
  savePlaceIdsCache();

  // Vytvor finálny report
  const problems = progress.results.filter(r => r.status === 'problem');
  const report = {
    timestamp: new Date().toISOString(),
    total,
    ok: okCount,
    problems: problemCount,
    skipped: skipCount,
    errors: errorCount,
    problemsList: problems.sort((a, b) => b.diffPercent - a.diffPercent)
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ OK: ${okCount} (${(okCount/total*100).toFixed(1)}%)`);
  console.log(`⚠️  PROBLÉMY: ${problemCount}`);
  console.log(`⏭️  Preskočené: ${skipCount}`);
  console.log(`❌ Chyby: ${errorCount}`);
  console.log(`\nReport uložený: ${reportPath}`);

  if (problems.length > 0) {
    console.log('\n--- TOP 30 NAJVÄČŠÍCH ROZDIELOV ---');
    problems.slice(0, 30).forEach((p, i) => {
      console.log(`${i + 1}. ${p.fromName} → ${p.toName}: ${p.precomputed}km vs ${p.placeId}km (${p.diffPercent}%)`);
    });
  }

  // Vymaž progress file
  if (fs.existsSync(progressPath)) {
    fs.unlinkSync(progressPath);
  }
}

main().catch(console.error);
