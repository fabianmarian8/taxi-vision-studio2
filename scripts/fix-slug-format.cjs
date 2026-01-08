/**
 * Oprava formátu slug-ov v precomputed-distances.json
 * Konvertuje base slug na slug s okresom pre duplicitné názvy
 * Napr. "bohunice" -> "bohunice-ilava" pre obce kde to patrí
 */

const fs = require('fs');
const path = require('path');

const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');

const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const precomputedData = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

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

// Count slug occurrences - same logic as municipalities.ts
const slugCount = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
});

// Build map of all municipality variants (with full info)
const municipalityVariants = new Map();
municipalitiesData.forEach(m => {
  const baseSlug = createSlug(m.name);
  if (!municipalityVariants.has(baseSlug)) {
    municipalityVariants.set(baseSlug, []);
  }
  municipalityVariants.get(baseSlug).push({
    name: m.name,
    district: m.district,
    lat: m.x,
    lon: m.y,
    districtSlug: createSlug(m.district)
  });
});

// Build city lookup
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

console.log('=== OPRAVA FORMÁTU SLUG-OV ===\n');

let fixedCount = 0;
let ambiguousCount = 0;
const fixes = [];

precomputedData.distances.forEach(record => {
  const baseSlug = record.municipalitySlug;
  const isDuplicate = (slugCount.get(baseSlug) || 0) > 1;

  if (!isDuplicate) {
    return; // Not a duplicate, keep as is
  }

  const variants = municipalityVariants.get(baseSlug);
  const city = cityMap.get(record.citySlug);

  if (!variants || !city) {
    return;
  }

  // Find which variant matches the air distance in record
  let bestMatch = null;
  let bestDiff = Infinity;

  variants.forEach(variant => {
    const calculatedAirDist = haversine(variant.lat, variant.lon, city.lat, city.lon);
    const diff = Math.abs(calculatedAirDist - record.airDistance);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestMatch = variant;
    }
  });

  if (bestMatch && bestDiff < 2) {
    // Found a match! Update slug to include district
    const newSlug = baseSlug + '-' + bestMatch.districtSlug;

    fixes.push({
      oldSlug: baseSlug,
      newSlug: newSlug,
      city: record.citySlug,
      district: bestMatch.district,
      airDistanceDiff: bestDiff
    });

    record.municipalitySlug = newSlug;
    fixedCount++;
  } else {
    ambiguousCount++;
  }
});

console.log('Opravených záznamov: ' + fixedCount);
console.log('Nejednoznačných (ponechaných): ' + ambiguousCount);

if (fixes.length > 0) {
  console.log('\n=== UKÁŽKA OPRÁV (prvých 30) ===\n');
  fixes.slice(0, 30).forEach((fix, i) => {
    console.log((i + 1) + '. ' + fix.oldSlug + ' -> ' + fix.newSlug + ' (-> ' + fix.city + ')');
    console.log('   Okres: ' + fix.district);
  });
}

// Save updated data
fs.writeFileSync(precomputedPath, JSON.stringify(precomputedData, null, 2));
console.log('\nPrecomputed data uložené.');

// Save fix report
const reportPath = path.join(__dirname, 'slug-fix-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  fixedCount,
  ambiguousCount,
  fixes
}, null, 2));
console.log('Report uložený: ' + reportPath);
