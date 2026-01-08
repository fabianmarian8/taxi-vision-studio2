/**
 * Migrate cities.json to Supabase
 *
 * This script reads data from src/data/cities.json and imports it into
 * Supabase cities and taxi_services tables.
 *
 * Usage:
 *   node scripts/migrate-cities-to-supabase.cjs
 *
 * Environment:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (not anon key!)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local contains these variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function loadCitiesJson() {
  const citiesPath = path.join(__dirname, '..', 'src', 'data', 'cities.json');
  const data = fs.readFileSync(citiesPath, 'utf-8');
  return JSON.parse(data);
}

async function clearExistingData() {
  console.log('Clearing existing data...');

  // Delete taxi_services first (foreign key constraint)
  const { error: tsError } = await supabase
    .from('taxi_services')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (tsError) {
    console.error('Error clearing taxi_services:', tsError);
  }

  // Delete cities
  const { error: citiesError } = await supabase
    .from('cities')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (citiesError) {
    console.error('Error clearing cities:', citiesError);
  }

  console.log('Cleared existing data');
}

async function migrateCity(cityData) {
  // Insert city
  const { data: city, error: cityError } = await supabase
    .from('cities')
    .insert({
      name: cityData.name,
      slug: cityData.slug,
      region: cityData.region,
      description: cityData.description || null,
      meta_description: cityData.metaDescription || null,
      keywords: cityData.keywords || [],
      latitude: cityData.latitude || null,
      longitude: cityData.longitude || null,
      hero_image: cityData.heroImage || null,
    })
    .select()
    .single();

  if (cityError) {
    console.error(`Error inserting city ${cityData.name}:`, cityError);
    return null;
  }

  // Insert taxi services
  if (cityData.taxiServices && cityData.taxiServices.length > 0) {
    const taxiServicesData = cityData.taxiServices.map((ts, index) => ({
      city_id: city.id,
      city_slug: cityData.slug,
      name: ts.name,
      phone: ts.phone || null,
      website: ts.website || null,
      address: ts.address || null,
      place_id: ts.placeId || null,
      is_premium: ts.isPremium || false,
      is_promotional: ts.isPromotional || false,
      premium_expires_at: ts.premiumExpiresAt || null,
      display_order: index,
    }));

    const { error: tsError } = await supabase
      .from('taxi_services')
      .insert(taxiServicesData);

    if (tsError) {
      console.error(`Error inserting taxi services for ${cityData.name}:`, tsError);
    }
  }

  return city;
}

async function main() {
  console.log('Starting migration...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  // Load cities data
  const { cities } = await loadCitiesJson();
  console.log(`Loaded ${cities.length} cities from cities.json`);

  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirmed = await new Promise((resolve) => {
    rl.question(
      `This will clear existing data and import ${cities.length} cities. Continue? (yes/no): `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });

  if (!confirmed) {
    console.log('Migration cancelled');
    process.exit(0);
  }

  // Clear existing data
  await clearExistingData();

  // Migrate cities in batches
  const BATCH_SIZE = 10;
  let successCount = 0;
  let errorCount = 0;
  let taxiServicesCount = 0;

  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);

    for (const cityData of batch) {
      const result = await migrateCity(cityData);
      if (result) {
        successCount++;
        taxiServicesCount += cityData.taxiServices?.length || 0;
      } else {
        errorCount++;
      }
    }

    // Progress update
    const progress = Math.round(((i + batch.length) / cities.length) * 100);
    process.stdout.write(`\rProgress: ${progress}% (${i + batch.length}/${cities.length})`);
  }

  console.log('\n\nMigration complete!');
  console.log(`Cities migrated: ${successCount}`);
  console.log(`Taxi services migrated: ${taxiServicesCount}`);
  console.log(`Errors: ${errorCount}`);

  // Verify counts
  const { count: citiesCount } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true });

  const { count: tsCount } = await supabase
    .from('taxi_services')
    .select('*', { count: 'exact', head: true });

  console.log('\nVerification:');
  console.log(`Cities in database: ${citiesCount}`);
  console.log(`Taxi services in database: ${tsCount}`);
}

main().catch(console.error);
