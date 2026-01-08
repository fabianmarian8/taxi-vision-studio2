/**
 * Root Layout - Next.js App Router
 *
 * Tento layout je Server COMPONENT (default) a aplikuje sa na všetky stránky.
 * Obsahuje:
 * - Metadata (SEO, Open Graph, favicons) - migrované z index.html
 * - Google Analytics + Consent Mode v2 - migrované z index.html <head>
 * - Google Fonts (Inter only) - optimalizované cez next/font (1 font = 200ms úspora)
 * - Global Providers (QueryClient, Tooltip) - Client Component wrapper
 * - Cookie Banner - GDPR compliance
 */

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Providers } from '@/components/providers';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { CookieBanner } from '@/components/cookie-banner';
import { GlobalChatWidget } from '@/components/GlobalChatWidget';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

// Optimalizovaný Inter font cez next/font/google
// LCP Optimalizácia: Redukovaný z 3 fontov na 1 (úspora ~200ms render-blocking)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata API - SEO optimalizace
export const metadata: Metadata = {
  title: 'Taxi NearMe - Najděte Taxi v Každém Městě v Česku',
  description:
    'Najděte spolehlivé taxislužby v každém městě v České republice. Praha, Brno, Ostrava, Plzeň a dalších 600+ měst. Rychle, jednoduše a vždy nablízku.',
  keywords: [
    'taxi',
    'taxislužby',
    'taxi česko',
    'taxi praha',
    'taxi brno',
    'objednat taxi',
    'taxi online',
  ],
  authors: [{ name: 'Taxi NearMe' }],
  manifest: '/site.webmanifest',

  // Favicons a ikony
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },

  // Open Graph metadata
  openGraph: {
    title: 'Taxi NearMe - Taxi v Každém Městě v Česku',
    description: 'Najděte spolehlivé taxislužby v každém městě v České republice. Kompletní seznam taxi služeb.',
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://www.taxinearme.cz',
    siteName: 'TaxiNearMe.cz',
    images: [
      {
        url: 'https://www.taxinearme.cz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Taxi NearMe - Najděte taxi v každém městě v Česku',
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Taxi NearMe - Taxi v Každém Městě v Česku',
    description: 'Najděte spolehlivé taxislužby v každém městě v České republice.',
    images: ['https://www.taxinearme.cz/og-image.png'],
  },

  // Ostatní meta tagy
  other: {
    'google-site-verification': '', // TODO: Přidat nové Google verification
  },

  // Hreflang a canonical URL pro SEO
  alternates: {
    canonical: 'https://www.taxinearme.cz',
    languages: {
      'cs': 'https://www.taxinearme.cz',
      'x-default': 'https://www.taxinearme.cz',
    },
  },
};

// Viewport konfigurácia
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffd700', // Taxi yellow
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preconnect pre externe domény - zrýchľuje načítanie */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://nominatim.openstreetmap.org" />

        {/* LCP Optimalizácia: Preload hero image - znižuje LCP o ~200-400ms */}
        <link
          rel="preload"
          as="image"
          href="/taxi-nearme-logo.webp"
          type="image/webp"
          fetchPriority="high"
        />

        {/* Sitemap link (z index.html line 43) */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />

        {/* Schema.org Organization and WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://www.taxinearme.cz/#organization',
                  name: 'Taxi NearMe',
                  url: 'https://www.taxinearme.cz',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://www.taxinearme.cz/taxi-nearme-logo.png',
                    width: 512,
                    height: 512,
                  },
                  description: 'Kompletní katalog taxislužeb v České republice',
                  address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'CZ',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.taxinearme.cz/#website',
                  url: 'https://www.taxinearme.cz',
                  name: 'Taxi NearMe',
                  description: 'Najděte spolehlivé taxislužby v každém městě v České republice',
                  publisher: {
                    '@id': 'https://www.taxinearme.cz/#organization',
                  },
                  inLanguage: 'cs',
                },
              ],
            }),
          }}
        />

        {/*
          Google Analytics (gtag.js) s Consent Mode v2
          - Načíta sa po hydratácii (afterInteractive)
          - Consent nastavený na granted pre analytics
          - Všetka inicializácia v jednom skripte
        */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XM0ES676GB"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Consent Mode v2 - analytics povolené vždy
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'granted',
              'functionality_storage': 'granted',
              'personalization_storage': 'denied',
              'security_storage': 'granted'
            });

            // Inicializácia GA4
            gtag('js', new Date());
            gtag('config', 'G-XM0ES676GB', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </Script>

        {/*
          Microsoft Clarity
          Tracking script - načíta sa až keď je stránka hotová (lazyOnload pre lepší performance na mobile)
        */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "u5uwq9jn6t");
          `}
        </Script>
      </head>

      <body className="font-sans antialiased" suppressHydrationWarning>
        {/*
          Google Analytics - Route change tracking pre Next.js App Router
        */}
        <GoogleAnalytics />

        {/*
          Providers wrapper - Client Component
          Obsahuje: QueryClient, TooltipProvider, Toasters, Cookie Consent logic
        */}
        <Providers>
          {children}
        </Providers>

        {/*
          Vercel Speed Insights - Performance monitoring
          Tracks web vitals and reports to Vercel
        */}
        <SpeedInsights />

        {/*
          Cookie Banner - GDPR Compliance
          Globálny komponent, zobrazuje sa na všetkých stránkach
        */}
        <CookieBanner />

        {/*
          Global Chat Widget - Podpora pre prihlásených partnerov
          Zobrazuje sa na všetkých stránkach ak je používateľ prihlásený
        */}
        <GlobalChatWidget />
      </body>
    </html>
  );
}
