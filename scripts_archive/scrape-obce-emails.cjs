#!/usr/bin/env node
/**
 * Scraper pre emaily obcí z e-obce.sk
 *
 * Postup:
 * 1. Stiahne zoznam všetkých obcí (6 stránok po 500)
 * 2. Pre každú obec stiahne detail stránku
 * 3. Extrahuje emaily z mailto: linkov
 * 4. Uloží do CSV súboru
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const BASE_URL = 'https://www.e-obce.sk';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'obce-emails.csv');

// Rate limiting - 200ms medzi requestami aby sme nezaťažili server
const DELAY_MS = 200;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getAllMunicipalityUrls() {
  const pages = [0, 500, 1000, 1500, 2000, 2500];
  const allUrls = [];

  for (const offset of pages) {
    const url = `${BASE_URL}/zoznam_vsetkych_obci.html?strana=${offset}`;
    console.log(`Sťahujem zoznam obcí (${offset + 1}-${offset + 500})...`);

    try {
      const html = await fetchPage(url);
      // Extrahuj URL obce
      const matches = html.match(/obec\/[^/"]+\/[^/"]+\.html/g) || [];
      const uniqueUrls = [...new Set(matches)];
      allUrls.push(...uniqueUrls);
      console.log(`  Nájdených: ${uniqueUrls.length} obcí`);
    } catch (err) {
      console.error(`  Chyba: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  return [...new Set(allUrls)];
}

async function extractEmailsFromMunicipality(urlPath) {
  const url = `${BASE_URL}/${urlPath}`;

  try {
    const html = await fetchPage(url);

    // Extrahuj názov obce z URL
    const nameMatch = urlPath.match(/obec\/([^/]+)\//);
    const obec = nameMatch ? nameMatch[1].replace(/-/g, ' ') : urlPath;

    // Extrahuj emaily z mailto: linkov
    const emailMatches = html.match(/mailto:([^">\s]+)/gi) || [];
    const emails = emailMatches
      .map(m => m.replace('mailto:', '').trim())
      .filter(e => e.includes('@') && !e.includes('e-obce.sk'));

    // Extrahuj telefón - hľadaj čísla v slovenskom formáte
    const telMatch = html.match(/(\+421|0)[\s]?(\d{3})[\s]?(\d{3})[\s]?(\d{3})/g) || [];
    const telefon = telMatch.length > 0 ? telMatch[0].replace(/\s/g, '') : '';

    // Extrahuj web obce
    const webMatch = html.match(/href="(https?:\/\/(?:www\.)?[^"]*(?!e-obce)[^"]*)"[^>]*>(?:www\.|http)/i);
    const web = webMatch ? webMatch[1] : '';

    return {
      obec: obec.charAt(0).toUpperCase() + obec.slice(1),
      urlPath,
      emails: [...new Set(emails)],
      telefon,
      web
    };
  } catch (err) {
    return {
      obec: urlPath,
      urlPath,
      emails: [],
      telefon: '',
      web: '',
      error: err.message
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Scraper emailov obcí z e-obce.sk');
  console.log('='.repeat(60));
  console.log('');

  // 1. Získaj všetky URL obcí
  console.log('KROK 1: Sťahovanie zoznamu obcí...');
  const municipalityUrls = await getAllMunicipalityUrls();
  console.log(`\nCelkom nájdených obcí: ${municipalityUrls.length}\n`);

  // 2. Pre každú obec extrahuj emaily
  console.log('KROK 2: Extrahovanie emailov z jednotlivých obcí...');
  console.log('(Toto môže trvať 10-15 minút)\n');

  const results = [];
  let processed = 0;
  let withEmail = 0;

  for (const urlPath of municipalityUrls) {
    const data = await extractEmailsFromMunicipality(urlPath);
    results.push(data);

    processed++;
    if (data.emails.length > 0) withEmail++;

    // Progress log každých 100 obcí
    if (processed % 100 === 0) {
      console.log(`  Spracovaných: ${processed}/${municipalityUrls.length} (s emailom: ${withEmail})`);
    }

    await sleep(DELAY_MS);
  }

  // 3. Ulož do CSV
  console.log('\nKROK 3: Ukladanie do CSV...');

  const csvHeader = 'obec,email_1,email_2,telefon,web,url\n';
  const csvRows = results.map(r => {
    const email1 = r.emails[0] || '';
    const email2 = r.emails[1] || '';
    return `"${r.obec}","${email1}","${email2}","${r.telefon}","${r.web}","${BASE_URL}/${r.urlPath}"`;
  });

  fs.writeFileSync(OUTPUT_FILE, csvHeader + csvRows.join('\n'), 'utf8');

  // 4. Štatistiky
  console.log('\n' + '='.repeat(60));
  console.log('HOTOVO!');
  console.log('='.repeat(60));
  console.log(`Celkom obcí: ${results.length}`);
  console.log(`S emailom: ${withEmail} (${Math.round(withEmail/results.length*100)}%)`);
  console.log(`Uložené do: ${OUTPUT_FILE}`);

  // Uložiť aj JSON pre ďalšie spracovanie
  const jsonFile = OUTPUT_FILE.replace('.csv', '.json');
  fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`JSON uložený: ${jsonFile}`);
}

main().catch(console.error);
