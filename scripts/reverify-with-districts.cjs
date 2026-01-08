/**
 * Re-verifikácia problémov s okresom pre duplicitné obce
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';

const precomputedPath = path.join(__dirname, '../src/data/precomputed-distances.json');
const placeIdsCachePath = path.join(__dirname, 'place-ids-cache-full.json');
const municipalitiesPath = path.join(__dirname, '../slovenske-obce-main/obce.json');
const citiesPath = path.join(__dirname, '../src/data/cities.json');
const reportPath = path.join(__dirname, 'full-verification-report.json');

const precomputed = JSON.parse(fs.readFileSync(precomputedPath, 'utf-8'));
let placeIdsCache = JSON.parse(fs.readFileSync(placeIdsCachePath, 'utf-8'));
const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf-8'));
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Build slug -> {name, district} lookup
function toSlugSimple(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const slugToInfo = new Map();
municipalitiesData.forEach(mun => {
  if (!mun.name) return;
  let slug = toSlugSimple(mun.name);
  const duplicates = municipalitiesData.filter(m => m.name && toSlugSimple(m.name) === slug);
  if (duplicates.length > 1) {
    slug = `${slug}-${toSlugSimple(mun.district)}`;
  }
  slugToInfo.set(slug, { name: mun.name, district: mun.district });
});

citiesData.cities.forEach(city => {
  slugToInfo.set(city.slug, { name: city.name, district: city.name });
});

async function getPlaceIdWithDistrict(slug) {
  const info = slugToInfo.get(slug);
  if (!info) {
    // Try to find by partial match
    for (const [s, i] of slugToInfo) {
      if (slug.startsWith(toSlugSimple(i.name))) {
        return await searchPlaceId(i.name, i.district, slug);
      }
    }
    return null;
  }
  return await searchPlaceId(info.name, info.district, slug);
}

async function searchPlaceId(name, district, slug) {
  // Build query with district
  let query;
  if (district && district !== name) {
    query = `${name}, okres ${district}, Slovensko`;
  } else {
    query = `${name}, Slovensko`;
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.[0]) {
      const result = {
        placeId: data.results[0].place_id,
        name: data.results[0].name,
        address: data.results[0].formatted_address,
        searchQuery: query
      };
      return result;
    }
  } catch (e) {}
  return null;
}

async function getDistanceWithPlaceId(fromPlaceId, toPlaceId) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${fromPlaceId}&destinations=place_id:${toPlaceId}&mode=driving&language=sk&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const el = data.rows[0].elements[0];
      return {
        distanceKm: Math.round(el.distance.value / 100) / 10,
        durationMin: Math.round(el.duration.value / 60)
      };
    }
  } catch (e) {}
  return null;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== RE-VERIFIKÁCIA S OKRESMI ===\n');

  // Filter remaining problems (excluding already fixed)
  const fixedTo = ['Hosťovce', 'Chlmec'];
  const fixedFrom = ['Konská', 'Ploské'];

  const remaining = report.problemsList.filter(p => {
    if (fixedTo.includes(p.toName)) return false;
    if (fixedFrom.includes(p.fromName)) return false;
    return true;
  });

  console.log(`Počet problémov na preverenie: ${remaining.length}\n`);

  // First, update Place IDs for all unique slugs with district info
  const allSlugs = new Set();
  remaining.forEach(p => {
    allSlugs.add(p.from);
    allSlugs.add(p.to);
  });

  console.log('--- Aktualizujem Place ID s okresmi ---\n');

  let updatedCount = 0;
  for (const slug of allSlugs) {
    const info = slugToInfo.get(slug);
    if (!info) continue;

    // Check if this is a duplicate name
    const sameName = municipalitiesData.filter(m => m.name === info.name);
    if (sameName.length > 1) {
      // This is a duplicate - update with district
      const newPlace = await getPlaceIdWithDistrict(slug);
      if (newPlace) {
        const oldPlace = placeIdsCache[slug];
        if (!oldPlace || oldPlace.placeId !== newPlace.placeId) {
          console.log(`${info.name} (${info.district}): ${oldPlace?.name || 'N/A'} → ${newPlace.name}`);
          console.log(`  Query: "${newPlace.searchQuery}"`);
          console.log(`  Adresa: ${newPlace.address}`);
          placeIdsCache[slug] = {
            placeId: newPlace.placeId,
            name: newPlace.name
          };
          updatedCount++;
        }
      }
      await sleep(100);
    }
  }

  console.log(`\nAktualizovaných Place ID: ${updatedCount}`);

  // Save updated cache
  fs.writeFileSync(placeIdsCachePath, JSON.stringify(placeIdsCache, null, 2));

  // Now re-verify all remaining problems
  console.log('\n--- Preverujem vzdialenosti ---\n');

  const stillProblems = [];
  const nowOk = [];
  const needsFix = [];

  for (let i = 0; i < remaining.length; i++) {
    const p = remaining[i];
    const fromPlace = placeIdsCache[p.from];
    const toPlace = placeIdsCache[p.to];

    if (!fromPlace || !toPlace) {
      stillProblems.push({ ...p, reason: 'missing_place_id' });
      continue;
    }

    const result = await getDistanceWithPlaceId(fromPlace.placeId, toPlace.placeId);
    if (!result) {
      stillProblems.push({ ...p, reason: 'api_error' });
      continue;
    }

    // Find precomputed pair
    const precompPair = precomputed.distances.find(
      d => d.municipalitySlug === p.from && d.citySlug === p.to
    );
    const precompDist = precompPair?.roadDistance || p.precomputed;

    const diff = Math.abs(result.distanceKm - precompDist);
    const diffPercent = precompDist > 0 ? (diff / precompDist) * 100 : 0;

    if (diffPercent > 20 || diff > 5) {
      // Still a problem - check if Place ID is more accurate
      const fromInfo = slugToInfo.get(p.from);
      const toInfo = slugToInfo.get(p.to);

      needsFix.push({
        from: p.from,
        to: p.to,
        fromName: fromInfo?.name || p.fromName,
        fromDistrict: fromInfo?.district || '?',
        toName: toInfo?.name || p.toName,
        toDistrict: toInfo?.district || '?',
        precomputed: precompDist,
        placeId: result.distanceKm,
        diff: Math.round(diff * 10) / 10,
        diffPercent: Math.round(diffPercent)
      });
    } else {
      nowOk.push({ from: p.from, to: p.to });
    }

    if ((i + 1) % 50 === 0) {
      process.stdout.write(`\r[${i + 1}/${remaining.length}] OK: ${nowOk.length}, Problémy: ${needsFix.length}`);
    }

    await sleep(50);
  }

  console.log(`\n\n=== VÝSLEDKY ===\n`);
  console.log(`Teraz OK: ${nowOk.length}`);
  console.log(`Stále problémy: ${needsFix.length}`);
  console.log(`Chyby (missing Place ID/API): ${stillProblems.length}`);

  // Group problems by size
  const huge = needsFix.filter(p => p.diffPercent > 100);
  const big = needsFix.filter(p => p.diffPercent > 50 && p.diffPercent <= 100);
  const medium = needsFix.filter(p => p.diffPercent > 30 && p.diffPercent <= 50);
  const small = needsFix.filter(p => p.diffPercent <= 30);

  console.log(`\n--- Rozdelenie problémov ---`);
  console.log(`OBROVSKÉ (>100%): ${huge.length}`);
  console.log(`VEĽKÉ (50-100%): ${big.length}`);
  console.log(`STREDNÉ (30-50%): ${medium.length}`);
  console.log(`MALÉ (20-30%): ${small.length}`);

  if (huge.length > 0) {
    console.log('\n=== OBROVSKÉ ROZDIELY (>100%) ===');
    huge.forEach(p => {
      console.log(`${p.fromName} (${p.fromDistrict}) -> ${p.toName} (${p.toDistrict}): ${p.precomputed}km vs ${p.placeId}km (${p.diffPercent}%)`);
    });
  }

  if (big.length > 0) {
    console.log('\n=== VEĽKÉ ROZDIELY (50-100%) ===');
    big.forEach(p => {
      console.log(`${p.fromName} (${p.fromDistrict}) -> ${p.toName} (${p.toDistrict}): ${p.precomputed}km vs ${p.placeId}km (${p.diffPercent}%)`);
    });
  }

  // Save report
  const newReport = {
    timestamp: new Date().toISOString(),
    total: remaining.length,
    nowOk: nowOk.length,
    stillProblems: needsFix.length,
    errors: stillProblems.length,
    problemsBySize: { huge: huge.length, big: big.length, medium: medium.length, small: small.length },
    problems: needsFix,
    errors_list: stillProblems
  };

  fs.writeFileSync(path.join(__dirname, 'reverification-report.json'), JSON.stringify(newReport, null, 2));
  console.log('\n✅ Report uložený: scripts/reverification-report.json');
}

main().catch(console.error);
