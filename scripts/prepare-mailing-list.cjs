#!/usr/bin/env node
/**
 * Pripraví mailing list pre obce
 *
 * Vytvorí CSV s personalizovanými údajmi pre každú obec:
 * - email
 * - nazov_obce (s veľkým písmenom)
 * - url_obce (odkaz na taxinearme.sk)
 */

const fs = require('fs');
const path = require('path');

// Načítaj scraped dáta
const obceData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'obce-emails.json'), 'utf8')
);

// Načítaj municipalities pre mapovanie na okresy
const municipalitiesPath = path.join(__dirname, '..', 'src', 'data', 'municipalities.json');
let municipalities = [];
if (fs.existsSync(municipalitiesPath)) {
  municipalities = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf8'));
}

// Helper na vytvorenie slug
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper na formátovanie názvu obce
function formatObecName(name) {
  // Capitalize first letter of each word
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Nájdi okres pre obec
function findDistrict(obecSlug) {
  const mun = municipalities.find(m => createSlug(m.name) === obecSlug);
  if (mun) {
    return {
      district: mun.district,
      region: mun.region
    };
  }
  return null;
}

// Vytvor URL pre obec
function createObecUrl(obec) {
  const obecSlug = createSlug(obec.obec);
  const district = findDistrict(obecSlug);

  if (district) {
    const regionSlug = createSlug(district.region);
    const districtSlug = createSlug(district.district);
    // Hierarchická URL: /taxi/{region}/{okres}
    return `https://www.taxinearme.sk/taxi/${regionSlug}/${districtSlug}`;
  }

  // Fallback na hlavnú stránku
  return 'https://www.taxinearme.sk';
}

// Priprav mailing list
const mailingList = [];

obceData.forEach(obec => {
  // Preskočí obce bez emailu
  if (!obec.emails || obec.emails.length === 0) return;

  const email = obec.emails[0]; // Primárny email
  const nazovObce = formatObecName(obec.obec);
  const urlObce = createObecUrl(obec);

  mailingList.push({
    email,
    nazov_obce: nazovObce,
    url_obce: urlObce
  });
});

// CSV header
const csvHeader = 'email,nazov_obce,url_obce\n';

// CSV rows
const csvRows = mailingList.map(item =>
  `"${item.email}","${item.nazov_obce}","${item.url_obce}"`
).join('\n');

// Ulož CSV
const outputPath = path.join(__dirname, '..', 'data', 'obce-mailing-list.csv');
fs.writeFileSync(outputPath, csvHeader + csvRows, 'utf8');

console.log('='.repeat(60));
console.log('Mailing list pripravený!');
console.log('='.repeat(60));
console.log(`Celkom kontaktov: ${mailingList.length}`);
console.log(`Uložené do: ${outputPath}`);
console.log('');
console.log('Príklady:');
mailingList.slice(0, 5).forEach(item => {
  console.log(`  ${item.nazov_obce}: ${item.email}`);
  console.log(`    -> ${item.url_obce}`);
});
