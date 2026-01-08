/**
 * TaxiService Schema Component (Server Component)
 *
 * Generates Schema.org TaxiService structured data for individual taxi service pages.
 * This helps Google understand the specific taxi service and improves visibility
 * in local search results, Google Maps, and "near me" searches.
 *
 * Schema types used:
 * - TaxiService: Specific type for taxi businesses
 * - PostalAddress: Service address information
 * - GeoCoordinates: GPS coordinates for map placement
 */

import Script from 'next/script';
import type { CityData, TaxiService } from '@/data/cities';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

interface TaxiServiceSchemaProps {
  service: TaxiService;
  city: CityData;
  citySlug: string;
  serviceSlug: string;
}

export const TaxiServiceSchema = ({ service, city, citySlug, serviceSlug }: TaxiServiceSchemaProps) => {
  const baseUrl = SEO_CONSTANTS.siteUrl;
  const serviceUrl = `${baseUrl}/taxi/${citySlug}/${serviceSlug}`;

  // Parse street address from the service address if available
  const parseAddress = (fullAddress: string | undefined) => {
    if (!fullAddress) return null;
    // Address format: "Street Name 123, City"
    const parts = fullAddress.split(',');
    if (parts.length >= 1) {
      return {
        streetAddress: parts[0].trim(),
        // Try to extract postal code from the address (5 digits)
        postalCode: fullAddress.match(/\d{5}/)?.[0] || undefined,
      };
    }
    return null;
  };

  const parsedAddress = parseAddress(service.address);

  // Build TaxiService schema
  const taxiServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    '@id': `${serviceUrl}#taxiservice`,
    name: service.name,
    url: serviceUrl,

    // Service area
    areaServed: {
      '@type': 'City',
      name: city.name,
    },

    // Address information - use real address if available
    address: {
      '@type': 'PostalAddress',
      ...(parsedAddress?.streetAddress && { streetAddress: parsedAddress.streetAddress }),
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: SEO_CONSTANTS.countryCode,
      ...(parsedAddress?.postalCode && { postalCode: parsedAddress.postalCode }),
    },

    // GPS coordinates (if available - using city's coordinates)
    ...(city.latitude && city.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.latitude,
        longitude: city.longitude,
      },
    }),

    // Contact information
    ...(service.phone && { telephone: service.phone }),

    // Website
    ...(service.website && { sameAs: service.website }),

    // Price range (generic estimate for taxi services in Czech Republic)
    priceRange: '€€',

    // Service provider info
    provider: {
      '@type': 'LocalBusiness',
      name: service.name,
      ...(service.phone && { telephone: service.phone }),
      ...(service.website && { url: service.website }),
    },

    // Additional metadata
    ...(service.isPremium && {
      additionalType: 'PremiumTaxiService',
    }),

    // Aggregate rating (if you have ratings in the future)
    // aggregateRating: {
    //   '@type': 'AggregateRating',
    //   ratingValue: '4.5',
    //   reviewCount: '50',
    // },
  };

  return (
    <Script
      id={`taxi-service-${citySlug}-${serviceSlug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(taxiServiceSchema),
      }}
    />
  );
};
