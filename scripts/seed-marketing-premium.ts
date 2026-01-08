import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env.local for local development
dotenv.config({ path: '.env.local' });

/**
 * FOMO Marketing Script - Supabase Version
 *
 * Tento script prideluje "fake" Premium status jednej taxisluzbe v kazdom meste,
 * aby vytvoril FOMO (Fear Of Missing Out) efekt pre ostatne taxisluzby.
 *
 * Ked taxisluzba uvidi, ze konkurencia ma "zlaty odznak", bude ho chciet tiez.
 *
 * DÔLEŽITÉ:
 * - Používa flag `is_promotional = true` na odlíšenie od platiacich zákazníkov
 * - Preskakuje mestá kde už je platiaci Premium (is_promotional = false)
 * - Preskakuje mestá s len 1 taxislužbou (žiadna konkurencia)
 * - Spúšťa sa automaticky každý týždeň cez GitHub Actions
 *
 * Na vypnutie: Jednoducho zastav GitHub Action alebo vymaž všetky is_promotional=true
 */

// Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mestá ktoré sa preskakujú (majú permanentné nastavenie)
const EXCLUDED_CITIES = ['zvolen'];

interface TaxiService {
  id: string;
  city_slug: string;
  name: string;
  is_premium: boolean;
  is_promotional: boolean;
  subscription_id: string | null;
}

interface CityGroup {
  slug: string;
  services: TaxiService[];
}

async function seedPremiumTaxis() {
  console.log('='.repeat(60));
  console.log('FOMO Marketing Script - Supabase Version');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('');

  // Štatistiky
  let totalUpgraded = 0;
  let citiesWithTaxis = 0;
  let citiesWithPaidPremium = 0;
  let citiesSkippedOnlyOne = 0;
  let citiesSkippedExcluded = 0;
  let promotionalReset = 0;

  // Expiračný dátum - 1 týždeň od dnes
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  const premiumExpiresAt = expirationDate.toISOString();

  try {
    // 1. Načítaj všetky taxi služby
    const { data: allServices, error: fetchError } = await supabase
      .from('taxi_services')
      .select('id, city_slug, name, is_premium, is_promotional, subscription_id')
      .order('city_slug');

    if (fetchError) {
      console.error('Error fetching taxi services:', fetchError.message);
      process.exit(1);
    }

    if (!allServices || allServices.length === 0) {
      console.log('No taxi services found in database.');
      process.exit(0);
    }

    console.log(`Načítaných ${allServices.length} taxi služieb`);
    console.log('');

    // 2. Zoskup podľa mesta
    const citiesMap = new Map<string, TaxiService[]>();
    for (const service of allServices) {
      const existing = citiesMap.get(service.city_slug) || [];
      existing.push(service);
      citiesMap.set(service.city_slug, existing);
    }

    const cities: CityGroup[] = Array.from(citiesMap.entries()).map(([slug, services]) => ({
      slug,
      services
    }));

    console.log(`Celkom ${cities.length} miest s taxi službami`);
    console.log('');

    // 3. Spracuj každé mesto
    for (const city of cities) {
      citiesWithTaxis++;

      // Skip: len 1 taxislužba (žiadna konkurencia)
      if (city.services.length === 1) {
        citiesSkippedOnlyOne++;
        continue;
      }

      // Skip: vylúčené mesto
      if (EXCLUDED_CITIES.includes(city.slug)) {
        citiesSkippedExcluded++;
        console.log(`[SKIP] ${city.slug} - vylúčené mesto`);
        continue;
      }

      // Skip: už má platiaceho Premium (nie promotional)
      const hasPaidPremium = city.services.some(
        s => s.is_premium && !s.is_promotional && s.subscription_id !== null
      );

      if (hasPaidPremium) {
        citiesWithPaidPremium++;
        console.log(`[SKIP] ${city.slug} - má platiaceho Premium zákazníka`);
        continue;
      }

      // Reset existujúcich promotional premium v tomto meste
      const promotionalServices = city.services.filter(s => s.is_promotional);
      if (promotionalServices.length > 0) {
        const { error: resetError } = await supabase
          .from('taxi_services')
          .update({
            is_premium: false,
            is_promotional: false,
            premium_expires_at: null
          })
          .eq('city_slug', city.slug)
          .eq('is_promotional', true);

        if (resetError) {
          console.error(`Error resetting promotional in ${city.slug}:`, resetError.message);
        } else {
          promotionalReset += promotionalServices.length;
        }
      }

      // Vyber náhodného víťaza z nepremium služieb
      const eligibleServices = city.services.filter(s => !s.is_premium || s.is_promotional);

      if (eligibleServices.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleServices.length);
        const winner = eligibleServices[randomIndex];

        const { error: updateError } = await supabase
          .from('taxi_services')
          .update({
            is_premium: true,
            is_promotional: true,
            premium_expires_at: premiumExpiresAt
          })
          .eq('id', winner.id);

        if (updateError) {
          console.error(`Error updating ${winner.name} in ${city.slug}:`, updateError.message);
        } else {
          console.log(`[PREMIUM] ${city.slug}: "${winner.name}"`);
          totalUpgraded++;
        }
      }
    }

    // Sumár
    console.log('');
    console.log('='.repeat(60));
    console.log('SUMÁR');
    console.log('='.repeat(60));
    console.log(`Celkovo miest s taxi:            ${citiesWithTaxis}`);
    console.log(`Miest s len 1 taxislužbou:       ${citiesSkippedOnlyOne}`);
    console.log(`Vylúčených miest:                ${citiesSkippedExcluded}`);
    console.log(`Miest s plateným Premium:        ${citiesWithPaidPremium}`);
    console.log(`Resetovaných promotional:        ${promotionalReset}`);
    console.log(`Nových promo PREMIUM:            ${totalUpgraded}`);
    console.log('');
    console.log(`Premium expiruje: ${premiumExpiresAt}`);
    console.log('');
    console.log('FOMO efekt aktivovaný!');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

seedPremiumTaxis();
