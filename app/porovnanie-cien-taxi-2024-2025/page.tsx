/** Migrováno z: src/vite-pages/PriceComparisonPage.tsx */

import { Metadata } from "next";
import { PriceComparisonContent } from "@/components/PriceComparisonContent";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';

export const metadata: Metadata = {
  title: 'Index cen taxislužeb v Česku 2025 | TaxiNearMe.cz',
  description: 'Komplexní porovnání cen taxi v českých městech. Zjistěte, kde je nejlevnější a nejdražší cestovat taxíkem.',
  keywords: ['ceny taxi česko', 'porovnání cen taxi', 'nejlevnější taxi', 'taxi ceník', 'taxi průzkum 2025'],
  openGraph: {
    title: 'Index cen taxislužeb v Česku 2025',
    description: 'Komplexní porovnání cen taxi v českých městech. Zjistěte, kde je nejlevnější a nejdražší cestovat taxíkem.',
    url: 'https://www.taxinearme.cz/porovnanie-cien-taxi-2024-2025',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/index-cien.jpg',
      width: 1200,
      height: 630,
      alt: 'Index cen taxislužeb'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Index cen taxislužeb v Česku 2025',
    description: 'Komplexní porovnání cen taxi v českých městech. Zjistěte, kde je nejlevnější a nejdražší cestovat taxíkem.',
    images: ['https://www.taxinearme.cz/blog-images/index-cien.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/porovnanie-cien-taxi-2024-2025',
    languages: {
      'cs': 'https://www.taxinearme.cz/porovnanie-cien-taxi-2024-2025',
      'x-default': 'https://www.taxinearme.cz/porovnanie-cien-taxi-2024-2025',
    },
  }
};

export default function PriceComparisonPage() {
  return (
    <>
      <ArticleSchema
        title="Index cen taxislužeb v Česku 2025"
        description="Komplexní porovnání cen taxi v českých městech. Zjistěte, kde je nejlevnější a nejdražší cestovat taxíkem."
        url="https://www.taxinearme.cz/porovnanie-cien-taxi-2024-2025"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <PriceComparisonContent />
    </>
  );
}
