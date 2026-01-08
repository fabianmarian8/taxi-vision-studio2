/**
 * Oprava duplicitných obcí - pre každý záznam vyberie správnu variantu
 * Pre mestá na severe Slovenska použije severnú variantu obce a naopak
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

// Find all duplicates
const duplicateDetails = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  if (!duplicateDetails.has(slug)) {
    duplicateDetails.set(slug, []);
  }
  duplicateDetails.get(slug).push({
    name: m.name,
    district: m.district,
    lat: m.x,
    lon: m.y
  });
});

// Keep only actual duplicates
duplicateDetails.forEach((variants, slug) => {
  if (variants.length <= 1) {
    duplicateDetails.delete(slug);
  }
});

// Build city lookup
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

console.log('=== OPRAVA DUPLICITNÝCH OBCÍ ===\n');
console.log('Duplicitných slug-ov: ' + duplicateDetails.size);

let fixedCount = 0;
const fixes = [];

// Process each record
precomputedData.distances.forEach(record => {
  const variants = duplicateDetails.get(record.municipalitySlug);
  if (!variants) return; // Not a duplicate

  const city = cityMap.get(record.citySlug);
  if (!city) return; // City not found

  // Find the closest variant to this city
  let closestVariant = null;
  let closestDistance = Infinity;

  variants.forEach(variant => {
    const dist = haversine(variant.lat, variant.lon, city.lat, city.lon);
    if (dist < closestDistance) {
      closestDistance = dist;
      closestVariant = variant;
    }
  });

  // Check if current air distance matches the closest variant
  const currentAirDist = record.airDistance;
  const correctAirDist = Math.round(closestDistance * 10) / 10;
  const diff = Math.abs(currentAirDist - correctAirDist);

  // If difference > 10km, this is probably using the wrong variant
  if (diff > 10) {
    fixes.push({
      municipality: record.municipalitySlug,
      city: record.citySlug,
      oldAirDistance: currentAirDist,
      newAirDistance: correctAirDist,
      oldRoadDistance: record.roadDistance,
      correctDistrict: closestVariant.district,
      allVariants: variants.map(v => v.district)
    });

    // Update the record - for now just update air distance
    // Road distance would need recalculation via API
    record.airDistance = correctAirDist;
    // Estimate road distance as 1.3x air distance (approximate)
    record.roadDistance = Math.round(correctAirDist * 1.3 * 10) / 10;
    record.duration = Math.round(record.roadDistance * 1.2); // ~50 km/h average

    fixedCount++;
  }
});

console.log('Opravených záznamov: ' + fixedCount);

if (fixes.length > 0) {
  console.log('\n=== UKÁŽKA OPRÁV (prvých 30) ===\n');
  fixes.slice(0, 30).forEach((fix, i) => {
    console.log((i + 1) + '. ' + fix.municipality + ' -> ' + fix.city);
    console.log('   Správny okres: ' + fix.correctDistrict);
    console.log('   Air: ' + fix.oldAirDistance + 'km -> ' + fix.newAirDistance + 'km');
    console.log('   Varianty: ' + fix.allVariants.join(', '));
    console.log('');
  });
}

// Save updated data
fs.writeFileSync(precomputedPath, JSON.stringify(precomputedData, null, 2));
console.log('Precomputed data uložené.');

// Save fix report
const reportPath = path.join(__dirname, 'duplicates-fix-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  fixedCount,
  fixes
}, null, 2));
console.log('Report uložený: ' + reportPath);

console.log('\n=== DÔLEŽITÉ ===');
console.log('Road distance bola odhadnutá ako 1.3x air distance.');
console.log('Pre presné hodnoty by bolo potrebné zavolať routing API pre každý opravený záznam.');
