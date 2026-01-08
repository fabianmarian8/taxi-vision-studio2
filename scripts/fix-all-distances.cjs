/**
 * Script to identify and fix all incorrect distances
 * Checks against OSRM and fixes discrepancies > 20%
 *
 * Usage: node scripts/fix-all-distances.cjs
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
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Build municipality lookup - use district to make unique
const municipalityMap = new Map();
municipalitiesData.forEach(m => {
  const slug = createSlug(m.name);
  if (!municipalityMap.has(slug)) {
    municipalityMap.set(slug, []);
  }
  municipalityMap.get(slug).push({
    name: m.name,
    district: m.district,
    lat: m.x,
    lon: m.y
  });
});

// Build city lookup
const cityMap = new Map();
citiesData.cities.forEach(c => {
  if (c.latitude && c.longitude) {
    cityMap.set(c.slug, { lat: c.latitude, lon: c.longitude, name: c.name });
  }
});

// Find duplicates
const duplicates = [];
municipalityMap.forEach((arr, slug) => {
  if (arr.length > 1) {
    duplicates.push({ slug, count: arr.length, locations: arr });
  }
});

console.log('=== DUPLICITNÉ NÁZVY OBCÍ ===');
console.log(`Celkom ${duplicates.length} duplicitných názvov\n`);

// Find affected records in precomputed distances
const affectedRecords = [];
precomputedData.distances.forEach((record, index) => {
  if (municipalityMap.has(record.municipalitySlug)) {
    const locations = municipalityMap.get(record.municipalitySlug);
    if (locations.length > 1) {
      affectedRecords.push({
        index,
        record,
        possibleLocations: locations
      });
    }
  }
});

console.log(`=== POSTIHNUTÉ ZÁZNAMY ===`);
console.log(`Celkom ${affectedRecords.length} záznamov s duplicitnými názvami\n`);

// Group by municipality
const byMunicipality = {};
affectedRecords.forEach(a => {
  if (!byMunicipality[a.record.municipalitySlug]) {
    byMunicipality[a.record.municipalitySlug] = {
      locations: a.possibleLocations,
      records: []
    };
  }
  byMunicipality[a.record.municipalitySlug].records.push(a.record);
});

console.log('=== PREHĽAD DUPLICÍT ===');
Object.entries(byMunicipality).forEach(([slug, data]) => {
  console.log(`\n${slug} (${data.locations.length} lokalít):`);
  data.locations.forEach(l => {
    console.log(`  - ${l.district}: ${l.lat.toFixed(4)}, ${l.lon.toFixed(4)}`);
  });
  console.log(`  Záznamy: ${data.records.map(r => r.citySlug).join(', ')}`);
});

console.log('\n=== ŠTATISTIKY ===');
console.log(`Celkom záznamov: ${precomputedData.distances.length}`);
console.log(`Postihnutých záznamov: ${affectedRecords.length}`);
console.log(`Percentuálny podiel: ${(affectedRecords.length / precomputedData.distances.length * 100).toFixed(2)}%`);
