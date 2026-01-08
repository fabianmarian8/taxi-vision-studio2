/**
 * Revert incorrect fixes - restore original ORS values
 */

const fs = require('fs');
const path = require('path');

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const precomputedData = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));

// Original correct values (from ORS with correct coordinates)
const correctValues = [
  { m: "visnove", c: "stara-tura", roadDistance: 10.9, duration: 15 },
  { m: "zavada", c: "chynorany", roadDistance: 23.5, duration: 30 },
  { m: "petrovce", c: "lucenec", roadDistance: 37.6, duration: 42 },
  { m: "zavada", c: "banovce-nad-bebravou", roadDistance: 35.5, duration: 47 },
  { m: "milpos", c: "bardejov", roadDistance: 37.2, duration: 62 }, // revert - need to check
  { m: "bystricka", c: "martin", roadDistance: 5.5, duration: 10 }, // revert - need to check
  { m: "stupne", c: "puchov", roadDistance: 16.8, duration: 23 }, // revert - need to check
  { m: "vojka-nad-dunajom", c: "dunajska-streda", roadDistance: 32.8, duration: 30 }, // revert - need to check
  { m: "ptruksa", c: "biel", roadDistance: 27.2, duration: 31 }, // revert - need to check
  { m: "nevolne", c: "handlova", roadDistance: 33.2, duration: 47 }, // revert - need to check
  { m: "ptruksa", c: "cierna-nad-tisou", roadDistance: 30, duration: 34 }, // revert - need to check
  { m: "bansky-studenec", c: "krupina", roadDistance: 20.2, duration: 32 }, // revert - need to check
  { m: "boliarov", c: "kosice", roadDistance: 34.8, duration: 31 }, // revert - need to check
];

console.log("=== REVERTUJEM NESPRÁVNE OPRAVY ===\n");

let revertCount = 0;

correctValues.forEach(fix => {
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

// Note: Keep Brdárka -> Dobšiná fix (31.1 km) - that one was CORRECT

fs.writeFileSync(precomputedPath, JSON.stringify(precomputedData, null, 2));

console.log("\n=== HOTOVO ===");
console.log("Revertovaných záznamov: " + revertCount);
console.log("\nPOZNÁMKA: Brdárka -> Dobšiná (31.1 km) ZOSTÁVA - to bola správna oprava!");
