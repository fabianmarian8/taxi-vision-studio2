/**
 * Kompletná verifikácia všetkých vzdialeností cez OSRM
 * Používa SPRÁVNE súradnice zo systému (nie z externých zdrojov)
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
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Build municipality lookup - FIRST ONE wins (same as precompute script)
const municipalityMap = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, { lat: m.x, lon: m.y, district: m.district, name: m.name });
  }
});

// Build city lookup
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

async function getOSRM(fromLat, fromLon, toLat, toLon) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return {
        distance: Math.round(data.routes[0].distance / 100) / 10,
        duration: Math.round(data.routes[0].duration / 60)
      };
    }
  } catch (e) {}
  return null;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const THRESHOLD = 30; // 30% rozdiel = problém
  const DELAY_MS = 100;

  console.log('=== KOMPLETNÁ VERIFIKÁCIA VZDIALENOSTÍ ===');
  console.log('Používam súradnice zo systému (obce.json, cities.json)');
  console.log('Prahová hodnota: ' + THRESHOLD + '%');
  console.log('Celkom záznamov: ' + precomputedData.distances.length);
  console.log('');

  const problems = [];
  let checked = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of precomputedData.distances) {
    const mCoords = municipalityMap.get(record.municipalitySlug);
    const cCoords = cityMap.get(record.citySlug);

    if (!mCoords || !cCoords) {
      skipped++;
      continue;
    }

    const osrm = await getOSRM(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);

    if (osrm) {
      const diff = Math.abs(osrm.distance - record.roadDistance);
      const diffPct = record.roadDistance > 0 ? (diff / record.roadDistance) * 100 : 100;

      if (diffPct > THRESHOLD && diff > 5) { // >30% AND >5km difference
        problems.push({
          municipality: record.municipalitySlug,
          district: mCoords.district,
          city: record.citySlug,
          orsDistance: record.roadDistance,
          osrmDistance: osrm.distance,
          orsDuration: record.duration,
          osrmDuration: osrm.duration,
          diffKm: diff,
          diffPct: diffPct
        });

        console.log('! ' + record.municipalitySlug + ' (' + mCoords.district + ') -> ' + record.citySlug +
          ': ORS=' + record.roadDistance + 'km, OSRM=' + osrm.distance + 'km (' + diffPct.toFixed(0) + '%)');
      }
    } else {
      errors++;
    }

    checked++;

    if (checked % 200 === 0) {
      console.log('Progress: ' + checked + '/' + precomputedData.distances.length +
        ' (' + problems.length + ' problémov)');
    }

    await delay(DELAY_MS);
  }

  // Sort by difference
  problems.sort((a, b) => b.diffPct - a.diffPct);

  console.log('\n=== VÝSLEDKY ===');
  console.log('Skontrolovaných: ' + checked);
  console.log('Preskočených (chýbajú súradnice): ' + skipped);
  console.log('Chýb API: ' + errors);
  console.log('Problémov (>' + THRESHOLD + '%): ' + problems.length);

  if (problems.length > 0) {
    console.log('\n=== TOP 30 PROBLÉMOV ===');
    problems.slice(0, 30).forEach((p, i) => {
      console.log((i + 1) + '. ' + p.municipality + ' (' + p.district + ') -> ' + p.city);
      console.log('   ORS: ' + p.orsDistance + 'km, OSRM: ' + p.osrmDistance + 'km (diff: ' + p.diffPct.toFixed(0) + '%)');
    });
  }

  // Save report
  const reportPath = path.join(__dirname, 'full-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    threshold: THRESHOLD,
    checked,
    skipped,
    errors,
    problemCount: problems.length,
    problems
  }, null, 2));

  console.log('\nReport uložený: ' + reportPath);
}

main().catch(console.error);
