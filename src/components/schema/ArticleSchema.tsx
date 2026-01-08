/**
 * Article Schema Component (Server Component)
 *
 * Generates Schema.org Article/BlogPosting structured data for blog articles.
 * This helps Google understand the article content and improves
 * visibility in search results with rich snippets.
 *
 * E-E-A-T: Author je teraz Person s prepojením na /o-nas stránku
 */

import Script from 'next/script';
import { authorData } from '@/components/ArticleAuthor';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  imageUrl?: string;
}

export const ArticleSchema = ({
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  imageUrl = SEO_CONSTANTS.defaultImage,
}: ArticleSchemaProps) => {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    url: url,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: authorData.name,
      jobTitle: authorData.role,
      url: `${SEO_CONSTANTS.siteUrl}/o-nas`,
      image: `${SEO_CONSTANTS.siteUrl}${authorData.image}`,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONSTANTS.siteName,
      url: SEO_CONSTANTS.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONSTANTS.siteUrl}/taxi-nearme-logo.png`,
        width: 512,
        height: 512,
      },
    },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    inLanguage: SEO_CONSTANTS.language,
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleSchema),
      }}
    />
  );
};
