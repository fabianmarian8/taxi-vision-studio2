#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load cities data
const citiesFilePath = path.join(__dirname, '../public/cities.json');
const citiesData = JSON.parse(fs.readFileSync(citiesFilePath, 'utf8'));

// Content directory
const contentDir = path.join(__dirname, '../public/content/cities');

// Get list of cities with content files
const contentFiles = fs.readdirSync(contentDir)
  .filter(file => file.endsWith('.md'))
  .map(file => file.replace('.md', ''));

console.log(`Found ${contentFiles.length} content files`);

// Update cities with hasContent and contentSummary
let updatedCount = 0;

citiesData.cities = citiesData.cities.map(city => {
  if (contentFiles.includes(city.slug)) {
    updatedCount++;
    return {
      ...city,
      hasContent: true,
      contentSummary: `Podrobné informácie o taxislužbách v meste ${city.name}, vrátane ${city.taxiServices.length} taxislužieb, cien, tipov pre cestujúcich a často kladených otázok.`
    };
  }
  return city;
});

// Update lastUpdated timestamp
citiesData.lastUpdated = new Date().toISOString();

// Write updated data back to file
fs.writeFileSync(citiesFilePath, JSON.stringify(citiesData, null, 2), 'utf8');

console.log(`✓ Updated ${updatedCount} cities with hasContent and contentSummary`);
console.log(`✓ Updated lastUpdated timestamp: ${citiesData.lastUpdated}`);
