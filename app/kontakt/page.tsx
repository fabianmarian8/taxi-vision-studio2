/**
 * Contact Page
 *
 * Migrované z: src/vite-pages/Contact.tsx
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import { FooterLegal } from '@/components/FooterLegal';
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const metadata: Metadata = {
  title: 'Kontakt | Taxi NearMe',
  description: 'Kontaktujte nás přes email info@taxinearme.cz',
  openGraph: {
    title: 'Kontakt | Taxi NearMe',
    description: 'Kontaktujte nás přes email info@taxinearme.cz',
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: `${SEO_CONSTANTS.siteUrl}/kontakt`,
    siteName: SEO_CONSTANTS.siteName,
    images: [
      {
        url: SEO_CONSTANTS.defaultImage,
        width: SEO_CONSTANTS.defaultImageWidth,
        height: SEO_CONSTANTS.defaultImageHeight,
        alt: 'Kontakt - Taxi NearMe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Kontakt | Taxi NearMe',
    description: 'Kontaktujte nás přes email info@taxinearme.cz',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/kontakt`,
    languages: {
      [SEO_CONSTANTS.language]: `${SEO_CONSTANTS.siteUrl}/kontakt`,
      'x-default': `${SEO_CONSTANTS.siteUrl}/kontakt`,
    },
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto max-w-4xl px-8 py-24">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na hlavní stránku
          </Button>
        </Link>

        <h1 className="text-5xl md:text-6xl font-black mb-12 text-foreground">Kontakt</h1>

        <div className="space-y-8">
          <div className="bg-card rounded-2xl p-8 md:p-12 border-2 border-foreground/10">
            <div className="flex items-start gap-6">
              <div className="bg-foreground text-background rounded-full p-4">
                <Mail className="h-8 w-8" />
              </div>

              <div className="flex-1 space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Kontaktujte nás</h2>
                <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
                  Pokud máte dotazy, podněty, stížnosti, požadavky na změnu nebo návrhy na
                  spolupráci, napište nám na
                </p>

                <a
                  href="mailto:info@taxinearme.cz"
                  className="inline-flex items-center text-2xl md:text-3xl font-bold text-foreground hover:text-foreground/70 transition-colors"
                >
                  info@taxinearme.cz
                </a>

                <p className="text-lg text-foreground/80 leading-relaxed pt-4 border-t border-foreground/10">
                  Odpovíme vám co nejdříve.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/">
          <Button className="mt-12" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na hlavní stránku
          </Button>
        </Link>
      </div>

      <FooterLegal />
    </div>
  );
}
