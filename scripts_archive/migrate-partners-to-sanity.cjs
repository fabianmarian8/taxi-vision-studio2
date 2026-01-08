/**
 * Migrácia existujúcich partnerov do Sanity CMS
 *
 * Spustenie:
 * SANITY_API_TOKEN=xxx node scripts/migrate-partners-to-sanity.cjs
 */

const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

// Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Načítaj cities.json
const citiesPath = path.join(__dirname, '../src/data/cities.json')
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'))

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function migratePartners() {
  console.log('=== MIGRÁCIA PARTNEROV DO SANITY ===\n')

  // Nájdi všetkých partnerov (okrem Fast Taxi Zvolen - to je vlastné)
  const partners = []

  for (const city of citiesData.cities) {
    for (const service of city.taxiServices) {
      if (service.isPartner && !service.name.includes('Fast Taxi Zvolen')) {
        partners.push({
          city,
          service,
        })
      }
    }
  }

  console.log(`Nájdených partnerov na migráciu: ${partners.length}\n`)

  for (const { city, service } of partners) {
    const partnerData = service.partnerData || {}

    const doc = {
      _type: 'partnerTaxiService',
      _id: `partner-${toSlug(service.name)}-${city.slug}`,

      // Základné info
      name: service.name,
      slug: { _type: 'slug', current: toSlug(service.name) },
      city: city.name,
      citySlug: city.slug,
      secondaryCity: partnerData.secondaryCity || null,

      // Kontakt
      phone: service.phone,
      phone2: service.phone2 || null,
      whatsapp: partnerData.whatsapp || null,
      website: service.website || null,
      address: service.address || null,

      // Popis
      description: service.description || partnerData.description || null,
      customCtaTitle: partnerData.customCtaTitle || null,

      // Služby
      services: partnerData.services || [],
      paymentMethods: partnerData.paymentMethods || [],
      workingHours: partnerData.workingHours || null,

      // Odkazy
      bookingUrl: partnerData.bookingUrl || null,
      pricelistUrl: partnerData.pricelistUrl || null,
      transportRulesUrl: partnerData.transportRulesUrl || null,
      contactUrl: partnerData.contactUrl || null,

      // Workflow - začíname ako schválené (existujúci partneri)
      status: 'approved',
      reviewNote: 'Migrované z pôvodného systému',
    }

    console.log(`Migrujem: ${service.name} (${city.name})`)
    console.log(`  ID: ${doc._id}`)

    try {
      // Vytvor alebo aktualizuj dokument
      await client.createOrReplace(doc)
      console.log(`  ✅ OK\n`)
    } catch (error) {
      console.log(`  ❌ CHYBA: ${error.message}\n`)
    }
  }

  console.log('=== MIGRÁCIA DOKONČENÁ ===')
  console.log('\nPOZNÁMKA: Obrázky (logo, heroImage, gallery) treba nahrať manuálne cez Sanity Studio')
  console.log('pretože vyžadujú upload do Sanity asset storage.')
}

// Kontrola env variables
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('CHYBA: Chýba NEXT_PUBLIC_SANITY_PROJECT_ID')
  console.error('Najprv vytvor projekt na sanity.io/manage')
  process.exit(1)
}

if (!process.env.SANITY_API_TOKEN) {
  console.error('CHYBA: Chýba SANITY_API_TOKEN')
  console.error('Vytvor token na sanity.io/manage -> API -> Tokens')
  process.exit(1)
}

migratePartners().catch(console.error)
