/**
 * Script na pridanie partnera do Supabase databázy
 *
 * Použitie:
 * SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/add-partner-to-supabase.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkuybturazislquqaxci.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required');
  console.log('\nUsage: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/add-partner-to-supabase.cjs');
  console.log('\nGet the key from: https://supabase.com/dashboard/project/kkuybturazislquqaxci/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Partner data - R.S.T. Taxi
const partners = [
  {
    email: 'info@taxipodbrezova.sk',
    name: 'R.S.T. Taxi',
    slug: 'r-s-t-taxi',
    city_slug: 'brezno',
  },
  {
    email: 'info@taxipodbrezova.sk',
    name: 'R.S.T. Taxi',
    slug: 'r-s-t-taxi',
    city_slug: 'podbrezova',
  },
];

async function createPartnerWithUser(partnerData) {
  console.log(`\nProcessing: ${partnerData.name} (${partnerData.city_slug})`);

  // 1. Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let user = existingUsers?.users?.find(u => u.email === partnerData.email);

  if (!user) {
    // Create user with a temporary password (they will use magic link anyway)
    console.log(`  Creating user: ${partnerData.email}`);
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: partnerData.email,
      email_confirm: true, // Auto-confirm email
    });

    if (userError) {
      console.error(`  Error creating user: ${userError.message}`);
      return;
    }
    user = newUser.user;
    console.log(`  User created: ${user.id}`);
  } else {
    console.log(`  User exists: ${user.id}`);
  }

  // 2. Check if partner record exists
  const { data: existingPartner } = await supabase
    .from('partners')
    .select('id')
    .eq('slug', partnerData.slug)
    .eq('city_slug', partnerData.city_slug)
    .single();

  if (existingPartner) {
    console.log(`  Partner record already exists: ${existingPartner.id}`);
    return;
  }

  // 3. Create partner record
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .insert({
      user_id: user.id,
      email: partnerData.email,
      name: partnerData.name,
      slug: partnerData.slug,
      city_slug: partnerData.city_slug,
    })
    .select()
    .single();

  if (partnerError) {
    console.error(`  Error creating partner: ${partnerError.message}`);
    return;
  }

  console.log(`  Partner created: ${partner.id}`);

  // 4. Create initial draft with existing data
  const { error: draftError } = await supabase
    .from('partner_drafts')
    .insert({
      partner_id: partner.id,
      status: 'approved', // Mark as approved since it's existing data
      company_name: partnerData.name,
    });

  if (draftError) {
    console.error(`  Error creating draft: ${draftError.message}`);
    return;
  }

  console.log(`  Initial draft created`);
}

async function main() {
  console.log('='.repeat(50));
  console.log('Adding partners to Supabase');
  console.log('='.repeat(50));

  for (const partner of partners) {
    await createPartnerWithUser(partner);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Done!');
  console.log('='.repeat(50));
  console.log('\nPartner can now login at: /partner/login');
  console.log('Using email: info@taxipodbrezova.sk');
}

main().catch(console.error);
