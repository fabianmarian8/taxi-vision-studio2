import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Načítanie cities.json
const citiesDataPath = join(__dirname, '../src/data/cities.json');
const citiesData = JSON.parse(readFileSync(citiesDataPath, 'utf-8'));

// Načítanie base index.html z dist
const distIndexPath = join(__dirname, '../dist/index.html');
const baseHtml = readFileSync(distIndexPath, 'utf-8');

const baseUrl = 'https://www.taxinearme.sk';

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

// Helper funkcia na vloženie meta tagov a canonical do HTML
const injectMetaTags = (html, title, description, canonicalUrl, keywords = []) => {
  let modifiedHtml = html;

  // Inject title
  modifiedHtml = modifiedHtml.replace(
    /<title>.*?<\/title>/,
    `<title>${title}</title>`
  );

  // Inject description
  modifiedHtml = modifiedHtml.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${description}" />`
  );

  // Inject keywords if provided
  if (keywords.length > 0) {
    modifiedHtml = modifiedHtml.replace(
      /<meta name="keywords" content=".*?"\/>/,
      `<meta name="keywords" content="${keywords.join(', ')}"/>`
    );
  }

  // Inject OG tags
  modifiedHtml = modifiedHtml.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description}" />`
  );

  // Inject Twitter tags
  modifiedHtml = modifiedHtml.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  // CRITICAL: Inject canonical tag BEFORE </head>
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}"/>`;
  modifiedHtml = modifiedHtml.replace(
    /<!-- Canonical tag je dynamicky nastavený cez SEOHead komponent pre každú stránku -->/,
    `<!-- Pre-rendered canonical tag for SEO -->\n    ${canonicalTag}`
  );

  return modifiedHtml;
};

