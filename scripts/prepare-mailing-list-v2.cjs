#!/usr/bin/env node
/**
 * Pripraví mailing list s korektným URL pre každú obec
 * URL formát: https://www.taxinearme.sk/obec/{slug}
 */

const fs = require('fs');
const path = require('path');

// Načítaj scraped emaily
const emailsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'obce-emails.json'), 'utf8')
);

// Načítaj obce.json pre správne názvy a okresy
const obceData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'slovenske-obce-main', 'obce.json'), 'utf8')
);

// Helper na vytvorenie slug
function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Vytvor mapu obcí podľa názvu (lowercase)
const obceMap = new Map();
obceData.forEach(obec => {
  const key = obec.name.toLowerCase();
  if (!obceMap.has(key)) {
    obceMap.set(key, obec);
  }
});

// Spočítaj duplikáty slugov
const slugCount = new Map();
obceData.forEach(obec => {
  const slug = toSlug(obec.name);
  slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
});

// Vytvor URL pre obec
function createObecUrl(obecName, district) {
  const baseSlug = toSlug(obecName);

  // Ak je viac obcí s rovnakým slug, pridaj okres
  if (slugCount.get(baseSlug) > 1 && district) {
    return `https://www.taxinearme.sk/obec/${baseSlug}-${toSlug(district)}`;
  }

  return `https://www.taxinearme.sk/obec/${baseSlug}`;
}

// Priprav mailing list
const mailingList = [];
let matched = 0;
let unmatched = 0;

emailsData.forEach(item => {
  if (!item.emails || item.emails.length === 0) return;

  const email = item.emails[0].replace(/,+$/, '').trim();
  if (!email || !email.includes('@')) return;

  // Skús nájsť obec v našej databáze
  const obecKey = item.obec.toLowerCase();
  const obec = obceMap.get(obecKey);

  let nazovObce, okres, url;

  if (obec) {
    nazovObce = obec.name;
    okres = obec.district;
    url = createObecUrl(obec.name, obec.district);
    matched++;
  } else {
    // Fallback - použij názov zo scrape a vytvor URL
    nazovObce = item.obec.charAt(0).toUpperCase() + item.obec.slice(1).toLowerCase();
    okres = '';
    url = `https://www.taxinearme.sk/obec/${toSlug(item.obec)}`;
    unmatched++;
  }

  mailingList.push({
    email,
    nazov_obce: nazovObce,
    okres,
    url_obce: url
  });
});

// Ulož ako CSV
const csvHeader = 'email,nazov_obce,okres,url_obce\n';
const csvRows = mailingList.map(item =>
  `"${item.email}","${item.nazov_obce}","${item.okres}","${item.url_obce}"`
).join('\n');

const outputPath = path.join(__dirname, '..', 'data', 'obce-mailing-list-v2.csv');
fs.writeFileSync(outputPath, csvHeader + csvRows, 'utf8');

// Ulož aj ako JSON pre skript
const jsonPath = path.join(__dirname, '..', 'data', 'obce-mailing-list-v2.json');
fs.writeFileSync(jsonPath, JSON.stringify(mailingList, null, 2), 'utf8');

console.log('='.repeat(60));
console.log('Mailing list v2 pripravený!');
console.log('='.repeat(60));
console.log(`Celkom kontaktov: ${mailingList.length}`);
console.log(`Spárovaných s databázou: ${matched}`);
console.log(`Nespárovaných (fallback): ${unmatched}`);
console.log('');
console.log('Príklady:');
mailingList.slice(0, 10).forEach(item => {
  console.log(`  ${item.nazov_obce} (${item.okres})`);
  console.log(`    Email: ${item.email}`);
  console.log(`    URL: ${item.url_obce}`);
  console.log('');
});
