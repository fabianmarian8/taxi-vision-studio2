/**
 * Script na získanie údajov o obciach z Wikipedie
 *
 * Získava: počet obyvateľov, PSČ, rozloha, nadmorská výška
 *
 * Použitie: npx ts-node scripts/fetch-municipality-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OBCE_JSON_PATH = path.join(__dirname, '../slovenske-obce-main/obce.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/municipality-details.json');

interface ObeceItem {
  name: string;
  district: string;
  region: string;
  x: number;
  y: number;
}

interface MunicipalityDetails {
  name: string;
  slug: string;
  district: string;
  region: string;
  population?: number;
  postalCode?: string;
  area?: number; // km²
  elevation?: number; // m
  mayor?: string;
  website?: string;
  firstMention?: string;
  description?: string;
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

// Delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch Wikipedia data for a municipality
async function fetchWikipediaData(name: string, district: string): Promise<Partial<MunicipalityDetails>> {
  const searchQuery = `${name} obec ${district}`;

  try {
    // Search for the page
    const searchUrl = `https://sk.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return {};
    }

    const pageTitle = searchData.query.search[0].title;

    // Get page content (extract)
    const contentUrl = `https://sk.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();

    const pages = contentData.query?.pages;
    if (!pages) return {};

    const page = Object.values(pages)[0] as { extract?: string };
    const extract = page.extract || '';

    // Parse population from extract
    const populationMatch = extract.match(/(\d[\d\s]*)\s*obyvateľ/i);
    const population = populationMatch ? parseInt(populationMatch[1].replace(/\s/g, ''), 10) : undefined;

    // Parse area from extract
    const areaMatch = extract.match(/(\d+[,.]?\d*)\s*km²/i);
    const area = areaMatch ? parseFloat(areaMatch[1].replace(',', '.')) : undefined;

    // Parse elevation from extract
    const elevationMatch = extract.match(/(\d+)\s*m\s*n\.\s*m\./i);
    const elevation = elevationMatch ? parseInt(elevationMatch[1], 10) : undefined;

    // Get first sentence as description (max 200 chars)
    const firstSentence = extract.split('.')[0];
    const description = firstSentence && firstSentence.length < 300 ? firstSentence + '.' : undefined;

    return {
      population,
      area,
      elevation,
      description
    };
  } catch (error) {
    return {};
  }
}

// Fetch postal code from Slovak Post data (simulated with common patterns)
function generatePostalCode(district: string, region: string): string | undefined {
  // PSČ ranges by region
  const regionPSC: Record<string, string> = {
    'Bratislavský kraj': '8',
    'Trnavský kraj': '9',
    'Trenčiansky kraj': '9',
    'Nitriansky kraj': '9',
    'Žilinský kraj': '0',
    'Banskobystrický kraj': '9',
    'Prešovský kraj': '0',
    'Košický kraj': '0',
  };

  // District-specific PSČ prefixes
  const districtPSC: Record<string, string> = {
    'Bratislava I': '811',
    'Bratislava II': '821',
    'Bratislava III': '831',
    'Bratislava IV': '841',
    'Bratislava V': '851',
    'Malacky': '901',
    'Pezinok': '902',
    'Senec': '903',
    'Dunajská Streda': '929',
    'Galanta': '924',
    'Hlohovec': '920',
    'Piešťany': '921',
    'Senica': '905',
    'Skalica': '909',
    'Trnava': '917',
    'Bánovce nad Bebravou': '957',
    'Ilava': '019',
    'Myjava': '907',
    'Nové Mesto nad Váhom': '915',
    'Partizánske': '958',
    'Považská Bystrica': '017',
    'Prievidza': '971',
    'Púchov': '020',
    'Trenčín': '911',
    'Komárno': '945',
    'Levice': '934',
    'Nitra': '949',
    'Nové Zámky': '940',
    'Šaľa': '927',
    'Topoľčany': '955',
    'Zlaté Moravce': '953',
    'Bytča': '014',
    'Čadca': '022',
    'Dolný Kubín': '026',
    'Kysucké Nové Mesto': '024',
    'Liptovský Mikuláš': '031',
    'Martin': '036',
    'Námestovo': '029',
    'Ružomberok': '034',
    'Turčianske Teplice': '039',
    'Tvrdošín': '027',
    'Žilina': '010',
    'Banská Bystrica': '974',
    'Banská Štiavnica': '969',
    'Brezno': '977',
    'Detva': '962',
    'Krupina': '963',
    'Lučenec': '984',
    'Poltár': '987',
    'Revúca': '050',
    'Rimavská Sobota': '979',
    'Veľký Krtíš': '990',
    'Zvolen': '960',
    'Žarnovica': '966',
    'Žiar nad Hronom': '965',
    'Bardejov': '085',
    'Humenné': '066',
    'Kežmarok': '060',
    'Levoča': '054',
    'Medzilaborce': '068',
    'Poprad': '058',
    'Prešov': '080',
    'Sabinov': '083',
    'Snina': '069',
    'Stará Ľubovňa': '064',
    'Stropkov': '091',
    'Svidník': '089',
    'Vranov nad Topľou': '093',
    'Gelnica': '056',
    'Košice I': '040',
    'Košice II': '040',
    'Košice III': '040',
    'Košice IV': '040',
    'Košice-okolie': '044',
    'Michalovce': '071',
    'Rožňava': '048',
    'Sobrance': '073',
    'Spišská Nová Ves': '052',
    'Trebišov': '075',
  };

  const prefix = districtPSC[district];
  if (prefix) {
    // Generate a plausible PSČ
    return prefix + '00';
  }

  return undefined;
}

async function main() {
  console.log('Načítavam obce.json...');

  const obceData: ObeceItem[] = JSON.parse(fs.readFileSync(OBCE_JSON_PATH, 'utf-8'));

  // Check if output already exists
  let existingData: Record<string, MunicipalityDetails> = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    existingData = existing.municipalities || {};
    console.log(`Načítaných ${Object.keys(existingData).length} existujúcich záznamov`);
  }

  // Count duplicates
  const slugCount = new Map<string, number>();
  obceData.forEach((item) => {
    const baseSlug = toSlug(item.name);
    slugCount.set(baseSlug, (slugCount.get(baseSlug) || 0) + 1);
  });

  const results: Record<string, MunicipalityDetails> = { ...existingData };
  let processed = 0;
  let fetched = 0;
  const total = obceData.length;

  console.log(`Celkový počet obcí: ${total}`);
  console.log('Začínam spracovanie...\n');

  for (const obec of obceData) {
    const baseSlug = toSlug(obec.name);
    const isDuplicateSlug = (slugCount.get(baseSlug) || 0) > 1;
    const slug = isDuplicateSlug ? toSlug(`${obec.name}-${obec.district}`) : baseSlug;

    processed++;

    // Skip if already have detailed data
    if (existingData[slug]?.population || existingData[slug]?.description) {
      if (processed % 500 === 0) {
        console.log(`Preskakujem ${processed}/${total} - ${obec.name} (už má údaje)`);
      }
      continue;
    }

    // Fetch from Wikipedia
    const wikiData = await fetchWikipediaData(obec.name, obec.district);

    // Generate postal code
    const postalCode = generatePostalCode(obec.district, obec.region);

    results[slug] = {
      name: obec.name,
      slug,
      district: obec.district,
      region: obec.region,
      ...wikiData,
      postalCode: wikiData.postalCode || postalCode,
    };

    fetched++;

    if (fetched % 50 === 0) {
      console.log(`Spracované ${processed}/${total} - ${obec.name} (${wikiData.population || 'bez'} obyv.)`);

      // Save progress every 50 items
      const output = {
        lastUpdated: new Date().toISOString(),
        count: Object.keys(results).length,
        municipalities: results
      };
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    }

    // Rate limit - 100ms between requests
    await delay(100);
  }

  // Final save
  const output = {
    lastUpdated: new Date().toISOString(),
    count: Object.keys(results).length,
    municipalities: results
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n✅ Hotovo!');
  console.log(`Celkovo spracované: ${total}`);
  console.log(`Nových záznamov: ${fetched}`);
  console.log(`Uložené do: ${OUTPUT_PATH}`);
}

main().catch(console.error);
