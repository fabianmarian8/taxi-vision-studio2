/**
 * Oprava anomálií - pre záznamy z anomalies.csv ponechá pôvodné hodnoty
 */

const fs = require('fs');
const path = require('path');

const anomaliesPath = '/Users/marianfabian/Desktop/anomalies.csv';
const originalPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const googlePath = path.join(__dirname, '../src/data/precomputed-distances-google.json');

// Load files
const anomaliesContent = fs.readFileSync(anomaliesPath, 'utf-8');
const original = JSON.parse(fs.readFileSync(originalPath, 'utf-8'));
const google = JSON.parse(fs.readFileSync(googlePath, 'utf-8'));

// Parse anomalies CSV
const lines = anomaliesContent.trim().split('\n');
const anomalies = new Set();

// Skip header, parse each line
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';');
  if (parts.length >= 2) {
    const municipality = parts[0].trim();
    const city = parts[1].trim();
    anomalies.add(`${municipality}|${city}`);
  }
}

console.log('=== OPRAVA ANOMÁLIÍ ===\n');
console.log('Počet anomálií na opravu:', anomalies.size);

// Build original values map
const originalMap = new Map();
original.distances.forEach(d => {
  originalMap.set(`${d.municipalitySlug}|${d.citySlug}`, {
    roadDistance: d.roadDistance,
    duration: d.duration
  });
});

// Fix anomalies in google data
let fixedCount = 0;
const fixes = [];

google.distances.forEach(record => {
  const key = `${record.municipalitySlug}|${record.citySlug}`;

  if (anomalies.has(key)) {
    const originalValue = originalMap.get(key);

    if (originalValue) {
      fixes.push({
        municipality: record.municipalitySlug,
        city: record.citySlug,
        googleValue: record.roadDistance,
        originalValue: originalValue.roadDistance
      });

      record.roadDistance = originalValue.roadDistance;
      record.duration = originalValue.duration;
      fixedCount++;
    }
  }
});

console.log('Opravených záznamov:', fixedCount);
console.log('\n=== UKÁŽKA OPRÁV (prvých 30) ===');
fixes.slice(0, 30).forEach((f, i) => {
  console.log(`${i + 1}. ${f.municipality} → ${f.city}: ${f.googleValue}km → ${f.originalValue}km`);
});

// Save fixed data (overwrite google file)
google.source = 'Google Distance Matrix API + Original values for anomalies';
google.anomaliesFixed = fixedCount;

fs.writeFileSync(googlePath, JSON.stringify(google, null, 2));
console.log('\nUložené do:', googlePath);

// Save fix report
const reportPath = path.join(__dirname, 'anomalies-fix-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  anomaliesCount: anomalies.size,
  fixedCount,
  fixes
}, null, 2));
console.log('Report uložený:', reportPath);
