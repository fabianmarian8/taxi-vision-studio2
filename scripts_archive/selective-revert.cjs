/**
 * Selektívny revert - len záznamy kde ORS bolo správne
 */

const fs = require('fs');
const path = require('path');

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const precomputedData = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));

// Záznamy kde ORS bolo správne (overené OSRM so správnymi súradnicami)
const toRevert = [
  { m: "visnove", c: "stara-tura", roadDistance: 10.9, duration: 15 },
  { m: "zavada", c: "chynorany", roadDistance: 23.5, duration: 30 },
  { m: "petrovce", c: "lucenec", roadDistance: 37.6, duration: 42 },
  { m: "bansky-studenec", c: "krupina", roadDistance: 25, duration: 36 }, // OSRM hodnota
  { m: "bystricka", c: "martin", roadDistance: 8.9, duration: 22 }, // OSRM hodnota
];

// Záznamy kde necháme OSRM opravu (ORS bolo zlé)
const toKeepFixed = [
  { m: "milpos", c: "bardejov", roadDistance: 62.3, duration: 68 },
  { m: "vojka-nad-dunajom", c: "dunajska-streda", roadDistance: 21, duration: 28 },
  { m: "nevolne", c: "handlova", roadDistance: 43.3, duration: 48 },
  { m: "zavada", c: "banovce-nad-bebravou", roadDistance: 35.5, duration: 47 },
  { m: "stupne", c: "puchov", roadDistance: 24.7, duration: 28 },
  { m: "ptruksa", c: "biel", roadDistance: 36.3, duration: 38 },
  { m: "ptruksa", c: "cierna-nad-tisou", roadDistance: 39.1, duration: 42 },
  { m: "boliarov", c: "kosice", roadDistance: 27.4, duration: 29 },
];

console.log("=== SELEKTÍVNY REVERT ===\n");
console.log("Revertujem záznamy kde ORS bolo správne:\n");

let revertCount = 0;

toRevert.forEach(fix => {
  const record = precomputedData.distances.find(
    d => d.municipalitySlug === fix.m && d.citySlug === fix.c
  );

  if (record) {
    console.log(fix.m + " -> " + fix.c + ":");
    console.log("  " + record.roadDistance + " km -> " + fix.roadDistance + " km");

    record.roadDistance = fix.roadDistance;
    record.duration = fix.duration;
    revertCount++;
  }
});

console.log("\n=== PONECHÁVAM OSRM OPRAVY ===\n");

toKeepFixed.forEach(fix => {
  const record = precomputedData.distances.find(
    d => d.municipalitySlug === fix.m && d.citySlug === fix.c
  );

  if (record) {
    // Ensure the fix is applied
    if (record.roadDistance !== fix.roadDistance) {
      console.log(fix.m + " -> " + fix.c + ":");
      console.log("  Aktuálne: " + record.roadDistance + " km");
      console.log("  Správne: " + fix.roadDistance + " km");
      record.roadDistance = fix.roadDistance;
      record.duration = fix.duration;
    } else {
      console.log(fix.m + " -> " + fix.c + ": už opravené (" + fix.roadDistance + " km)");
    }
  }
});

fs.writeFileSync(precomputedPath, JSON.stringify(precomputedData, null, 2));

console.log("\n=== HOTOVO ===");
console.log("Revertovaných: " + revertCount);
console.log("POZNÁMKA: Brdárka -> Dobšiná (31.1 km) zostáva - správna oprava");
