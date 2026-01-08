/**
 * Hub stránka pre všetky taxi trasy
 *
 * URL: /taxi-trasa
 *
 * Zobrazuje:
 * - Všetkých 435 kombinácií medzi TOP 30 mestami
 * - Filtrovanie podľa mesta
 * - SEO optimalizovaná landing page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock, Euro, Route, Search, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { FooterLegal } from '@/components/FooterLegal';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import cityRoutesData from '../../src/data/city-routes.json';

interface CityRouteData {
  from: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
  };
  to: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
  };
  slug: string;
  distance_km: number;
  duration_min: number;
}

// Výpočet ceny
const calculatePrice = (distanceKm: number) => {
  const basePrice = 2.5;
  const minPrice = Math.round(basePrice + distanceKm * 0.85);
  return minPrice;
};

// Formátovanie času
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hod`;
  return `${hours}h ${mins}m`;
};

export const metadata: Metadata = {
  title: 'Taxi trasy medzi mestami | Ceny a vzdialenosti | TaxiNearMe.sk',
  description: 'Nájdite taxi trasy medzi 30 najväčšími mestami na Slovensku. Porovnajte vzdialenosti, časy cesty a orientačné ceny taxi prepravy.',
  keywords: [
    'taxi trasy slovensko',
    'taxi medzi mestami',
    'taxi cena bratislava košice',
    'taxi cena žilina bratislava',
    'preprava medzi mestami',
    'taxi dlhé vzdialenosti',
    'medzimestská taxi preprava',
  ],
  openGraph: {
    title: 'Taxi trasy medzi mestami | TaxiNearMe.sk',
    description: 'Nájdite taxi trasy medzi 30 najväčšími mestami na Slovensku. 435 kombinácií s cenami.',
    type: 'website',
    locale: 'sk_SK',
    siteName: 'TaxiNearMe.sk',
    url: 'https://www.taxinearme.sk/taxi-trasa',
    images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Taxi trasy medzi mestami | TaxiNearMe.sk',
    description: 'Nájdite taxi trasy medzi 30 najväčšími mestami na Slovensku. 435 kombinácií s cenami.',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/taxi-trasa',
  },
};

export default function TaxiTrasaHubPage() {
  const routes = cityRoutesData.routes as CityRouteData[];
  const cities = cityRoutesData.cities as Array<{ name: string; slug: string }>;

  // Rozšírený interface pre zobrazenie trasy (s info o smere)
  interface DisplayRoute extends CityRouteData {
    displayCity: string; // Mesto ktoré zobrazíme ako cieľ
    isReversed: boolean; // Či je trasa zobrazená v opačnom smere
    linkSlug: string; // Slug pre link - unikátny pre každý smer
  }

  // Zoskupiť trasy podľa mesta - každé mesto vidí všetky trasy (z neho aj doň)
  // DÔLEŽITÉ: linkSlug musí byť vždy [aktuálne-mesto]-[cieľové-mesto]
  // Takže keď som v Bratislave a idem do Banskej Bystrice, link = bratislava-banska-bystrica
  const routesByCity = new Map<string, DisplayRoute[]>();

  routes.forEach((route) => {
    // Pridať trasu pod "from" mesto
    // Keď som v "from" meste, chcem ísť do "to" mesta
    // Link slug = from-to
    if (!routesByCity.has(route.from.name)) {
      routesByCity.set(route.from.name, []);
    }
    routesByCity.get(route.from.name)!.push({
      ...route,
      displayCity: route.to.name,
      isReversed: false,
      linkSlug: `${route.from.slug}-${route.to.slug}`, // from → to
    });

    // Pridať trasu aj pod "to" mesto
    // Keď som v "to" meste, chcem ísť do "from" mesta
    // Link slug = to-from
    if (!routesByCity.has(route.to.name)) {
      routesByCity.set(route.to.name, []);
    }
    routesByCity.get(route.to.name)!.push({
      ...route,
      displayCity: route.from.name,
      isReversed: true,
      linkSlug: `${route.to.slug}-${route.from.slug}`, // to → from
    });
  });

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Taxi trasy medzi mestami',
    description: 'Kompletný zoznam taxi trás medzi 30 najväčšími mestami na Slovensku',
    url: 'https://www.taxinearme.sk/taxi-trasa',
    numberOfItems: routes.length,
    provider: {
      '@type': 'Organization',
      name: 'TaxiNearMe.sk',
      url: 'https://www.taxinearme.sk',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Domov',
        item: 'https://www.taxinearme.sk',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Taxi trasy',
        item: 'https://www.taxinearme.sk/taxi-trasa',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-yellow/20 via-white to-white py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-4 md:px-8">
            <div className="flex items-center gap-3 mb-4">
              <Route className="h-10 w-10 text-primary-yellow" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground">
                Taxi trasy medzi mestami
              </h1>
            </div>
            <p className="text-lg text-foreground/70 mb-6 max-w-3xl">
              Nájdite taxi prepravu medzi 30 najväčšími mestami na Slovensku.
              Porovnajte vzdialenosti, časy cesty a orientačné ceny. Každé mesto má {cities.length - 1} spojení s ostatnými mestami.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <Card className="px-4 py-2 bg-white/80 backdrop-blur inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-yellow" />
                <span className="font-bold">{cities.length}</span>
                <span className="text-foreground/60">miest</span>
              </Card>
              <Card className="px-4 py-2 bg-white/80 backdrop-blur inline-flex items-center gap-2">
                <Route className="h-4 w-4 text-primary-yellow" />
                <span className="font-bold">{routes.length * 2}</span>
                <span className="text-foreground/60">spojení</span>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Links - Popular Routes */}
        <section className="py-8 px-4 md:px-8 bg-foreground/5">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Najpopulárnejšie trasy
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {routes.slice(0, 12).map((route) => (
                <Link
                  key={route.slug}
                  href={`/taxi-trasa/${route.slug}`}
                  className="group"
                >
                  <Card className="p-3 text-center hover:shadow-md transition-all hover:border-primary-yellow/50">
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary-yellow transition-colors">
                      {route.from.name}
                    </p>
                    <ArrowRight className="h-3 w-3 mx-auto my-1 text-foreground/40" />
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary-yellow transition-colors">
                      {route.to.name}
                    </p>
                    <p className="text-xs text-green-600 font-bold mt-1">
                      od {calculatePrice(route.distance_km)}€*
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Routes by City */}
        <section className="py-8 md:py-12 px-4 md:px-8">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Všetky trasy podľa mesta
            </h2>

            <div className="space-y-8">
              {Array.from(routesByCity.entries())
                .sort(([a], [b]) => a.localeCompare(b, 'sk'))
                .map(([cityName, cityRoutes]) => (
                  <div key={cityName} id={cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '-')}>
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary-yellow" />
                      Trasy z/do mesta {cityName}
                      <span className="text-sm font-normal text-foreground/50">
                        ({cityRoutes.length} spojení)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {cityRoutes
                        .sort((a, b) => a.displayCity.localeCompare(b.displayCity, 'sk'))
                        .map((route) => (
                          <Link
                            key={`${route.linkSlug}`}
                            href={`/taxi-trasa/${route.linkSlug}`}
                            className="group"
                          >
                            <Card className="p-3 hover:shadow-md transition-all hover:border-primary-yellow/50">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-foreground group-hover:text-primary-yellow transition-colors">
                                  {route.isReversed ? '←' : '→'} {route.displayCity}
                                </p>
                                <span className="text-sm text-green-600 font-bold">
                                  od {calculatePrice(route.distance_km)}€*
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-foreground/60">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {route.distance_km} km
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(route.duration_min)}
                                </span>
                              </div>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-12 px-4 md:px-8 bg-primary-yellow/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Nenašli ste svoju trasu?
            </h2>
            <p className="text-foreground/70 mb-6">
              Prezrite si taxi služby v jednotlivých mestách alebo nás kontaktujte.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-yellow text-foreground font-bold rounded-lg hover:bg-primary-yellow/90 transition-colors"
            >
              <Search className="h-5 w-5" />
              Hľadať taxi podľa mesta
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-8 md:py-12 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <article className="prose prose-lg max-w-none">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Medzimestská taxi preprava na Slovensku
              </h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                TaxiNearMe.sk vám prináša kompletný prehľad taxi trás medzi najväčšími mestami
                na Slovensku. Či už potrebujete taxi z Bratislavy do Košíc, zo Žiliny do Banskej Bystrice,
                alebo akúkoľvek inú kombináciu, nájdete tu všetky potrebné informácie.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Pre každú trasu zobrazujeme vzdialenosť v kilometroch, orientačný čas cesty
                a predpokladanú cenu. Ceny sú vypočítané na základe priemerných taríf slovenských
                taxi služieb (cca 1€/km) a môžu sa líšiť podľa konkrétnej spoločnosti.
              </p>
              <h3 className="text-lg font-bold text-foreground mb-3">
                Výhody taxi prepravy na dlhé vzdialenosti
              </h3>
              <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
                <li>Vyzdvihnutie a dovoz priamo na adresu</li>
                <li>Bez prestupovania a čakania</li>
                <li>Možnosť prepravy batožiny</li>
                <li>Flexibilný čas odchodu</li>
                <li>Pohodlná preprava pre skupiny</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Footer */}
        <FooterLegal />
      </div>
    </>
  );
}
