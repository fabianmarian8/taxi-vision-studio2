/**
 * Kontrola len obcí s duplicitnými názvami
 * Tieto sú najproblematickejšie
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

// Find duplicate slugs
const slugCounts = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
});

const duplicateSlugs = new Set();
slugCounts.forEach((count, slug) => {
  if (count > 1) duplicateSlugs.add(slug);
});

console.log('=== ANALÝZA DUPLICITNÝCH OBCÍ ===\n');
console.log('Počet duplicitných slug-ov: ' + duplicateSlugs.size);

// Group duplicates by slug with full info
const duplicateDetails = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  if (duplicateSlugs.has(slug)) {
    if (!duplicateDetails.has(slug)) {
      duplicateDetails.set(slug, []);
    }
    duplicateDetails.get(slug).push({
      name: m.name,
      district: m.district,
      lat: m.x,
      lon: m.y
    });
  }
});

// Build city lookup
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

// Build first-found municipality map (same as precompute)
const municipalityMap = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, { lat: m.x, lon: m.y, district: m.district, name: m.name });
  }
});

// Check precomputed records for duplicates
console.log('\n=== PRECOMPUTED ZÁZNAMY S DUPLICITNÝMI OBCAMI ===\n');

let issueCount = 0;
const problematicRecords = [];

precomputedData.distances.forEach(record => {
  if (duplicateSlugs.has(record.municipalitySlug)) {
    const systemCoords = municipalityMap.get(record.municipalitySlug);
    const allVariants = duplicateDetails.get(record.municipalitySlug);
    const cityCoords = cityMap.get(record.citySlug);

    if (systemCoords && cityCoords && allVariants.length > 1) {
      // Check if any variant would give a different distance
      const systemAirDist = haversine(systemCoords.lat, systemCoords.lon, cityCoords.lat, cityCoords.lon);

      let hasBigDifference = false;
      allVariants.forEach(variant => {
        const variantAirDist = haversine(variant.lat, variant.lon, cityCoords.lat, cityCoords.lon);
        if (Math.abs(systemAirDist - variantAirDist) > 10) {
          hasBigDifference = true;
        }
      });

      if (hasBigDifference) {
        problematicRecords.push({
          municipality: record.municipalitySlug,
          city: record.citySlug,
          systemDistrict: systemCoords.district,
          airDistance: record.airDistance,
          roadDistance: record.roadDistance,
          variants: allVariants
        });
        issueCount++;
      }
    }
  }
});

// Show top 50 problematic
console.log('Nájdených potenciálne problematických: ' + issueCount);
console.log('\n=== TOP 50 DUPLICITNÝCH PRÍPADOV ===\n');

problematicRecords.slice(0, 50).forEach((p, i) => {
  console.log((i + 1) + '. ' + p.municipality + ' -> ' + p.city);
  console.log('   Použité: ' + p.systemDistrict + ' (air: ' + p.airDistance + ' km, road: ' + p.roadDistance + ' km)');
  console.log('   Varianty:');
  p.variants.forEach(v => {
    console.log('     - ' + v.district + ': ' + v.lat.toFixed(4) + ', ' + v.lon.toFixed(4));
  });
  console.log('');
});

// Save full report
const reportPath = path.join(__dirname, 'duplicates-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  duplicateCount: duplicateSlugs.size,
  problematicCount: problematicRecords.length,
  duplicates: Array.from(duplicateDetails.entries()).map(([slug, variants]) => ({
    slug,
    variants
  })),
  problematicRecords: problematicRecords
}, null, 2));

console.log('Report uložený: ' + reportPath);

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
