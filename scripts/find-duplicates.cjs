const obce = require("../slovenske-obce-main/obce.json");

// Nájdi duplicitné názvy
const nazvy = {};
obce.forEach(o => {
  const slug = o.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!nazvy[slug]) nazvy[slug] = [];
  nazvy[slug].push({ name: o.name, district: o.district, x: o.x, y: o.y });
});

// Zobraz duplicity
console.log("=== DUPLICITNÉ NÁZVY OBCÍ ===");
Object.entries(nazvy)
  .filter(([_, arr]) => arr.length > 1)
  .forEach(([slug, arr]) => {
    console.log(slug + " (" + arr.length + "x):");
    arr.forEach(o => console.log("  - " + o.district + ": " + o.x.toFixed(4) + ", " + o.y.toFixed(4)));
  });

console.log("\n=== PROBLEMATICKÉ Z REPORTU ===");
["visnove", "zavada", "petrovce"].forEach(slug => {
  if (nazvy[slug]) {
    console.log(slug + ":");
    nazvy[slug].forEach(o => console.log("  - " + o.district + ": " + o.x.toFixed(4) + ", " + o.y.toFixed(4)));
  }
});
