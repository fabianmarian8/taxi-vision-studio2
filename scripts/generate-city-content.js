#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load cities data
const citiesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/cities.json'), 'utf8'));

// Template for city content
const generateCityContent = (city) => {
  const { name, slug, region, taxiServices } = city;
  const taxiCount = taxiServices.length;

  // Determine city type based on region and taxi count
  const isLargeCity = taxiCount >= 10;
  const isMediumCity = taxiCount >= 5 && taxiCount < 10;

  return `## O Taxislužbách v Meste ${name}

${name}, ${getCityDescription(city, region, taxiCount)}, ponúka ${getTaxiAvailabilityText(taxiCount)} taxislužby pre obyvateľov aj návštevníkov. Či už potrebujete odvoz do práce, na nákupy, k lekárovi, alebo na iné miesta, taxi v meste ${name} je dostupnou a pohodlnou voľbou. Taxislužby pokrývajú celé územie mesta a okolia. ${getWaitTimeText(taxiCount)}

## Ako Objednať Taxi v Meste ${name}

Objednanie taxi v meste ${name} je jednoduché a rýchle. Najtradičnejším spôsobom je telefonická objednávka priamo u vybranej taxislužby. Na našom webe nájdete aktuálne telefónne čísla pre každú službu pôsobiacu v meste ${name}. ${getModernServicesText(isLargeCity)} Pre návštevníkov je vhodné si vopred uložiť telefónne číslo vybranej taxislužby do mobilu, aby ste mali rýchly prístup k objednávke.

## Ceny Taxi v Meste ${name}

Ceny za taxi služby v meste ${name} sa môžu líšiť v závislosti od konkrétnej taxislužby a typu jazdy. Každá taxislužba má vlastný cenník, ktorý zohľadňuje nástupnú sadzbu, cenu za kilometer a prípadné príplatky za čakanie alebo prepravu batožiny. ${getPriceVariationText(region)} Odporúčame vám vopred si overiť približnú cenu jazdy priamo u dispečingu vybranej taxislužby, najmä pri plánovaní dlhších trás alebo ciest mimo mesta. Seriózne taxislužby v meste ${name} vždy poskytnú transparentné informácie o cenách.

## Taxislužby v Meste ${name} - Zoznam

Nižšie nájdete zoznam taxislužieb pôsobiacich v meste ${name}. Každý záznam obsahuje názov spoločnosti, telefónne číslo a odkaz na webovú stránku (pokiaľ je k dispozícii), kde nájdete ďalšie informácie. Vyberte si službu, ktorá najlepšie vyhovuje vašim potrebám a kontaktujte ju priamo pre objednanie jazdy.

## Tipy Pre Cestujúcich v Meste ${name}

Pre bezproblémovú a bezpečnú jazdu taxíkom v meste ${name} odporúčame dodržiavať niekoľko jednoduchých zásad. ${getSafetyTips(isLargeCity)} Pred nástupom do vozidla sa môžete informovať u vodiča o predpokladanej cene jazdy. V prípade, že si vo vozidle zabudnete osobné veci, kontaktujte priamo dispečing danej taxislužby. ${getLocalTips(region)} Uložte si telefónne číslo na vašu obľúbenú taxislužbu do telefónu, aby ste mali rýchly prístup k objednávke kedykoľvek to budete potrebovať.
`;
};

// Helper functions for dynamic content
const getCityDescription = (city, region, taxiCount) => {
  const descriptions = {
    'Bratislavský kraj': 'mesto v západnej časti Slovenska',
    'Trnavský kraj': 'mesto v Trnavskom kraji',
    'Trenčiansky kraj': 'mesto v Trenčianskom kraji',
    'Nitriansky kraj': 'mesto v Nitrianskom kraji',
    'Žilinský kraj': 'mesto v Žilinskom kraji',
    'Banskobystrický kraj': 'mesto v Banskobystrickom kraji',
    'Prešovský kraj': 'mesto v Prešovskom kraji',
    'Košický kraj': 'mesto vo východnej časti Slovenska'
  };
  return descriptions[region] || `mesto v regióne ${region}`;
};

const getTaxiAvailabilityText = (count) => {
  if (count >= 10) return 'širokú škálu';
  if (count >= 5) return 'dobrú ponuku';
  if (count >= 3) return 'niekoľko kvalitných';
  return 'dostupné';
};

const getTaxiServicesWord = (count) => {
  if (count === 1) return 'taxislužbu';
  if (count >= 2 && count <= 4) return 'taxislužby';
  return 'taxislužieb';
};

const getTaxiServicesPlural = (count) => {
  if (count === 1) return 'pokryje';
  return 'pokrývajú';
};

const getWaitTimeText = (count) => {
  if (count >= 10) return 'Vďaka hustej sieti vozidiel je priemerná čakacia doba zvyčajne len niekoľko minút.';
  if (count >= 5) return 'Čakacia doba na taxi je v meste krátka, zvyčajne do 10 minút.';
  return 'Odporúčame si taxi objednať vopred, najmä v čase dopravnej špičky.';
};

const getModernServicesText = (isLarge) => {
  if (isLarge) {
    return 'Mnohé moderné taxislužby ponúkajú aj možnosť objednania cez mobilné aplikácie, ktoré umožňujú sledovanie polohy vozidla v reálnom čase a platbu kartou.';
  }
  return 'Niektoré taxislužby môžu ponúkať aj moderné spôsoby objednávania cez mobilné aplikácie.';
};

const getPriceVariationText = (region) => {
  return 'Ceny sa tiež môžu líšiť počas dňa a noci, prípadne počas víkendov a sviatkov.';
};

const getSafetyTips = (isLarge) => {
  if (isLarge) {
    return 'Vždy si vyberajte oficiálne označené vozidlá taxislužby s viditeľným označením a cenovníkom.';
  }
  return 'Uistite sa, že nastupujete do oficiálne označeného vozidla taxislužby.';
};

const getLocalTips = (region) => {
  const tips = {
    'Bratislavský kraj': 'Pri cestách na letisko alebo k hlavnej stanici si taxi objednajte s časovou rezervou.',
    'Košický kraj': 'Pri cestách na letisko alebo k železničnej stanici si taxi objednajte s dostatočným predstihom.',
    'Žilinský kraj': 'V zimných mesiacoch si vopred overte, či taxislužba disponuje vozidlami vybavenými pre horské podmienky.',
    'Prešovský kraj': 'Pri cestách do horských oblastí si overte, či taxislužba disponuje vhodnými vozidlami.',
    'Banskobystrický kraj': 'Pri cestách do turistických oblastí si overte dostupnosť služby v mieste určenia.'
  };
  return tips[region] || 'Pri dlhších cestách si overte dostupnosť služby v mieste určenia.';
};

// Generate content for all cities without hasContent
const citiesWithoutContent = citiesData.cities.filter(city => !city.hasContent);

console.log(`Generating content for ${citiesWithoutContent.length} cities...`);

let generatedCount = 0;
const contentDir = path.join(__dirname, '../public/content/cities');

// Ensure directory exists
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

citiesWithoutContent.forEach(city => {
  const content = generateCityContent(city);
  const filePath = path.join(contentDir, `${city.slug}.md`);

  fs.writeFileSync(filePath, content, 'utf8');
  generatedCount++;

  if (generatedCount % 10 === 0) {
    console.log(`Generated ${generatedCount}/${citiesWithoutContent.length} files...`);
  }
});

console.log(`✓ Successfully generated ${generatedCount} city content files!`);
console.log(`Files saved to: ${contentDir}`);