// Helper funkcia na vloženie SEO obsahu pre taxi service stránky
const injectTaxiServiceSEOContent = (html, serviceName, cityName, cityRegion, phone) => {
  const seoContent = `
    <!-- Pre-rendered SEO Content -->
    <noscript>
      <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">${serviceName}</h1>
        <p style="margin-bottom: 1rem;">Taxislužba v meste ${cityName}</p>

        <h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem;">O taxislužbe ${serviceName} v meste ${cityName}</h2>
        <p style="margin-bottom: 1rem; line-height: 1.6;">
          ${serviceName} patrí medzi taxislužby pôsobiace v meste ${cityName} a jeho okolí.
          Podľa dostupných informácií zabezpečuje prepravu osôb v rámci mesta aj do
          priľahlých obcí a okolitých častí regiónu ${cityRegion}. Služby tohto poskytovateľa
          môžu využiť obyvatelia, návštevníci mesta, ako aj cestujúci smerujúci na letiská,
          vlakové a autobusové stanice či iné dôležité dopravné uzly.
        </p>

        <p style="margin-bottom: 1rem; line-height: 1.6;">
          Informácie o taxislužbe ${serviceName} na tejto stránke vychádzajú z verejne dostupných
          zdrojov alebo z údajov deklarovaných samotným poskytovateľom služby. Stránka funguje
          ako nezávislá databáza taxislužieb a neprevádzkuje taxi dopravu. Z tohto dôvodu
          nemôžeme priamo garantovať dostupnosť vozidiel, kvalitu služieb, profesionalitu
          vodičov ani presnosť všetkých uvádzaných údajov. Údaje sa môžu v čase meniť, preto
          odporúčame dôležité informácie (napríklad ceny, dostupnosť alebo otváracie hodiny)
          vždy overiť priamo u poskytovateľa.
        </p>

        <h3 style="font-size: 1.25rem; font-weight: bold; margin: 1.5rem 0 1rem;">Prečo môže byť ${serviceName} vhodnou voľbou?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.6;">
          V prípade, že hľadáte taxi v meste ${cityName}, taxislužba ${serviceName} môže byť
          jednou z možností, ktoré stojí za zváženie. Nižšie uvádzame všeobecné výhody, ktoré
          môžu byť pre cestujúcich pri výbere taxislužby dôležité. Nejde o hodnotenie zo strany
          tejto stránky, ale o prehľad kritérií, ktoré si môžete overiť priamo u poskytovateľa:
        </p>
        <ul style="margin: 1rem 0 1rem 2rem; line-height: 1.8;">
          <li>Preprava v rámci mesta ${cityName} aj do okolitých častí regiónu ${cityRegion}, čo môže byť praktické pri dochádzaní za prácou, nákupmi alebo službami.</li>
          <li>Podľa vlastných údajov taxislužby môžu mať vodiči dobrú znalosť miestnych ulíc, dopravnej situácie a frekventovaných cieľov v meste.</li>
          <li>Poskytovateľ môže deklarovať rozšírenú dostupnosť počas dňa, prípadne aj v nočných hodinách; odporúčame však aktuálne informácie o prevádzkovej dobe overiť pri objednávke.</li>
          <li>Taxislužby často uvádzajú dôraz na férové a prehľadné ceny; konkrétne sadzby, príplatky či paušálne ceny za jazdu na letisko si vždy vyžiadajte priamo u ${serviceName}.</li>
        </ul>
        ${phone ? `
        <h3 style="font-size: 1.25rem; font-weight: bold; margin: 1.5rem 0 1rem;">Ako objednať taxi v meste ${cityName}?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.6;">
          Taxislužbu ${serviceName} môžete podľa dostupných údajov kontaktovať telefonicky na čísle <strong>${phone}</strong>.
          Pri volaní odporúčame overiť si aktuálnu dostupnosť vozidiel, orientačnú
          cenu jazdy, prípadné príplatky (napríklad za batožinu alebo nočnú prevádzku) a odhadovaný
          čas pristavenia vozidla. Niektoré taxislužby môžu ponúkať aj online formulár alebo
          mobilnú aplikáciu na objednanie, dostupnosť týchto možností je však potrebné overiť
          priamo u poskytovateľa.
        </p>
        ` : ''}
        <p style="margin-bottom: 1rem; line-height: 1.6;">
          Táto stránka má za cieľ uľahčiť vám orientáciu v ponuke taxislužieb v meste ${cityName}
          tým, že na jednom mieste zobrazuje základné kontaktné informácie a doplnkové údaje o
          službách, ako sú oblasti pôsobenia či zameranie prepravy. Konečný výber taxislužby
          je však vždy na vás ako zákazníkovi. Pred objednaním odporúčame porovnať viac možností,
          overiť si podmienky priamo u poskytovateľa a riadiť sa vlastnou skúsenosťou.
        </p>
      </div>
    </noscript>
  `;

  // Vloží SEO content do <body> pred <div id="root">
  return html.replace(
    /<div id="root"><\/div>/,
    `${seoContent}\n    <div id="root"></div>`
  );
};

// Generovanie pre-renderovaných stránok
let generatedPages = 0;

// Získanie unikátnych regiónov
const regions = [...new Set(citiesData.cities.map(city => city.region))].sort();

console.log('🚀 Začínam pre-rendering stránok...\n');

// IMPORTANT: Save original base template before any modifications
const originalBaseHtml = baseHtml;

// Pre-render homepage
const homepageHtml = injectMetaTags(
  originalBaseHtml,
  'Taxi NearMe - Nájdite Taxi v Každom Meste na Slovensku',
  'Nájdite spoľahlivé taxislužby v každom meste na Slovensku. Bratislava, Košice, Prešov, Žilina a ďalších miest. Rýchlo, jednoducho a vždy nablízku.',
  `${baseUrl}/`,
  ['taxi', 'taxislužby', 'taxi slovensko', 'taxi bratislava', 'taxi košice', 'objednať taxi', 'taxi online']
);
writeFileSync(distIndexPath, homepageHtml, 'utf-8');
generatedPages++;
console.log(`✅ Homepage: ${baseUrl}/`);

