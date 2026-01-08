/**
 * Analýza top 10 problémov z Geoapify verifikácie
 * Overuje súradnice a porovnáva s Google Maps vzdušné vzdialenosti
 */

const fs = require('fs');
const path = require('path');

const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');
const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const reportPath = path.join(__dirname, 'geoapify-verification-report.json');

const municipalities = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

function createSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
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

console.log('=== ANALÝZA TOP PROBLÉMOV Z GEOAPIFY VERIFIKÁCIE ===\n');

// Analyze top 15 problems
const top15 = report.problems.slice(0, 15);

top15.forEach((problem, i) => {
  console.log(`${i + 1}. ${problem.municipality} → ${problem.city}`);
  console.log(`   Okres: ${problem.district}`);
  console.log(`   Precomputed: ${problem.precomputed} km | Geoapify: ${problem.geoapify} km | Diff: ${problem.diffPct}%`);

  // Find coordinates
  const mCoords = municipalityMap.get(problem.municipality);
  const cCoords = cityMap.get(problem.city);

  if (mCoords && cCoords) {
    const airDist = haversine(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);
    console.log(`   Vzdušná vzdialenosť (vypočítaná): ${airDist} km`);
    console.log(`   Obec súradnice: ${mCoords.lat}, ${mCoords.lon}`);
    console.log(`   Mesto súradnice: ${cCoords.lat}, ${cCoords.lon}`);
    console.log(`   Google Maps link: https://www.google.com/maps/dir/${mCoords.lat},${mCoords.lon}/${cCoords.lat},${cCoords.lon}`);

    // Check ratio precomputed/air vs geoapify/air
    const precompRatio = (problem.precomputed / airDist).toFixed(2);
    const geoRatio = (problem.geoapify / airDist).toFixed(2);
    console.log(`   Pomer cesta/vzduch: Precomp=${precompRatio}x | Geoapify=${geoRatio}x`);

    // Typical road/air ratio is 1.2-1.5 for direct roads, up to 2.5 for mountain/detour
    if (precompRatio < 1) {
      console.log(`   ⚠️ Precomputed < vzdušná! Pravdepodobne chyba v precomputed.`);
    } else if (geoRatio < 1) {
      console.log(`   ⚠️ Geoapify < vzdušná! Pravdepodobne chyba v Geoapify.`);
    } else if (precompRatio > 3) {
      console.log(`   ⚠️ Precomputed pomer veľmi vysoký (${precompRatio}x) - možno zlá trasa`);
    } else if (geoRatio > 3) {
      console.log(`   ⚠️ Geoapify pomer veľmi vysoký (${geoRatio}x) - možno zlá trasa`);
    }
  } else {
    console.log(`   ❌ Nenájdené súradnice!`);
    if (!mCoords) console.log(`      - Obec ${problem.municipality} nenájdená v mape`);
    if (!cCoords) console.log(`      - Mesto ${problem.city} nenájdené v mape`);
  }

  console.log('');
});

// Summary analysis
console.log('=== SÚHRN ANALÝZY ===\n');

let precompBetter = 0;
let geoBetter = 0;
let unclear = 0;

report.problems.forEach(p => {
  const mCoords = municipalityMap.get(p.municipality);
  const cCoords = cityMap.get(p.city);

  if (mCoords && cCoords) {
    const airDist = haversine(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);
    const precompRatio = p.precomputed / airDist;
    const geoRatio = p.geoapify / airDist;

    // Better = closer to reasonable ratio (1.2-2.0)
    const precompReasonable = precompRatio >= 1.0 && precompRatio <= 2.5;
    const geoReasonable = geoRatio >= 1.0 && geoRatio <= 2.5;

    if (precompReasonable && !geoReasonable) {
      precompBetter++;
    } else if (geoReasonable && !precompReasonable) {
      geoBetter++;
    } else {
      unclear++;
    }
  }
});

console.log(`Precomputed pravdepodobne správne: ${precompBetter}`);
console.log(`Geoapify pravdepodobne správne: ${geoBetter}`);
console.log(`Nejasné: ${unclear}`);
console.log(`\nCelkom problémov: ${report.problems.length}`);
