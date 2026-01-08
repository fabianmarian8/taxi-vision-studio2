import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Načítanie cities.json
const citiesDataPath = join(__dirname, '../src/data/cities.json');
const citiesData = JSON.parse(readFileSync(citiesDataPath, 'utf-8'));

// Helper funkcia pre vytvorenie slug z názvu kraja
const createRegionSlug = (regionName) => {
  return regionName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
};

// Helper funkcia pre vytvorenie slug z názvu taxislužby
const createServiceSlug = (serviceName) => {
  return serviceName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Získanie unikátnych regiónov
const regions = [...new Set(citiesData.cities.map(city => city.region))].sort();

// Zoznam všetkých routes
const routes = [];

// Homepage
routes.push('/');

// Stránky krajov
regions.forEach(region => {
  const regionSlug = createRegionSlug(region);
  routes.push(`/kraj/${regionSlug}`);
});

// Stránky miest a taxislužieb
citiesData.cities.forEach(city => {
  // Stránka mesta
  routes.push(`/taxi/${city.slug}`);

  // Stránky jednotlivých taxislužieb
  if (city.taxiServices && city.taxiServices.length > 0) {
    city.taxiServices.forEach(service => {
      const serviceSlug = createServiceSlug(service.name);
      routes.push(`/taxi/${city.slug}/${serviceSlug}`);
    });
  }
});

// Právne stránky
routes.push('/ochrana-sukromia');
routes.push('/podmienky-pouzivania');
routes.push('/kontakt');

// Uloženie do JSON súboru
const outputPath = join(__dirname, '../routes.json');
writeFileSync(outputPath, JSON.stringify(routes, null, 2), 'utf-8');

console.log('✅ Routes úspešne vygenerované!');
console.log(`📊 Celkový počet routes: ${routes.length}`);
console.log(`   - Homepage: 1`);
console.log(`   - Kraje: ${regions.length}`);
console.log(`   - Mestá: ${citiesData.cities.length}`);
console.log(`   - Taxislužby: ${citiesData.cities.reduce((sum, city) => sum + (city.taxiServices?.length || 0), 0)}`);
console.log(`   - Právne stránky: 3`);
console.log(`📝 Uložené do: ${outputPath}`);
