import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Načítanie cities.json
const citiesDataPath = join(__dirname, '../src/data/cities.json');
const citiesData = JSON.parse(readFileSync(citiesDataPath, 'utf-8'));

// Funkcia na vytvorenie vylepšeného meta description
const generateImprovedMetaDescription = (city) => {
  const taxiCount = city.taxiServices?.length || 0;
  
  if (taxiCount === 0) {
    return `Nájdite taxislužby v meste ${city.name}. Kompletný zoznam dostupných taxi služieb s telefónnymi číslami a webovými stránkami.`;
  }
  
  // Získať názvy prvých 2-3 taxislužieb
  const topServices = city.taxiServices
    .slice(0, Math.min(3, taxiCount))
    .map(s => s.name)
    .join(', ');
  
  return `Nájdite taxi v meste ${city.name}. ${taxiCount} ${taxiCount === 1 ? 'taxislužba' : taxiCount < 5 ? 'taxislužby' : 'taxislužieb'} s telefónnymi číslami a webovými stránkami: ${topServices}${taxiCount > 3 ? ' a ďalšie' : ''}. Kontaktujte priamo.`;
};

// Aktualizácia meta descriptions
let updatedCount = 0;
citiesData.cities.forEach(city => {
  const newMetaDescription = generateImprovedMetaDescription(city);
  if (city.metaDescription !== newMetaDescription) {
    city.metaDescription = newMetaDescription;
    updatedCount++;
  }
});

// Aktualizácia lastUpdated
citiesData.lastUpdated = new Date().toISOString();

// Uloženie späť do cities.json
writeFileSync(citiesDataPath, JSON.stringify(citiesData, null, 2), 'utf-8');

console.log('✅ Meta descriptions úspešne vylepšené!');
console.log(`📊 Aktualizovaných miest: ${updatedCount}/${citiesData.cities.length}`);
console.log(`📝 Uložené do: ${citiesDataPath}`);
