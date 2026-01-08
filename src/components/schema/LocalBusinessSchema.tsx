/**
 * LocalBusiness Schema Component (Server Component)
 *
 * Generates Schema.org LocalBusiness structured data for city pages.
 * This helps Google understand the local business context and improves
 * visibility in local search results and Google Maps.
 *
 * Schema types used:
 * - LocalBusiness: Main business entity
 * - PostalAddress: City address information
 * - GeoCoordinates: GPS coordinates for map placement
 * - OfferCatalog: List of taxi services available in the city
 */

import Script from 'next/script';
import type { CityData } from '@/data/cities';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

interface LocalBusinessSchemaProps {
  city: CityData;
}

export const LocalBusinessSchema = ({ city }: LocalBusinessSchemaProps) => {
  const baseUrl = SEO_CONSTANTS.siteUrl;

  // Calculate price range based on taxi services (if available)
  const priceRange = '€€'; // Default to medium price range

  // Build LocalBusiness schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/taxi/${city.slug}#localbusiness`,
    name: `Taxislužby ${city.name}`,
    description: city.metaDescription || `Kompletný zoznam taxislužieb v meste ${city.name}. Nájdite spoľahlivé taxi s kontaktmi a cenami.`,
    url: `${baseUrl}/taxi/${city.slug}`,

    // Address information
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: SEO_CONSTANTS.countryCode,
    },

    // GPS coordinates (if available)
    ...(city.latitude && city.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.latitude,
        longitude: city.longitude,
      },
    }),

    // Price range
    priceRange,

    // Service area
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'Country',
        name: SEO_CONSTANTS.country,
      },
    },

    // Offer catalog - list of taxi services
    ...(city.taxiServices && city.taxiServices.length > 0 && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Taxi služby',
        itemListElement: city.taxiServices.map((service, index) => ({
          '@type': 'Offer',
          position: index + 1,
          itemOffered: {
            '@type': 'Service',
            name: service.name,
            provider: {
              '@type': 'LocalBusiness',
              name: service.name,
              ...(service.phone && { telephone: service.phone }),
              ...(service.website && { url: service.website }),
            },
          },
        })),
      },
    }),

    // Aggregate rating (if you have ratings in the future)
    // aggregateRating: {
    //   '@type': 'AggregateRating',
    //   ratingValue: '4.5',
    //   reviewCount: '100',
    // },
  };

  return (
    <Script
      id={`local-business-${city.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema),
      }}
    />
  );
};
