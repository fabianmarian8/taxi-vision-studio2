/**
 * Run SQL migration on Supabase PostgreSQL
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.kkuybturazislquqaxci:AKKXxVb9XIgXuFet@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251224_add_cities_taxi_services.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');

    // Verify tables exist
    const citiesResult = await client.query("SELECT COUNT(*) FROM cities");
    const taxiResult = await client.query("SELECT COUNT(*) FROM taxi_services");

    console.log(`\nVerification:`);
    console.log(`- cities table: ${citiesResult.rows[0].count} rows`);
    console.log(`- taxi_services table: ${taxiResult.rows[0].count} rows`);

  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
