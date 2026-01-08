/**
 * Script na zlúčenie údajov o obciach z rôznych zdrojov
 *
 * Zdroje:
 * 1. villages-psc.json - PSČ z GitHub gunsoft
 * 2. slo2021-obce-utf8.csv - počet obyvateľov a rozloha zo Štatistického lexikónu 2021
 *
 * Výstup: municipality-data.json - kompletné údaje pre MunicipalityInfo komponent
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../src/data');

interface Village {
  id: number;
  fullname: string;
  shortname: string;
  zip: string;
  district_id: number;
  region_id: number;
}

interface District {
  id: number;
  name: string;
  veh_reg_num: string;
  code: number;
  region_id: number;
}

interface CensusData {
  name: string;
  region: string;
  district: string;
  population: number;
  area: number; // ha
  type: string;
}

interface MunicipalityData {
  name: string;
  slug: string;
  district: string;
  region: string;
  postalCode: string;
  population?: number;
  area?: number; // km²
}

// Helper function to generate slug from text
const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Parse CSV line (handles quoted fields)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
};

// Parse number from string (handles spaces as thousand separators)
const parseNumber = (str: string): number | undefined => {
  const cleaned = str.replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
};

async function main() {
  console.log('Načítavam zdrojové súbory...\n');

  // 1. Load villages with PSČ
  const villagesPath = path.join(DATA_DIR, 'villages-psc.json');
  const villages: Village[] = JSON.parse(fs.readFileSync(villagesPath, 'utf-8'));
  console.log(`Načítaných ${villages.length} obcí s PSČ`);

  // 2. Load districts for mapping
  const districtsData = await fetch('https://raw.githubusercontent.com/gunsoft/obce-okresy-kraje-slovenska/master/JSON/districts.json');
  const districts: District[] = await districtsData.json();
  const districtMap = new Map<number, string>();
  districts.forEach(d => districtMap.set(d.id, d.name));
  console.log(`Načítaných ${districts.length} okresov`);

  // 3. Load regions for mapping
  const regionsData = await fetch('https://raw.githubusercontent.com/gunsoft/obce-okresy-kraje-slovenska/master/JSON/regions.json');
  const regions: { id: number; name: string }[] = await regionsData.json();
  const regionMap = new Map<number, string>();
  regions.forEach(r => regionMap.set(r.id, r.name));
  console.log(`Načítaných ${regions.length} krajov`);

  // 4. Load census data
  const censusPath = path.join(DATA_DIR, 'slo2021-obce-utf8.csv');
  const censusContent = fs.readFileSync(censusPath, 'utf-8');
  const censusLines = censusContent.split('\n');

  // Parse census data (only "obec" type entries)
  const censusMap = new Map<string, CensusData>();

  for (let i = 2; i < censusLines.length; i++) { // Skip header rows
    const line = censusLines[i];
    if (!line.trim()) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 26) continue;

    // Type is at index 31 but check content for "obec" anywhere in the line
    const type = fields[31]?.trim().replace(/;/g, ''); // Clean up type field
    if (!line.includes(';obec;')) continue;

    const region = fields[1]?.trim();
    const district = fields[2]?.trim();
    const name = fields[3]?.trim();
    const area = parseNumber(fields[7]); // Výmera v ha
    const population = parseNumber(fields[9]); // Počet obyvateľov spolu

    if (!name || !region || !district) continue;

    // Create key for matching (lowercase, normalized)
    const key = toSlug(`${name}-${district}`);

    censusMap.set(key, {
      name,
      region,
      district,
      population: population || 0,
      area: area || 0,
      type,
    });
  }

  console.log(`Načítaných ${censusMap.size} obcí zo sčítania 2021`);

  // 5. Merge data
  const result: Record<string, MunicipalityData> = {};
  let matched = 0;
  let unmatched = 0;

  // Count duplicates
  const slugCount = new Map<string, number>();
  villages.forEach((v) => {
    const baseSlug = toSlug(v.fullname);
    slugCount.set(baseSlug, (slugCount.get(baseSlug) || 0) + 1);
  });

  for (const village of villages) {
    const district = districtMap.get(village.district_id) || '';
    const region = regionMap.get(village.region_id) || '';

    // Generate slug (with district for duplicates)
    const baseSlug = toSlug(village.fullname);
    const isDuplicate = (slugCount.get(baseSlug) || 0) > 1;
    const slug = isDuplicate ? toSlug(`${village.fullname}-${district}`) : baseSlug;

    // Find matching census data
    const censusKey = toSlug(`${village.fullname}-${district}`);
    const census = censusMap.get(censusKey);

    if (census) {
      matched++;
    } else {
      unmatched++;
    }

    result[slug] = {
      name: village.fullname,
      slug,
      district,
      region: `${region} kraj`,
      postalCode: village.zip,
      population: census?.population,
      area: census?.area ? Math.round(census.area) / 100 : undefined, // Convert ha to km²
    };
  }

  console.log(`\nZlúčené údaje:`);
  console.log(`  - S počtom obyvateľov: ${matched}`);
  console.log(`  - Bez počtu obyvateľov: ${unmatched}`);

  // 6. Save result
  const outputPath = path.join(DATA_DIR, 'municipality-data.json');
  const output = {
    lastUpdated: new Date().toISOString(),
    source: 'SODB 2021 + GitHub gunsoft/obce-okresy-kraje-slovenska',
    count: Object.keys(result).length,
    municipalities: result,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Uložené do: ${outputPath}`);
  console.log(`Celkovo: ${Object.keys(result).length} obcí`);

  // Show sample
  console.log('\nUkážka dát:');
  const samples = Object.values(result).slice(0, 5);
  samples.forEach(s => {
    console.log(`  ${s.name} (${s.district}): PSČ ${s.postalCode}, ${s.population || '?'} obyv., ${s.area || '?'} km²`);
  });
}

main().catch(console.error);
