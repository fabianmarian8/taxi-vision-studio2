#!/usr/bin/env npx ts-node

/**
 * Azet.sk Taxi Services Scraper
 *
 * This script scrapes taxi services from Azet.sk catalog and compares
 * them with existing data to find new/missing services.
 *
 * Usage:
 *   npx ts-node scripts/scrape-azet-taxi.ts [city-slug]
 *   npx ts-node scripts/scrape-azet-taxi.ts banska-bystrica
 *   npx ts-node scripts/scrape-azet-taxi.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AzetTaxiService {
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  description: string | null;
  azet_url: string;
  azet_id: string;
}

interface ExistingTaxiService {
  name: string;
  phone: string;
  website: string | null;
  isPremium?: boolean;
  isPromotional?: boolean;
}

interface City {
  name: string;
  slug: string;
  region: string;
  taxiServices: ExistingTaxiService[];
}

interface CitiesData {
  lastUpdated: string;
  cities: City[];
}

// Normalize phone number for comparison
function normalizePhone(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '').slice(-9); // Last 9 digits
}

// Simple fetch function using native https
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'sk,en-US;q=0.9,en;q=0.8'
      }
    }, (res: any) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }

      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Extract company links from search results
function extractCompanyLinks(html: string): { name: string; url: string }[] {
  const results: { name: string; url: string }[] = [];

  // Match: href="https://www.azet.sk/firma/ID/slug/">Name</a>
  const regex = /href="(https:\/\/www\.azet\.sk\/firma\/\d+\/[^"]+\/)"[^>]*>([^<]+)<\/a>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const name = match[2].trim();

    // Skip duplicates and non-relevant
    if (!results.some(r => r.url === url) && name && name.length > 1) {
      results.push({ name, url });
    }
  }

  return results;
}

// Extract details from company detail page
function extractCompanyDetails(html: string, url: string): AzetTaxiService | null {
  // Extract azet_id from URL
  const idMatch = url.match(/\/firma\/(\d+)\//);
  const azet_id = idMatch ? idMatch[1] : '';

  // Extract name from itemprop="name"
  const nameMatch = html.match(/itemprop="name"[^>]*>([^<]+)</);
  const name = nameMatch ? nameMatch[1].trim() : '';

  if (!name) return null;

  // Extract phone from tel: link
  const phoneMatch = html.match(/href="tel:([^"]+)"/);
  let phone = phoneMatch ? phoneMatch[1] : null;

  // Also try looking for phone in other formats
  if (!phone) {
    const phoneMatch2 = html.match(/(\+421|0)\s*\d{3}\s*\d{3}\s*\d{3}/);
    phone = phoneMatch2 ? phoneMatch2[0].replace(/\s/g, '') : null;
  }

  // Extract address
  const streetMatch = html.match(/itemprop="streetAddress">([^<]+)</);
  const postalMatch = html.match(/itemprop="postalCode">([^<]+)</);
  const localityMatch = html.match(/itemprop="addressLocality">([^<]+)</);

  const address = streetMatch ? streetMatch[1].trim() : null;
  const postalCode = postalMatch ? postalMatch[1].trim() : null;
  const city = localityMatch ? localityMatch[1].trim() : null;

  // Extract description
  const descMatch = html.match(/itemprop="description"[^>]*>([^<]+)</);
  const description = descMatch ? descMatch[1].trim() : null;

  return {
    name,
    phone,
    address,
    city,
    postalCode,
    description,
    azet_url: url,
    azet_id
  };
}

// Search taxi services on Azet.sk for a city
async function searchTaxiInCity(cityName: string, maxPages: number = 3): Promise<AzetTaxiService[]> {
  const results: AzetTaxiService[] = [];
  const seenIds = new Set<string>(); // Track by azet_id to prevent duplicates
  const searchQuery = encodeURIComponent('taxi');
  const cityQuery = encodeURIComponent(cityName);

  console.log(`\n🔍 Searching taxi services in ${cityName}...`);

  for (let page = 1; page <= maxPages; page++) {
    const pageParam = page > 1 ? `&p=${page}` : '';
    const url = `https://www.azet.sk/katalog/vyhladavanie/firmy/?q=${searchQuery}&k=${cityQuery}${pageParam}`;

    try {
      console.log(`  📄 Page ${page}...`);
      const html = await fetchUrl(url);

      const companies = extractCompanyLinks(html);

      if (companies.length === 0) {
        console.log(`  ℹ️  No more results on page ${page}`);
        break;
      }

      // Filter out already seen companies
      const newCompanies = companies.filter(c => {
        const idMatch = c.url.match(/\/firma\/(\d+)\//);
        if (idMatch && seenIds.has(idMatch[1])) return false;
        if (idMatch) seenIds.add(idMatch[1]);
        return true;
      });

      if (newCompanies.length === 0) {
        console.log(`  ℹ️  No new results on page ${page}, stopping`);
        break;
      }

      console.log(`  ✅ Found ${newCompanies.length} new companies on page ${page}`);

      // Get details for each company
      for (const company of newCompanies) {
        try {
          // Rate limiting - wait 500ms between requests
          await new Promise(resolve => setTimeout(resolve, 500));

          const detailHtml = await fetchUrl(company.url);
          const details = extractCompanyDetails(detailHtml, company.url);

          if (details && details.name.toLowerCase().includes('taxi')) {
            results.push(details);
            console.log(`    📍 ${details.name} - ${details.phone || 'no phone'}`);
          }
        } catch (error) {
          console.log(`    ⚠️  Failed to fetch ${company.name}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error on page ${page}: ${error}`);
      break;
    }
  }

  return results;
}

// Compare Azet results with existing data
function findNewServices(
  azetServices: AzetTaxiService[],
  existingServices: ExistingTaxiService[]
): AzetTaxiService[] {
  const existingPhones = new Set(
    existingServices.map(s => normalizePhone(s.phone))
  );

  const existingNames = new Set(
    existingServices.map(s => s.name.toLowerCase().trim())
  );

  return azetServices.filter(azet => {
    const normalizedPhone = normalizePhone(azet.phone);
    const normalizedName = azet.name.toLowerCase().trim();

    // Check if phone already exists
    if (normalizedPhone && existingPhones.has(normalizedPhone)) {
      return false;
    }

    // Check if name is very similar
    for (const existing of existingNames) {
      if (existing.includes(normalizedName) || normalizedName.includes(existing)) {
        return false;
      }
    }

    return true;
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  // Load existing cities data
  const citiesPath = path.join(__dirname, '../src/data/cities.json');
  const citiesData: CitiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

  let citiesToScrape: City[] = [];

  if (args.includes('--all')) {
    citiesToScrape = citiesData.cities;
  } else if (args.length > 0) {
    const slug = args[0];
    const city = citiesData.cities.find(c => c.slug === slug);
    if (city) {
      citiesToScrape = [city];
    } else {
      console.error(`❌ City not found: ${slug}`);
      console.log('Available cities:');
      citiesData.cities.forEach(c => console.log(`  - ${c.slug}`));
      process.exit(1);
    }
  } else {
    console.log('📋 Azet.sk Taxi Scraper');
    console.log('');
    console.log('Usage:');
    console.log('  npx ts-node scripts/scrape-azet-taxi.ts <city-slug>');
    console.log('  npx ts-node scripts/scrape-azet-taxi.ts --all');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node scripts/scrape-azet-taxi.ts banska-bystrica');
    console.log('  npx ts-node scripts/scrape-azet-taxi.ts bratislava');
    console.log('');
    console.log('Available cities:');
    citiesData.cities.slice(0, 10).forEach(c => console.log(`  - ${c.slug} (${c.name})`));
    console.log(`  ... and ${citiesData.cities.length - 10} more`);
    process.exit(0);
  }

  // Results collection
  const allNewServices: { city: City; newServices: AzetTaxiService[] }[] = [];

  // Scrape each city
  for (const city of citiesToScrape) {
    const azetServices = await searchTaxiInCity(city.name);
    const newServices = findNewServices(azetServices, city.taxiServices);

    if (newServices.length > 0) {
      allNewServices.push({ city, newServices });
      console.log(`\n🆕 Found ${newServices.length} NEW services in ${city.name}:`);
      newServices.forEach(s => {
        console.log(`   - ${s.name}`);
        console.log(`     Phone: ${s.phone || 'N/A'}`);
        console.log(`     City: ${s.city || 'N/A'}`);
        console.log(`     URL: ${s.azet_url}`);
      });
    } else {
      console.log(`\n✅ No new services found in ${city.name} (all already in database)`);
    }

    // Rate limiting between cities
    if (citiesToScrape.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY REPORT');
  console.log('='.repeat(60));

  if (allNewServices.length === 0) {
    console.log('\n✅ All taxi services are already in the database!');
  } else {
    let totalNew = 0;
    for (const { city, newServices } of allNewServices) {
      totalNew += newServices.length;
    }

    console.log(`\n🆕 Found ${totalNew} NEW taxi services across ${allNewServices.length} cities:\n`);

    // Output in format ready to add to cities.json
    const outputPath = path.join(__dirname, '../azet-import.json');
    const importData = allNewServices.map(({ city, newServices }) => ({
      citySlug: city.slug,
      cityName: city.name,
      newServices: newServices.map(s => ({
        name: s.name,
        phone: s.phone ? `+421${normalizePhone(s.phone)}` : null,
        website: null,
        source: 'azet.sk',
        azet_url: s.azet_url,
        address: s.address,
        description: s.description
      }))
    }));

    fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2));
    console.log(`📁 Import data saved to: ${outputPath}`);

    // Print preview
    for (const { city, newServices } of allNewServices) {
      console.log(`\n📍 ${city.name} (${city.slug}):`);
      newServices.forEach(s => {
        const phone = s.phone ? `+421${normalizePhone(s.phone)}` : 'N/A';
        console.log(`   - ${s.name} | ${phone}`);
      });
    }
  }
}

main().catch(console.error);
