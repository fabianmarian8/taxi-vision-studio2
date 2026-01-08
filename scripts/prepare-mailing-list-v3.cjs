#!/usr/bin/env node
/**
 * Pripraví mailing list s KOREKTNOU URL pre každú obec
 * URL formát: https://www.taxinearme.sk/taxi/{kraj}/{okres}/{slug}
 */

const fs = require('fs');
const path = require('path');

// Načítaj scraped emaily
const emailsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'obce-emails.json'), 'utf8')
);

// Načítaj municipality-data.json so správnymi slug, district, region
const municipalityData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'municipality-data.json'), 'utf8')
);

// Helper na vytvorenie slug
function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/ kraj$/i, '') // Odstráň duplicitný "kraj"
    .replace(/-+/g, '-');
}

// Helper na normalizáciu názvu (bez diakritiky, lowercase)
function normalizeName(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Vytvor mapu obcí podľa názvu (normalizovaného)
const municipalityMap = new Map();
const municipalityMapBySlug = new Map();

Object.values(municipalityData.municipalities).forEach(obec => {
  // Pridaj do mapy podľa normalizovaného názvu
  const key = normalizeName(obec.name);
  if (municipalityMap.has(key)) {
    const existing = municipalityMap.get(key);
    if (!Array.isArray(existing)) {
      municipalityMap.set(key, [existing]);
    }
    municipalityMap.get(key).push(obec);
  } else {
    municipalityMap.set(key, obec);
  }

  // Pridaj aj do mapy podľa slug
  municipalityMapBySlug.set(obec.slug, obec);
});

// Vytvor URL pre obec
function createObecUrl(obec) {
  // Normalizuj region - musí byť vo formáte "nitriansky-kraj"
  let regionSlug = toSlug(obec.region.replace(/ kraj kraj$/i, ' kraj').replace(/ kraj$/i, ''));
  // Pridaj -kraj ak tam nie je
  if (!regionSlug.endsWith('-kraj')) {
    regionSlug = regionSlug + '-kraj';
  }
  let districtSlug = toSlug(obec.district);
  let slug = obec.slug;

  return `https://www.taxinearme.sk/taxi/${regionSlug}/${districtSlug}/${slug}`;
}

// Nájdi obec v databáze
function findObec(name, district) {
  // Skús nájsť podľa normalizovaného názvu
  const key = normalizeName(name);
  let found = municipalityMap.get(key);

  // Ak nenájdené, skús podľa slug
  if (!found) {
    const slug = toSlug(name);
    found = municipalityMapBySlug.get(slug);
  }

  // Ak stále nenájdené, skús s okresom v slug
  if (!found && district) {
    const slugWithDistrict = toSlug(name) + '-' + toSlug(district);
    found = municipalityMapBySlug.get(slugWithDistrict);
  }

  if (!found) return null;

  // Ak je to pole (viac obcí s rovnakým názvom), skús nájsť podľa okresu
  if (Array.isArray(found)) {
    if (district) {
      const districtNorm = normalizeName(district);
      const match = found.find(o =>
        normalizeName(o.district).includes(districtNorm) ||
        districtNorm.includes(normalizeName(o.district))
      );
      if (match) return match;
    }
    // Vráť prvú ak nenájdeme zhodu
    return found[0];
  }

  return found;
}

// Priprav mailing list
const mailingList = [];
let matched = 0;
let unmatched = 0;
const unmatchedList = [];

emailsData.forEach(item => {
  if (!item.emails || item.emails.length === 0) return;

  const email = item.emails[0].replace(/,+$/, '').trim();
  if (!email || !email.includes('@')) return;

  // Skús nájsť obec v databáze
  const obec = findObec(item.obec, item.okres);

  if (obec) {
    const url = createObecUrl(obec);
    mailingList.push({
      email,
      nazov_obce: obec.name,
      okres: obec.district,
      kraj: obec.region,
      slug: obec.slug,
      url_obce: url
    });
    matched++;
  } else {
    unmatchedList.push({ name: item.obec, okres: item.okres, email });
    unmatched++;
  }
});

// Ulož ako JSON
const jsonPath = path.join(__dirname, '..', 'data', 'obce-mailing-list-v3.json');
fs.writeFileSync(jsonPath, JSON.stringify(mailingList, null, 2), 'utf8');

// Ulož nespárované pre kontrolu
const unmatchedPath = path.join(__dirname, '..', 'data', 'obce-unmatched.json');
fs.writeFileSync(unmatchedPath, JSON.stringify(unmatchedList, null, 2), 'utf8');

console.log('='.repeat(60));
console.log('Mailing list v3 pripravený (SPRÁVNE URL)!');
console.log('='.repeat(60));
console.log(`Celkom kontaktov: ${mailingList.length}`);
console.log(`Spárovaných s databázou: ${matched}`);
console.log(`Nespárovaných: ${unmatched}`);
console.log('');
console.log('Príklady URL:');
mailingList.slice(0, 5).forEach(item => {
  console.log(`  ${item.nazov_obce} (${item.okres})`);
  console.log(`    URL: ${item.url_obce}`);
  console.log('');
});

// Verifikuj niekoľko URL
console.log('Verifikácia URL:');
const testUrls = [
  mailingList.find(m => m.nazov_obce === 'Bohunice' && m.okres.includes('Ilava')),
  mailingList.find(m => m.nazov_obce === 'Zvolen'),
  mailingList.find(m => m.nazov_obce === 'Bratislava - Petržalka' || m.slug?.includes('petrzalka')),
].filter(Boolean);

testUrls.forEach(item => {
  if (item) {
    console.log(`  ${item.nazov_obce}: ${item.url_obce}`);
  }
});
