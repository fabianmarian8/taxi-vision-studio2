/**
 * Apply fixes from verification report
 */

const fs = require('fs');
const path = require('path');

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const reportPath = path.join(__dirname, 'distance-verification-report.json');

const precomputedData = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log('=== APLIKUJEM OPRAVY ===\n');

let fixCount = 0;

report.discrepancies.forEach(fix => {
  // Find the record in precomputed data
  const record = precomputedData.distances.find(
    d => d.municipalitySlug === fix.municipalitySlug && d.citySlug === fix.citySlug
  );

  if (record) {
    console.log(`${fix.municipalitySlug} -> ${fix.citySlug}:`);
    console.log(`  roadDistance: ${record.roadDistance} -> ${fix.osrmDistance}`);
    console.log(`  duration: ${record.duration} -> ${fix.osrmDuration}`);

    record.roadDistance = fix.osrmDistance;
    record.duration = fix.osrmDuration;
    fixCount++;
  } else {
    console.log(`! Nenájdený záznam: ${fix.municipalitySlug} -> ${fix.citySlug}`);
  }
});

// Save updated data
precomputedData.lastFixed = new Date().toISOString();
precomputedData.fixedRecords = (precomputedData.fixedRecords || 0) + fixCount;

fs.writeFileSync(precomputedPath, JSON.stringify(precomputedData, null, 2));

console.log(`\n=== HOTOVO ===`);
console.log(`Opravených záznamov: ${fixCount}`);
console.log(`Uložené do: ${precomputedPath}`);
