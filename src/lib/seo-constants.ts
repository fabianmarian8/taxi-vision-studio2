/**
 * SEO Constants
 *
 * Centralized SEO configuration to ensure consistency across all pages
 */

export const SEO_CONSTANTS = {
  siteName: 'Taxi NearMe',
  siteUrl: 'https://www.taxinearme.cz',
  twitterSite: '@taxinearme',
  defaultImage: 'https://www.taxinearme.cz/og-image.png',
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
  locale: 'cs_CZ' as const,
  language: 'cs' as const,
  country: 'Česká republika' as const,
  countryCode: 'CZ' as const,
} as const;

/**
 * Helper to create consistent OpenGraph metadata
 */
export function createOpenGraphMetadata(options: {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article';
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
}) {
  return {
    title: options.title,
    description: options.description,
    type: options.type || 'website',
    locale: SEO_CONSTANTS.locale,
    url: options.url,
    siteName: SEO_CONSTANTS.siteName,
    images: [
      {
        url: options.image || SEO_CONSTANTS.defaultImage,
        width: SEO_CONSTANTS.defaultImageWidth,
        height: SEO_CONSTANTS.defaultImageHeight,
        alt: options.title,
      },
    ],
    ...(options.publishedTime && { publishedTime: options.publishedTime }),
    ...(options.modifiedTime && { modifiedTime: options.modifiedTime }),
  };
}

/**
 * Helper to create consistent Twitter Card metadata
 */
export function createTwitterMetadata(options: {
  title: string;
  description: string;
  image?: string;
}) {
  return {
    card: 'summary_large_image' as const,
    site: SEO_CONSTANTS.twitterSite,
    title: options.title,
    description: options.description,
    images: [options.image || SEO_CONSTANTS.defaultImage],
  };
}

/**
 * Helper to create canonical URL and language alternates
 */
export function createAlternates(url: string) {
  return {
    canonical: url,
    languages: {
      'cs': url,
      'x-default': url,
    },
  };
}
