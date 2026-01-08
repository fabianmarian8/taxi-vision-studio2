/**
 * Skript na opravu duplicitných GPS súradníc v obce.json
 *
 * Používa OpenStreetMap Nominatim API na získanie správnych súradníc
 * pre obce s rovnakým názvom ale rôznymi okresmi.
 *
 * Spustenie: npx ts-node scripts/fix-duplicate-gps.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Obec {
  name: string;
  district: string;
  region: string;
  x: number;
  y: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const OBCE_PATH = path.join(__dirname, '../slovenske-obce-main/obce.json');
const OUTPUT_PATH = path.join(__dirname, '../slovenske-obce-main/obce-fixed.json');
const DELAY_MS = 1100; // Nominatim rate limit: 1 req/sec

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch GPS from Nominatim
async function fetchGPS(obec: Obec): Promise<{ lat: number; lon: number } | null> {
  // Query format: "Obec, Okres, Slovensko"
  const query = encodeURIComponent(`${obec.name}, ${obec.district}, Slovakia`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=sk`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TaxiNearMe.sk GPS Fixer (contact: fabianmarian8@gmail.com)'
      }
    });

    if (!response.ok) {
      console.error(`  ❌ HTTP error: ${response.status}`);
      return null;
    }

    const data = await response.json() as NominatimResult[];

    if (data.length === 0) {
      // Skúsime bez okresu
      const query2 = encodeURIComponent(`${obec.name}, Slovakia`);
      const url2 = `https://nominatim.openstreetmap.org/search?q=${query2}&format=json&limit=5&countrycodes=sk`;

      await delay(DELAY_MS);
      const response2 = await fetch(url2, {
        headers: {
          'User-Agent': 'TaxiNearMe.sk GPS Fixer (contact: fabianmarian8@gmail.com)'
        }
      });

      const data2 = await response2.json() as NominatimResult[];

      // Hľadáme v výsledkoch podľa okresu
      const match = data2.find(r => r.display_name.includes(obec.district));
      if (match) {
        return { lat: parseFloat(match.lat), lon: parseFloat(match.lon) };
      }

      // Ak stále nič, vrátime prvý výsledok ak existuje
      if (data2.length > 0) {
        console.log(`  ⚠️ Použitý prvý výsledok: ${data2[0].display_name}`);
        return { lat: parseFloat(data2[0].lat), lon: parseFloat(data2[0].lon) };
      }

      return null;
    }

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (error) {
    console.error(`  ❌ Fetch error:`, error);
    return null;
  }
}

async function main() {
  console.log('=== OPRAVA DUPLICITNÝCH GPS SÚRADNÍC ===\n');

  // Načítanie obcí
  const obce: Obec[] = JSON.parse(fs.readFileSync(OBCE_PATH, 'utf-8'));
  console.log(`Načítaných ${obce.length} obcí\n`);

  // Nájdenie duplicitných názvov
  const nameCount = new Map<string, number>();
  obce.forEach(o => {
    nameCount.set(o.name, (nameCount.get(o.name) || 0) + 1);
  });

  // Filtrovanie len duplicitných s rovnakými GPS
  const duplicateNames = [...nameCount.entries()]
    .filter(([name, count]) => count > 1)
    .map(([name]) => name);

  // Identifikácia obcí na opravu (len tie s rovnakými GPS)
  const toFix: Obec[] = [];

  duplicateNames.forEach(name => {
    const items = obce.filter(o => o.name === name);
    const uniqueCoords = new Set(items.map(o => `${o.x},${o.y}`));

    // Ak majú všetky rovnaké GPS, treba ich opraviť
    if (uniqueCoords.size === 1 && items.length > 1) {
      toFix.push(...items);
    }
  });

  console.log(`Nájdených ${toFix.length} obcí s duplicitnými GPS na opravu\n`);

  // Oprava GPS
  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < toFix.length; i++) {
    const obec = toFix[i];
    console.log(`[${i + 1}/${toFix.length}] ${obec.name} (${obec.district})`);

    const gps = await fetchGPS(obec);

    if (gps) {
      // Nájdeme obec v pôvodnom poli a aktualizujeme
      const originalIndex = obce.findIndex(o =>
        o.name === obec.name && o.district === obec.district
      );

      if (originalIndex !== -1) {
        const oldX = obce[originalIndex].x;
        const oldY = obce[originalIndex].y;
        obce[originalIndex].x = gps.lat;
        obce[originalIndex].y = gps.lon;

        console.log(`  ✅ ${oldX}, ${oldY} → ${gps.lat}, ${gps.lon}`);
        fixed++;
      }
    } else {
      console.log(`  ❌ Nepodarilo sa nájsť GPS`);
      failed++;
    }

    // Rate limiting
    if (i < toFix.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Uloženie výsledkov
  console.log('\n=== UKLADANIE VÝSLEDKOV ===');
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(obce, null, 2), 'utf-8');
  console.log(`Uložené do: ${OUTPUT_PATH}`);

  // Štatistiky
  console.log('\n=== ŠTATISTIKY ===');
  console.log(`Opravených: ${fixed}`);
  console.log(`Neúspešných: ${failed}`);
  console.log(`Celkom: ${toFix.length}`);

  // Ak všetko OK, nahradíme pôvodný súbor
  if (failed === 0) {
    console.log('\n✅ Všetky obce opravené! Nahrádzam pôvodný súbor...');
    fs.copyFileSync(OBCE_PATH, OBCE_PATH + '.backup');
    fs.renameSync(OUTPUT_PATH, OBCE_PATH);
    console.log('Hotovo!');
  } else {
    console.log(`\n⚠️ ${failed} obcí sa nepodarilo opraviť.`);
    console.log(`Skontrolujte ${OUTPUT_PATH} a manuálne doplňte chýbajúce.`);
  }
}

main().catch(console.error);
