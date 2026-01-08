const fs = require('fs');
const path = require('path');

const OBCE_PATH = path.join(__dirname, '../slovenske-obce-main/obce.json');
const data = JSON.parse(fs.readFileSync(OBCE_PATH, 'utf-8'));

// Správne súradnice pre BA a KE okresy + Jablonec
const corrections = {
  'Bratislava I': { x: 48.1436, y: 17.1096 },
  'Bratislava II': { x: 48.1483, y: 17.1750 },
  'Bratislava III': { x: 48.1741, y: 17.1248 },
  'Bratislava IV': { x: 48.1579, y: 17.0540 },
  'Bratislava V': { x: 48.1054, y: 17.1133 },
  'Košice I': { x: 48.7200, y: 21.2580 },
  'Košice II': { x: 48.7240, y: 21.2260 },
  'Košice III': { x: 48.7400, y: 21.2430 },
  'Košice IV': { x: 48.6920, y: 21.2450 }
};

// Jablonec (Pezinok) - manuálne súradnice
const jablonec = { name: 'Jablonec', district: 'Pezinok', x: 48.3282, y: 17.4565 };

let updated = 0;

data.forEach(obec => {
  // BA a KE okresy
  if (corrections[obec.name]) {
    obec.x = corrections[obec.name].x;
    obec.y = corrections[obec.name].y;
    console.log(`${obec.name} -> ${obec.x}, ${obec.y}`);
    updated++;
  }

  // Jablonec (Pezinok)
  if (obec.name === jablonec.name && obec.district === jablonec.district) {
    obec.x = jablonec.x;
    obec.y = jablonec.y;
    console.log(`${obec.name} (${obec.district}) -> ${obec.x}, ${obec.y}`);
    updated++;
  }
});

fs.writeFileSync(OBCE_PATH, JSON.stringify(data, null, 2));
console.log(`\nOpravených: ${updated}`);
