import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Načítanie cities.json
const citiesDataPath = join(__dirname, '../src/data/cities.json');
const citiesData = JSON.parse(readFileSync(citiesDataPath, 'utf-8'));

const baseUrl = 'https://www.taxinearme.sk';
const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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

// Začiatok XML sitemap
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Homepage
xml += '  <url>\n';
xml += `    <loc>${baseUrl}/</loc>\n`;
xml += `    <lastmod>${currentDate}</lastmod>\n`;
xml += '    <changefreq>daily</changefreq>\n';
xml += '    <priority>1.0</priority>\n';
xml += '  </url>\n';

// Stránky krajov
regions.forEach(region => {
  const regionSlug = createRegionSlug(region);
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/kraj/${regionSlug}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';
});

// Stránky miest
citiesData.cities.forEach(city => {
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/taxi/${city.slug}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.9</priority>\n';
  xml += '  </url>\n';

  // Stránky jednotlivých taxislužieb
  if (city.taxiServices && city.taxiServices.length > 0) {
    city.taxiServices.forEach(service => {
      const serviceSlug = createServiceSlug(service.name);
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/taxi/${city.slug}/${serviceSlug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
  }
});

// Blog články - VYSOKÁ PRIORITA PRE SEO
const blogArticles = [
  { path: '/prieskum-cien-taxisluzieb-slovensko-2025', priority: '0.8', date: '2025-01-15' },
  { path: '/porovnanie-cien-taxi-2024-2025', priority: '0.8', date: '2025-01-15' },
  { path: '/hodnotenie-vodicov', priority: '0.8', date: '2025-01-15' },
  { path: '/alkohol-nocny-zivot', priority: '0.8', date: '2025-01-15' },
  { path: '/komplexny-sprievodca-taxi', priority: '0.8', date: '2025-01-15' },
  { path: '/komunikacia-taxikar-zakaznik', priority: '0.8', date: '2025-01-15' },
  { path: '/elektrifikacia-taxi', priority: '0.8', date: '2025-01-15' },
  { path: '/psychologia-zakaznikov', priority: '0.8', date: '2025-01-15' },
  { path: '/taxi-navigacia', priority: '0.8', date: '2025-01-15' },
  { path: '/co-musi-zniest-vodic', priority: '0.8', date: '2025-01-15' },
  { path: '/temna-strana-bolt-uber', priority: '0.8', date: '2025-01-15' }
];

blogArticles.forEach(article => {
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}${article.path}</loc>\n`;
  xml += `    <lastmod>${article.date}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += `    <priority>${article.priority}</priority>\n`;
  xml += '  </url>\n';
});

// Právne stránky
const legalPages = [
  { path: '/ochrana-sukromia', priority: '0.3' },
  { path: '/podmienky-pouzivania', priority: '0.3' },
  { path: '/kontakt', priority: '0.5' }
];

legalPages.forEach(page => {
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += `    <priority>${page.priority}</priority>\n`;
  xml += '  </url>\n';
});

xml += '</urlset>\n';

// Uloženie do public/sitemap.xml
const outputPath = join(__dirname, '../public/sitemap.xml');
writeFileSync(outputPath, xml, 'utf-8');

const totalTaxiServices = citiesData.cities.reduce((sum, city) => sum + (city.taxiServices?.length || 0), 0);
const totalUrls = 1 + regions.length + citiesData.cities.length + totalTaxiServices + blogArticles.length + legalPages.length;

console.log('✅ Sitemap úspešne vygenerovaný!');
console.log(`📊 Celkový počet URL: ${totalUrls}`);
console.log(`   - Homepage: 1`);
console.log(`   - Kraje: ${regions.length}`);
console.log(`   - Mestá: ${citiesData.cities.length}`);
console.log(`   - Taxislužby: ${totalTaxiServices}`);
console.log(`   - Blog články: ${blogArticles.length} ⭐ NOVÉ!`);
console.log(`   - Právne stránky: ${legalPages.length}`);
console.log(`📝 Uložené do: ${outputPath}`);
