import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Car, ArrowLeft, Phone, HelpCircle, ExternalLink, Euro, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import routePagesData from '../../../src/data/route-pages.json';

interface CarrierData {
  name: string;
  website: string;
  phone?: string;
  description: string;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewsCount?: number;
}

interface RouteData {
  slug: string;
  origin: string;
  destination: string;
  distance_km: string;
  duration_min: string;
  meta: {
    title: string;
    description: string;
  };
  h1: string;
  keywords: string[];
  content: string;
  carriersIntro?: string;
  carriers?: CarrierData[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

const getRouteBySlug = (slug: string): RouteData | undefined => {
  return (routePagesData.routes as RouteData[]).find(route => route.slug === slug);
};

export async function generateStaticParams() {
  return (routePagesData.routes as RouteData[]).map((route) => ({
    slug: route.slug,
  }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    return {
      title: 'Trasa nenájdená | TaxiNearMe.sk',
    };
  }

  return {
    title: route.meta.title,
    description: route.meta.description,
    keywords: route.keywords,
    openGraph: {
      title: route.meta.title,
      description: route.meta.description,
      type: 'website',
      locale: 'sk_SK',
      siteName: 'TaxiNearMe.sk',
      url: `https://www.taxinearme.sk/trasa/${route.slug}`,
      images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONSTANTS.twitterSite,
      title: route.meta.title,
      description: route.meta.description,
      images: [SEO_CONSTANTS.defaultImage],
    },
    alternates: {
      canonical: `https://www.taxinearme.sk/trasa/${route.slug}`,
    },
  };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    notFound();
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAction',
    name: route.h1,
    description: route.meta.description,
    fromLocation: {
      '@type': 'Place',
      name: route.origin,
      address: {
        '@type': 'PostalAddress',
        addressLocality: route.origin,
        addressCountry: route.origin.includes('Vieden') ? 'AT' : 'SK',
      },
    },
    toLocation: {
      '@type': 'Place',
      name: route.destination,
      address: {
        '@type': 'PostalAddress',
        addressLocality: route.destination.split(' ')[0],
        addressCountry: route.destination.includes('Vieden') || route.destination.includes('Wien') || route.destination.includes('Schwechat') ? 'AT' : 'SK',
      },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: route.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  // Split content into paragraphs
  const paragraphs = route.content.split('\n\n').filter(p => p.trim());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-yellow/20 via-white to-white py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4 md:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Späť na hlavnú stránku
            </Link>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-6">
              {route.h1}
            </h1>

            {/* Route Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-yellow/20">
                    <MapPin className="h-5 w-5 text-primary-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Vzdialenosť</p>
                    <p className="font-bold text-foreground">{route.distance_km} km</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-yellow/20">
                    <Clock className="h-5 w-5 text-primary-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Čas cesty</p>
                    <p className="font-bold text-foreground">{route.duration_min} min</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur col-span-2 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-yellow/20">
                    <Car className="h-5 w-5 text-primary-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Trasa</p>
                    <p className="font-bold text-foreground text-sm">{route.origin} → {route.destination.split(' ')[0]}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <article className="prose prose-lg max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-foreground/80 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </article>
          </div>
        </section>

        {/* Carriers Section */}
        {route.carriers && route.carriers.length > 0 && (
          <section className="py-12 md:py-16 px-4 md:px-8 bg-foreground/5">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4 flex items-center gap-3">
                <Euro className="h-8 w-8 text-primary-yellow" />
                Prepravcovia na tejto trase
              </h2>
              {route.carriersIntro && (
                <p className="text-foreground/70 mb-8">{route.carriersIntro}</p>
              )}

              <div className="grid gap-4">
                {route.carriers.map((carrier, index) => (
                  <Card key={index} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg mb-1">{carrier.name}</h3>
                        <p className="text-foreground/70 text-sm mb-2">{carrier.description}</p>
                        {carrier.googleRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-foreground">{carrier.googleRating.toFixed(1)}</span>
                            <span className="text-foreground/60 text-sm">
                              ({carrier.googleReviewsCount} {carrier.googleReviewsCount === 1 ? 'recenzia' : carrier.googleReviewsCount && carrier.googleReviewsCount < 5 ? 'recenzie' : 'recenzií'})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {carrier.phone && (
                          <a
                            href={`tel:${carrier.phone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                          >
                            <Phone className="h-4 w-4" />
                            Zavolať
                          </a>
                        )}
                        <a
                          href={carrier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-yellow text-foreground font-semibold rounded-lg hover:bg-primary-yellow/90 transition-colors text-sm whitespace-nowrap"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Web
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 md:py-16 px-4 md:px-8 bg-primary-yellow/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
              Hľadáte taxi na túto trasu?
            </h2>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Nájdite taxislužby v meste {route.origin} a okolí. Porovnajte ponuky a objednajte si odvoz.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/taxi/${route.origin.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-yellow text-foreground font-bold rounded-lg hover:bg-primary-yellow/90 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Taxi {route.origin}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white font-bold rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Všetky mestá
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {route.faq && route.faq.length > 0 && (
          <section className="py-12 md:py-16 px-4 md:px-8">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8 flex items-center gap-3">
                <HelpCircle className="h-8 w-8 text-primary-yellow" />
                Časté otázky
              </h2>

              <div className="space-y-4">
                {route.faq.map((item, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="font-bold text-foreground mb-3">{item.question}</h3>
                    <p className="text-foreground/70">{item.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <section className="py-8 px-4 md:px-8 bg-foreground/5">
          <div className="container mx-auto max-w-4xl">
            <p className="text-sm text-foreground/50 text-center">
              {routePagesData.disclaimer}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
