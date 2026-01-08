/**
 * Prepočítanie všetkých vzdialeností cez Google Distance Matrix API
 * Používa batch requesty (max 25 origins × 25 destinations = 625 elementov)
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCFNUO3vwJ0wIHe3IVNYmgoTEA0RZPFx-4';
const BATCH_SIZE = 10; // 10 origins × 10 destinations = 100 elements per request (safe limit)
const DELAY_MS = 200; // 200ms delay between requests

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');
const outputPath = path.join(__dirname, '../src/data/precomputed-distances-google.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const municipalities = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

function createSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Build municipality map (same logic as app)
const slugCount = new Map();
municipalities.forEach(m => {
  const slug = createSlug(m.name);
  slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
});

const municipalityMap = new Map();
municipalities.forEach(m => {
  const baseSlug = createSlug(m.name);
  const isDuplicate = (slugCount.get(baseSlug) || 0) > 1;
  const slug = isDuplicate ? baseSlug + '-' + createSlug(m.district) : baseSlug;
  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, { lat: m.x, lon: m.y, district: m.district, name: m.name });
  }
});

// Build city map
const cityMap = new Map();
cities.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getDistanceMatrix(origins, destinations) {
  const originsStr = origins.map(o => `${o.lat},${o.lon}`).join('|');
  const destinationsStr = destinations.map(d => `${d.lat},${d.lon}`).join('|');

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=driving&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('API Error:', data.status, data.error_message);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Fetch error:', e.message);
    return null;
  }
}

async function main() {
  console.log('=== GOOGLE DISTANCE MATRIX API PREPOČET ===\n');
  console.log('API Key:', GOOGLE_API_KEY.substring(0, 10) + '...');
  console.log('Počet záznamov:', precomputed.distances.length);
  console.log('Batch size:', BATCH_SIZE + '×' + BATCH_SIZE);
  console.log('Delay:', DELAY_MS + 'ms');
  console.log('');

  // Group records by city for efficient batching
  const recordsByCity = new Map();
  precomputed.distances.forEach((record, index) => {
    if (!recordsByCity.has(record.citySlug)) {
      recordsByCity.set(record.citySlug, []);
    }
    recordsByCity.get(record.citySlug).push({ ...record, originalIndex: index });
  });

  console.log('Počet miest:', recordsByCity.size);

  const results = new Map(); // key: "municipalitySlug|citySlug" -> { roadDistance, duration }
  let totalProcessed = 0;
  let totalApiCalls = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  // Process each city
  for (const [citySlug, records] of recordsByCity) {
    const cityCoords = cityMap.get(citySlug);
    if (!cityCoords) {
      console.log(`⚠️ Mesto ${citySlug} nenájdené v cities.json`);
      continue;
    }

    // Get all municipalities for this city
    const municipalitiesForCity = records.map(r => {
      const coords = municipalityMap.get(r.municipalitySlug);
      return coords ? { slug: r.municipalitySlug, ...coords } : null;
    }).filter(Boolean);

    // Process in batches
    for (let i = 0; i < municipalitiesForCity.length; i += BATCH_SIZE) {
      const batch = municipalitiesForCity.slice(i, i + BATCH_SIZE);

      const origins = batch.map(m => ({ lat: m.lat, lon: m.lon }));
      const destinations = [{ lat: cityCoords.lat, lon: cityCoords.lon }];

      const response = await getDistanceMatrix(origins, destinations);
      totalApiCalls++;

      if (response && response.rows) {
        response.rows.forEach((row, rowIndex) => {
          const municipality = batch[rowIndex];
          const element = row.elements[0];

          if (element.status === 'OK') {
            const distanceKm = Math.round(element.distance.value / 100) / 10; // meters to km
            const durationMin = Math.round(element.duration.value / 60); // seconds to minutes

            results.set(`${municipality.slug}|${citySlug}`, {
              roadDistance: distanceKm,
              duration: durationMin
            });
          } else {
            totalErrors++;
          }
        });
      } else {
        totalErrors += batch.length;
      }

      totalProcessed += batch.length;

      // Progress
      if (totalApiCalls % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = totalProcessed / elapsed;
        const remaining = (precomputed.distances.length - totalProcessed) / rate;
        console.log(`Progress: ${totalProcessed}/${precomputed.distances.length} | API calls: ${totalApiCalls} | Errors: ${totalErrors} | ETA: ${Math.round(remaining)}s`);
      }

      await delay(DELAY_MS);
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log('\n=== VÝSLEDKY ===');
  console.log('Čas:', elapsed, 'sekúnd');
  console.log('API volaní:', totalApiCalls);
  console.log('Spracovaných:', totalProcessed);
  console.log('Úspešných:', results.size);
  console.log('Chýb:', totalErrors);

  // Update precomputed data
  let updatedCount = 0;
  let unchangedCount = 0;
  let changedSignificantly = [];

  precomputed.distances.forEach(record => {
    const key = `${record.municipalitySlug}|${record.citySlug}`;
    const googleResult = results.get(key);

    if (googleResult) {
      const oldDistance = record.roadDistance;
      const newDistance = googleResult.roadDistance;
      const diff = Math.abs(newDistance - oldDistance);
      const diffPct = oldDistance > 0 ? (diff / oldDistance) * 100 : 100;

      if (diffPct > 20 && diff > 3) {
        changedSignificantly.push({
          municipality: record.municipalitySlug,
          city: record.citySlug,
          oldDistance,
          newDistance,
          diffPct: Math.round(diffPct)
        });
      }

      if (newDistance !== oldDistance) {
        updatedCount++;
      } else {
        unchangedCount++;
      }

      record.roadDistance = googleResult.roadDistance;
      record.duration = googleResult.duration;
    }
  });

  console.log('\nZmenených záznamov:', updatedCount);
  console.log('Nezmenených:', unchangedCount);
  console.log('Významných zmien (>20% a >3km):', changedSignificantly.length);

  if (changedSignificantly.length > 0) {
    console.log('\n=== TOP 30 VÝZNAMNÝCH ZMIEN ===');
    changedSignificantly.sort((a, b) => b.diffPct - a.diffPct);
    changedSignificantly.slice(0, 30).forEach((c, i) => {
      console.log(`${i + 1}. ${c.municipality} → ${c.city}: ${c.oldDistance}km → ${c.newDistance}km (${c.diffPct}%)`);
    });
  }

  // Save results
  precomputed.generatedAt = new Date().toISOString();
  precomputed.source = 'Google Distance Matrix API';

  fs.writeFileSync(outputPath, JSON.stringify(precomputed, null, 2));
  console.log('\nUložené do:', outputPath);

  // Save change report
  const reportPath = path.join(__dirname, 'google-matrix-changes.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRecords: precomputed.distances.length,
    apiCalls: totalApiCalls,
    updated: updatedCount,
    unchanged: unchangedCount,
    errors: totalErrors,
    significantChanges: changedSignificantly
  }, null, 2));
  console.log('Report uložený:', reportPath);
}

main().catch(console.error);
