/**
 * Vylepšený skript na opravu zaokrúhlených GPS súradníc v obce.json
 *
 * Funkcie:
 * - Dry-run mód (--dry-run)
 * - Validácia súradníc (Slovensko: 47.7-49.6°N, 16.8-22.6°E)
 * - Diff report
 * - Limit počtu opráv (--limit N)
 * - Len kritické (--critical-only)
 *
 * Použitie:
 *   node scripts/fix-rounded-gps-v2.cjs --dry-run
 *   node scripts/fix-rounded-gps-v2.cjs --limit 10
 *   node scripts/fix-rounded-gps-v2.cjs --critical-only
 *   node scripts/fix-rounded-gps-v2.cjs  # Produkčný run
 */

const fs = require('fs');
const path = require('path');

// Konfigurácia
const OBCE_PATH = path.join(__dirname, '../slovenske-obce-main/obce.json');
const REPORT_PATH = path.join(__dirname, 'rounded-coords-report.json');
const DIFF_PATH = path.join(__dirname, 'gps-fix-diff.json');
const DELAY_MS = 1200; // Nominatim rate limit

// Argumenty
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CRITICAL_ONLY = args.includes('--critical-only');
const limitIndex = args.indexOf('--limit');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

// Slovensko bounding box
const SK_BOUNDS = {
  minLat: 47.7, maxLat: 49.6,
  minLon: 16.8, maxLon: 22.6
};

// Helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Validácia súradníc
function validateCoords(lat, lon, name) {
  if (lat < SK_BOUNDS.minLat || lat > SK_BOUNDS.maxLat) {
    console.log(`  ⚠️ ${name}: Latitude ${lat} je mimo Slovenska!`);
    return false;
  }
  if (lon < SK_BOUNDS.minLon || lon > SK_BOUNDS.maxLon) {
    console.log(`  ⚠️ ${name}: Longitude ${lon} je mimo Slovenska!`);
    return false;
  }
  return true;
}

// Detekcia zaokrúhlených súradníc
function isRounded(num) {
  const str = num.toString();
  if (str.includes('33333') || str.includes('66666') || str.includes('66667')) return 'critical';
  if (/\.\d*[50]0*$/.test(str) && str.split('.')[1]?.length <= 2) return 'moderate';
  if (/\.\d[50]$/.test(str)) return 'moderate';
  const decimals = str.split('.')[1];
  if (decimals && decimals.length <= 2) return 'moderate';
  return false;
}

// Fetch GPS z Nominatim
async function fetchGPS(obec) {
  const query = encodeURIComponent(`${obec.name}, ${obec.district}, Slovakia`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=sk`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TaxiNearMe.sk GPS Fixer v2 (contact: fabianmarian8@gmail.com)' }
    });

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.length === 0) {
      // Fallback: hľadaj len podľa názvu
      await delay(DELAY_MS);
      const query2 = encodeURIComponent(`${obec.name}, Slovakia`);
      const url2 = `https://nominatim.openstreetmap.org/search?q=${query2}&format=json&limit=5&countrycodes=sk`;
      const response2 = await fetch(url2, {
        headers: { 'User-Agent': 'TaxiNearMe.sk GPS Fixer v2' }
      });
      const data2 = await response2.json();

      // Hľadaj podľa okresu
      const match = data2.find(r => r.display_name.includes(obec.district));
      if (match) {
        return { lat: parseFloat(match.lat), lon: parseFloat(match.lon), source: 'nominatim-fallback' };
      }

      // Žiadny match - NEpoužívame prvý výsledok (bezpečnejšie)
      console.log(`  ⚠️ Nenájdené v OSM`);
      return null;
    }

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), source: 'nominatim' };
  } catch (error) {
    console.log(`  ❌ Fetch error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('=== OPRAVA ZAOKRÚHLENÝCH GPS SÚRADNÍC v2 ===\n');
  console.log(`Mód: ${DRY_RUN ? 'DRY-RUN (bez zápisu)' : 'PRODUKČNÝ'}`);
  console.log(`Filter: ${CRITICAL_ONLY ? 'Len kritické' : 'Všetky'}`);
  if (LIMIT) console.log(`Limit: ${LIMIT} obcí`);
  console.log();

  // Načítanie reportu
  if (!fs.existsSync(REPORT_PATH)) {
    console.log('❌ Najprv spustite: node scripts/find-rounded-coords.cjs');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
  const obce = JSON.parse(fs.readFileSync(OBCE_PATH, 'utf-8'));

  // Vyber obce na opravu
  let toFix = CRITICAL_ONLY ? report.critical : [...report.critical, ...report.moderate];
  if (LIMIT) toFix = toFix.slice(0, LIMIT);

  console.log(`Obce na opravu: ${toFix.length}\n`);

  // Oprava
  const diff = [];
  let fixed = 0, failed = 0, skipped = 0;

  for (let i = 0; i < toFix.length; i++) {
    const target = toFix[i];
    console.log(`[${i + 1}/${toFix.length}] ${target.name} (${target.district})`);

    const gps = await fetchGPS(target);

    if (gps) {
      // Validácia
      if (!validateCoords(gps.lat, gps.lon, target.name)) {
        skipped++;
        continue;
      }

      // Kontrola či sa súradnice významne líšia
      const latDiff = Math.abs(gps.lat - target.x);
      const lonDiff = Math.abs(gps.lon - target.y);

      if (latDiff < 0.001 && lonDiff < 0.001) {
        console.log(`  ⏭️ Rozdiel < 100m, preskakujem`);
        skipped++;
        continue;
      }

      // Zaznamenaj diff
      diff.push({
        name: target.name,
        district: target.district,
        old: { x: target.x, y: target.y },
        new: { x: gps.lat, y: gps.lon },
        source: gps.source,
        diffKm: Math.round(latDiff * 111 * 10) / 10 // Približný rozdiel v km
      });

      console.log(`  ✅ ${target.x}, ${target.y} → ${gps.lat}, ${gps.lon} (${gps.source})`);

      if (!DRY_RUN) {
        // Nájdi a aktualizuj v pôvodnom poli
        const idx = obce.findIndex(o => o.name === target.name && o.district === target.district);
        if (idx !== -1) {
          obce[idx].x = gps.lat;
          obce[idx].y = gps.lon;
        }
      }

      fixed++;
    } else {
      failed++;
    }

    // Rate limiting
    if (i < toFix.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Uloženie
  console.log('\n=== VÝSLEDKY ===');
  console.log(`Opravených: ${fixed}`);
  console.log(`Neúspešných: ${failed}`);
  console.log(`Preskočených: ${skipped}`);

  // Ulož diff report
  fs.writeFileSync(DIFF_PATH, JSON.stringify(diff, null, 2));
  console.log(`\nDiff report: ${DIFF_PATH}`);

  if (!DRY_RUN && fixed > 0) {
    // Backup a uloženie
    const backupPath = OBCE_PATH + '.backup-' + Date.now();
    fs.copyFileSync(OBCE_PATH, backupPath);
    console.log(`Backup: ${backupPath}`);

    fs.writeFileSync(OBCE_PATH, JSON.stringify(obce, null, 2));
    console.log(`✅ Aktualizované: ${OBCE_PATH}`);
  } else if (DRY_RUN) {
    console.log('\n🔍 DRY-RUN: Žiadne zmeny neboli uložené');
  }
}

main().catch(console.error);
