import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Type for Sanity image source
type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>['image']>[0]

// Sanity client pre čítanie dát
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production', // CDN pre produkciu
})

// Sanity client pre zápis (s tokenom)
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Write token (len server-side)
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// === QUERIES ===

// Získaj všetkých schválených partnerov
export const getAllApprovedPartnersQuery = `
  *[_type == "partnerTaxiService" && status == "approved"] {
    _id,
    name,
    "slug": slug.current,
    city,
    citySlug,
    secondaryCity,
    phone,
    phone2,
    whatsapp,
    website,
    address,
    "logo": logo.asset->url,
    "heroImage": heroImage.asset->url,
    "gallery": gallery[].asset->url,
    description,
    fullDescription,
    customCtaTitle,
    services,
    paymentMethods,
    workingHours,
    bookingUrl,
    pricelistUrl,
    transportRulesUrl,
    contactUrl
  }
`

// Získaj partnera podľa citySlug
export const getPartnerByCitySlugQuery = `
  *[_type == "partnerTaxiService" && citySlug == $citySlug && status == "approved"][0] {
    _id,
    name,
    "slug": slug.current,
    city,
    citySlug,
    secondaryCity,
    phone,
    phone2,
    whatsapp,
    website,
    address,
    "logo": logo.asset->url,
    "heroImage": heroImage.asset->url,
    "gallery": gallery[].asset->url,
    description,
    fullDescription,
    customCtaTitle,
    services,
    paymentMethods,
    workingHours,
    bookingUrl,
    pricelistUrl,
    transportRulesUrl,
    contactUrl
  }
`

// Získaj partnera podľa ID (pre admin)
export const getPartnerByIdQuery = `
  *[_type == "partnerTaxiService" && _id == $id][0] {
    _id,
    _rev,
    name,
    "slug": slug.current,
    city,
    citySlug,
    status,
    reviewNote,
    // ... všetky ostatné polia
  }
`

// Získaj partnerov čakajúcich na schválenie (pre admin)
export const getPendingPartnersQuery = `
  *[_type == "partnerTaxiService" && status == "pending"] | order(_updatedAt desc) {
    _id,
    name,
    city,
    status,
    _updatedAt
  }
`

// === HELPER FUNCTIONS ===

export async function getApprovedPartners() {
  return sanityClient.fetch(getAllApprovedPartnersQuery)
}

export async function getPartnerByCitySlug(citySlug: string) {
  return sanityClient.fetch(getPartnerByCitySlugQuery, { citySlug })
}

export async function getPendingPartners() {
  return sanityClient.fetch(getPendingPartnersQuery)
}

// Aktualizuj status partnera (admin only)
export async function updatePartnerStatus(
  id: string,
  status: 'draft' | 'pending' | 'approved' | 'rejected',
  reviewNote?: string
) {
  return sanityWriteClient
    .patch(id)
    .set({ status, reviewNote: reviewNote || '' })
    .commit()
}

// === TYPY ===

export interface SanityPartner {
  _id: string
  name: string
  slug: string
  city: string
  citySlug: string
  secondaryCity?: string
  phone: string
  phone2?: string
  whatsapp?: string
  website?: string
  address?: string
  logo?: string
  heroImage?: string
  gallery?: string[]
  description?: string
  fullDescription?: Array<{ _type: string; [key: string]: unknown }> // Portable Text
  customCtaTitle?: string
  services?: string[]
  paymentMethods?: string[]
  workingHours?: string
  bookingUrl?: string
  pricelistUrl?: string
  transportRulesUrl?: string
  contactUrl?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  reviewNote?: string
}
