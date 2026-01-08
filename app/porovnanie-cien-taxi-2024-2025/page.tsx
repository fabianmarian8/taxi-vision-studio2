/** Migrované z: src/vite-pages/PriceComparisonPage.tsx */

import { Metadata } from "next";
import { PriceComparisonContent } from "@/components/PriceComparisonContent";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';

export const metadata: Metadata = {
  title: 'Index cien taxislužieb na Slovensku 2025 | TaxiNearMe.sk',
  description: 'Komplexné porovnanie cien taxi v slovenských mestách. Zistite, kde je najlacnejšie a najdrahšie cestovať taxíkom.',
  keywords: ['ceny taxi slovensko', 'porovnanie cien taxi', 'najlacnejšie taxi', 'taxi cenník', 'taxi prieskum 2025'],
  openGraph: {
    title: 'Index cien taxislužieb na Slovensku 2025',
    description: 'Komplexné porovnanie cien taxi v slovenských mestách. Zistite, kde je najlacnejšie a najdrahšie cestovať taxíkom.',
    url: 'https://www.taxinearme.sk/porovnanie-cien-taxi-2024-2025',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/index-cien.jpg',
      width: 1200,
      height: 630,
      alt: 'Index cien taxislužieb'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Index cien taxislužieb na Slovensku 2025',
    description: 'Komplexné porovnanie cien taxi v slovenských mestách. Zistite, kde je najlacnejšie a najdrahšie cestovať taxíkom.',
    images: ['https://www.taxinearme.sk/blog-images/index-cien.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/porovnanie-cien-taxi-2024-2025',
    languages: {
      'sk': 'https://www.taxinearme.sk/porovnanie-cien-taxi-2024-2025',
      'x-default': 'https://www.taxinearme.sk/porovnanie-cien-taxi-2024-2025',
    },
  }
};

export default function PriceComparisonPage() {
  return (
    <>
      <ArticleSchema
        title="Index cien taxislužieb na Slovensku 2025"
        description="Komplexné porovnanie cien taxi v slovenských mestách. Zistite, kde je najlacnejšie a najdrahšie cestovať taxíkom."
        url="https://www.taxinearme.sk/porovnanie-cien-taxi-2024-2025"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <PriceComparisonContent />
    </>
  );
}
