/**
 * Oprava záznamov kde analýza ukázala že precomputed je chybné
 * Kritérium: pomer cesta/vzduch < 1.0 (menej ako vzdušná) = CHYBA
 */

const fs = require('fs');
const path = require('path');

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const reportPath = path.join(__dirname, 'geoapify-verification-report.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const municipalities = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

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
  return R * c;
}

// Build maps
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

const cityMap = new Map();
cities.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

console.log('=== OPRAVA PROBLÉMOV NA ZÁKLADE ANALÝZY ===\n');

// Find problems where precomputed is clearly wrong
const toFix = [];

report.problems.forEach(p => {
  const mCoords = municipalityMap.get(p.municipality);
  const cCoords = cityMap.get(p.city);

  if (mCoords && cCoords) {
    const airDist = haversine(mCoords.lat, mCoords.lon, cCoords.lat, cCoords.lon);
    const precompRatio = p.precomputed / airDist;
    const geoRatio = p.geoapify / airDist;

    // Case 1: Precomputed < air distance (impossible, clear error)
    if (precompRatio < 1.0) {
      toFix.push({
        municipality: p.municipality,
        city: p.city,
        reason: 'precomputed < vzdušná',
        oldValue: p.precomputed,
        newValue: p.geoapify,
        airDist: Math.round(airDist * 10) / 10,
        precompRatio: Math.round(precompRatio * 100) / 100,
        geoRatio: Math.round(geoRatio * 100) / 100
      });
    }
    // Case 2: Geoapify has reasonable ratio (1.0-2.5) but precomputed doesn't
    else if (geoRatio >= 1.0 && geoRatio <= 2.5 && (precompRatio < 1.0 || precompRatio > 3.0)) {
      toFix.push({
        municipality: p.municipality,
        city: p.city,
        reason: 'Geoapify má rozumný pomer, precomputed nie',
        oldValue: p.precomputed,
        newValue: p.geoapify,
        airDist: Math.round(airDist * 10) / 10,
        precompRatio: Math.round(precompRatio * 100) / 100,
        geoRatio: Math.round(geoRatio * 100) / 100
      });
    }
  }
});

console.log(`Nájdených ${toFix.length} záznamov na opravu:\n`);

toFix.forEach((fix, i) => {
  console.log(`${i + 1}. ${fix.municipality} → ${fix.city}`);
  console.log(`   Dôvod: ${fix.reason}`);
  console.log(`   Vzdušná: ${fix.airDist} km`);
  console.log(`   Stará hodnota: ${fix.oldValue} km (pomer ${fix.precompRatio}x)`);
  console.log(`   Nová hodnota: ${fix.newValue} km (pomer ${fix.geoRatio}x)`);
  console.log('');
});

// Apply fixes
let fixedCount = 0;
toFix.forEach(fix => {
  const record = precomputed.distances.find(d =>
    d.municipalitySlug === fix.municipality && d.citySlug === fix.city
  );

  if (record) {
    record.roadDistance = fix.newValue;
    // Recalculate duration based on average speed ~50 km/h
    record.duration = Math.round(fix.newValue / 50 * 60);
    fixedCount++;
  }
});

console.log(`\nOpravených: ${fixedCount} záznamov`);

// Save
fs.writeFileSync(precomputedPath, JSON.stringify(precomputed, null, 2));
console.log('Uložené do precomputed-distances.json');

// Save fix report
const fixReportPath = path.join(__dirname, 'google-verified-fixes.json');
fs.writeFileSync(fixReportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  fixedCount,
  fixes: toFix
}, null, 2));
console.log(`Report uložený: ${fixReportPath}`);
