/**
 * Verifikácia vzdialeností cez Geoapify API
 * Náhodná vzorka 3000 záznamov
 */

const fs = require('fs');
const path = require('path');

const GEOAPIFY_API_KEY = '8dfc3b8c650b4e9589bc789ffda4be5b';
const SAMPLE_SIZE = 3000;
const DELAY_MS = 50; // 20 req/s should be safe
const THRESHOLD_PERCENT = 30; // 30% rozdiel = problém
const THRESHOLD_KM = 5; // minimálne 5km rozdiel

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');

const precomputedData = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

function createSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Build municipality map - match the app's logic
const slugCount = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
});

const municipalityMap = new Map();
municipalitiesData.forEach(m => {
  const baseSlug = createSlug(m.name);
  const isDuplicate = (slugCount.get(baseSlug) || 0) > 1;
  const slug = isDuplicate ? baseSlug + '-' + createSlug(m.district) : baseSlug;

  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, { lat: m.x, lon: m.y, district: m.district, name: m.name });
  }
});

// Build city map
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

async function getGeoapifyRoute(fromLat, fromLon, toLat, toLon) {
  try {
    const url = `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLon}|${toLat},${toLon}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Geoapify error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      return {
        distance: Math.round(props.distance / 100) / 10, // meters to km
        duration: Math.round(props.time / 60) // seconds to minutes
      };
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
  return null;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function main() {
  console.log('=== GEOAPIFY VERIFIKÁCIA VZDIALENOSTÍ ===');
  console.log('API: Geoapify Routing');
  console.log('Vzorka: ' + SAMPLE_SIZE + ' náhodných záznamov');
  console.log('Prah: ' + THRESHOLD_PERCENT + '% AND >' + THRESHOLD_KM + 'km');
  console.log('');

  // Filter records that have valid coordinates
  const validRecords = precomputedData.distances.filter(record => {
    const mCoords = municipalityMap.get(record.municipalitySlug);
    const cCoords = cityMap.get(record.citySlug);
    return mCoords && cCoords;
  });

  console.log('Validných záznamov: ' + validRecords.length);

  // Random sample
  const shuffled = shuffleArray(validRecords);
  const sample = shuffled.slice(0, Math.min(SAMPLE_SIZE, shuffled.length));

  console.log('Vzorka: ' + sample.length + ' záznamov');
  console.log('Odhadovaný čas: ' + Math.round(sample.length * DELAY_MS / 1000 / 60) + ' minút');
  console.log('');

  const problems = [];
  let checked = 0;
  let errors = 0;
  let matches = 0;
  const startTime = Date.now();

  for (const record of sample) {
    const mCoords = municipalityMap.get(record.municipalitySlug);
    const cCoords = cityMap.get(record.citySlug);

    const geoapify = await getGeoapifyRoute(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);

    if (geoapify) {
      const diff = Math.abs(geoapify.distance - record.roadDistance);
      const diffPct = record.roadDistance > 0 ? (diff / record.roadDistance) * 100 : 100;

      if (diffPct > THRESHOLD_PERCENT && diff > THRESHOLD_KM) {
        problems.push({
          municipality: record.municipalitySlug,
          district: mCoords.district,
          city: record.citySlug,
          precomputed: record.roadDistance,
          geoapify: geoapify.distance,
          diffKm: Math.round(diff * 10) / 10,
          diffPct: Math.round(diffPct)
        });

        console.log('! ' + record.municipalitySlug + ' -> ' + record.citySlug +
          ': Precomp=' + record.roadDistance + 'km, Geoapify=' + geoapify.distance + 'km (' + Math.round(diffPct) + '%)');
      } else {
        matches++;
      }
    } else {
      errors++;
    }

    checked++;

    if (checked % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = checked / elapsed;
      const remaining = (sample.length - checked) / rate;

      console.log('Progress: ' + checked + '/' + sample.length +
        ' | OK: ' + matches + ' | Problémy: ' + problems.length +
        ' | Chyby: ' + errors +
        ' | ETA: ' + Math.round(remaining) + 's');
    }

    await delay(DELAY_MS);
  }

  // Sort by difference
  problems.sort((a, b) => b.diffPct - a.diffPct);

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log('\n=== VÝSLEDKY ===');
  console.log('Čas: ' + elapsed + ' sekúnd');
  console.log('Skontrolovaných: ' + checked);
  console.log('Zhodných (OK): ' + matches + ' (' + Math.round(matches / checked * 100) + '%)');
  console.log('Problémov: ' + problems.length + ' (' + Math.round(problems.length / checked * 100) + '%)');
  console.log('API chýb: ' + errors);

  if (problems.length > 0) {
    console.log('\n=== TOP 30 PROBLÉMOV ===');
    problems.slice(0, 30).forEach((p, i) => {
      console.log((i + 1) + '. ' + p.municipality + ' (' + p.district + ') -> ' + p.city);
      console.log('   Precomp: ' + p.precomputed + 'km, Geoapify: ' + p.geoapify + 'km (diff: ' + p.diffPct + '%)');
    });
  }

  // Save report
  const reportPath = path.join(__dirname, 'geoapify-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    sampleSize: sample.length,
    checked,
    matches,
    problemCount: problems.length,
    errors,
    matchRate: Math.round(matches / checked * 100),
    problems
  }, null, 2));

  console.log('\nReport uložený: ' + reportPath);
}

main().catch(console.error);
