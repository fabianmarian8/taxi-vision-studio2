/**
 * Script na získanie adries taxislužieb z Google Places API
 *
 * Použitie: GOOGLE_API_KEY=xxx npx ts-node scripts/fetch-taxi-addresses.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDeOUUCHV1blii6PBqJzOLYUF8Y2dqul9g';
const CITIES_JSON_PATH = path.join(__dirname, '../src/data/cities.json');

interface TaxiService {
  name: string;
  phone: string;
  website: string | null;
  isPremium?: boolean;
  isPromotional?: boolean;
  premiumExpiresAt?: string;
  address?: string;
  placeId?: string;
}

interface City {
  name: string;
  slug: string;
  region: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  taxiServices: TaxiService[];
  latitude: number;
  longitude: number;
  heroImage?: string;
}

interface CitiesData {
  lastUpdated: string;
  cities: City[];
}

// Delay function to respect API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Search for a place using Google Places API (New)
async function searchPlace(query: string, cityName: string): Promise<{ address: string; placeId: string } | null> {
  const searchQuery = `${query} taxi ${cityName} Slovakia`;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress'
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          languageCode: 'sk',
          regionCode: 'SK',
          maxResultCount: 1
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error for "${query}": ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();

    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      return {
        address: place.shortFormattedAddress || place.formattedAddress || '',
        placeId: place.id || ''
      };
    }

    return null;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return null;
  }
}

// Alternative: Search by phone number
async function searchByPhone(phone: string): Promise<{ address: string; placeId: string } | null> {
  // Clean phone number
  const cleanPhone = phone.replace(/\s+/g, '').replace('+421', '0');

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.nationalPhoneNumber'
        },
        body: JSON.stringify({
          textQuery: `taxi ${cleanPhone}`,
          languageCode: 'sk',
          regionCode: 'SK',
          maxResultCount: 3
        })
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.places && data.places.length > 0) {
      // Try to find exact phone match
      for (const place of data.places) {
        if (place.nationalPhoneNumber && place.nationalPhoneNumber.replace(/\s+/g, '') === cleanPhone) {
          return {
            address: place.shortFormattedAddress || place.formattedAddress || '',
            placeId: place.id || ''
          };
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('Načítavam cities.json...');

  const citiesData: CitiesData = JSON.parse(fs.readFileSync(CITIES_JSON_PATH, 'utf-8'));

  let totalServices = 0;
  let foundAddresses = 0;
  let skippedWithAddress = 0;

  // Count total services
  for (const city of citiesData.cities) {
    totalServices += city.taxiServices.length;
  }

  console.log(`Celkový počet taxislužieb: ${totalServices}`);
  console.log('Začínam vyhľadávanie adries...\n');

  for (const city of citiesData.cities) {
    console.log(`\n📍 ${city.name} (${city.taxiServices.length} taxislužieb)`);

    for (const service of city.taxiServices) {
      // Skip if already has address
      if (service.address) {
        console.log(`  ✓ ${service.name} - už má adresu: ${service.address}`);
        skippedWithAddress++;
        continue;
      }

      // Try to find by name first
      let result = await searchPlace(service.name, city.name);

      // If not found, try by phone
      if (!result && service.phone) {
        result = await searchByPhone(service.phone);
      }

      if (result && result.address) {
        service.address = result.address;
        service.placeId = result.placeId;
        foundAddresses++;
        console.log(`  ✅ ${service.name}: ${result.address}`);
      } else {
        console.log(`  ❌ ${service.name}: adresa nenájdená`);
      }

      // Respect rate limits - 100ms between requests
      await delay(100);
    }
  }

  // Update lastUpdated
  citiesData.lastUpdated = new Date().toISOString();

  // Save updated data
  console.log('\n\nUkladám aktualizované dáta...');
  fs.writeFileSync(CITIES_JSON_PATH, JSON.stringify(citiesData, null, 2));

  console.log('\n📊 Štatistiky:');
  console.log(`  Celkový počet taxislužieb: ${totalServices}`);
  console.log(`  Preskočené (už mali adresu): ${skippedWithAddress}`);
  console.log(`  Nájdené adresy: ${foundAddresses}`);
  console.log(`  Nenájdené: ${totalServices - skippedWithAddress - foundAddresses}`);
  console.log('\n✅ Hotovo!');
}

main().catch(console.error);
