/**
 * Oprava problémových vzdialeností pomocou Place ID
 *
 * 1. Načíta problémové páry z verifikačného reportu
 * 2. Získa Place ID pre obce
 * 3. Prepočíta vzdialenosti cez Distance Matrix API s Place ID
 * 4. Aktualizuje precomputed-distances.json
 *
 * Použitie: GOOGLE_API_KEY=xxx node scripts/fix-problem-distances.cjs
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

// Paths
const reportPath = path.join(__dirname, 'google-verification-report.json');
const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const placeIdsPath = path.join(__dirname, 'place-ids-cache.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');

// Load data
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

// Helper: Create slug from name
function toSlugSimple(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build lookup: slug -> {name, district}
const munLookup = new Map();
municipalitiesData.forEach(mun => {
  if (!mun.name) return;

  let slug = toSlugSimple(mun.name);

  // Check for duplicates - add district suffix
  const duplicates = municipalitiesData.filter(m => m.name && toSlugSimple(m.name) === slug);
  if (duplicates.length > 1) {
    const districtSlug = toSlugSimple(mun.district);
    slug = `${slug}-${districtSlug}`;
  }

  munLookup.set(slug, {
    name: mun.name,
    district: mun.district
  });
});

// Add cities
citiesData.cities.forEach(city => {
  munLookup.set(city.slug, {
    name: city.name,
    district: city.name // Cities use their own name as "district"
  });
});

// Load or create place IDs cache
let placeIdsCache = {};
if (fs.existsSync(placeIdsPath)) {
  placeIdsCache = JSON.parse(fs.readFileSync(placeIdsPath, 'utf-8'));
}

function savePlaceIdsCache() {
  fs.writeFileSync(placeIdsPath, JSON.stringify(placeIdsCache, null, 2));
}

/**
 * Získa Place ID pre dané miesto - POUŽÍVA OKRES pre presnosť!
 */
async function getPlaceId(placeName, slug, district = null) {
  // Check cache first
  if (placeIdsCache[slug]) {
    return placeIdsCache[slug];
  }

  // Použij okres pre presnejšie výsledky (dôležité pre duplicitné názvy obcí!)
  let query;
  if (district && district !== placeName) {
    query = `${placeName}, okres ${district}, Slovensko`;
  } else {
    query = `${placeName}, Slovensko`;
  }

  console.log(`  🔍 Hľadám: "${query}"`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log(`  ⚠️ Place ID nenájdené: ${placeName}`);
      return null;
    }

    const result = data.results[0];
    const placeData = {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address
    };

    // Cache it
    placeIdsCache[slug] = placeData;
    savePlaceIdsCache();

    return placeData;
  } catch (error) {
    console.error(`  ❌ Chyba pre ${placeName}:`, error.message);
    return null;
  }
}

/**
 * Získa vzdialenosť cez Distance Matrix API s Place ID
 */
