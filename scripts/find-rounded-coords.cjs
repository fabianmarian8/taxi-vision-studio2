/**
 * Skript na nájdenie obcí so zaokrúhlenými GPS súradnicami
 *
 * Zaokrúhlené súradnice končia na: .333333, .666667, .5, .0, .05, .1, .15, atď.
 */

const fs = require('fs');
const path = require('path');

const OBCE_PATH = path.join(__dirname, '../slovenske-obce-main/obce.json');
const obce = JSON.parse(fs.readFileSync(OBCE_PATH, 'utf-8'));

// Vzory indikujúce zaokrúhlenie
const isRounded = (num) => {
  const str = num.toString();

  // Končí na .333333 alebo .666667 (1/3, 2/3 stupňa)
  if (str.includes('33333') || str.includes('66666') || str.includes('66667')) return true;

  // Končí na .5 alebo .0 (polovica alebo celé)
  if (/\.\d*[50]0*$/.test(str) && str.split('.')[1]?.length <= 2) return true;

  // Končí na .X5 alebo .X0 kde X je číslo (zaokrúhlené na 0.05)
  if (/\.\d[50]$/.test(str)) return true;

  // Má len 1-2 desatinné miesta (príliš hrubé)
  const decimals = str.split('.')[1];
  if (decimals && decimals.length <= 2) return true;

  return false;
};

// Nájdi zaokrúhlené
const rounded = obce.filter(obec => isRounded(obec.x) || isRounded(obec.y));

console.log('=== OBCE SO ZAOKRÚHLENÝMI GPS SÚRADNICAMI ===\n');
console.log(`Celkom nájdených: ${rounded.length} z ${obce.length} obcí\n`);

// Rozdeľ podľa závažnosti
const critical = rounded.filter(o =>
  o.x.toString().includes('33333') ||
  o.x.toString().includes('66666') ||
  o.y.toString().includes('33333') ||
  o.y.toString().includes('66666')
);

const moderate = rounded.filter(o => !critical.includes(o));

console.log(`Kritické (1/3 stupňa = ~37km): ${critical.length}`);
console.log(`Stredné (zaokrúhlené): ${moderate.length}\n`);

console.log('--- KRITICKÉ ---');
critical.forEach(o => {
  console.log(`${o.name} (${o.district}): ${o.x}, ${o.y}`);
});

console.log('\n--- STREDNÉ ---');
moderate.slice(0, 30).forEach(o => {
  console.log(`${o.name} (${o.district}): ${o.x}, ${o.y}`);
});

if (moderate.length > 30) {
  console.log(`... a ${moderate.length - 30} ďalších`);
}

// Export pre ďalšie spracovanie
const output = {
  total: rounded.length,
  critical: critical.map(o => ({ name: o.name, district: o.district, x: o.x, y: o.y })),
  moderate: moderate.map(o => ({ name: o.name, district: o.district, x: o.x, y: o.y }))
};

fs.writeFileSync(
  path.join(__dirname, 'rounded-coords-report.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n✅ Report uložený do scripts/rounded-coords-report.json');