// Pre-render stránky krajov
regions.forEach(region => {
  const regionSlug = createRegionSlug(region);
  const regionPath = join(__dirname, `../dist/kraj/${regionSlug}`);
  mkdirSync(regionPath, { recursive: true });

  const citiesCount = citiesData.cities.filter(c => c.region === region).length;
  const title = `Taxislužby v Kraji ${region} | Taxi NearMe`;
  const description = `Nájdite spoľahlivé taxislužby v kraji ${region}. Prehľad ${citiesCount} miest s dostupnými taxi službami. Rýchlo, jednoducho a vždy nablízku.`;
  const canonicalUrl = `${baseUrl}/kraj/${regionSlug}`;

  const regionHtml = injectMetaTags(originalBaseHtml, title, description, canonicalUrl);
  writeFileSync(join(regionPath, 'index.html'), regionHtml, 'utf-8');
  generatedPages++;
  console.log(`✅ Kraj: ${canonicalUrl}`);
});

// Pre-render stránky miest a taxislužieb
citiesData.cities.forEach(city => {
  // Stránka mesta
  const cityPath = join(__dirname, `../dist/taxi/${city.slug}`);
  mkdirSync(cityPath, { recursive: true });

  const cityTitle = `Taxi ${city.name} - Taxislužby v Meste ${city.name} | Taxi NearMe`;
  const cityDescription = city.metaDescription || `Nájdite spoľahlivé taxislužby v meste ${city.name}. Kompletný zoznam taxi služieb.`;
  const cityCanonicaUrl = `${baseUrl}/taxi/${city.slug}`;

  const cityHtml = injectMetaTags(
    originalBaseHtml,
    cityTitle,
    cityDescription,
    cityCanonicaUrl,
    city.keywords || []
  );
  writeFileSync(join(cityPath, 'index.html'), cityHtml, 'utf-8');
  generatedPages++;

  // Stránky jednotlivých taxislužieb
  if (city.taxiServices && city.taxiServices.length > 0) {
    city.taxiServices.forEach(service => {
      const serviceSlug = createServiceSlug(service.name);
      const servicePath = join(cityPath, serviceSlug);
      mkdirSync(servicePath, { recursive: true });

      const serviceTitle = `${service.name} - Taxi ${city.name} | Taxi NearMe`;
      const serviceDescription = `${service.name} - Spoľahlivá taxislužba v meste ${city.name}. ${service.phone ? `Telefonický kontakt: ${service.phone}.` : ''} Rýchla a pohodlná preprava osôb.`;
      const serviceCanonicalUrl = `${baseUrl}/taxi/${city.slug}/${serviceSlug}`;

      const serviceKeywords = [
        service.name,
        `taxi ${city.name}`,
        `taxislužba ${city.name}`,
        `${service.name} ${city.name}`,
        `taxi ${city.name} telefón`,
        `objednať taxi ${city.name}`
      ];

      let serviceHtml = injectMetaTags(
        originalBaseHtml,
        serviceTitle,
        serviceDescription,
        serviceCanonicalUrl,
        serviceKeywords
      );

      // Vloží SEO obsah pre taxi service stránky
      serviceHtml = injectTaxiServiceSEOContent(
        serviceHtml,
        service.name,
        city.name,
        city.region,
        service.phone
      );

      writeFileSync(join(servicePath, 'index.html'), serviceHtml, 'utf-8');
      generatedPages++;
    });
  }
});

console.log('\n✅ Pre-rendering dokončený!');
console.log(`📊 Celkový počet vygenerovaných stránok: ${generatedPages}`);
console.log(`   - Homepage: 1`);
console.log(`   - Kraje: ${regions.length}`);
console.log(`   - Mestá: ${citiesData.cities.length}`);
console.log(`   - Taxislužby: ${citiesData.cities.reduce((sum, city) => sum + (city.taxiServices?.length || 0), 0)}`);
console.log(`\n🎯 Všetky stránky majú teraz správne canonical tagy!`);