async function getDistanceWithPlaceId(fromPlaceId, toPlaceId) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${fromPlaceId}&destinations=place_id:${toPlaceId}&mode=driving&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
      return null;
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      return null;
    }

    return {
      distanceKm: Math.round(element.distance.value / 100) / 10,
      durationMin: Math.round(element.duration.value / 60)
    };
  } catch (error) {
    console.error('  ❌ Distance Matrix chyba:', error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== OPRAVA PROBLÉMOVÝCH VZDIALENOSTÍ ===\n');
  console.log(`Problémových párov: ${report.problems.length}`);

  // Extrahuj unikátne miesta
  const uniquePlaces = new Map();
  report.problems.forEach(p => {
    uniquePlaces.set(p.from, p.fromName);
    uniquePlaces.set(p.to, p.toName);
  });
  console.log(`Unikátnych miest: ${uniquePlaces.size}`);

  // Získaj Place ID pre všetky unikátne miesta (s okresom!)
  console.log('\n--- Získavam Place ID (s okresom pre presnosť) ---');
  let fetchedCount = 0;
  for (const [slug, name] of uniquePlaces) {
    if (!placeIdsCache[slug]) {
      const munInfo = munLookup.get(slug);
      const district = munInfo ? munInfo.district : null;
      await getPlaceId(name, slug, district);
      fetchedCount++;
      await sleep(200); // Rate limiting
    }
  }
  console.log(`Nových Place ID získaných: ${fetchedCount}`);
  console.log(`Celkom v cache: ${Object.keys(placeIdsCache).length}`);

  // Prepočítaj vzdialenosti pre problémové páry
  console.log('\n--- Prepočítavam vzdialenosti ---');

  const fixes = [];
  const errors = [];

  for (let i = 0; i < report.problems.length; i++) {
    const problem = report.problems[i];

    const fromPlace = placeIdsCache[problem.from];
    const toPlace = placeIdsCache[problem.to];

    if (!fromPlace || !toPlace) {
      errors.push({
        from: problem.from,
        to: problem.to,
        reason: 'Missing Place ID'
      });
      continue;
    }

    const result = await getDistanceWithPlaceId(fromPlace.placeId, toPlace.placeId);
    await sleep(100);

    if (!result) {
      errors.push({
        from: problem.from,
        to: problem.to,
        reason: 'API error'
      });
      continue;
    }

    // Porovnaj s precomputed
    const diff = Math.abs(result.distanceKm - problem.precomputed.road);
    const diffPercent = (diff / problem.precomputed.road) * 100;

    console.log(`${i + 1}/${report.problems.length} ${problem.fromName} → ${problem.toName}: ` +
      `precomp=${problem.precomputed.road}km, placeId=${result.distanceKm}km (${diffPercent.toFixed(0)}%)`);

    // Ak je rozdiel malý (< 50%), použijeme Place ID hodnotu
    // Ak je rozdiel veľký, niečo je zle s našimi precomputed dátami
    if (diffPercent < 50) {
      // Naše precomputed dáta sú pravdepodobne správne
      console.log(`  ✅ Naše dáta OK - rozdiel len ${diff.toFixed(1)}km`);
    } else {
      // Google s koordinátami vrátil zlý výsledok, Place ID je lepšie
      fixes.push({
        municipalitySlug: problem.from,
        citySlug: problem.to,
        oldRoad: problem.precomputed.road,
        newRoad: result.distanceKm,
        oldDuration: problem.precomputed.duration,
        newDuration: result.durationMin,
        airDistance: problem.precomputed.air
      });
      console.log(`  📝 OPRAVA: ${problem.precomputed.road}km → ${result.distanceKm}km`);
    }
  }

  // Výsledky
  console.log('\n' + '='.repeat(50));
  console.log('VÝSLEDKY');
  console.log('='.repeat(50));
  console.log(`✅ Dáta OK (rozdiel < 50%): ${report.problems.length - fixes.length - errors.length}`);
  console.log(`📝 Na opravu: ${fixes.length}`);
  console.log(`❌ Chyby: ${errors.length}`);

  if (fixes.length > 0) {
    console.log('\n--- OPRAVY NA APLIKOVANIE ---');
    fixes.forEach(f => {
      console.log(`${f.municipalitySlug} → ${f.citySlug}: ${f.oldRoad}km → ${f.newRoad}km`);
    });

    // Opýtaj sa či aplikovať
    console.log('\n💡 Použi --apply pre aplikovanie opráv do precomputed-distances.json');

    if (process.argv.includes('--apply')) {
      console.log('\n--- APLIKUJEM OPRAVY ---');

      let appliedCount = 0;
      for (const fix of fixes) {
        const idx = precomputed.distances.findIndex(
          d => d.municipalitySlug === fix.municipalitySlug && d.citySlug === fix.citySlug
        );

        if (idx !== -1) {
          precomputed.distances[idx].roadDistance = fix.newRoad;
          precomputed.distances[idx].duration = fix.newDuration;
          appliedCount++;
          console.log(`  ✅ ${fix.municipalitySlug} → ${fix.citySlug}`);
        } else {
          console.log(`  ⚠️ Nenájdené: ${fix.municipalitySlug} → ${fix.citySlug}`);
        }
      }

      fs.writeFileSync(precomputedPath, JSON.stringify(precomputed, null, 2));
      console.log(`\n✅ Aplikovaných ${appliedCount} opráv do precomputed-distances.json`);
    }
  }

  // Ulož zoznam opráv
  const fixesPath = path.join(__dirname, 'distance-fixes.json');
  fs.writeFileSync(fixesPath, JSON.stringify({ fixes, errors }, null, 2));
  console.log(`\nZoznam opráv uložený do: ${fixesPath}`);
}

main().catch(console.error);
