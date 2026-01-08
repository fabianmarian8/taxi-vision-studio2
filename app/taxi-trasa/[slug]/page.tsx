/**
 * Dynamická stránka pre taxi trasy medzi mestami
 *
 * URL: /taxi-trasa/[slug]
 * Príklad: /taxi-trasa/bratislava-zilina
 *
 * Obsahuje:
 * - Vzdialenosť a čas cesty
 * - Orientačnú cenu (1€/km)
 * - Interaktívnu mapu
 * - Taxi služby z oboch miest
 * - FAQ sekciu
 * - Schema.org markup
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Car, ArrowLeft, Phone, HelpCircle, Euro, Navigation, Route, Train, Bus, Coffee, Landmark, Star, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { FooterLegal } from '@/components/FooterLegal';
import { CityRouteMapWrapper } from '@/components/CityRouteMapWrapper';
import { ExpandableTaxiList } from '@/components/ExpandableTaxiList';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import cityRoutesData from '../../../src/data/city-routes.json';
import citiesData from '../../../src/data/cities.json';

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

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

// Typ pre dáta mesta
interface CityData {
  name: string;
  slug: string;
  lat: number;
  lng: number;
}

// Typ pre rozšírené dáta trasy s presným smerom podľa URL
interface ParsedRoute {
  from: CityData;
  to: CityData;
  distance_km: number;
  duration_min: number;
  urlSlug: string;
}

// Získanie mesta podľa slug z cities zoznamu
const getCityBySlug = (slug: string): CityData | undefined => {
  const cities = cityRoutesData.cities as CityData[];
  return cities.find(city => city.slug === slug);
};

// Parsovanie slug na dve mestá - skúša všetky kombinácie delenia
const parseCitiesFromSlug = (slug: string): { from: CityData; to: CityData } | undefined => {
  const parts = slug.split('-');

  // Skúšame všetky možné delenia
  for (let i = 1; i < parts.length; i++) {
    const city1Slug = parts.slice(0, i).join('-');
    const city2Slug = parts.slice(i).join('-');

    const city1 = getCityBySlug(city1Slug);
    const city2 = getCityBySlug(city2Slug);

    if (city1 && city2) {
      return { from: city1, to: city2 };
    }
  }

  return undefined;
};

// Získanie trasy podľa slug - smer je určený podľa URL
const getRouteBySlug = (slug: string): ParsedRoute | undefined => {
  const routes = cityRoutesData.routes as CityRouteData[];

  // Parsuj mestá z URL slug
  const cities = parseCitiesFromSlug(slug);
  if (!cities) {
    return undefined;
  }

  // Nájdi trasu medzi týmito mestami (v hocijakom smere, potrebujeme len distance a duration)
  const route = routes.find(r =>
    (r.from.slug === cities.from.slug && r.to.slug === cities.to.slug) ||
    (r.from.slug === cities.to.slug && r.to.slug === cities.from.slug)
  );

  if (!route) {
    return undefined;
  }

  // Vráť dáta s presným smerom podľa URL
  return {
    from: cities.from,
    to: cities.to,
    distance_km: route.distance_km,
    duration_min: route.duration_min,
    urlSlug: slug,
  };
};

// Získanie taxi služieb pre mesto
const getTaxiServicesForCity = (citySlug: string) => {
  const city = citiesData.cities.find(c => c.slug === citySlug);
  return city?.taxiServices?.slice(0, 5) || []; // Max 5 služieb
};

// Deterministický náhodný výber taxislužby podľa dňa a slug
// Každý deň sa zobrazí iná taxislužba, ale pre rovnaký deň a slug je vždy rovnaká
const getDailyFeaturedTaxi = (taxis: typeof citiesData.cities[0]['taxiServices'], routeSlug: string) => {
  if (!taxis || taxis.length === 0) return null;

  // Získaj dnešný dátum ako číslo dní od epoch
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

  // Vytvor hash zo slug pre konzistentné rozloženie medzi trasami
  let slugHash = 0;
  for (let i = 0; i < routeSlug.length; i++) {
    slugHash = ((slugHash << 5) - slugHash) + routeSlug.charCodeAt(i);
    slugHash = slugHash & slugHash; // Convert to 32bit integer
  }

  // Kombinuj deň a hash pre finálny index
  const index = Math.abs((daysSinceEpoch + slugHash) % taxis.length);

  return taxis[index];
};

// Získanie podobných trás (trasy z/do rovnakých miest)
const getRelatedRoutes = (currentSlug: string, fromSlug: string, toSlug: string, limit: number = 6) => {
  const routes = cityRoutesData.routes as CityRouteData[];
  const related: CityRouteData[] = [];

  // Nájdi trasy obsahujúce jedno z miest
  for (const route of routes) {
    if (route.slug === currentSlug) continue;

    // Trasy z/do zdrojového mesta
    if (route.from.slug === fromSlug || route.to.slug === fromSlug ||
        route.from.slug === toSlug || route.to.slug === toSlug) {
      related.push(route);
    }

    if (related.length >= limit) break;
  }

  return related;
};

// Výpočet ceny
const calculatePrice = (distanceKm: number) => {
  const basePrice = 2.5; // Nástupné
  const pricePerKm = 1.0; // €/km
  const minPrice = Math.round(basePrice + distanceKm * 0.85);
  const maxPrice = Math.round(basePrice + distanceKm * 1.15);
  return { minPrice, maxPrice };
};

// Formátovanie času
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hod`;
  return `${hours} hod ${mins} min`;
};

export async function generateStaticParams() {
  const routes = cityRoutesData.routes as CityRouteData[];
  const allSlugs: { slug: string }[] = [];

  routes.forEach((route) => {
    // Pridaj originálny slug (napr. banska-bystrica-bratislava)
    allSlugs.push({ slug: route.slug });

    // Pridaj aj opačný smer (napr. bratislava-banska-bystrica)
    const reversedSlug = `${route.to.slug}-${route.from.slug}`;
    allSlugs.push({ slug: reversedSlug });
  });

  return allSlugs; // 870 stránok (435 x 2)
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    return {
      title: 'Trasa nenájdená | TaxiNearMe.sk',
    };
  }

  const { minPrice, maxPrice } = calculatePrice(route.distance_km);
  const title = `Taxi ${route.from.name} - ${route.to.name} | Cena od ${minPrice}€ | TaxiNearMe.sk`;
  const description = `Taxi z ${route.from.name} do ${route.to.name}: ${route.distance_km} km, ${formatDuration(route.duration_min)}. Orientačná cena ${minPrice}-${maxPrice}€. Nájdite spoľahlivé taxi služby.`;

  // Názvy miest bez diakritiky pre keywords
  const fromNameNormalized = route.from.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const toNameNormalized = route.to.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  return {
    title,
    description,
    keywords: [
      // Hlavné kľúčové frázy - odpoveď od oponent
      `${route.from.name.toLowerCase()} ${route.to.name.toLowerCase()} taxi`,
      `${route.to.name.toLowerCase()} ${route.from.name.toLowerCase()} taxi`,
      `taxi ${route.from.name} ${route.to.name}`,
      `taxi ${route.to.name} ${route.from.name}`,
      // Bez diakritiky
      `${fromNameNormalized} ${toNameNormalized} taxi`,
      `taxi ${fromNameNormalized} ${toNameNormalized}`,
      // Ďalšie varianty
      `preprava ${route.from.name} ${route.to.name}`,
      `odvoz ${route.from.name} ${route.to.name}`,
      `taxi cena ${route.from.name}`,
      `taxi služby ${route.from.name}`,
      'taxi slovensko',
      'taxi cena za km',
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'sk_SK',
      siteName: 'TaxiNearMe.sk',
      url: `https://www.taxinearme.sk/taxi-trasa/${slug}`,
      images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONSTANTS.twitterSite,
      title,
      description,
      images: [SEO_CONSTANTS.defaultImage],
    },
    alternates: {
      canonical: `https://www.taxinearme.sk/taxi-trasa/${slug}`,
    },
    other: {
      // Geo tagy pre lokálne SEO
      'geo.region': 'SK',
      'geo.placename': `${route.from.name}, ${route.to.name}`,
      'geo.position': `${route.from.lat};${route.from.lng}`,
      'ICBM': `${route.from.lat}, ${route.from.lng}`,
      // Ďalšie meta tagy
      'revisit-after': '7 days',
      'author': 'TaxiNearMe.sk',
    },
  };
}

export default async function CityRoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    notFound();
  }

  const { minPrice, maxPrice } = calculatePrice(route.distance_km);
  const fromTaxis = getTaxiServicesForCity(route.from.slug);
  const toTaxis = getTaxiServicesForCity(route.to.slug);
  const relatedRoutes = getRelatedRoutes(slug, route.from.slug, route.to.slug, 6);

  // Vyber dennú "featured" taxislužbu - mení sa každý deň
  const featuredTaxi = getDailyFeaturedTaxi(fromTaxis, slug);

  // BreadcrumbList Schema - KRITICKÉ pre SEO
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
      {
        '@type': 'ListItem',
        position: 3,
        name: `${route.from.name} - ${route.to.name}`,
        item: `https://www.taxinearme.sk/taxi-trasa/${slug}`,
      },
    ],
  };

  // TaxiService Schema - správny typ pre taxi služby
  const taxiServiceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: `Taxi ${route.from.name} - ${route.to.name}`,
    description: `Taxi preprava z ${route.from.name} do ${route.to.name}. Vzdialenosť ${route.distance_km} km, čas cesty ${formatDuration(route.duration_min)}.`,
    provider: {
      '@type': 'Organization',
      name: 'TaxiNearMe.sk',
      url: 'https://www.taxinearme.sk',
    },
    areaServed: [
      {
        '@type': 'City',
        name: route.from.name,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: route.from.lat,
          longitude: route.from.lng,
        },
      },
      {
        '@type': 'City',
        name: route.to.name,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: route.to.lat,
          longitude: route.to.lng,
        },
      },
    ],
    priceRange: `${minPrice}€ - ${maxPrice}€`,
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: minPrice,
        priceCurrency: 'EUR',
        minPrice: minPrice,
        maxPrice: maxPrice,
      },
    },
  };

  // FAQ data
  const faqItems = [
    {
      question: `Koľko stojí taxi z ${route.from.name} do ${route.to.name}?`,
      answer: `Orientačná cena taxi z ${route.from.name} do ${route.to.name} je ${minPrice}-${maxPrice}€. Konečná cena závisí od konkrétnej taxi služby, typu vozidla a času jazdy.`,
    },
    {
      question: `Ako dlho trvá cesta taxíkom z ${route.from.name} do ${route.to.name}?`,
      answer: `Cesta taxíkom z ${route.from.name} do ${route.to.name} trvá približne ${formatDuration(route.duration_min)}. Skutočný čas závisí od dopravnej situácie.`,
    },
    {
      question: `Aká je vzdialenosť medzi ${route.from.name} a ${route.to.name}?`,
      answer: `Vzdialenosť medzi ${route.from.name} a ${route.to.name} je približne ${route.distance_km} km po ceste.`,
    },
    {
      question: `Kde nájdem taxi v ${route.from.name}?`,
      answer: `Na stránke TaxiNearMe.sk nájdete zoznam overených taxi služieb v ${route.from.name} s kontaktnými údajmi a hodnoteniami.`,
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* Above The Fold dizajn - jednotný pre všetky trasy */}
        <section className="relative bg-gradient-to-br from-primary-yellow/10 via-white to-blue-50/30">
            {/* Kompaktný Hero - všetko dôležité na jednej obrazovke */}
            <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">

              {/* Grid layout: Info vľavo, Mapa vpravo */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

                {/* Ľavá strana - Hlavné info a CTA */}
                <div className="lg:col-span-2 flex flex-col">
                  {/* Headline */}
                  <div className="mb-4">
                    <p className="text-sm text-foreground/60 mb-1">Taxi preprava</p>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-tight">
                      {route.from.name} → {route.to.name}
                    </h1>
                  </div>

                  {/* Cena - dominantná */}
                  <div className="bg-white rounded-xl shadow-lg border-2 border-primary-yellow p-4 mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl md:text-4xl font-black text-green-600">{minPrice}€</span>
                      <span className="text-lg text-foreground/50">- {maxPrice}€*</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground/70">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {route.distance_km} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(route.duration_min)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 mt-2">
                      * Uvedené ceny sú len orientačné.
                    </p>
                  </div>

                  {/* CTA - denná náhodná taxislužba alebo generický link */}
                  <div className="space-y-3 mb-4">
                    {featuredTaxi?.phone ? (
                      <a
                        href={`tel:${featuredTaxi.phone.replace(/\s/g, '')}`}
                        className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl text-lg"
                      >
                        <Phone className="h-6 w-6" />
                        Zavolať {featuredTaxi.name}
                      </a>
                    ) : (
                      <Link
                        href="#taxi-sluzby"
                        className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl text-lg"
                      >
                        <Phone className="h-6 w-6" />
                        Nájsť taxi službu
                      </Link>
                    )}
                    <Link
                      href="#taxi-sluzby"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary-yellow text-foreground font-bold rounded-xl hover:bg-primary-yellow/90 transition-all"
                    >
                      <Car className="h-5 w-5" />
                      {fromTaxis.length > 0 ? `${fromTaxis.length} taxi služieb v ${route.from.name}` : 'Zobraziť taxi služby'}
                    </Link>
                  </div>
                </div>

                {/* Pravá strana - Mapa */}
                <div className="lg:col-span-3">
                  <div className="rounded-xl overflow-hidden shadow-lg h-[250px] md:h-[300px] lg:h-full lg:min-h-[350px]">
                    <CityRouteMapWrapper
                      fromLat={route.from.lat}
                      fromLng={route.from.lng}
                      fromName={route.from.name}
                      toLat={route.to.lat}
                      toLng={route.to.lng}
                      toName={route.to.name}
                    />
                  </div>
                </div>
              </div>

              {/* Breadcrumb - navigácia späť */}
              <div className="mt-6 pt-4 border-t border-foreground/10">
                <Link
                  href="/taxi-trasa"
                  className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Späť na všetky taxi trasy
                </Link>
              </div>
            </div>
          </section>

        {/* Taxi Services Section - len z východiskového mesta */}
        <section id="taxi-sluzby" className="py-8 md:py-12 px-4 md:px-8 bg-foreground/5 scroll-mt-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Car className="h-6 w-6 text-primary-yellow" />
              Taxi služby v {route.from.name}
            </h2>

            <ExpandableTaxiList
              taxis={fromTaxis}
              cityName={route.from.name}
              citySlug={route.from.slug}
            />
          </div>
        </section>

        {/* Špeciálny obsah pre trasu BRATISLAVA -> ŽILINA */}
        {slug === 'bratislava-zilina' && (
          <>
            {/* Porovnanie alternatív prepravy */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Žiliny</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Plánujete cestu na sever Slovenska? Či už ide o služobnú cestu, návštevu rodiny
                  alebo výlet do Malej Fatry, máte na výber z viacerých možností dopravy.
                </p>

                {/* Mobile: stack, sm: 2 col, md: 3 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Taxi - zvýraznená karta */}
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Vyzdvihnutie v Bratislave kdekoľvek - hotel, letisko BTS, Hlavná stanica.
                        Dovoz priamo na adresu v Žiline.
                      </p>
                    </div>
                  </Card>

                  {/* Vlak */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">7-15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold text-xs sm:text-sm">2h 15min - 2h 45min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">ZSSK:</a> IC vlaky z Hlavnej stanice. <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-yellow-600 hover:underline">RegioJet:</a> od 7€,
                        žlté vlaky s WiFi a občerstvením.
                      </p>
                    </div>
                  </Card>

                  {/* Autobus */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2h 25min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> odchod z AS Nivy v Bratislave, približne 5 spojov denne.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Info box - responzívny */}
                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi z Bratislavy?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Cestujete s rodinou alebo skupinou - cena na osobu vychádza ako vlak</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Máte lyže, snowboard alebo veľa batožiny na hory</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Potrebujete vyzdvihnutie z letiska BTS alebo z hotela</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Chcete ísť priamo do lyžiarskeho strediska, nie na stanicu</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Trasa z Bratislavy */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo uvidíte po ceste na sever</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Diaľnica D1 z Bratislavy vedie údolím Váhu cez celé západné Slovensko.
                  Ak máte čas, stojí za to urobiť si zastávku.
                </p>

                {/* Mobile: stack, md: 2 col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Kúpeľný+ostrov+Piešťany" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Piešťany - kúpele</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Prvá väčšia zastávka. Svetoznáme kúpele s liečivým bahnom.
                          Prechádzka po Kúpeľnom ostrove alebo rýchla káva.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~85 km od Bratislavy</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:inline block w-full sm:w-auto">Odbočka 10 min z D1</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Trenčiansky+hrad" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Trenčiansky hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          V polovici cesty. Jeden z najkrajších hradov na Slovensku.
                          Studňa lásky a Matúšova veža s výhľadom na Považie.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~120 km od Bratislavy</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:inline block w-full sm:w-auto">Odbočka 5 min z D1</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Tip box - responzívny */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-yellow/10 rounded-lg">
                  <p className="text-xs sm:text-sm text-foreground/80">
                    <strong>Tip:</strong> Ak cestujete taxíkom a chcete urobiť zastávku,
                    dohodnite sa s vodičom vopred. Čakanie sa účtuje okolo 10-15€/hod.
                  </p>
                </div>
              </div>
            </section>

            {/* Odpočívadlá z BA */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 shrink-0" />
                  <span>Odpočívadlá na D1 (smer Žilina)</span>
                </h2>

                {/* Mobile: 2 col, sm: 2 col, lg: 3 col */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {[
                    { name: 'Zlaté Piesky', km: '5 km', note: 'za Bratislavou' },
                    { name: 'Zeleneč', km: '35 km', note: 'OMV, McDonald\'s' },
                    { name: 'Červeník', km: '55 km', note: 'Shell' },
                    { name: 'Hrádok', km: '110 km', note: 'za Piešťanmi' },
                    { name: 'Zamarovce', km: '125 km', note: 'pri Trenčíne' },
                    { name: 'Pov. Bystrica', km: '165 km', note: 'pred Žilinou' },
                  ].map((stop, index) => (
                    <Card key={index} className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs sm:text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{stop.name}</h4>
                          <p className="text-[10px] sm:text-xs text-foreground/60 truncate">{stop.km} • {stop.note}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Praktické tipy BA -> ZA */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu z Bratislavy
                </h2>

                {/* Mobile: stack, md: 2 col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Kedy vyraziť</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Vyhnite sa piatkam popoludní - kolóny za Bratislavou. Ideálne ráno 9:00-11:00
                      alebo popoludní po 14:00.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cesta na hory</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás dovezie priamo do Malej Fatry alebo na Martinské hole.
                      Nemusíte prestupovať v Žiline.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Z letiska BTS</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás vyzdvihne priamo pri príletoch. Do Žiliny ste za {formatDuration(route.duration_min)}
                      bez starostí s batožinou.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">V zime</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Strečno býva náročnejšie. Taxi so skúseným vodičom je bezpečnejšia
                      voľba ako vlastné auto.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> TRENČÍN */}
        {slug === 'bratislava-trencin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Trenčína</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Trenčín s majestátnym hradom nad Váhom je vzdialený ~130 km od Bratislavy.
                  Priemyselné centrum Považia s bohatou históriou.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~1h 15min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Po D1 priamo do centra alebo priemyselnej zóny.
                        Bez prestupovania a čakania.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">6-12€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 15min - 1h 30min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        IC vlaky <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZSSK</a> aj <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">RegioJet</a>. Časté spoje, pohodlná cesta.
                        Stanica blízko centra.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">7-10€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 30min - 2h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a> a <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a>. Z AS Nivy na AS Trenčín.
                        Menej spojov ako vlak.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Trenčína?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Obchodné stretnutie v priemyselnej zóne (Matador, Continental)</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva Trenčianskeho hradu alebo kúpeľov v Trenčianskych Tepliciach</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Sťahovanie alebo preprava väčšej batožiny</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Cestujete v skorých ranných alebo neskorých večerných hodinách</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Trenčíne a okolí</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Trenčiansky+hrad" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Trenčiansky hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Ikonická dominanta mesta. Studňa lásky, Matúšova veža,
                          nádherný výhľad na Považie. Rímsky nápis z roku 179.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Trenčianske+Teplice+kúpele" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Trenčianske Teplice</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Kúpele len 15 km od Trenčína. Liečivé termálne pramene,
                          kúpeľný dom Sina, aquapark.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Mierové+námestie+Trenčín" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Mierové námestie</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Historické centrum s renesančnými domami. Morový stĺp,
                          mestská veža, kaviarničky a reštaurácie.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Skalka+Trenčín+pútnické+miesto" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Skalka</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Pútnické miesto nad Trenčínom. Kostol sv. Juraja
                          a krásny výhľad na celé údolie Váhu.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Trenčína
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa po D1</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po diaľnici D1 cez Trnavu a Piešťany. Kvalitná cesta,
                      v piatok popoludní možné kolóny za Bratislavou.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Priemyselné zóny</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Ak idete do fabriky (Continental, Matador, JLR), uveďte presnú adresu.
                      Taxi vás dovezie priamo k bráne.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Na hrad</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Parkovanie pri hrade je obmedzené. Taxi vás vysadí priamo
                      pri vstupe a môže na vás počkať.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Do kúpeľov</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Trenčianske Teplice sú len 15 km od Trenčína. Taxi vás dovezie
                      priamo do kúpeľného domu.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> TRNAVA */}
        {slug === 'bratislava-trnava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Trnavy</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Trnava - &quot;malý Rím&quot; Slovenska je len 55 km od Bratislavy.
                  Najstaršie slobodné kráľovské mesto s krásnym historickým centrom.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~35 minút</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Najrýchlejšia možnosť. Z centra do centra za pol hodiny.
                        Ideálne pre skupiny alebo s batožinou.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">2-4€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">30-45 min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Veľa spojov z Hlavnej stanice. Vlaky idú každých 15-30 minút.
                        Lacná a spoľahlivá možnosť.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">3-5€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">45-60 min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> z AS Nivy. Menej pohodlné ako vlak,
                        závislé od dopravnej situácie.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Trnavy?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Práca v PSA/Stellantis alebo v priemyselnej zóne</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva univerzity (UCM, STU) alebo prednáška</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Zápas FC Spartak na City Arene</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Transfer z letiska BTS priamo do Trnavy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Trnave - &quot;malom Ríme&quot;</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Bazilika+sv.+Mikuláša+Trnava" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Bazilika sv. Mikuláša</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Katedrála s najväčším barokovým oltárom v strednej Európe.
                          Bývalé sídlo arcibiskupstva.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Mestské+hradby+Trnava" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Mestské hradby</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najzachovalejšie stredoveké opevnenie na Slovensku.
                          Prechádzka okolo hradieb a mestské veže.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Trojičné+námestie+Trnava" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Trojičné námestie</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Srdce mesta s morovým stĺpom. Kaviarničky, reštaurácie,
                          trhy a spoločenský život.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=City+Arena+Trnava" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">City Arena</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Moderný futbalový štadión FC Spartak Trnava.
                          Zápasy a koncerty s kapacitou 19 000 miest.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Trnavy
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Dve trasy</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Diaľnica D1 (rýchlejšie, 30 min) alebo cesta cez Senec (krajšie, 45 min).
                      Vodič vyberie podľa dopravy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Parkovanie v centre</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické centrum je pešia zóna. Taxi vás vysadí pri bráne
                      a môžete prejsť pešo.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">PSA/Stellantis</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Automobilka je na okraji mesta. Taxi vás dovezie priamo
                      k vstupnej bráne.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Na zápas</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V deň zápasu počítajte s väčšou premávkou. City Arena
                      má vlastné parkovisko, taxi vás vysadí priamo tam.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> NITRA */}
        {slug === 'bratislava-nitra' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Nitry</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Nitra je jedno z najstarších miest na Slovensku a univerzitné centrum.
                  Je vzdialená len 90 km od Bratislavy - ideálna vzdialenosť na taxi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~1 hodina</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz door-to-door. Ideálne pre rodiny, biznis stretnutia
                        alebo návštevu univerzity.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">5-8€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 15min - 1h 30min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> a <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a>. Časté spoje z AS Nivy.
                        Príchod na AS Nitra.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">4-6€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 30min - 2h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Regionálne vlaky <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZSSK</a>. Často s prestupom v Leopoldove.
                        Pomalšie ako autobus.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Nitry?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Cesta na Agrokomplex, Nitrianske pivné slávnosti alebo konferenciu</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva študenta na SPU alebo UKF</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Business meeting - prídete rýchlo a reprezentatívne</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Transfer z letiska BTS priamo do Nitry</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Nitre</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Nitriansky+hrad" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Nitriansky hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Dominanta mesta na hradnom kopci. Katedrála sv. Emeráma
                          je najstarším kostolom v strednej Európe.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Agrokomplex+Nitra" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Agrokomplex</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Najväčšie výstavisko na Slovensku. Agrokomplex, Nábytok a Bývanie,
                          Autosalón a ďalšie veľtrhy.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Zobor+Nitra" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Zobor</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Vrch nad mestom s úžasným výhľadom. Pyramída a TV vysielač.
                          Ideálne na prechádzku alebo cyklistiku.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Štefánikova+trieda+Nitra" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Staré Mesto</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Pešia zóna s kaviarňami a reštauráciami. Štefánikova trieda
                          je srdcom spoločenského života.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Nitry
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po R1 cez Senec a Galantu. Kvalitná rýchlostná cesta
                      bez mýta. V okolí Senca môžu byť cez víkend zápchy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Vyhnite sa rannej a popoludňajšej špičke (7:00-8:30, 16:00-18:00).
                      Cez deň je cesta plynulá.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Parkovanie</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V centre Nitry je parkovanie náročnejšie. S taxi vás vodič
                      doveze priamo k cieľu bez starostí.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Späťná cesta</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Môžete si dohodnúť taxi aj na spätnú cestu. Vodič na vás počká
                      alebo sa dohodnete na konkrétnom čase.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> KOŠICE */}
        {slug === 'bratislava-kosice' && (
          <>
            {/* Porovnanie alternatív prepravy */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Košíc</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Plánujete cestu na východ Slovenska? Košice sú druhým najväčším mestom a centrom
                  východného Slovenska. Tu je porovnanie možností dopravy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Taxi */}
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~4 hodiny</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Z letiska BTS alebo centra priamo do Košíc. Ideálne pre 3-4 osoby
                        alebo s veľa batožinou.
                      </p>
                    </div>
                  </Card>

                  {/* Vlak */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">15-25€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold text-xs sm:text-sm">4h 30min - 5h 30min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">ZSSK:</a> IC vlaky z Hlavnej stanice. <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-yellow-600 hover:underline">RegioJet:</a>
                        žlté vlaky s WiFi a občerstvením.
                      </p>
                    </div>
                  </Card>

                  {/* Lietadlo */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Lietadlo</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">50-150€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~1 hodina</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                          <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Lety BTS-KSC nie sú pravidelné. Väčšinou cez Viedeň alebo Praha.
                        S transfermi trvá 4+ hodiny.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi z Bratislavy do Košíc?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Cestujete vo viacerých - cena na osobu vychádza ako vlak</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Máte sťahovanie, veľa batožiny alebo špeciálne potreby</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Potrebujete prísť na konkrétnu adresu, nie na stanicu</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Cestujete v noci alebo veľmi skoro ráno</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Zaujímavosti na trase */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo uvidíte po ceste na východ</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Cesta z Bratislavy do Košíc vedie cez celé Slovensko. Prejdete popod Tatry
                  a uvidíte najkrajšie scenérie krajiny.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.vysoketatry.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Vysoké Tatry</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Z diaľnice D1 uvidíte celý masív Tatier. Najkrajší pohľad
                          je medzi Ružomberkom a Popradom.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~300 km od Bratislavy</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.spisskyhrad.sk" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Spišský hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          UNESCO pamiatka, jeden z najväčších hradov v Európe.
                          Viditeľný z diaľnice pri Spišskom Podhradí.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~350 km od Bratislavy</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Liptov+Slovensko" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Liptov</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          <a href="https://www.tatralandia.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Aquapark Tatralandia</a>, <a href="https://www.jasna.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jasná</a>, Demänovská dolina.
                          Ideálne miesto na zastávku.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~270 km od Bratislavy</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Dóm+svätej+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Dóm sv. Alžbety</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Najväčší kostol na Slovensku v centre Košíc.
                          Gotická katedrála z 14. storočia.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>Cieľ - centrum Košíc</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Odpočívadlá */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 shrink-0" />
                  <span>Odpočívadlá na D1 (smer Košice)</span>
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {[
                    { name: 'Zeleneč', km: '35 km', note: 'OMV, McDonald\'s' },
                    { name: 'Trenčín', km: '125 km', note: 'Shell, reštaurácie' },
                    { name: 'Pov. Bystrica', km: '165 km', note: 'OMV' },
                    { name: 'Likavka', km: '240 km', note: 'pri Ružomberku' },
                    { name: 'Poprad', km: '310 km', note: 'McDonald\'s, Tesco' },
                    { name: 'Spišské Podhradie', km: '350 km', note: 'výhľad na hrad' },
                  ].map((stop, index) => (
                    <Card key={index} className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs sm:text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{stop.name}</h4>
                          <p className="text-[10px] sm:text-xs text-foreground/60 truncate">{stop.km} • {stop.note}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Praktické tipy */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Košíc
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Kedy vyraziť</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Vyhnite sa piatkam popoludní a nedeľám večer. Ideálne ráno 7:00-9:00
                      alebo cez týždeň. Cesta môže trvať aj 5 hodín pri zápcach.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">V zime</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Úsek cez Tatry môže byť náročnejší. Taxi so skúseným vodičom a
                      zimnými pneumatikami je bezpečnejšia voľba.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zastávka v Tatrách</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Ak máte čas, stojí za to urobiť si prestávku v Tatranskej Lomnici
                      alebo Štrbskom Plese. Dohodnite sa s vodičom vopred.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cieľové body v Košiciach</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás dovezie kamkoľvek - letisko KSC, Aupark, U.S. Steel,
                      Hlavná ulica či konkrétna adresa.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> BRATISLAVA */}
        {slug === 'zilina-bratislava' && (
          <>
            {/* Porovnanie alternatív - z pohľadu Žiliny */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Bratislavy</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Cestujete zo Žiliny do hlavného mesta? Či už máte ranný let z letiska BTS,
                  obchodné rokovanie alebo sa vraciate zo služobnej cesty, tu je porovnanie možností.
                </p>

                {/* Mobile: stack, sm: 2 col, md: 3 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Taxi - zvýraznená karta */}
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Vyzdvihnutie v Žiline kdekoľvek - hotel, Aupark, priemyselná zóna.
                        Dovoz priamo na letisko BTS alebo kamkoľvek v Bratislave.
                      </p>
                    </div>
                  </Card>

                  {/* Vlak */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">7-15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold text-xs sm:text-sm">2h 15min - 2h 45min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-yellow-600 hover:underline">RegioJet:</a> zo Žiliny od 6:00 ráno. <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">ZSSK:</a> IC vlaky
                        každú hodinu. Príchod na Hlavnú stanicu BA.
                      </p>
                    </div>
                  </Card>

                  {/* Autobus */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2h 25min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> zo Žiliny AS, príchod na AS Nivy v Bratislave.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Info box - responzívny */}
                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi zo Žiliny?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Máte ranný let z letiska BTS - taxi vás vyzdvihne aj o 4:00 ráno</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Obchodné stretnutie - prídete odpočinutý, môžete pracovať v aute</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Vraciate sa z hôr s výbavou - lyže, kočík, veľa batožiny</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Potrebujete sa dostať do konkrétnej časti Bratislavy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Trasa zo Žiliny */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo uvidíte po ceste do Bratislavy</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Cesta zo Žiliny vedie najprv cez malebné Strečno, potom tunelom Višňové
                  a údolím Váhu až do hlavného mesta.
                </p>

                {/* Mobile: stack, sm: 2 col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Strečniansky+hrad" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Strečniansky hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Hneď za Žilinou. Zrúcanina hradu na skale nad Váhom.
                          Jeden z najfotogenickejších výhľadov na Slovensku.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~15 km od Žiliny</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:inline block w-full sm:w-auto">Výhľad z cesty</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Tunel+Višňové+D1" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Tunel Višňové</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Najdlhší diaľničný tunel na Slovensku (7,5 km).
                          Otvorený v roku 2023, výrazne skrátil cestu.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~25 km od Žiliny</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:inline block w-full sm:w-auto">7,5 km dlhý</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Trenčiansky+hrad" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Trenčiansky hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Približne v polovici cesty. Majestátny hrad nad mestom Trenčín,
                          viditeľný z diaľnice.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~80 km od Žiliny</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:inline block w-full sm:w-auto">Odbočka 5 min</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Trnava+centrum" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Trnava - malý Rím</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                          Posledná väčšia zastávka pred Bratislavou. Historické centrum
                          s množstvom kostolov a kaviarní.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-foreground/60">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>~150 km od Žiliny</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:inline block w-full sm:w-auto">Odbočka 10 min</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Odpočívadlá zo ZA */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 shrink-0" />
                  <span>Odpočívadlá na D1 (smer Bratislava)</span>
                </h2>

                {/* Mobile: 2 col, lg: 3 col */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {[
                    { name: 'Pov. Bystrica', km: '35 km', note: 'za Žilinou' },
                    { name: 'Zamarovce', km: '75 km', note: 'pri Trenčíne' },
                    { name: 'Hrádok', km: '90 km', note: 'pred Piešťanmi' },
                    { name: 'Červeník', km: '145 km', note: 'Shell' },
                    { name: 'Zeleneč', km: '165 km', note: 'OMV, McDonald\'s' },
                    { name: 'Zlaté Piesky', km: '195 km', note: 'pred Bratislavou' },
                  ].map((stop, index) => (
                    <Card key={index} className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs sm:text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{stop.name}</h4>
                          <p className="text-[10px] sm:text-xs text-foreground/60 truncate">{stop.km} • {stop.note}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Praktické tipy ZA -> BA */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu zo Žiliny
                </h2>

                {/* Mobile: stack, sm: 2 col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Transfer na letisko BTS</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Ak máte let o 10:00, odporúčame odchod zo Žiliny o 6:00-6:30.
                      Taxi vás dovezie priamo k terminálu.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Obchodné stretnutia</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V taxíku môžete pracovať na notebooku. Prídete do Bratislavy
                      odpočinutý a pripravený.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Nedeľný návrat</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V nedeľu večer býva D1 pred Bratislavou zaplnená. Počítajte s miernym
                      predĺžením cesty o 15-30 minút.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-foreground/5 rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cieľové body v BA</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás dovezie kamkoľvek - letisko BTS, Staré Mesto, Petržalka,
                      kongresové centrá či konkrétna adresa.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> PIEŠŤANY */}
        {slug === 'bratislava-piestany' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Piešťan</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Piešťany sú najznámejšie kúpeľné mesto na Slovensku, preslávené liečivými prameňmi
                  a blatom. Vzdialené len 80 km od Bratislavy - ideálne na wellness víkend.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~50 min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Odvoz priamo k hotelu či kúpeľom. Ideálne s batožinou
                        po liečebnom pobyte.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~6€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h - 1h 15min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Regionálne vlaky, nie priama IC linka. Stanica je
                        mimo centra kúpeľov.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~7€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 15min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a>. Autobusová stanica je bližšie k centru
                        ako vlaková.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Piešťan?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Kúpeľný pobyt s batožinou a zdravotnými pomôckami</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Wellness víkend pre páry alebo rodinu</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Seniori alebo osoby s obmedzenou mobilitou</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Transfer z letiska BTS priamo do kúpeľov</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo ponúkajú Piešťany</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Kúpeľný+ostrov+Piešťany" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Kúpeľný ostrov</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Unikátny ostrov s kúpeľnými domami, parkom a liečivými
                          procedúrami. Symbolom je socha Barlolámač.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Kolonádový+most+Piešťany" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Colonnade Bridge</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Ikonický kolonádový most z roku 1933. Jedno z najfotografovanejších
                          miest v Piešťanoch.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Aquacity+Piešťany" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Aquacity</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Moderný aquapark s termálnymi bazénmi a wellness.
                          Skvelé pre rodiny s deťmi.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Winterova+ulica+Piešťany" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Winterova ulica</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Hlavná pešia zóna s kaviarňami, reštauráciami a obchodmi.
                          Príjemná promenáda po meste.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Piešťan
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Termálna voda</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Piešťanské termálne pramene majú 67-69°C a vysoký obsah síry.
                      Liečia pohybový aparát už od 19. storočia.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Letisko</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Piešťany majú vlastné malé letisko (PZY). V minulosti
                      využívané pre kúpeľných hostí z celého sveta.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Kúpeľné hotely</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Thermia Palace, Balnea, Splendid - taxi vás privezie
                      priamo pred vchod do vášho hotela.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Víkendový tip</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Spojte návštevu Piešťan so zastávkou v Trnave alebo
                      výletom na zámok Červený Kameň.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> POPRAD */}
        {slug === 'bratislava-poprad' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Popradu</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Poprad je brána do Vysokých Tatier a najväčšie mesto pod Tatrami.
                  330 km od Bratislavy - dlhšia cesta, ale taxi ponúka maximálny komfort.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~3,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz až do Tatier. Lyžiarska výbava, rodina
                        s deťmi - všetko bez problémov.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak IC</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~20-25€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">4-4,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        InterCity vlaky 3-4x denne. Z Popradu TEŽ do Tatier,
                        ale pridáva čas a prestup.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Lietadlo</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 50€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">50 min let</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Letisko Poprad-Tatry (TAT). Sezónne lety, potreba
                        check-in času. Plus transfer z letiska.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Popradu?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Lyžiarsky výlet s rodinnou výbavou</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Skupina priateľov na tatranský víkend</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Transfer na biznis akciu v hoteloch pod Tatrami</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Nočný odchod - šofér šoféruje, vy spíte</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Poprad a Vysoké Tatry</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Štrbské+Pleso+Tatry" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Štrbské Pleso</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Ikonické tatranské jazero. Taxi vás dovezie priamo k hotelu
                          alebo k lanovke na Solisko.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Starý+Smokovec+Tatry" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Starý Smokovec</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Historické centrum tatranského turizmu. Grand Hotel,
                          TEŽ stanica, štarty turistických trás.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Tatranská+Lomnica" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Tatranská Lomnica</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Lanovka na Lomnický štít (2634 m). Najvyšší bod
                          dostupný lanovkou v Tatrách.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=AquaCity+Poprad" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">AquaCity Poprad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Moderný aquapark s geotermálnou vodou. Ideálne
                          po lyžovačke alebo turistike.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Tatier
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zimné pneumatiky</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V zime je D1 cez Strečno a Donovaly náročná. Naše taxi
                      majú vždy zimné pneumatiky a skúsených vodičov.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Lyžiarska výbava</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Objednajte väčšie vozidlo alebo kombi. Lyže, snowboardy,
                      batohy - všetko sa zmestí.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Kam vás dovezieme</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Štrbské Pleso, Starý Smokovec, Tatranská Lomnica, Ždiar,
                      alebo konkrétny hotel či chata.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Návrat</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Dohodnite si aj spiatočnú cestu. Po týždni na horách
                      oceníte pohodlný odvoz domov.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> PREŠOV */}
        {slug === 'bratislava-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Prešova</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Prešov je tretie najväčšie mesto Slovenska a centrum východného regiónu.
                  400 km od Bratislavy - taxi je ideálne pre komfort na dlhej ceste.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~4 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Pohodlná cesta bez prestupov. Pracujte na notebooku,
                        odpočívajte alebo spite.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak IC</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~22€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">4,5-5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        IC vlaky niekoľkokrát denne. Dlhá cesta, možné
                        meškania na trati.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~15-18€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">5-5,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a>, <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a>. Najdlhšia možnosť,
                        závislé od premávky.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Prešova?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Biznis cesta s potrebou práce počas jazdy</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Rodina s deťmi na návštevu príbuzných</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Skupina - pri 3-4 osobách vychádza výhodne</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Nočný odchod - ráno ste na mieste</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Prešove</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Historické centrum</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Hlavná ulica s meštianskymi domami, Neptúnova fontána
                          a gotický Konkatedrála sv. Mikuláša.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov+múzeum" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Solivar</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Unikátny technický pamätník - historická soľná baňa
                          s funkčnými zariadeniami z 17. storočia.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Dukla+aréna+Prešov" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Dukla aréna</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Moderný hokejový štadión HC Košice a Dukla Michalovce.
                          Koncerty a športové podujatia.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Šariš+Park+Veľký+Šariš" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Šariš Park</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Veľké obchodné a zábavné centrum. Kino, bowling,
                          reštaurácie na jednom mieste.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Prešova
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cez Žilinu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      D1 cez Žilinu, Poprad a Prešov. V zime pozor na
                      Strečniansky priesmyk.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Blízko Košíc</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Prešov je len 35 km od Košíc. Zvážte návštevu oboch
                      miest počas jednej cesty.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Univerzitné mesto</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Prešovská univerzita a ďalšie školy. Taxi ideálne
                      pre sťahovanie študenta.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Delenie ceny</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Pri 4 osobách vychádza taxi podobne ako vlak.
                      Plus pohodlie a úspora času.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> MARTIN */}
        {slug === 'bratislava-martin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Martina</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Martin je centrum Turca a mesto s bohatou kultúrnou históriou.
                  Vzdialený 230 km od Bratislavy, známy Slovenským národným múzeom a Maticou slovenskou.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~2,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz do centra alebo na konkrétnu adresu.
                        Bez prestupovania a čakania.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak IC</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~14€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2,5-3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        IC vlaky cez Žilinu. Stanica v centre Martina,
                        ale ďaleko od múzeí.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~12€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-3,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> a <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a>. AS Martin je mimo centra,
                        potrebný ďalší presun.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Martina?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva SNM alebo Matice slovenskej</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Biznis stretnutie v Martinskej nemocnici</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Rodinná udalosť alebo svadba v Turci</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Transfer na lyžovačku v Jasnej (30 km)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Martine a okolí</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Slovenské+národné+múzeum+Martin" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Slovenské národné múzeum</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Etnografické múzeum s expozíciami ľudovej kultúry.
                          Skanzen v prírode.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Matica+slovenská+Martin" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Matica slovenská</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najstaršia kultúrna inštitúcia Slovákov. Historická
                          budova a archív.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Martinské+hole" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Martinské hole</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Lyžiarske stredisko priamo nad mestom. Menšie,
                          ale výborné pre začiatočníkov.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Jasná+Chopok+lyžiarske+stredisko" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Jasná - Chopok</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najväčšie lyžiarske stredisko na Slovensku len 30 km.
                          Taxi vás dovezie priamo na svah.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Martina
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cez Žilinu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Trasa vedie po D1 cez Žilinu. Martin je 30 km za Žilinou
                      smerom na Poprad.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Nemocnica</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Univerzitná nemocnica Martin je významné zdravotnícke
                      centrum. Taxi ideálne pre pacientov.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vrútky</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Vlaky často stoja vo Vrútkach, nie v Martine.
                      Taxi vás odvezie kam potrebujete.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Lyžovačka</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Z Martina do Jasnej len 30 min. Dohodnite si
                      odvoz aj s lyžiarskou výbavou.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> ZVOLEN */}
        {slug === 'bratislava-zvolen' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Zvolena</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Zvolen je historické mesto v srdci Slovenska, známe Zvolenským zámkom
                  a blízkosťou Banskej Bystrice. 200 km od Bratislavy cez malebné Pohronie.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~2,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Dve trasy na výber - cez Nitru alebo cez Žiar.
                        Vodič vyberie podľa aktuálnej dopravy.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~12€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2,5-3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priame spojenie cez Levice a Žiar. Krásna trasa
                        cez Pohronie.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~10€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> z AS Nivy. Autobus prechádza cez
                        viacero miest.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Zvolena?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva Zvolenského zámku a okolia</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Biznis v Zvolene alebo Banskej Bystrici (20 km)</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Lyžovačka v Skalke alebo na Donovaloch</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Rodinná návšteva v regióne Pohronie</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť vo Zvolene</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Zvolenský+zámok" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Zvolenský zámok</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Gotický zámok z 14. storočia. Dnes Slovenská národná
                          galéria s významnými zbierkami.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Pustý+hrad+Zvolen" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Pustý hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najrozsiahlejší hradný komplex na Slovensku. Výhľad
                          na celé Pohronie a Zvolen.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Arborétum+Borová+hora+Zvolen" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Arborétum Borová hora</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Botanická záhrada s 1300 druhmi drevín. Ideálne
                          na prechádzky v prírode.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Banská+Bystrica+centrum" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Banská Bystrica</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Len 20 km od Zvolena. Námestie SNP, historické centrum,
                          taxi vás dovezie aj tam.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Zvolena
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Dve trasy</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cez Nitru a Žiar (kratšia) alebo cez R1 (diaľnica).
                      Vodič vyberie podľa dopravy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Blízko BB</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Banská Bystrica je len 20 km. Zvážte návštevu
                      oboch miest počas jednej cesty.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Skalka</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Lyžiarske stredisko len 15 km od Zvolena.
                      Taxi s lyžiarskou výbavou bez problémov.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Univerzita</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Technická univerzita vo Zvolene. Taxi ideálne
                      pre sťahovanie študentov.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> LIPTOVSKÝ MIKULÁŠ */}
        {slug === 'bratislava-liptovsky-mikulas' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Liptovského Mikuláša</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Liptovský Mikuláš je srdce Liptova a brána k Nízkym Tatrám a Jasnej.
                  270 km od Bratislavy - ideálne pre lyžiarsky víkend alebo letnú turistiku.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~2,5-3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz do Jasnej, Demänovskej doliny alebo
                        kamkoľvek na Liptove.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak IC</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~16€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-3,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        IC vlaky niekoľkokrát denne. Z vlaku ešte potrebujete
                        transfer do Jasnej (15 km).
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~14€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3,5-4 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> a <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a>. Dlhšia cesta s možnými
                        zdržaniami na trase.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi na Liptov?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Lyžovačka v Jasnej s celou výbavou</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Rodinný pobyt v Tatralandii alebo aquaparku</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Turistika v Demänovskej doline</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Skupina priateľov - cena na osobu vychádza výhodne</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo ponúka Liptov</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Jasná+Chopok+lyžiarske+stredisko" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Jasná - Chopok</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najväčšie lyžiarske stredisko na Slovensku. Moderné
                          lanovky a 50+ km zjazdoviek.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Demänovská+jaskyňa+slobody" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Demänovská jaskyňa</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Ľadová a Jaskyňa slobody - jedny z najkrajších
                          jaskýň na Slovensku.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.tatralandia.sk" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Tatralandia</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najväčší aquapark na Slovensku. Celoročná prevádzka
                          s termálnou vodou.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Liptovská+Mara+vodná+nádrž" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Liptovská Mara</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Veľká vodná nádrž na kúpanie a vodné športy.
                          Pláže a kempy v okolí.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre Liptov
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Do Jasnej</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás dovezie priamo k lanovke v Jasnej. Žiadny
                      parking, žiadne prestupy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zimná trasa</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V zime cez Donovaly býva náročná. Naši vodiči poznajú
                      trasu a majú zimné pneumatiky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Výbava</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Lyže, snowboardy, detské sánky - objednajte väčšie
                      auto a všetko sa zmestí.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Spiatočka</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Dohodnite si odvoz na konkrétny deň a hodinu.
                      Unavení po lyžovačke oceníte pohodlie.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> RUŽOMBEROK */}
        {slug === 'bratislava-ruzomberok' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Ružomberka</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Ružomberok je priemyselné a turistické centrum medzi Veľkou Fatrou a Nízkymi Tatrami.
                  250 km od Bratislavy, brána k lyžiarskym strediskám Malinô Brdo a Donovaly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~2,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz na Malinô Brdo, do Vlkolínca
                        alebo kamkoľvek v regióne.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak IC</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2,5-3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        IC vlaky na trase Bratislava-Košice. Stanica v centre,
                        ale ďaleko od lyžiarskych stredísk.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~12€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-3,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> cez Žilinu. Dlhšia cesta
                        s možnými prestupmi.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Ružomberka?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Lyžovačka na Malinô Brdo alebo Donovaloch</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva Vlkolínca - UNESCO pamiatka</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Biznis v papierňach Mondi SCP</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Turistika vo Veľkej Fatre</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Ružomberku a okolí</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Vlkolínec+UNESCO" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Vlkolínec</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          UNESCO pamiatka - zachovaná ľudová architektúra.
                          Unikátna dedinka priamo v meste.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Malinô+Brdo+Ružomberok" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Malinô Brdo</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Lyžiarske stredisko s modernou lanovkou.
                          Krásne zjazdovky a bobová dráha.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Veľká+Fatra+národný+park" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Veľká Fatra</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Národný park s turistickými trasami. Gaderská dolina,
                          Blatnická dolina.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Donovaly+lyžiarske+stredisko" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Donovaly</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Lyžiarske stredisko len 25 km. Park Snow
                          s rodinným lyžovaním.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Ružomberka
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cez Žilinu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      D1 cez Žilinu a ďalej po E50. Dobre udržiavaná
                      trasa po celý rok.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Mondi SCP</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Veľká papierenská fabrika. Taxi ideálne pre
                      biznis návštevy a stretnutia.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">K lanovke</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás dovezie priamo k lanovke na Malinô Brdo.
                      Bez parkovania a problémov.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vlkolínec</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      UNESCO dedinka je súčasťou Ružomberka. Taxi vás
                      odvezie priamo k vstupu.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> DOLNÝ KUBÍN */}
        {slug === 'bratislava-dolny-kubin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Dolného Kubína</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Dolný Kubín je centrum Oravy, historický región pod Roháčmi a Oravskou Magurou.
                  260 km od Bratislavy cez krásne Považie a Turiec.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz na Oravu. Na Oravský hrad, k priehrade
                        alebo kamkoľvek v regióne.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~16€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">4-5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Prestup v Kraľovanoch. Regionálny vlak na Oravu,
                        dlhá a nepohodlná cesta.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~13€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">4 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> cez Žilinu. Lepšia alternatíva
                        ako vlak, ale stále dlhé.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi na Oravu?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva Oravského hradu a skanzenu</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Lyžovačka v Zuberci alebo na Kubínskej holi</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Turistika v Roháčoch a Západných Tatrách</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Splav Oravy alebo vodný zážitok</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť na Orave</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.oravskemuzeum.sk" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Oravský hrad</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Jeden z najkrajších hradov na Slovensku. Miesto natáčania
                          filmu Nosferatu.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Oravská+priehrada" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Oravská priehrada</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Vodná nádrž s krásnym prostredím. Pláže, vodné športy,
                          výlety loďou.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Roháče+Zuberec" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Roháče - Zuberec</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Lyžiarske stredisko a vstup do Západných Tatier.
                          Turistika a lyžovanie.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+oravskej+dediny+Zuberec" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Oravská dedina</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Skanzen v Zuberci. Ukážka tradičnej oravskej
                          architektúry a života.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu na Oravu
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cez Kraľovany</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Z D1 odbočka v Kraľovanoch na Oravu. Krásna cesta
                      popri Orave a Váhu.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vzdialené miesta</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Taxi vás dovezie aj do Námestova, Trstenej alebo
                      Zuberci. Celá Orava je dostupná.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zimná cesta</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V zime býva na Orave sneh. Naši vodiči sú zvyknutí
                      na zimné podmienky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Roháče</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Transfer na turistiku alebo lyžovanie. Zuberec
                      je 20 km od Dolného Kubína.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> PRIEVIDZA */}
        {slug === 'bratislava-prievidza' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Prievidze</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Prievidza je centrum hornej Nitry, priemyselné mesto pod Vtáčnikom.
                  150 km od Bratislavy - stredná vzdialenosť ideálna na taxi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">~1,5-2 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy odvoz bez prestupov. Ideálne pre biznis
                        alebo rodinné návštevy.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~10€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2,5-3 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Prestup v Leopoldove alebo Topoľčanoch.
                        Nepohodlná a dlhá cesta.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-purple-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">~9€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2-2,5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slovak Lines</a> z AS Nivy. Lepšie ako vlak,
                        priame spojenie.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi do Prievidze?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Biznis v priemyselných závodoch regiónu</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Návšteva Bojnického zámku (10 km)</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Rodinná udalosť alebo svadba</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Nočný odchod - ráno ste na mieste</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  <span>Čo vidieť v Prievidzi a okolí</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-100 shrink-0">
                        <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Bojnický+zámok" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Bojnický zámok</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najromantickejší zámok na Slovensku. Len 10 km
                          od Prievidze, ideálny na výlet.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-green-100 shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Bojnice" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Bojnická ZOO</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Najstaršia zoologická záhrada na Slovensku.
                          Ideálne pre rodiny s deťmi.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-orange-100 shrink-0">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Vtáčnik+pohorie" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Vtáčnik</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Pohorie nad Prievidzou. Turistické trasy
                          a krásna príroda.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-amber-100 shrink-0">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                          <a href="https://www.google.com/maps/search/?api=1&query=Kúpele+Bojnice" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">Kúpele Bojnice</a>
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground/70">
                          Termálne kúpele s liečivou vodou. Wellness
                          a relaxácia pri zámku.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické tipy pre cestu do Prievidze
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cez Nitru</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      R1 cez Nitru a Partizánske. Alebo cez Trenčín
                      po diaľnici D1.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Bojnice</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Zámok je len 10 minút od Prievidze. Taxi vás
                      dovezie priamo k bráne.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Priemysel</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Región má viacero priemyselných závodov.
                      Taxi ideálne pre pracovné cesty.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Handlová</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Bývalé banícke mesto len 15 km. Dovezieme vás
                      kamkoľvek v regióne.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> POVAŽSKÁ BYSTRICA */}
        {slug === 'bratislava-povazska-bystrica' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Považskej Bystrice</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Komfort, batožina zdarma</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      IC vlaky zo stanice Bratislava hl. st. Priame spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~2 hod</p>
                      <p>Cena: od 12€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a> a <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">RegioJet</a>.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: {formatDuration(route.duration_min)}</p>
                      <p>Cena: od 8€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Považskej Bystrice?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v Považskej Bystrici</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre rodiny a skupiny</li>
                    <li>• Cestujete pohodlne s batožinou</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Považskej Bystrici</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Hrad Považská Bystrica</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Zrúcanina hradu na kopci nad mestom s nádhernými výhľadmi
                      na údolie Váhu a okolitú krajinu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Manínska tiesňava</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Najužšia tiesňava na Slovensku len pár km od mesta.
                      Úžasné skalné útvary a turistické trasy.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Kostolec - Veľký Manín</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Skalné veže a rozľahlé lúky. Obľúbená destinácia
                      pre turistov a milovníkov prírody.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Priemyselné dedičstvo</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mesto známe výrobou pneumatík Matador. Moderná
                      priemyselná história Slovenska.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mimo špičky (9-15h a po 19h) je cesta plynulejšia.
                      Vyhnete sa kolónam na D1 pri Trenčíne.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po diaľnici D1 cez Trnavu a Trenčín.
                      Kvalitná cesta po celej trase.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Púchov</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Susedné mesto len 12 km. Dovezieme vás aj tam
                      bez príplatku na trase.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Priame okolie</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Dovezieme vás aj do Bytče, Žiliny či Dubnice.
                      Flexibilná preprava v regióne.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> NOVÉ MESTO NAD VÁHOM */}
        {slug === 'bratislava-nove-mesto-nad-vahom' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Nového Mesta nad Váhom</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Komfort, door-to-door</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      IC a rýchliky z Bratislavy hl. st. Priame spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~1h 15min</p>
                      <p>Cena: od 7€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy, menej časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~1h 30min</p>
                      <p>Cena: od 6€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Nového Mesta?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v meste</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre pracovné cesty</li>
                    <li>• Možnosť zastávky v Piešťanoch</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Novom Meste nad Váhom</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Beckov</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Majestátny hrad na skalnom brale len 8 km od mesta.
                      Jedna z najkrajších hradných zrúcanín na Slovensku.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Čachtický hrad</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Legendárny hrad Alžbety Bátoryovej. Turisticky
                      atraktívna lokalita s bohatou históriou.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Podjavorinské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum venované spisovateľke Ľ. Podjavorinskej.
                      Galéria a expozície regionálnej histórie.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vinárstva okolia</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Región je známy kvalitným vínom. Vínne pivnice
                      a degustácie v okolí Čachtíc a Nového Mesta.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Kratšia trasa - ideálna kedykoľvek. Mimo špičky
                      zvládnete cestu za cca hodinu.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po diaľnici D1 cez Trnavu. Moderná
                      infraštruktúra po celej trase.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trenčín</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Krajské mesto len 20 km ďalej. Možnosť kombinovanej
                      cesty alebo zastávky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Stará Turá</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické mestečko v Bielych Karpatoch. Dovezieme
                      vás aj do okolitých obcí.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> BANSKÁ BYSTRICA */}
        {slug === 'bratislava-banska-bystrica' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Banskej Bystrice</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Komfort, batožina zdarma</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      IC vlaky z Bratislavy cez Zvolen. Pohodlné spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~3 hod</p>
                      <p>Cena: od 14€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a> a <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">RegioJet</a> z AS Mlynské Nivy. Časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: {formatDuration(route.duration_min)}</p>
                      <p>Cena: od 9€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Banskej Bystrice?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo do centra alebo na konkrétnu adresu</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre rodiny a skupiny</li>
                    <li>• Možnosť zastávky vo Zvolene</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Banskej Bystrici</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">SNP námestie</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické centrum mesta s hodinovou vežou, radnicou
                      a Mariánskym stĺpom. Srdce Banskej Bystrice.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Múzeum SNP</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Významné múzeum venované Slovenskému národnému povstaniu.
                      Architektúra a expozície svetového formátu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Urpín</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Symbolický vrch nad mestom s krížovou cestou.
                      Nádherné výhľady na Banskú Bystricu a okolie.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Staré Hory</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Pútnické miesto neďaleko mesta. Bazilika Panny Márie
                      a pokojná atmosféra Veľkej Fatry.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mimo špičky je cesta najrýchlejšia. Cez R1
                      sa vyhnete kolónam na starej ceste.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez D1, R1 a Zvolen. Moderná
                      rýchlostná cesta po väčšine trasy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zvolen</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Susedné mesto len 20 km. Zámok a historické
                      centrum. Možnosť zastávky na trase.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Donovaly</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Lyžiarske stredisko len 30 km. Dovezieme vás
                      aj na hory v okolí Banskej Bystrice.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> HUMENNÉ */}
        {slug === 'bratislava-humenne' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Humenného</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Komfort na dlhej ceste</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      IC vlaky cez Košice s prestupom. Dlhá trasa.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~6-7 hod</p>
                      <p>Cena: od 22€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Menej časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~5h 30min</p>
                      <p>Cena: od 16€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Humenného?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu bez prestupovania</li>
                    <li>• Pohodlie na dlhej ceste</li>
                    <li>• Ideálne pre rodiny a skupiny</li>
                    <li>• Možnosť zastávky v Prešove alebo Košiciach</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Humennom</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vihorlatské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum v renesančnom kaštieli rodiny Drughetovcov.
                      Expozície histórie a prírody regiónu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Skanzen</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum ľudovej architektúry v prírode. Jedinečná
                      kolekcia drevených cerkví a ľudových stavieb.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vihorlat</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Pohorie s nádhernými turistickými trasami.
                      Morské oko a vulkanická príroda.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Andy Warhol múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V neďalekom Medzilaborci múzeum slávneho umelca
                      s rodinnými koreňmi v regióne.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Odporúčame ranný štart. Dlhá trasa vyžaduje
                      dostatok času na pohodlnú jazdu.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez D1 na Prešov a ďalej na východ.
                      Moderná diaľnica po väčšinu trasy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Snina</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Brána do Polonín len 20 km od Humenného.
                      Dovezieme vás aj do tohto regiónu.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Medzilaborce</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Rodisko Andy Warhola len 30 km. Múzeum a
                      rusínska kultúra.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> MICHALOVCE */}
        {slug === 'bratislava-michalovce' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Michaloviec</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Komfort, bez prestupovania</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      IC vlaky cez Košice s prestupom. Dlhá trasa.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~6 hod</p>
                      <p>Cena: od 20€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Obmedzené spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~5h 30min</p>
                      <p>Cena: od 15€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Michaloviec?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu bez prestupovania</li>
                    <li>• Pohodlie na dlhej ceste cez celé Slovensko</li>
                    <li>• Ideálne pre rodiny a skupiny</li>
                    <li>• Možnosť zastávky v Košiciach</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Michalovciach</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zemplínska šírava</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      "Slovenské more" - obľúbená rekreačná oblasť
                      s plážami, kúpaliskom a vodným športom.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Zemplínske múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum v pôvodnom kaštieli s expozíciami
                      histórie a etnografie Zemplína.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Viniansky hrad</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Zrúcanina hradu v blízkej obci Vinné.
                      Krásne výhľady na Zemplínsku šíravu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Tokajská vínna cesta</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Región Tokaj je len pár km. Ochutnávky
                      svetoznámeho tokajského vína.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Ranný štart je ideálny. V lete doprava
                      pri Šírave môže byť hustejšia.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez D1 na Košice a ďalej
                      smerom na juhovýchod Slovenska.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trebišov</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Okresné mesto len 20 km. Kaštieľ a
                      vinársky región. Možnosť zastávky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Sobrance</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Kúpeľné mesto pri hraniciach s Ukrajinou.
                      Dovezieme vás aj sem.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> SPIŠSKÁ NOVÁ VES */}
        {slug === 'bratislava-spisska-nova-ves' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Spišskej Novej Vsi</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Brána do Slovenského raja</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      IC vlaky z Bratislavy. Priame spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~4h 30min</p>
                      <p>Cena: od 18€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Menej časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~4h 15min</p>
                      <p>Cena: od 14€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Spišskej Novej Vsi?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo k vstupu do Slovenského raja</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre turistov s výbavou</li>
                    <li>• Možnosť zastávky v Poprade</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Spišskej Novej Vsi</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Slovenský raj</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Národný park s nádhernými tiesňavami, vodopádmi
                      a rebríkmi. Suchá Belá, Prielom Hornádu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Spišský hrad</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      UNESCO pamiatka len 20 km od mesta. Najväčší
                      hradný komplex v strednej Európe.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Radničné námestie</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické centrum s najvyššou kostolnou vežou
                      na Slovensku (87m). Maríánsky stĺp.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Levoča</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      UNESCO mesto len 15 km. Najvyšší gotický
                      oltár na svete od Majstra Pavla.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V sezóne (leto) odporúčame ranný štart.
                      Parkoviská pri Slov. raji sa rýchlo plnia.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez D1 cez Žilinu a Poprad.
                      Krásna trasa pod Tatrami.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Čingov</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Vstup do Slovenského raja len 10 km.
                      Dovezieme vás priamo k turistickým trasám.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Krompachy</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické banícke mesto len 15 km.
                      Dovezieme vás kamkoľvek v regióne Spiša.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> LEVICE */}
        {slug === 'bratislava-levice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Levíc</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Rýchle, pohodlné</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Regionálne vlaky cez Nové Zámky. Prestup.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: {formatDuration(route.duration_min)}</p>
                      <p>Cena: od 8€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Priame spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~1h 45min</p>
                      <p>Cena: od 7€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Levíc?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v Leviciach</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre pracovné cesty</li>
                    <li>• Možnosť zastávky v Nitre</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Leviciach</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Levický hrad</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Rozsiahla hradná zrúcanina s múzeom. Jedna
                      z najväčších hradných ruín na Slovensku.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Tekovské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum v historickej budove s expozíciami
                      archeológie a histórie Tekova.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Arborétum Tesárske Mlyňany</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Krásny park s tisíckami druhov stromov
                      a krov. Príjemný výlet v prírode.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vinárstva Tekova</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Región známy kvalitným vínom. Vínne pivnice
                      a degustácie v okolí Levíc.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Kratšia trasa - ideálna kedykoľvek.
                      Vyhnite sa špičke pri Bratislave.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez R1 rýchlostnú cestu.
                      Kvalitná infraštruktúra po celej trase.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Nové Zámky</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Okresné mesto len 30 km. Možnosť
                      kombinovanej cesty alebo zastávky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Želiezovce</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické mestečko v blízkosti. Kaštieľ
                      a park. Dovezieme vás kamkoľvek.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> LUČENEC */}
        {slug === 'bratislava-lucenec' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Lučenca</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Pohodlie, bez prestupovania</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Vlaky cez Zvolen s prestupom. Dlhšia trasa.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~3h 30min</p>
                      <p>Cena: od 12€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Priame spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: {formatDuration(route.duration_min)}</p>
                      <p>Cena: od 10€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Lučenca?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v Lučenci</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre pracovné cesty</li>
                    <li>• Možnosť zastávky vo Zvolene</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Lučenci</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Novohradské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum v historickej budove s bohatými zbierkami
                      regionálnej histórie a umenia.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Reduta</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Secesná budova divadla. Architektonická perla
                      mesta a centrum kultúrneho života.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Hrad Fiľakovo</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Zrúcanina hradu len 15 km od Lučenca.
                      Významná historická pamiatka regiónu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Kúpele Číž</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Kúpeľné mestečko v blízkosti. Liečivé termálne
                      pramene a wellness procedúry.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mimo špičky je cesta plynulá. Cesta cez R1
                      je rýchla a pohodlná.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez R1 a Zvolen. Kvalitná
                      rýchlostná cesta po väčšine trasy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Fiľakovo</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mestečko s hradom len 15 km. Dovezieme
                      vás aj na prehliadku hradu.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Maďarské hranice</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Hraničný prechod len pár km. Dovezieme vás
                      aj do Maďarska (Salgótarján).
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> RIMAVSKÁ SOBOTA */}
        {slug === 'bratislava-rimavska-sobota' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Rimavskej Soboty</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Pohodlie, bez prestupovania</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Vlaky cez Zvolen s prestupom. Dlhšia trasa.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~4 hod</p>
                      <p>Cena: od 14€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Obmedzené spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~3h 15min</p>
                      <p>Cena: od 12€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Rimavskej Soboty?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Bez zdĺhavého prestupovania</li>
                    <li>• Možnosť zastávky vo Zvolene</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Rimavskej Sobote</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Gemersko-malohontské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum s bohatými zbierkami histórie a prírody
                      regiónu Gemer-Malohont.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Gotický kostol</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historický gotický kostol v centre mesta.
                      Významná architektúra regiónu.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Muránska planina</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Národný park neďaleko mesta. Jedinečná príroda
                      a turistické trasy.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Hrad Muráň</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Zrúcanina hradu v nádhernom prostredí planiny.
                      Romantické miesto s históriou.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta je najplynulejšia mimo dopravnú špičku.
                      Odporúčame ranný alebo neskorší odchod.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez R1 a Zvolen. Potom
                      krajinou Gemera smerom na juh.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Hnúšťa</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mestečko len 20 km od R. Soboty.
                      Dovezieme vás aj sem.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Revúca</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické mesto len 20 km. Prvé
                      slovenské gymnázium. Dovezieme vás.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> GALANTA */}
        {slug === 'bratislava-galanta' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Galanty</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Rýchle, pohodlné</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Časté vlaky z Bratislavy hl. st. Priame spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~45 min</p>
                      <p>Cena: od 4€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~50 min</p>
                      <p>Cena: od 4€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Galanty?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v Galante</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre skupiny a rodiny</li>
                    <li>• Rýchla a pohodlná cesta</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Galante</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Neogotický kaštieľ</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Romantický neogotický kaštieľ rodiny Esterházyovcov.
                      Dnes vlastivedné múzeum.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Galéria Šamorín</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V blízkom Šamoríne galéria moderného umenia.
                      Zaujímavá kultúrna destinácia.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Termálne kúpalisko</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Obľúbené termálne kúpalisko s liečivou vodou.
                      Bazény a wellness služby.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vinohradníctvo</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Okolie Galanty je vinohradnícky región.
                      Degustácie a vínne pivnice.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Veľmi krátka trasa - ideálna kedykoľvek.
                      Vyhnite sa len rannej špičke.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po diaľnici D1 smerom na Trnavu.
                      Rýchla a pohodlná jazda.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Sereď</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Susedné mesto len 10 km. Kaštieľ a
                      Múzeum holokaustu. Dovezieme vás.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Šaľa</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Okresné mesto len 15 km ďalej.
                      Dovezieme vás kamkoľvek v regióne.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> DUNAJSKÁ STREDA */}
        {slug === 'bratislava-dunajska-streda' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Dunajskej Stredy</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Rýchle, pohodlné</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Regionálne vlaky z Bratislavy. Priame spojenie.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~1 hod</p>
                      <p>Cena: od 4€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~50 min</p>
                      <p>Cena: od 4€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Dunajskej Stredy?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v meste</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne na termálne kúpalisko</li>
                    <li>• Rýchla a pohodlná cesta</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Dunajskej Strede</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Thermalpark</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Moderný termálny aquapark s mnohými bazénmi,
                      tobogánmi a wellness službami.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Žitnoostrovské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum histórie a kultúry Žitného ostrova.
                      Zaujímavé expozície regionálnych tradícií.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vodný mlyn Jelka</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Jedinečný plávajúci vodný mlyn na Malom Dunaji.
                      Technická pamiatka a múzeum.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Malý Dunaj</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Ideálne miesto na splav a vodné športy.
                      Krásna príroda Žitného ostrova.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Krátka trasa - ideálna kedykoľvek. V lete
                      väčšia premávka k aquaparku.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie cez D1 a potom na juh.
                      Rýchla a pohodlná jazda.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Šamorín</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Mestečko na trase len 20 km od BA.
                      Možnosť zastávky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Gabčíkovo</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Vodné dielo len 20 km. Technická pamiatka
                      a turistická atrakcia.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> SENEC */}
        {slug === 'bratislava-senec' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Senca</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Rýchle, pohodlné</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Prímestské vlaky z Bratislavy hl. st. Veľmi časté.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~25 min</p>
                      <p>Cena: od 2€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Prímestské autobusy. Veľmi časté spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~35 min</p>
                      <p>Cena: od 2€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Senca?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu alebo k Slnečným jazerám</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Ideálne pre rodiny s deťmi a batožinou</li>
                    <li>• Najrýchlejšia možnosť prepravy</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Senci</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Slnečné jazerá</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Obľúbená rekreačná oblasť pri Bratislave.
                      Pláže, vodné športy a letné zábavné parky.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Aquapark Senec</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Celoročný aquapark s bazénmi, tobogánmi
                      a wellness službami.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Centrum mesta</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické centrum s kostolom a radnicou.
                      Príjemné námestie s kaviarňami.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Cyklotrasy</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Sieť cyklotrás v okolí. Ideálne podmienky
                      pre cyklistov v rovinatom teréne.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Veľmi krátka trasa - ideálna kedykoľvek.
                      V lete premávka k jazerám.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po diaľnici D1. Len 20 km
                      od centra Bratislavy.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Bernolákovo</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Susedná obec na trase. Golf resort
                      a príjemné prostredie.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Letisko</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Senec je blízko BA letiska. Ideálne
                      pre transfer z/na letisko.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> TOPOĽČANY */}
        {slug === 'bratislava-topolcany' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Topoľčian</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Pohodlie, flexibilita</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Vlaky cez Trnavu. Potrebný prestup.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~2 hod</p>
                      <p>Cena: od 7€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Priame spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~1h 30min</p>
                      <p>Cena: od 6€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Topoľčian?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu v Topoľčanoch</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Bez prestupovania a čakania</li>
                    <li>• Možnosť zastávky v Nitre</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Topoľčanoch</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Hrad Topoľčany</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Zrúcanina gotického hradu v blízkosti mesta.
                      Krásne výhľady na okolie.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Tribečské múzeum</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Múzeum histórie a prírody regiónu Ponitria.
                      Zaujímavé expozície.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Pohorie Tribeč</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Hornatá oblasť s turistickými trasami.
                      Príroda a zrúcaniny hradov.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vinárstva</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Okolie je známe vinárstvom. Vínne pivnice
                      a degustácie v regióne.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta je plynulá mimo dopravnú špičku.
                      Ideálne v dopoludňajších hodinách.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po D1 a R1 cez Trnavu.
                      Kvalitná rýchlostná cesta.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Partizánske</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Susedné mesto len 15 km. Dovezieme
                      vás aj do okolitých obcí.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Nitra</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Krajské mesto len 35 km. Možnosť
                      kombinovanej cesty.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BRATISLAVA -> ŠTÚROVO */}
        {slug === 'bratislava-sturovo' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Štúrova</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-3 sm:p-4 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Priama cesta bez prestupov. Cena {minPrice}-{maxPrice}€,
                      vyzdvihnutie kdekoľvek v Bratislave.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~{formatDuration(route.duration_min)}</p>
                      <p>Výhoda: Pohodlie, flexibilita</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Regionálne vlaky cez Nové Zámky. Prestup.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: {formatDuration(route.duration_min)}</p>
                      <p>Cena: od 8€</p>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">
                      Linky z AS Mlynské Nivy. Obmedzené spojenia.
                    </p>
                    <div className="text-xs text-foreground/60">
                      <p>Čas: ~2 hod</p>
                      <p>Cena: od 7€</p>
                    </div>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                    Prečo zvoliť taxi na cestu do Štúrova?
                  </h3>
                  <ul className="text-xs sm:text-sm text-foreground/70 space-y-1">
                    <li>• Priamo na vašu adresu alebo k termálu</li>
                    <li>• Vyzdvihnutie kdekoľvek v Bratislave</li>
                    <li>• Bez prestupovania a čakania</li>
                    <li>• Dovezieme vás aj do Maďarska (Ostrihom)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Štúrove</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Vadaš termálne kúpalisko</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Obľúbený termálny aquapark s bazénmi,
                      tobogánmi a wellness službami.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Ostrihom (HU)</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické mesto na druhej strane Dunaja.
                      Majestátna bazilika a staré mesto.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Most Márie Valérie</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historický most spájajúci Štúrovo s Ostrihomom.
                      Symbol priateľstva medzi národmi.
                    </p>
                  </Card>

                  <Card className="p-3 sm:p-4">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Dunajská príroda</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Krásna príroda pri Dunaji. Cyklotrasy
                      a príležitosti na rybolov.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Najlepší čas na cestu</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      V lete väčšia premávka k termálnemu kúpalisku.
                      Mimo sezóny je cesta pokojnejšia.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Trasa cesty</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Cesta vedie po R1 a potom smerom na juh
                      cez Nové Zámky.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Komárno</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Historické mesto len 30 km. Pevnosť
                      a krásne historické centrum.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">Maďarsko</h3>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      Hranice sú priamo v meste. Dovezieme vás
                      aj do Ostrihomu alebo Budapešti.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> BARDEJOV */}
        {slug === 'banska-bystrica-bardejov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Bardejova</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Bardejov je mesto UNESCO s jedinečným gotickým námestím. Cesta z Banskej Bystrice
                  vedie cez malebné krajiny východného Slovenska.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">Priama cesta bez prestupov, vyzdvihnutie kdekoľvek.</p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">15-25€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">5-6 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestupy:</span>
                        <span className="font-semibold text-orange-600">1-2×</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZSSK</a>: Prestup v Košiciach alebo Prešove.
                    </p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 16€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 50min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Spoje:</span>
                        <span className="font-semibold">denne</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.flixbus.sk/autobusove-spoje/banska-bystrica-bardejov" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a>: WiFi, zásuvky, WC na palube.
                    </p>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground mb-2">Prečo zvoliť taxi do Bardejova?</h3>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Priama cesta bez prestupovania - úspora času</li>
                    <li>• Možnosť zastávky v Košiciach alebo Prešove</li>
                    <li>• Ideálne pre skupiny a rodiny s deťmi</li>
                    <li>• Dovezieme vás až na námestie UNESCO</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Bardejove (UNESCO)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Radničné námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Centrum mesta s 46 meštianskymi domami na gotických parcelách. Najkrajšie námestie na Slovensku.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Radničné+námestie+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Bazilika sv. Egídia</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Gotický chrám zo 14. storočia s 11 vzácnymi neskorogotickými krídlovými oltármi.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bazilika+sv.+Egídia+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestská radnica</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Prvá renesančná stavba na Slovensku (1505-1511). Unikátna pamiatka stredoeurópskej architektúry.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestská+radnica+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Židovské suburbium (UNESCO)</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Unikátny komplex synagógy a rituálnych kúpeľov z 18. storočia zapísaný v UNESCO.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Židovské+suburbium+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestské hradby a bašty</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Najzachovanejší stredoveký obranný systém na Slovensku vrátane Katovho domu.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestské+hradby+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Bardejovské kúpele a skanzen</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Najstarší skanzen na Slovensku (1965) s 28 ľudovými stavbami zo Šariša.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bardejovské+kúpele+skanzen" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-foreground mb-2">💡 Tip: Drevený kostol v Hervartove</h3>
                  <p className="text-sm text-foreground/70">
                    Len 10 km od Bardejova sa nachádza najstarší drevený kostol na Slovensku (15. stor.), tiež zapísaný v UNESCO.
                    <a href="https://www.google.com/maps/search/?api=1&query=Drevený+kostol+Hervartov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Zobraziť na mape →</a>
                  </p>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Trasa cesty</h3>
                    <p className="text-sm text-foreground/70">
                      Cesta vedie cez Zvolen, Brezno, Rožňavu a Prešov.
                      Malebná krajina cez Slovenský raj a Šarišskú vrchovinu.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Najlepší čas na návštevu</h3>
                    <p className="text-sm text-foreground/70">
                      Bardejov je krásny celoročne. V lete kultúrne podujatia,
                      v zime vianočné trhy na námestí UNESCO.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Kombinácia s Prešovom</h3>
                    <p className="text-sm text-foreground/70">
                      Cestou môžete navštíviť Prešov (40 km od Bardejova).
                      Soľný banský revír a historické centrum.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Ubytovanie</h3>
                    <p className="text-sm text-foreground/70">
                      V Bardejovských kúpeľoch aj v centre mesta.
                      Kúpeľné hotely s wellness službami.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> DOLNÝ KUBÍN */}
        {slug === 'banska-bystrica-dolny-kubin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Dolného Kubína</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Dolný Kubín je centrom Oravy s bohatou históriou a blízkym prístupom k Oravskému hradu.
                  Cesta z Banskej Bystrice vedie cez krásnu oravskú krajinu.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">Priama cesta bez prestupov, vyzdvihnutie kdekoľvek.</p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">6-12€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 20min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestupy:</span>
                        <span className="font-semibold text-orange-600">2× (Vrútky, Kraľovany)</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZSSK</a>: Prestup vo Vrútkach a Kraľovanoch.
                    </p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">9-14€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 17min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Spoje:</span>
                        <span className="font-semibold">denne</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">FlixBus</a>: WiFi, zásuvky, WC na palube.
                    </p>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground mb-2">Prečo zvoliť taxi na Oravu?</h3>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Priama cesta bez prestupovania - úspora času</li>
                    <li>• Možnosť zastávky pri Oravskom hrade</li>
                    <li>• Ideálne pre skupiny a rodiny s deťmi</li>
                    <li>• Zavezieme vás priamo k lyžiarskemu stredisku Kubínska hoľa</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Dolnom Kubíne a okolí</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Oravský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Jeden z najkrajších hradov na Slovensku, tyčiaci sa 112 m nad riekou Orava. Len 10 km od Dolného Kubína.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Oravský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Oravská galéria</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Sídli v historickom Župnom dome zo 17. stor. Expozície starého umenia, ikon a slovenského výtvarného umenia.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Oravská+galéria+Dolný+Kubín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum P. O. Hviezdoslava</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Najstaršie literárne múzeum na Slovensku (1954). Život a dielo veľkého slovenského básnika.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Oravské+múzeum+Dolný+Kubín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kubínska hoľa</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Obľúbené lyžiarske stredisko v Oravskej Magure. V lete turistické chodníky s výhľadmi na Tatry.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kubínska+hoľa+lyžiarske+stredisko" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Aquapark AquaRelax</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Moderný aquapark v centre mesta s bazénmi, tobogánmi a wellness zónou.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Aquapark+AquaRelax+Dolný+Kubín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum oravskej dediny (Zuberec)</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Jeden z najnavštevovanejších skanzenov na Slovensku v prostredí Roháčov. 28 ľudových stavieb.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+oravskej+dediny+Zuberec" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-foreground mb-2">💡 Tip: Drevený kostol v Leštinách (UNESCO)</h3>
                  <p className="text-sm text-foreground/70">
                    Len 15 km od Dolného Kubína sa nachádza drevený artikulárny evanjelický kostol z roku 1688, zapísaný v UNESCO.
                    <a href="https://www.google.com/maps/search/?api=1&query=Drevený+kostol+Leštiny" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Zobraziť na mape →</a>
                  </p>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Trasa cesty</h3>
                    <p className="text-sm text-foreground/70">
                      Cesta vedie cez Zvolen, Martin a Kraľovany.
                      Prekrásna krajina cez Turiec a pozdĺž rieky Orava.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Najlepší čas na návštevu</h3>
                    <p className="text-sm text-foreground/70">
                      V zime lyžovačka na Kubínskej holi, v lete turistika v Roháčoch
                      a návšteva Oravského hradu.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Zastávka pri Oravskom hrade</h3>
                    <p className="text-sm text-foreground/70">
                      Cestou môžeme urobiť zastávku pri Oravskom Podzámku.
                      Prehliadka hradu trvá cca 1-2 hodiny.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Ubytovanie</h3>
                    <p className="text-sm text-foreground/70">
                      V Dolnom Kubíne aj v lyžiarskom stredisku.
                      Penzióny a hotely v centre mesta aj na Kubínskej.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> DUNAJSKÁ STREDA */}
        {slug === 'banska-bystrica-dunajska-streda' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Dunajskej Stredy</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Dunajská Streda je srdcom Žitného ostrova s termálnym kúpaliskom svetového formátu.
                  Ideálna destinácia pre wellness pobyt a relax.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">Priama cesta bez prestupov, vyzdvihnutie kdekoľvek.</p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">12-18€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">4-5 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestupy:</span>
                        <span className="font-semibold text-orange-600">2× (Bratislava)</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZSSK</a>: Prestup v Bratislave, potom regionálny vlak.
                    </p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">12-20€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-4 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Spoje:</span>
                        <span className="font-semibold">obmedzené</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Slovak Lines</a>: Väčšinou s prestupom v Bratislave.
                    </p>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground mb-2">Prečo zvoliť taxi do Dunajskej Stredy?</h3>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Priama cesta bez prestupovania - dovezieme vás až ku kúpalisku</li>
                    <li>• Ideálne pre rodiny s deťmi a batožinou</li>
                    <li>• Možnosť zastávky v Bratislave alebo Trnave</li>
                    <li>• Odvoz priamo od vchodu do Thermalparku</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Dunajskej Strede a okolí</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Thermalpark Dunajská Streda</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Jeden z najväčších termálnych aquaparkov na Slovensku. 10 bazénov, tobogány, wellness, termálna voda 26-39°C.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Thermalpark+Dunajská+Streda" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vodný mlyn Jelka</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Historický vodný mlyn na brehu Malého Dunaja z roku 1894. Unikátna technická pamiatka regiónu.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vodný+mlyn+Jelka" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zoo Malkia Park</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Rodinná zoo pri Slovakia Ring s exotickými zvieratami. Ideálne pre rodiny s deťmi.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zoo+Malkia+Park" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Slovakia Ring</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Medzinárodný automobilový okruh. Jazdy na supersportoch, kartingové centrum a motorsport eventy.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Slovakia+Ring" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Splav Malého Dunaja</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Romantický splav na kanoe alebo raftoch po Malom Dunaji. Obľúbená letná aktivita v regióne.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Malý+Dunaj+splav" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Žitnoostrovné múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Regionálne múzeum v Dunajskej Strede dokumentujúce históriu a tradície Žitného ostrova.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Žitnoostrovné+múzeum+Dunajská+Streda" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-foreground mb-2">💡 Tip: Golfové ihriská</h3>
                  <p className="text-sm text-foreground/70">
                    V okolí Dunajskej Stredy nájdete kvalitné golfové ihriská - Golf Welten v Báči a Golf Jelka.
                    <a href="https://www.google.com/maps/search/?api=1&query=Golf+Welten+Báč" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Zobraziť na mape →</a>
                  </p>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Trasa cesty</h3>
                    <p className="text-sm text-foreground/70">
                      Cesta vedie cez Zvolen, Nitru alebo priamo cez Bratislavu.
                      Rôzne možnosti podľa preferovanej trasy.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Najlepší čas na návštevu</h3>
                    <p className="text-sm text-foreground/70">
                      Thermalpark je otvorený celoročne. V lete vonkajšie bazény,
                      v zime wellness a vnútorná časť.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Kombinácia s Bratislavou</h3>
                    <p className="text-sm text-foreground/70">
                      Cestou môžete navštíviť Bratislavu (50 km od DS).
                      Ideálne ako denný výlet z hlavného mesta.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Ubytovanie</h3>
                    <p className="text-sm text-foreground/70">
                      Hotel Thermalpark priamo pri kúpalisku.
                      Penzióny a apartmány v centre mesta.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> GALANTA */}
        {slug === 'banska-bystrica-galanta' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Galanty</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Galanta je mesto s bohatou históriou a nádherným neogotickým kaštieľom rodiny Esterházy.
                  Známe aj vďaka slávnym Galantským tancom Zoltána Kodálya.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow text-foreground px-2 py-0.5 rounded-full font-medium">
                        Odporúčané
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">Priama cesta bez prestupov, vyzdvihnutie kdekoľvek.</p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-4 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestupy:</span>
                        <span className="font-semibold text-orange-600">1-2×</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ZSSK</a>: Prestup v Leopoldove alebo Bratislave.
                    </p>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-16€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-4 hod</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Spoje:</span>
                        <span className="font-semibold">obmedzené</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 mt-3">
                      <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Slovak Lines</a>: Menej časté priame spoje.
                    </p>
                  </Card>
                </div>

                <div className="bg-white rounded-lg p-4 border border-foreground/10">
                  <h3 className="font-bold text-foreground mb-2">Prečo zvoliť taxi do Galanty?</h3>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Priama cesta bez prestupovania</li>
                    <li>• Možnosť zastávky v Nitre alebo Trnave</li>
                    <li>• Ideálne pre pracovné cesty a obchodné stretnutia</li>
                    <li>• Odvoz priamo ku kaštieľu alebo kdekoľvek v meste</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Galante a okolí</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Neogotický kaštieľ Esterházyovcov</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Nádherný kaštieľ z roku 1633 s neogotickou prestavbou z 1861. Múzeum, galéria a pamätné izby.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Neogotický+kaštieľ+Galanta" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestský park</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Historický park okolo kaštieľa so vzácnymi drevinami - duby, tisy, ginko, platany.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestský+park+Galanta" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Pamätná izba Zoltána Kodálya</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Venovaná slávnemu skladateľovi, autorovi Galantských tancov. V severnom krídle kaštieľa.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Pamätná+izba+Kodálya+Galanta" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Pamätná izba Karola Duchoňa</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Expozícia venovaná populárnemu slovenskému spevákom, rodákovi z Galanty.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Neogotický+kaštieľ+Galanta" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Termálne kúpalisko Vincov les</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Obľúbené termálne kúpalisko v blízkosti Sládkovičova. Ideálne na letné osvieženie.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vincov+les+kúpalisko" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vodný mlyn Tomášikovo</h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      Funkčný vodný mlyn na Malom Dunaji. Technická pamiatka s ukážkami mletia.
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vodný+mlyn+Tomášikovo" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-foreground mb-2">💡 Tip: Galantské trhy</h3>
                  <p className="text-sm text-foreground/70">
                    V auguste sa v Galante konajú tradičné Galantské trhy - najväčšie jarmočné podujatie v regióne.
                  </p>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-foreground/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  Praktické informácie pre cestu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Trasa cesty</h3>
                    <p className="text-sm text-foreground/70">
                      Cesta vedie cez Zvolen a Nitru alebo cez Bratislavu.
                      Vzdialenosť približne 180 km.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Najlepší čas na návštevu</h3>
                    <p className="text-sm text-foreground/70">
                      Kaštieľ je otvorený celoročne. V auguste Galantské trhy,
                      v decembri vianočné podujatia.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Kombinácia s okolím</h3>
                    <p className="text-sm text-foreground/70">
                      Blízko sú Trnava (25 km), Dunajská Streda (20 km)
                      a Sereď (15 km).
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold text-foreground mb-2">Ubytovanie</h3>
                    <p className="text-sm text-foreground/70">
                      Hotely a penzióny v centre mesta.
                      Blízko sú aj kúpeľné hotely v Dunajskej Strede.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> BRATISLAVA */}
        {slug === 'banska-bystrica-bratislava' && (
          <>
            {/* Porovnanie alternatív prepravy */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Bratislavy</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Plánujete cestu do hlavného mesta? Či už ide o služobnú cestu, návštevu letiska
                  alebo kultúrny výlet, máte na výber z viacerých možností dopravy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Taxi */}
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Vyzdvihnutie kdekoľvek v Banskej Bystrici. Dovoz priamo na letisko,
                        do centra alebo na konkrétnu adresu v Bratislave.
                      </p>
                    </div>
                  </Card>

                  {/* Vlak */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-18€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 36min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.zssk.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">ZSSK:</a> Priame rýchliky R 8xx,
                        dvojhodinový takt celodenný.
                      </p>
                    </div>
                  </Card>

                  {/* Autobus */}
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-25€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3-4h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> od 22€.
                        <a href="https://www.slovaklines.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline ml-1">Slovak Lines:</a> od 9,85€.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Info box */}
                <div className="bg-white rounded-lg p-4 sm:p-5 border">
                  <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Kedy sa oplatí taxi z Banskej Bystrice?</h4>
                  <ul className="space-y-2 sm:space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Potrebujete sa dostať na letisko BTS - taxi vás vyzdvihne priamo</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Cestujete s rodinou - cena na osobu vychádza porovnateľne</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Máte veľa batožiny alebo špeciálne vybavenie</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="text-primary-yellow mt-0.5 text-lg">✓</span>
                      <span>Potrebujete flexibilný odchod - nie ste viazaní na cestovný poriadok</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Atrakcie v Bratislave */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Dominantný symbol mesta s výhľadom na Dunaj a okolie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší a najstarší chrám v Bratislave s katakombami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+svätého+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Posledná zachovaná mestská brána, stará viac ako 700 rokov.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Most SNP s UFO vyhliadkou</h3>
                    <p className="text-sm text-foreground/70 mb-3">Moderná dominanta s reštauráciou a panoramatickým výhľadom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=UFO+vyhliadka+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrad Devín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hradné ruiny nad sútokom Dunaja a Moravy s výhľadom do Rakúska.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Devín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> ZVOLEN */}
        {slug === 'banska-bystrica-zvolen' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Zvolena</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Zvolen je len 20 km od Banskej Bystrice - ideálny na krátky výlet za históriou
                  alebo návštevu slávneho Zvolenského zámku.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">1-3€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">16-25min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Frekvencia:</span>
                        <span className="font-semibold text-xs">každých 30min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Najhustejšie využívaná jednokoľajná trať na Slovensku.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">1-2€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">17-20min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Frekvencia:</span>
                        <span className="font-semibold text-xs">IDS BBSK</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Linka 101 - vysoká frekvencia regionálnych spojov.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Atrakcie vo Zvolene */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť vo Zvolene</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zvolenský zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Stredoveký zámok z rokov 1360-1382, dnes sídlo Slovenskej národnej galérie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zvolenský+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Pustý hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Ruiny hradu z 13. storočia nad sútokom Hronu a Slatiny - najrozsiahlejšia hradná zrúcanina na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Pustý+hrad+Zvolen" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Arborétum Borová hora</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedna z najväčších zbierok ruží na Slovensku s rozáriem a alpínom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Arborétum+Borová+hora+Zvolen" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> KOŠICE */}
        {slug === 'banska-bystrica-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Košíc</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Cesta do metropoly východu - Košice sú druhé najväčšie mesto Slovenska s bohatou
                  históriou a kultúrou.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-20€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">4-5h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Margecany</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        8 párov vlakov denne na linke Zvolen-Košice.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">10-14€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 13min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> od 13€, viaceré spoje denne.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Atrakcie v Košiciach */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku, najvýchodnejšia gotická katedrála v Európe.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+svätej+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Spievajúca fontána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Legendárna fontána so zvonkohrou - symbol mesta Košice.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Spievajúca+fontána+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrnčiarska ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Ulička remesiel s tradičnými remeselníkmi a kaviarňami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrnčiarska+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia zoologická záhrada na Slovensku s rozlohou 288 ha.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Jasovská jaskyňa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Prvá sprístupnená jaskyňa na Slovensku (1846), UNESCO pamiatka.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jasovská+jaskyňa" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> ŽILINA */}
        {slug === 'banska-bystrica-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Žiliny</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Žilina je bránou do Malej Fatry a významné priemyselné centrum. Cesta vedie
                  cez malebné pohoria stredného Slovenska.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">4,50-10€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 48min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Priamy spoj R 9xx od GVD 2024/2025.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">5,48-6€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1-1,5h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> od 5,48€, viaceré spoje denne.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Atrakcie v Žiline */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historický vodný hrad z 13. storočia s expozíciou drôtených výrobkov.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Pamiatková veža s vyhliadkovou plošinou a panoramatickým výhľadom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s kaviarňami, obchodmi a gotickými podlubiami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Rozhľadňa na Špicáku</h3>
                    <p className="text-sm text-foreground/70 mb-3">Výhľad na 4 okolité hrady a panorámu Malej Fatry.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rozhľadňa+Špicák+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Katakomby</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotické podzemie pod námestím s unikátnou atmosférou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katakomby+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> POPRAD */}
        {slug === 'banska-bystrica-poprad' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Popradu</span>
                </h2>

                <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6">
                  Poprad je brána do Vysokých Tatier - ideálny cieľ pre milovníkov hôr, lyžovania
                  a prírodných krás.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                          <Star className="h-4 w-4 text-primary-yellow fill-primary-yellow" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Ideálne pre lyžiarov - odvoz priamo do strediska.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">8-15€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2-3h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Margecany</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Zr vlaky BB-Margecany, 4-6 spojov denne.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">15-20€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 45min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Pohodlie:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-green-500 fill-green-500" />
                          <Star className="h-4 w-4 text-gray-300" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> od 20€, najrýchlejšia možnosť.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Atrakcie v Poprade a okolí */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Poprade a Tatrách</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">AquaCity Poprad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný park nad geotermálnym prameňom s 13 bazénmi a wellness.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=AquaCity+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Lomnický štít</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najvyšší štít Vysokých Tatier dostupný lanovkou s observatóriom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Lomnický+štít" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Popradské pleso</h3>
                    <p className="text-sm text-foreground/70 mb-3">Ikonická lokalita pre turistiku vo Vysokých Tatrách.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Popradské+pleso" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Belianska jaskyňa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jediná sprístupnená jaskyňa vo Vysokých Tatrách od roku 1882.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Belianska+jaskyňa" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Štrbské pleso</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najznámejšie tatranské pleso s lyžiarskym strediskom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Štrbské+pleso" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> LUČENEC */}
        {slug === 'banska-bystrica-lucenec' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Lučenca</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1,5-2h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">cez Zvolen</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 11,98€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1-1,5h</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Lučenci</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Synagóga Lučenec</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší multikultúrny stánok na Slovensku z rokov 1924-1925.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Lučenec" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zámok Halič</h3>
                    <p className="text-sm text-foreground/70 mb-3">Rozprávkový zámok z roku 1612 s výhľadom na 15 dedín.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zámok+Halič" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vodná nádrž Ružiná</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedna z najteplejších priehrad na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vodná+nádrž+Ružiná" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrad Fiľakovo</h3>
                    <p className="text-sm text-foreground/70 mb-3">Stredoveký hrad nad mestom, prvá zmienka z roku 1242.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Fiľakovo" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> RIMAVSKÁ SOBOTA */}
        {slug === 'banska-bystrica-rimavska-sobota' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Rimavskej Soboty</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2-3h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Zvolen, Jesenské</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 11€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2-3h</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Rimavskej Sobote</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kurinec - Zelená voda</h3>
                    <p className="text-sm text-foreground/70 mb-3">Rekreačná oblasť 4 km od mesta s plážou a vodným športom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kurinec+Zelená+voda" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Drienčanský kras</h3>
                    <p className="text-sm text-foreground/70 mb-3">Malá a Veľká drienčanská jaskyňa, 15 km od mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Drienčanský+kras" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Gemersko-malohontské múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múmia egyptskej ženy z 26. dynastie - unikát na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Gemersko-malohontské+múzeum+Rimavská+Sobota" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hvezdáreň s Astroparkom</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedinečný astropark na okraji mesta pre milovníkov vesmíru.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hvezdáreň+Rimavská+Sobota" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> LIPTOVSKÝ MIKULÁŠ */}
        {slug === 'banska-bystrica-liptovsky-mikulas' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Liptovského Mikuláša</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Ideálne pre Tatralandiu - odvoz priamo k aquaparku.
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1,5-2h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Vrútky</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1-2h</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Liptovskom Mikuláši</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Aquapark Tatralandia</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší vodný areál v strednej Európe - 14 bazénov, 28 šmykľaviek.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Aquapark+Tatralandia" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Demänovská jaskyňa slobody</h3>
                    <p className="text-sm text-foreground/70 mb-3">Celoročná jaskynná atrakcia s krásnymi stalaktitmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Demänovská+jaskyňa+slobody" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Liptovská Mara</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodná nádrž z roku 1975, ideálna na vodné športy a relaxáciu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Liptovská+Mara" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Galéria ILUSIA</h3>
                    <p className="text-sm text-foreground/70 mb-3">Optické ilúzie a 3D maľby - zábava pre celú rodinu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Galéria+ILUSIA+Liptovský+Mikuláš" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> RUŽOMBEROK */}
        {slug === 'banska-bystrica-ruzomberok' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Ružomberka</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">5-12€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2h 06min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Vrútky</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 5,48€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">55min - 1h 14min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> 3 priame spoje denne.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Ružomberku</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vlkolínec - UNESCO</h3>
                    <p className="text-sm text-foreground/70 mb-3">Podhorská osada zapísaná v UNESCO z 14. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vlkolínec" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">SKI PARK Ružomberok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Lyžiarske stredisko na Veľkej Fatre, 545-1209 m.n.m.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=SKI+PARK+Ružomberok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Galéria Ľudovíta Fullu</h3>
                    <p className="text-sm text-foreground/70 mb-3">Súčasť Slovenskej národnej galérie s dielami významného maliara.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Galéria+Ľudovíta+Fullu+Ružomberok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zrúcanina hradu Likavka</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historický hrad nad obcou Likavka s výhľadmi na okolie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Likavka" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> MARTIN */}
        {slug === 'banska-bystrica-martin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Martina</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1,5-2h</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Vrútky</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 3€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1-1,5h</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.regiojet.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">RegioJet:</a> najlacnejšia cena od 3€.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Martine</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum slovenskej dediny</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia etnografická výstava v prírode na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+slovenskej+dediny+Martin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Národný cintorín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Miesto posledného odpočinku významných slovenských osobností.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Národný+cintorín+Martin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Winter park Martinky</h3>
                    <p className="text-sm text-foreground/70 mb-3">Lyžiarske stredisko v okolí Martina s modernými vylekmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Winter+park+Martinky" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Via ferrata Martinské hole</h3>
                    <p className="text-sm text-foreground/70 mb-3">Adrenalínový zážitok pre milovníkov horskej turistiky.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Via+ferrata+Martinské+hole" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> PRIEVIDZA */}
        {slug === 'banska-bystrica-prievidza' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Prievidze</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        Ideálne pre Bojnický zámok - odvoz priamo k bráne.
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">4-10€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2h 57min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Turč. Teplice</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 6,98€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 35min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> priamy spoj o 10:45.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Prievidzi a okolí</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Bojnický zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Rozprávkový zámok s najväčšou ZOO na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bojnický+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">ZOO Bojnice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia a najstaršia ZOO na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Bojnice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Prepoštská jaskyňa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická jaskyňa v Hornonitrianskej kotline v Bojniciach.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Prepoštská+jaskyňa+Bojnice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kúpele Bojnice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Liečivé termálne pramene a wellness procedúry.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kúpele+Bojnice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> TRENČÍN */}
        {slug === 'banska-bystrica-trencin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Trenčína</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">8-17€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 26min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Vrútky</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 8,98€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2h 50min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> jeden spoj denne.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Trenčíne</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Trenčiansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Tretí najväčší hrad na Slovensku s legendou o Studni lásky.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Trenčiansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Rímsky nápis z roku 179 n.l.</h3>
                    <p className="text-sm text-foreground/70 mb-3">Dôkaz prítomnosti Rimanov v strednej Európe - unikát.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rímsky+nápis+Trenčín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestská veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">32 m vysoká vstupná brána s výhľadom na hrad a okolie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestská+veža+Trenčín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Trenčianske Teplice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Kúpeľné mesto v blízkosti Trenčína s termálnymi prameňmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Trenčianske+Teplice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> NITRA */}
        {slug === 'banska-bystrica-nitra' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Nitry</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">7-17€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">5h 18min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Levice, Šurany</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 11,69€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">1h 25min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> priamy spoj, každé 4h.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Nitre</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Nitriansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstarší hrad na Slovensku z 11. storočia - symbol mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nitriansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Dražovský kostolík</h3>
                    <p className="text-sm text-foreground/70 mb-3">Románsky kostol z 11.-12. storočia - najfotogenickejšie miesto.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dražovský+kostolík" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zoborský kláštor</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstarší kláštor na Slovensku z rokov 850-880.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zoborský+kláštor+Nitra" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Synagóga Nitra</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedna z najstarších a najkrajších synagóg na Slovensku z roku 1908.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Nitra" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> TRNAVA */}
        {slug === 'banska-bystrica-trnava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Trnavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">12-24€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 32min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Vrútky</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 15,59€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">2h 31min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> 6 spojov týždenne, priamy.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Trnave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestská veža Trnava</h3>
                    <p className="text-sm text-foreground/70 mb-3">57 m vysoká veža z roku 1574 s výhľadom na mesto (143 schodov).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestská+veža+Trnava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestské hradby</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najzachovalejšie tehlové opevnenie v Európe z 13. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestské+hradby+Trnava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Bazilika sv. Mikuláša</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mariánske pútnické miesto s orgánom z 18. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bazilika+sv.+Mikuláša+Trnava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Katedrála sv. Jána Krstiteľa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší a prvý barokový kostol na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+sv.+Jána+Krstiteľa+Trnava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> PREŠOV */}
        {slug === 'banska-bystrica-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold text-green-600 text-base">{minPrice}-{maxPrice}€*</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">{formatDuration(route.duration_min)}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">13-24€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">6h 01min</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Prestup:</span>
                        <span className="font-semibold text-xs">Kysak/Vrútky</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Cena:</span>
                        <span className="font-semibold">od 18,94€</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-foreground/60">Čas cesty:</span>
                        <span className="font-semibold">3h 20min</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-foreground/70">
                        <a href="https://www.flixbus.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">FlixBus:</a> dva priame spoje denne.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo navštíviť v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Šarišský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najväčších hradov na Slovensku nad obcou Veľký Šariš.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Šarišský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Solivar - UNESCO</h3>
                    <p className="text-sm text-foreground/70 mb-3">Technická pamiatka UNESCO na čerpanie a varenie soli z 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Konkatedrála sv. Mikuláša</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najvýznamnejšia cirkevná stavba v Prešove.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Konkatedrála+sv.+Mikuláša+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Aquapark Delňa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Celoročný aquapark s tobogánmi a vírivkami (1500 m²).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Aquapark+Delňa+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> BRATISLAVA */}
        {slug === 'kosice-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 18,70-25€</p>
                      <p><span className="font-semibold">Čas:</span> 4h 53min - 5h 26min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (16 expresov denne)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 22€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 5h 55min - 7h 20min</p>
                      <p><span className="font-semibold">Spoj:</span> Prvý 2:25, posledný 22:00</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta s Múzeom histórie, výhľad zo 47m korunovacej veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný chrám z 15. storočia s kryptami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrad Devín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hradné ruiny na sútoku Dunaja a Moravy (vstup 4-8€).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Devín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">UFO vyhliadková veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadka z výšky 95m na Moste SNP s reštauráciou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=UFO+vyhliadka+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Posledná zo štyroch mestských brán, 700-ročná veža.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> PREŠOV */}
        {slug === 'kosice-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 1-4€</p>
                      <p><span className="font-semibold">Čas:</span> 28-42 min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (každú hodinu)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 6,50€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 25 min</p>
                      <p><span className="font-semibold">Spoj:</span> 7 spojov denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Prešovský Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne objekty na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najcennejšia pamiatka, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia kalvária v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Šarišská galéria</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia galéria na východe Slovenska.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Šarišská+galéria+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> POPRAD */}
        {slug === 'kosice-poprad' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Popradu</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 3,30-10€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 58min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (každú hodinu)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 12€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> 4 spoje denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Poprade a Tatrách</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">AquaCity Poprad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší vodný park s 13 bazénmi nad geotermálnym prameňom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=AquaCity+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Spišská Sobota</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická mestská rezervácia s múzeom a galériou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Spišská+Sobota" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Tatranské elektrické vlaky</h3>
                    <p className="text-sm text-foreground/70 mb-3">Kométa a Trojča do Tatier - jedinečný zážitok.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Tatranská+električka+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Slovenský raj</h3>
                    <p className="text-sm text-foreground/70 mb-3">Prístup k tiesňavám, vodopádom a jaskyniam.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Slovenský+raj" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vysoké Tatry</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najmenšie veľhory sveta - Štrbské pleso, Hrebienok.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vysoké+Tatry" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> MICHALOVCE */}
        {slug === 'kosice-michalovce' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Michaloviec</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 3,70-7,40€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 21min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (každé 3 hodiny)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 3-5€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 4min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Michalovciach a Zemplíne</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zemplínska Šírava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najväčšia vodná nádrž (33 km²) s 8 rekreačnými strediskami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zemplínska+Šírava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zemplínske múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">V kaštieli, s unikátnou amforou z doby bronzovej.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zemplínske+múzeum+Michalovce" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Morské oko</h3>
                    <p className="text-sm text-foreground/70 mb-3">Prírodné jazero vo Vihorlatských vrchoch (618 m n.m.).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Morské+oko+Vihorlat" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Thermal Šírava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Aquapark s vnútornými a vonkajšími bazénmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Thermal+Šírava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Viniansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický hrad z 13. storočia pri obci Vinné.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Viniansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> HUMENNÉ */}
        {slug === 'kosice-humenne' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Humenného</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 4,50-6,50€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 56min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy REX (každé 3h)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Dopravca:</span> SAD Humenné</p>
                      <p><span className="font-semibold">Info:</span> sadhe.sk</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne spoje</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Humennom a okolí</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Morské oko</h3>
                    <p className="text-sm text-foreground/70 mb-3">Národná prírodná rezervácia vo Vihorlatských vrchoch.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Morské+oko+Vihorlat" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vihorlatské múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">V renesančnom kaštieli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vihorlatské+múzeum+Humenné" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Skanzen ľudovej architektúry</h3>
                    <p className="text-sm text-foreground/70 mb-3">S tradičným dreveným kostolíkom bez klincov.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Skanzen+Humenné" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrad Brekov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Stredoveký hrad na kopci pri ceste do Strážskeho.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Brekov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Thermal Šírava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný park na brehu Zemplínskej Šíravy.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Thermal+Šírava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> SPIŠSKÁ NOVÁ VES */}
        {slug === 'kosice-spisska-nova-ves' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Spišskej Novej Vsi</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 3-5€</p>
                      <p><span className="font-semibold">Čas:</span> 58min - 1h 20min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (každú hodinu)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 6€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 2h 26min (s prestupom)</p>
                      <p><span className="font-semibold">Poznámka:</span> Nie je priamy spoj</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Spišskej Novej Vsi</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najdlhšie šošovkovité námestie tohto typu v Európe.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Radničné+námestie+Spišská+Nová+Ves" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kostol Nanebovzatia Panny Márie</h3>
                    <p className="text-sm text-foreground/70 mb-3">S najvyššou neogotickou vežou na Slovensku (87 m).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kostol+Nanebovzatia+Panny+Márie+Spišská+Nová+Ves" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Slovenský raj</h3>
                    <p className="text-sm text-foreground/70 mb-3">Národný park s tiesňavami, vodopádmi a jaskyňami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Slovenský+raj" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zoologická záhrada</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najmenšia zoo na Slovensku s 500 živočíchmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zoo+Spišská+Nová+Ves" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Sovia skala</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadka s výhľadom na Prielom Hornádu a Tatry.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Sovia+skala+Čingov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> ŽILINA */}
        {slug === 'kosice-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 7-70€</p>
                      <p><span className="font-semibold">Čas:</span> 3h 22 - 3h 44min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (každú hodinu)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 12€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 4h 10min</p>
                      <p><span className="font-semibold">Spoj:</span> 3 priame spoje denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické srdce mesta s arkádami, unikátne na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Diecézny kostol s dvoma vežami, výška 53 m.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadková veža s panorámou mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia na severnom okraji Žiliny.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická architektúra od Petra Behrensa (1930-31).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> BANSKÁ BYSTRICA */}
        {slug === 'kosice-banska-bystrica' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Banskej Bystrice</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 13-25€</p>
                      <p><span className="font-semibold">Čas:</span> 4h 15min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom v Zvolene</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 13-16€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 3h 13min</p>
                      <p><span className="font-semibold">Spoj:</span> Obmedzený počet</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Banskej Bystrici</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Námestie SNP</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedno z najkrajších námestí na Slovensku s morovým stĺpom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Námestie+SNP+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická dominanta s Kostolom Nanebovzatia Panny Márie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestský+hrad+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum SNP</h3>
                    <p className="text-sm text-foreground/70 mb-3">Netradičná budova s expozíciou protifašistického odboja.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+SNP+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Thurzov dom</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstaršia svetská stavba (1495).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Thurzov+dom+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vrch Urpín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Náučný chodník s výhľadom na mesto.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Urpín+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> ROŽŇAVA */}
        {slug === 'kosice-roznava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Rožňavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 11-17€</p>
                      <p><span className="font-semibold">Čas:</span> 58min - 1h 1min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (dvojhodinový takt)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> od 7-8€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 25min</p>
                      <p><span className="font-semibold">Spoj:</span> 3 spoje denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Rožňave a Slovenskom krase</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Slovenský kras</h3>
                    <p className="text-sm text-foreground/70 mb-3">Národný park UNESCO s jaskyňami (Domica, Gombasek, Jasov).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Slovenský+kras" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Námestie baníkov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšie stredoveké námestie štvorcového pôdorysu na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Námestie+baníkov+Rožňava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Strážna veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskororenesančná veža s tureckou delovou guľou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Strážna+veža+Rožňava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrad Krásna Hôrka</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický hrad z 14. storočia nad Krásnohorským Podhradím.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Krásna+Hôrka" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Zádielska tiesňava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Impozantná prírodná atrakcia v národnom parku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zádielska+tiesňava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu KOŠICE -> TREBIŠOV */}
        {slug === 'kosice-trebisov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Košíc do Trebišova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, pohodlie, bez prestupov</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 2-5€</p>
                      <p><span className="font-semibold">Čas:</span> 45min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (každé 3 hodiny)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p><span className="font-semibold">Cena:</span> 3-5€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 4min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu (Arriva)</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>Čo vidieť v Trebišove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestský park Andrássyovcov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší a najcennejší park v strednej Európe (62 ha).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Park+Andrássyovcov+Trebišov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mauzóleum grófa Andrássyho</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neogotická pamiatka z roku 1893.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mauzóleum+Andrássy+Trebišov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hrad Parič</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne ruiny gotického hradu z 13. storočia (z tehál).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Parič+Trebišov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kaštieľ Andrássyovcov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Baroková stavba z 1786, dnes múzeum s tokajskými vínami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kaštieľ+Andrássy+Trebišov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kostol Navštívenia Panny Márie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotická pamiatka spred roku 1404.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kostol+Navštívenia+Panny+Márie+Trebišov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> MARTIN */}
        {slug === 'zilina-martin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Martina</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 1-3€ (IDS PLUS)</p>
                      <p><span className="font-semibold">Čas:</span> 37 minút</p>
                      <p><span className="font-semibold">Spoj:</span> Každých 30 minút</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na cp.sk</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný s vlakom</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Martine</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Národný cintorín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Miesto odpočinku M. Kukučína, J. Kráľa a ďalších významných osobností.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Národný+cintorín+Martin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum slovenskej dediny</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšie múzeum v prírode na Slovensku so 150 objektmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+slovenskej+dediny+Martin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum Andreja Kmeťa</h3>
                    <p className="text-sm text-foreground/70 mb-3">S rozsiahly herbárom a kostrou mamuta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+Andreja+Kmeťa+Martin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Martinské hole</h3>
                    <p className="text-sm text-foreground/70 mb-3">Lyžiarske stredisko a rekreačná zóna v Malej Fatre.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Martinské+hole" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Matica slovenská</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická inštitúcia slovenského národného života.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Matica+slovenská+Martin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> RUŽOMBEROK */}
        {slug === 'zilina-ruzomberok' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Ružomberka</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 2€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 8min</p>
                      <p><span className="font-semibold">Spoj:</span> Každých 30 minút</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na cp.sk</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný s vlakom</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Ružomberku</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vlkolínec (UNESCO)</h3>
                    <p className="text-sm text-foreground/70 mb-3">Horská osada s autentickou ľudovou architektúrou zo 14. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vlkolínec" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Malinô Brdo</h3>
                    <p className="text-sm text-foreground/70 mb-3">12 km zjazdoviek, v lete bike park s 10 trasami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Malinô+Brdo+Ružomberok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Lanový park Tarzánia</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší lanový park na Slovensku v Hrabove.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Tarzánia+Hrabovo" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Galéria Ľudovíta Fullu</h3>
                    <p className="text-sm text-foreground/70 mb-3">Súčasť Slovenskej národnej galérie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Galéria+Ľudovíta+Fullu+Ružomberok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mauzóleum Andreja Hlinku</h3>
                    <p className="text-sm text-foreground/70 mb-3">Pod Kostolom sv. Ondreja.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mauzóleum+Andreja+Hlinku+Ružomberok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> LIPTOVSKÝ MIKULÁŠ */}
        {slug === 'zilina-liptovsky-mikulas' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Liptovského Mikuláša</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-14€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 37min - 1h 47min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom vo Vrútkach</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na cp.sk</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný s vlakom</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Liptovskom Mikuláši</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Aquapark Tatralandia</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedna z najväčších vodných zábavných oblastí v strednej Európe.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Aquapark+Tatralandia" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kostol sv. Mikuláša</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia ranogotická stavba na Liptove (1280-1300).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kostol+svätého+Mikuláša+Liptovský+Mikuláš" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum Janka Kráľa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Sedem storočí príbehu L. Mikuláša vrátane procesu s J. Jánošíkom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+Janka+Kráľa+Liptovský+Mikuláš" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Galéria ILUSIA</h3>
                    <p className="text-sm text-foreground/70 mb-3">Umenie optických ilúzií a 3D malieb.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Galéria+ILUSIA+Liptovský+Mikuláš" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Lumina Verse</h3>
                    <p className="text-sm text-foreground/70 mb-3">Svetelný park s 26 interaktívnymi atrakciami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Lumina+Verse+Liptovský+Mikuláš" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> TRENČÍN */}
        {slug === 'zilina-trencin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Trenčína</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 4-21€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 23min</p>
                      <p><span className="font-semibold">Spoj:</span> Každých 30 minút</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na cp.sk</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný s vlakom</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Trenčíne</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Trenčiansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najrozsiahlejších hradov v Európe so Studňou lásky.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Trenčiansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestská veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">32 m vysoká vyhliadka na Mierovom námestí.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestská+veža+Trenčín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Piaristický kostol</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najkrajších barokových kostolov na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Piaristický+kostol+Trenčín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Rímsky nápis</h3>
                    <p className="text-sm text-foreground/70 mb-3">Z roku 179 n.l. vytesaný do hradnej skaly.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rímsky+nápis+Trenčín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Židovská synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Secesná budova z 1913, dnes koncertná sála.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Trenčín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> POVAŽSKÁ BYSTRICA */}
        {slug === 'zilina-povazska-bystrica' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Považskej Bystrice</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na zssk.sk</p>
                      <p><span className="font-semibold">Čas:</span> Trať 120</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na FlixBus</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný s vlakom</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus + regionálne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Považskej Bystrici</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Považský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Ruiny hradu z 13. storočia, bývalé sídlo lúpežných rytierov Podmanických.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Považský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Manínska tiesňava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najužší skalný kaňon v Strednej Európe (NPR).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Manínska+tiesňava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Orlové kaštieľ</h3>
                    <p className="text-sm text-foreground/70 mb-3">Barokový kaštieľ s prírodovednou expozíciou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Orlové+kaštieľ+Považská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kostolecká tiesňava</h3>
                    <p className="text-sm text-foreground/70 mb-3">500 m dlhý kaňon, nazývaný "Strecha Slovenska".</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kostolecká+tiesňava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kúpele Nimnica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Wellness a rekondičné pobyty.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kúpele+Nimnica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> DOLNÝ KUBÍN */}
        {slug === 'zilina-dolny-kubin' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Dolného Kubína</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-35€</p>
                      <p><span className="font-semibold">Čas:</span> 2h 17min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom v Kraľovanoch</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na cp.sk</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Dolnom Kubíne</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Oravský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najkrajších hradov na Slovensku, postavený v 13. storočí.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Oravský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Oravské múzeum P. O. Hviezdoslava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstaršie literárne múzeum na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Oravské+múzeum+Dolný+Kubín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Oravská galéria</h3>
                    <p className="text-sm text-foreground/70 mb-3">Župný dom so stálymi expozíciami - staré umenie, ikony.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Oravská+galéria+Dolný+Kubín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Archeoskanzen</h3>
                    <p className="text-sm text-foreground/70 mb-3">Stredoveká dedina - unikátny projekt pod Oravským hradom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Archeoskanzen+Oravský+Podzámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kubínska hoľa</h3>
                    <p className="text-sm text-foreground/70 mb-3">Lyžiarske stredisko a turistika v Oravskej Magure.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kubínska+hoľa" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> ČADCA */}
        {slug === 'zilina-cadca' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Čadce</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-3€</p>
                      <p><span className="font-semibold">Čas:</span> 35 minút</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na cp.sk</p>
                      <p><span className="font-semibold">Čas:</span> Porovnateľný</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Čadci</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Historická lesná železnica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vo Vychylovke - jedna z dvoch úvraťových železníc na svete.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Historická+lesná+úvraťová+železnica+Vychylovka" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum kysuckej dediny</h3>
                    <p className="text-sm text-foreground/70 mb-3">Skanzen so zrubovými domčekmi z obcí zatopených vodnou nádržou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+kysuckej+dediny+Vychylovka" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kostol sv. Bartolomeja</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstarší barokový kostol na horných Kysuciach z roku 1734.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kostol+sv.+Bartolomeja+Čadca" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Kamenné gule v Milošovej</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne pieskovcové skalné gule objavené v 1988.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kamenné+gule+Milošová" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Korňanský ropný prameň</h3>
                    <p className="text-sm text-foreground/70 mb-3">Prírodná pamiatka z roku 1984.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Korňanský+ropný+prameň" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> BANSKÁ BYSTRICA */}
        {slug === 'zilina-banska-bystrica' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Banskej Bystrice</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-35€</p>
                      <p><span className="font-semibold">Čas:</span> 2h 33min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom vo Vrútkach</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 11-16€ (FlixBus)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 50min</p>
                      <p><span className="font-semibold">Spoj:</span> 1x denne priamy</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Banskej Bystrici</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Námestie SNP</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedno z najkrajších námestí na Slovensku s morovým stĺpom Panny Márie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Námestie+SNP+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Hodinová veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Šikmá hodinová veža s vyhliadkou, symbol mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hodinová+veža+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Mestský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">S Kostolom Nanebovzatia Panny Márie - najstaršia stavba z 13. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestský+hrad+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Múzeum SNP</h3>
                    <p className="text-sm text-foreground/70 mb-3">Pamätník v tvare rozpoleného srdca.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+SNP+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Thurzov dom</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstaršia svetská stavba z roku 1495.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Thurzov+dom+Banská+Bystrica" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> POPRAD */}
        {slug === 'zilina-poprad' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Popradu</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-1 rounded-full">Najpohodlnejšie</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Door-to-door, bez prestupu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 4,50€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 59min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu, priamy</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Cena:</span> 7-13€</p>
                      <p><span className="font-semibold">Čas:</span> 2 hodiny</p>
                      <p><span className="font-semibold">Spoj:</span> Overiť na Rome2Rio</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>Čo vidieť v Poprade a Tatrách</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Spišská Sobota</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Kostolom sv. Juraja a oltárom Majstra Pavla.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Spišská+Sobota" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">AquaCity Poprad</h3>
                    <p className="text-sm text-foreground/70 mb-3">13 bazénov s termálnou vodou z hĺbky 1300 m.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=AquaCity+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Vysoké Tatry</h3>
                    <p className="text-sm text-foreground/70 mb-3">Lomnický štít, Symbolický cintorín, vodopády, plesá.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vysoké+Tatry" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Podtatranské múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">Lebka neandertálca, expozícia Knieža z Popradu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Podtatranské+múzeum+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-bold mb-2">Divadlo Poprad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Novinka 2025 - zrekonštruované kino Máj s divadelným súborom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Divadlo+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> KOŠICE */}
        {slug === 'presov-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bratislavy do Nitry</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK priamy vlak - 18 vlakov denne od 15.12.2024.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 5,10€ (2. trieda)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 37min - 1h 45min</p>
                      <p><span className="font-semibold">Prestup:</span> Priamy spoj</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">FlixBus, Slovak Lines, Turancar.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> od 8,50-11€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 5min</p>
                      <p><span className="font-semibold">Frekvencia:</span> 65+ spojov denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Nitre</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Nitriansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšie stredoveké hradisko s bazilikou sv. Emeráma a Vazulovou vežou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nitriansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Horné mesto</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s romantickými uličkami a sochou Corgoňa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Horné+mesto+Nitra" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jedna z najstarších na Slovensku z roku 1908.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Nitra" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Pešia zóna</h3>
                    <p className="text-sm text-foreground/70 mb-3">So zväčšenou kópiou historického meča a hudobnými hodinami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Pešia+zóna+Nitra" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Z prelomu 18. a 19. storočia s krásnym výhľadom na mesto.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Nitra" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}








        {/* Špeciálny obsah pre trasu PREŠOV -> POPRAD */}
        {slug === 'presov-poprad' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Popradu</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK vlaky - hodinový takt v pracovné dni.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> Cez IDS Východ kalkulátor</p>
                      <p><span className="font-semibold">Čas:</span> 45-60 minút</p>
                      <p><span className="font-semibold">Prestup:</span> S prestupom v Kysaku</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">FlixBus - každé 4 hodiny.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 4,98-5,48€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 5min</p>
                      <p><span className="font-semibold">Frekvencia:</span> Denne + nočné</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Poprade</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Námestie sv. Egídia</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s kostolom sv. Egídia z 13. storočia so stredovekými freskami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Námestie+sv.+Egídia+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Spišská Sobota</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia od roku 1950 s dobovou architektúrou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Spišská+Sobota+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. AquaCity Poprad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Aquapark nad geotermálnym prameňom s 13 bazénmi, tobogánmi a wellness.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=AquaCity+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Tatranská galéria</h3>
                    <p className="text-sm text-foreground/70 mb-3">Prvá budova na Slovensku kde továrenský priestor premenili na kultúrne centrum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Tatranská+galéria+Poprad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Vysoké Tatry</h3>
                    <p className="text-sm text-foreground/70 mb-3">Štrbské pleso, Popradské pleso, vodopád Skok, Hrebienok, Skalnaté pleso.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vysoké+Tatry" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> HUMENNÉ */}
        {slug === 'presov-humenne' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Humenného</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - každé 2 hodiny, hodinový takt vo vrcholoch.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-6€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 32min</p>
                      <p><span className="font-semibold">Prestup:</span> Priamy spoj</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">SAD Humenné - regionálne spoje.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> cca 1€ (IDS Východ)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 44min</p>
                      <p><span className="font-semibold">Frekvencia:</span> 5× denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Humennom</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Kaštieľ Humenné</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zrekonštruovaný kaštieľ z roku 1610, sídlo Vihorlatského múzea.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kaštieľ+Humenné" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Skanzen ľudovej architektúry</h3>
                    <p className="text-sm text-foreground/70 mb-3">16 objektov na 4 ha, chrám sv. Michala Archanjela z 1764 (bez klinca).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Skanzen+Humenné" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Hrad Jasenov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Z 13. storočia, známy razením falošných peňazí Drugethovcami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Jasenov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Hrad Brekov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Ruiny stredovekého strážneho hradu z 13. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Brekov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Humenský Sokol</h3>
                    <p className="text-sm text-foreground/70 mb-3">Prímestský rekreačný areál (541 ha) pre pešiu turistiku a cykloturistiku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Humenský+Sokol" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> BARDEJOV */}
        {slug === 'presov-bardejov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Bardejova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - každé 3 hodiny.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-3€</p>
                      <p><span className="font-semibold">Čas:</span> cca 1h 5min</p>
                      <p><span className="font-semibold">Prestup:</span> Priamy spoj</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">FlixBus, Slovak Lines - 3 spoje denne.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> od 4,48€</p>
                      <p><span className="font-semibold">Čas:</span> 45-50 minút</p>
                      <p><span className="font-semibold">Frekvencia:</span> 3x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Bardejove (UNESCO)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Bazilika Minor sv. Egídia</h3>
                    <p className="text-sm text-foreground/70 mb-3">UNESCO pamiatka, 11 neskorogotických krídlových oltárov.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bazilika+sv.+Egídia+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Radničné námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">UNESCO pamiatka, 46 meštianskych domov, prvá renesančná radnica na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Radničné+námestie+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Židovské suburbium</h3>
                    <p className="text-sm text-foreground/70 mb-3">UNESCO pamiatka, Stará synagóga, mikve a bet hamidraš.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Židovské+suburbium+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Mestské opevnenie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najzachovalejší stredoveký obranný systém hradieb a bášt na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mestské+hradby+Bardejov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Skanzen Bardejovské Kúpele</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstarší skanzen na Slovensku (1965) + Drevený kostol Hervartov (UNESCO).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Skanzen+Bardejovské+Kúpele" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> MICHALOVCE */}
        {slug === 'presov-michalovce' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Michaloviec</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - spojenie cez Strázske.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-6€ (IDS Východ)</p>
                      <p><span className="font-semibold">Čas:</span> ~2h 40min</p>
                      <p><span className="font-semibold">Prestup:</span> Cez Strázske</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">SAD Prešov - linka 072 205.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> cca 2.60€ (IDS Východ)</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 23min</p>
                      <p><span className="font-semibold">Frekvencia:</span> 4× týždenne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Michalovciach a okolí</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Zemplínska Šírava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najväčšia priehrada na Slovensku (33 km²), 8 rekreačných stredísk.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zemplínska+Šírava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Zemplínske múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">V kaštieli na nábreží Laborca, dokumentuje vývoj regiónu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zemplínske+múzeum+Michalovce" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Thermal Šírava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Aquapark nad geotermálnym prameňom, vlnový bazén, wellness.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Thermal+Šírava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Morské oko</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vulkanické jazero vo Vihorlatských vrchoch (618 m n.m., hĺbka 25 m).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Morské+oko+Vihorlat" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Viniansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zrúcaniny gotického hradu z 13. storočia pri obci Vinné.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Viniansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> VRANOV NAD TOPĽOU */}
        {slug === 'presov-vranov-nad-toplou' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Vranova nad Topľou</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - každé 2 hodiny.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 1,80-2,70€</p>
                      <p><span className="font-semibold">Čas:</span> 56min - 1h 5min</p>
                      <p><span className="font-semibold">Prestup:</span> Priamy spoj</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">SAD Humenné, SAD Prešov - každé 3 hodiny.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> cca 0,90€</p>
                      <p><span className="font-semibold">Čas:</span> cca 1h 7min</p>
                      <p><span className="font-semibold">Frekvencia:</span> Každé 3h</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií vo Vranove nad Topľou</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Bazilika Narodenia Panny Márie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická bazilika z roku 1580, stropné maľby od Jána Lukáša Krackera.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bazilika+Vranov+nad+Topľou" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Domaša</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodná nádrž v horách Nízkych Beskýd, vodné športy a rekreácia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Domaša+priehrada" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Hrad Čičva</h3>
                    <p className="text-sm text-foreground/70 mb-3">Ruiny hradu z 14. storočia nad obcou Sedliská.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Čičva" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Zbojnícky hrad (Soľnohrad)</h3>
                    <p className="text-sm text-foreground/70 mb-3">Pozostatky ruín v Slanských vrchoch z 13.-14. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Zbojnícky+hrad+Slanské+vrchy" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Hrad Brekov</h3>
                    <p className="text-sm text-foreground/70 mb-3">Stredoveký strážny hrad z 13. storočia, viditeľný z cesty Strážske-Humenné.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Brekov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> STARÁ ĽUBOVŇA */}
        {slug === 'presov-stara-lubovna' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Starej Ľubovne</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - s prestupom v Kežmarku alebo Lipanoch.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-6€</p>
                      <p><span className="font-semibold">Čas:</span> cca 2h 19min</p>
                      <p><span className="font-semibold">Prestup:</span> S prestupom</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">SAD Prešov - linka 072 108.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 8-13€</p>
                      <p><span className="font-semibold">Čas:</span> cca 1h 32min</p>
                      <p><span className="font-semibold">Frekvencia:</span> 2x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Starej Ľubovni</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Ľubovniansky hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najnavštevovanejší hrad v Prešovskom kraji (200 000+ návštevníkov ročne).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Ľubovniansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Ľubovniansky skanzen</h3>
                    <p className="text-sm text-foreground/70 mb-3">25 objektov ľudovej architektúry, gréckokatolícka cerkev z Matysovej (1833).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Ľubovniansky+skanzen" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Stredoveký vojenský tábor</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny tábor v podhradí, streľba z luku/kuše, jazda na koni.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Stredoveký+tábor+Ľubovniansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Palác Lubomírskych</h3>
                    <p className="text-sm text-foreground/70 mb-3">Na hrade, jedna z najobľúbenejších častí prehliadky s výstupom na vežu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Palác+Lubomírskych+Ľubovniansky+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Tematické expozície</h3>
                    <p className="text-sm text-foreground/70 mb-3">Každý rok sa menia, pútavé historické prezentácie.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Ľubovnianske+múzeum" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> SVIDNÍK */}
        {slug === 'presov-svidnik' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Svidníka</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - obmedzené spojenia, overte na cp.sk.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> Cez IDS Východ kalkulátor</p>
                      <p><span className="font-semibold">Čas:</span> ~2-3 hodiny</p>
                      <p><span className="font-semibold">Prestup:</span> Vyžaduje prestupy</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">SAD Humenné, SAD Prešov.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> cca 1€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 16min</p>
                      <p><span className="font-semibold">Frekvencia:</span> 2-3x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií vo Svidníku</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Vojenské historické múzeum</h3>
                    <p className="text-sm text-foreground/70 mb-3">Budova v tvare protitankovej míny, park bojovej techniky s lietadlom a Katušou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Vojenské+historické+múzeum+Svidník" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Pamätník na Dukle</h3>
                    <p className="text-sm text-foreground/70 mb-3">Národná kultúrna pamiatka, 28 m vysoký pamätník na vojenskom cintoríne.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Pamätník+Dukla" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Múzeum ukrajinskej kultúry SNM</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najstaršie národnostné múzeum na Slovensku (1956).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Múzeum+ukrajinskej+kultúry+Svidník" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Skanzen</h3>
                    <p className="text-sm text-foreground/70 mb-3">50 objektov ľudovej architektúry na 11 ha, drevená cerkev.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Skanzen+Svidník" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Drevené chrámy UNESCO</h3>
                    <p className="text-sm text-foreground/70 mb-3">Kostol sv. Mikuláša v Bodružali (1658, UNESCO) a cerkev v Ladomírovej.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Drevený+kostol+Bodružal" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> BRATISLAVA */}
        {slug === 'presov-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK Expres Tatran - s prestupom v Košiciach.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> 18,70€ (2. trieda), 25€ (1. trieda)</p>
                      <p><span className="font-semibold">Čas:</span> cca 5h 26min</p>
                      <p><span className="font-semibold">Prestup:</span> S prestupom v Košiciach</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">FlixBus a Slovak Lines.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> od 16€ (FlixBus), od 37€ (Slovak Lines)</p>
                      <p><span className="font-semibold">Čas:</span> cca 5h 55min</p>
                      <p><span className="font-semibold">Frekvencia:</span> Viacero denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Národná kultúrna pamiatka, Múzeum histórie, výhľad z 47m korunnej veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný kostol z 15. storočia s pozlátenou korunou (85 m).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Posledná zo 4 mestských brán (700+ rokov), dominanta historického centra.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Hrad Devín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Národná kultúrna pamiatka na sútoku Dunaja a Moravy.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Devín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. UFO vyhliadková veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Na pylónoch mosta SNP vo výške 95 m, viditeľnosť až 100 km.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=UFO+vyhliadka+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PREŠOV -> ŽILINA */}
        {slug === 'presov-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Prešova do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                      <span className="ml-auto text-xs bg-primary-yellow/20 px-2 py-0.5 rounded">Odporúčané</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">Priama cesta od dverí k dverám bez starostí s batožinou.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> {minPrice}-{maxPrice}€</p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhody:</span> Komfort, flexibilita, bez prestupovania</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">ZSSK - s prestupom v Kysaku.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> Cez IDS Východ kalkulátor</p>
                      <p><span className="font-semibold">Čas:</span> ~3-4 hodiny</p>
                      <p><span className="font-semibold">Prestup:</span> S prestupom v Kysaku</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3">FlixBus - podľa cestovného poriadku.</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p><span className="font-semibold">Cena:</span> od 9,98€</p>
                      <p><span className="font-semibold">Čas:</span> 3h 25min</p>
                      <p><span className="font-semibold">Frekvencia:</span> 1× denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Dominanta mesta, súčasť Mestskej pamiatkovej rezervácie (1987).</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Diecézny kostol Žilinskej diecézy od 2008, veža 53 m.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">3. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 2. polovice 13. storočia chránený riekou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">4. Rosenfeldov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Z roku 1907, jedna z najkrajších secesných pamiatok na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rosenfeldov+palác+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická architektúra (1930-1931), projekt Petra Behrensa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu NITRA -> BRATISLAVA */}
        {slug === 'nitra-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Nitry do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Door-to-door z centra Nitry</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 5,10€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 37-45min</p>
                      <p><span className="font-semibold">Spoj:</span> ZSSK - priamy od 12/2024</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 8,50€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 5min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus, Slovak Lines</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta, Múzeum histórie, výhľad z 47m veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný chrám z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jediná zachovaná brána mestského opevnenia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Hrad Devín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hradné ruiny na sútoku Dunaja a Moravy.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Devín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. UFO vyhliadková veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Výhľad z výšky 95m na Moste SNP.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=UFO+vyhliadková+veža+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu TRENČÍN -> BRATISLAVA */}
        {slug === 'trencin-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Trenčína do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo spod Trenčianskeho hradu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 4,50-12€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 4min</p>
                      <p><span className="font-semibold">Spoj:</span> ZSSK každých 30 min</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 6,50€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta, Múzeum histórie, výhľad z 47m veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný chrám z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jediná zachovaná brána mestského opevnenia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Modrý kostol</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najfotografovanejšia pamiatka - Kostol sv. Alžbety.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Modrý+kostol+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Staré Mesto</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s Hlavným námestím.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavné+námestie+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu TRNAVA -> BRATISLAVA */}
        {slug === 'trnava-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Trnavy do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Door-to-door z "malého Ríma"</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 3€</p>
                      <p><span className="font-semibold">Čas:</span> 30-35min</p>
                      <p><span className="font-semibold">Spoj:</span> ZSSK REX v IDS BK</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 1€ (akcie)</p>
                      <p><span className="font-semibold">Čas:</span> 34-49min</p>
                      <p><span className="font-semibold">Spoj:</span> Slovak Lines, FlixBus</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta, Múzeum histórie, výhľad z 47m veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný chrám z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jediná zachovaná brána mestského opevnenia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Eurovea</h3>
                    <p className="text-sm text-foreground/70 mb-3">Moderné nákupné centrum na nábreží Dunaja.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Eurovea+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prezidentský palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Grassalkovichov palác s francúzskou záhradou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Prezidentský+palác+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu PIEŠŤANY -> BRATISLAVA */}
        {slug === 'piestany-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Piešťan do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z kúpeľného ostrova</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-4€</p>
                      <p><span className="font-semibold">Čas:</span> 46-47min</p>
                      <p><span className="font-semibold">Spoj:</span> ZSSK každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 5€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h</p>
                      <p><span className="font-semibold">Spoj:</span> Slovak Lines</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta, Múzeum histórie, výhľad z 47m veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný chrám z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Hrad Devín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hradné ruiny na sútoku Dunaja a Moravy.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Devín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Staré Mesto</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s kaviarňami a reštauráciami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Staré+Mesto+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Dunajské nábrežie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Promenáda s výhľadom na Dunaj a Most SNP.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dunajské+nábrežie+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu POPRAD -> BRATISLAVA */}
        {slug === 'poprad-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Popradu do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Tatier, batožina bez obmedzenia</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 16€</p>
                      <p><span className="font-semibold">Čas:</span> 3h 41min</p>
                      <p><span className="font-semibold">Spoj:</span> ZSSK Express každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 24€</p>
                      <p><span className="font-semibold">Čas:</span> 4h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus, Slovak Lines</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta, Múzeum histórie, výhľad z 47m veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Dóm sv. Martina</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotický korunovačný chrám z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Martina+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Hrad Devín</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hradné ruiny na sútoku Dunaja a Moravy.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hrad+Devín" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. UFO vyhliadková veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Výhľad z výšky 95m na Moste SNP.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=UFO+vyhliadková+veža+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Bratislava</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zoologická záhrada v lesnom prostredí.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu DUNAJSKÁ STREDA -> BRATISLAVA */}
        {slug === 'dunajska-streda-bratislava' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Dunajskej Stredy do Bratislavy</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Thermalparku</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 2,10€</p>
                      <p><span className="font-semibold">Čas:</span> ~50min</p>
                      <p><span className="font-semibold">Spoj:</span> Leo Express, ZSSK</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 3€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Bratislave</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Bratislavský hrad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Symbol mesta, Múzeum histórie, výhľad z 47m veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bratislavský+hrad" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Staré Mesto</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s Hlavným námestím.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavné+námestie+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Eurovea</h3>
                    <p className="text-sm text-foreground/70 mb-3">Moderné nákupné centrum na nábreží.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Eurovea+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Michalská brána</h3>
                    <p className="text-sm text-foreground/70 mb-3">700-ročná brána mestského opevnenia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Michalská+brána+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Dinopark</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zábavný park s dinosaurami pre rodiny.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dinopark+Bratislava" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu POPRAD -> KOŠICE */}
        {slug === 'poprad-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Popradu do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Tatier do centra KE</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 3,30€ (Leo Express)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 58min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 12€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus 4x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku, gotická katedrála.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia mestská pamiatková rezervácia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najväčších pokladov v Európe.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická pamiatka v centre.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">S DinoPark - atrakcia pre celú rodinu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu MICHALOVCE -> KOŠICE */}
        {slug === 'michalovce-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Michaloviec do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo zo Zemplína</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3,70-7,40€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 21min</p>
                      <p><span className="font-semibold">Spoj:</span> REX každé 3h</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-5€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 4min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s pešou zónou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátna zbierka vo Východoslovenskom múzeu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická architektúra.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zoologická záhrada s DinoPark.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu HUMENNE -> KOŠICE */}
        {slug === 'humenne-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Humenného do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Vihorlatu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 4,50-6,50€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 56min</p>
                      <p><span className="font-semibold">Spoj:</span> REX (elektrifikovaná trať)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 5€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> SAD Humenné</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotická katedrála z 14.-15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najdlhšia pešia zóna na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny historický poklad.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická architektúra.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zoologická záhrada s DinoPark.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu SPIŠSKÁ NOVÁ VES -> KOŠICE */}
        {slug === 'spisska-nova-ves-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Spišskej Novej Vsi do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo zo Slovenského raja</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-5€</p>
                      <p><span className="font-semibold">Čas:</span> 58min - 1h 20min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 6€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická pešia zóna v centre.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátna zbierka v múzeu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická pamiatka.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">S DinoPark pre celú rodinu.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ROŽŇAVA -> KOŠICE */}
        {slug === 'roznava-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Rožňavy do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo zo Slovenského krasu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 11-17€</p>
                      <p><span className="font-semibold">Čas:</span> 58min - 1h 1min</p>
                      <p><span className="font-semibold">Spoj:</span> Dvojhodinový takt</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 7-8€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 25min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus 3x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická pešia zóna.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najväčších pokladov.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historická architektúra.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Zoologická záhrada.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu TREBIŠOV -> KOŠICE */}
        {slug === 'trebisov-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Trebišova do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z tokajského regiónu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-5€</p>
                      <p><span className="font-semibold">Čas:</span> 45min</p>
                      <p><span className="font-semibold">Spoj:</span> Každé 3 hodiny</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-5€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 4min</p>
                      <p><span className="font-semibold">Spoj:</span> Arriva každú hodinu</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny historický poklad.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická pamiatka.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice</h3>
                    <p className="text-sm text-foreground/70 mb-3">S DinoPark atrakciou.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu MARTIN -> ŽILINA */}
        {slug === 'martin-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Martina do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z centra Martina</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 1-3€ (IDS PLUS)</p>
                      <p><span className="font-semibold">Čas:</span> 37 min</p>
                      <p><span className="font-semibold">Spoj:</span> Každých 30 minút</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 2€</p>
                      <p><span className="font-semibold">Čas:</span> ~40min</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické srdce mesta s arkádami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Diecézny kostol s dvoma vežami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadková veža s panorámou mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hrad na severnom okraji Žiliny.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická architektúra od Petra Behrensa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu RUŽOMBEROK -> ŽILINA */}
        {slug === 'ruzomberok-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Ružomberka do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Liptova</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 2€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 8min</p>
                      <p><span className="font-semibold">Spoj:</span> Každých 30 minút</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 3€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 15min</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne námestie s arkádami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Diecézny kostol, výška 53 m.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadka s panorámou mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická pamiatka z 1930.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu TRENČÍN -> ŽILINA */}
        {slug === 'trencin-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Trenčína do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z centra Trenčína</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 4-5€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 23min</p>
                      <p><span className="font-semibold">Spoj:</span> Každých 30 minút</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 5€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické centrum s arkádami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Dominanta mesta, dve veže.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančná zvonica.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad s múzeom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická architektúra.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ČADCA -> ŽILINA */}
        {slug === 'cadca-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Čadce do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Kysúc</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-3€</p>
                      <p><span className="font-semibold">Čas:</span> 35 min (REX)</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 2€</p>
                      <p><span className="font-semibold">Čas:</span> ~40min</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické námestie s arkádami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Dominanta mesta s vežami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadka na mesto.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Hrad s múzeom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická budova.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu POPRAD -> ŽILINA */}
        {slug === 'poprad-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Popradu do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Tatier</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 4,50€ (Leo Express)</p>
                      <p><span className="font-semibold">Čas:</span> 1h 59min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 7-13€</p>
                      <p><span className="font-semibold">Čas:</span> 2h</p>
                      <p><span className="font-semibold">Spoj:</span> Viaceré linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne námestie s arkádami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Diecézny kostol s vežami.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadková veža.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická architektúra.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BANSKÁ BYSTRICA -> ŽILINA */}
        {slug === 'banska-bystrica-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Banskej Bystrice do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z centra BB</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-35€</p>
                      <p><span className="font-semibold">Čas:</span> 2h 33min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom vo Vrútkach</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 11-16€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 50min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus 1x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Historické námestie s arkádami, unikát na Slovensku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Diecézny kostol s dvoma vežami, výška 53 m.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vyhliadková veža s panorámou mesta.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia, dnes múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická architektúra od Petra Behrensa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu LIPTOVSKÝ MIKULÁŠ -> ŽILINA */}
        {slug === 'liptovsky-mikulas-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Liptovského Mikuláša do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Liptova</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-14€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 37 - 1h 47min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom vo Vrútkach (S3)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> Regionálne tarify</p>
                      <p><span className="font-semibold">Čas:</span> cca 1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> SAD Liptovský Mikuláš</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne námestie s arkádami a farebnými domčekmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančná zvonica (40 m) s výhľadom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotická katedrála z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia, dnes múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická budova od Petra Behrensa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu POVAŽSKÁ BYSTRICA -> ŽILINA */}
        {slug === 'povazska-bystrica-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Považskej Bystrice do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Považia</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-4€</p>
                      <p><span className="font-semibold">Čas:</span> cca 25 min</p>
                      <p><span className="font-semibold">Spoj:</span> Priamy (trať 120)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> Regionálne tarify</p>
                      <p><span className="font-semibold">Čas:</span> cca 30 min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus, regionálne linky</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne námestie s arkádami a farebnými domčekmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančná zvonica (40 m) s výhľadom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotická katedrála z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia, dnes múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická budova od Petra Behrensa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu DOLNÝ KUBÍN -> ŽILINA */}
        {slug === 'dolny-kubin-zilina' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Dolného Kubína do Žiliny</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z Oravy</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-35€</p>
                      <p><span className="font-semibold">Čas:</span> 2h 17min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom v Kraľovanoch (S6)</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> Regionálne tarify</p>
                      <p><span className="font-semibold">Čas:</span> cca 1h 30min</p>
                      <p><span className="font-semibold">Spoj:</span> SAD Dolný Kubín</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Žiline</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Mariánske námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátne námestie s arkádami a farebnými domčekmi.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Mariánske+námestie+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Burianova veža</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančná zvonica (40 m) s výhľadom.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Burianova+veža+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Katedrála Najsvätejšej Trojice</h3>
                    <p className="text-sm text-foreground/70 mb-3">Gotická katedrála z 15. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Katedrála+Najsvätejšej+Trojice+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Budatínsky zámok</h3>
                    <p className="text-sm text-foreground/70 mb-3">Vodný hrad z 13. storočia, dnes múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Budatínsky+zámok" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Nová synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Funkcionalistická budova od Petra Behrensa.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Nová+synagóga+Žilina" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu ŽILINA -> KOŠICE */}
        {slug === 'zilina-kosice' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Žiliny do Košíc</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo zo Žiliny do Košíc</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 7,50€ (Leo Express)</p>
                      <p><span className="font-semibold">Čas:</span> 3h 22 - 3h 44min</p>
                      <p><span className="font-semibold">Spoj:</span> Každú hodinu</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 12€</p>
                      <p><span className="font-semibold">Čas:</span> 4h 10min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus 3x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Košiciach</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Dóm sv. Alžbety</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčší kostol na Slovensku, gotická katedrála.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Dóm+sv.+Alžbety+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Hlavná ulica</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najväčšia mestská pamiatková rezervácia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Košický zlatý poklad</h3>
                    <p className="text-sm text-foreground/70 mb-3">Jeden z najväčších pokladov v Európe.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Východoslovenské+múzeum+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Jakabov palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Neskorogotická pamiatka v centre.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Jakabov+palác+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. ZOO Košice s DinoPark</h3>
                    <p className="text-sm text-foreground/70 mb-3">Najvýznamnejšia atrakcia na východe.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=ZOO+Košice" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ==================== PREŠOV REVERSE ROUTES ==================== */}


        {/* Špeciálny obsah pre trasu POPRAD -> PREŠOV */}
        {slug === 'poprad-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Popradu do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Z Tatier priamo do Prešova</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-6€</p>
                      <p><span className="font-semibold">Čas:</span> 45-60 min</p>
                      <p><span className="font-semibold">Spoj:</span> Hodinový takt</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 4,98-5,48€</p>
                      <p><span className="font-semibold">Čas:</span> 1h 5min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus každé 4h</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu HUMENNE -> PREŠOV */}
        {slug === 'humenne-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Humenného do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Priamo z centra Humenného</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> IDS Východ</p>
                      <p><span className="font-semibold">Čas:</span> ~1 hodina</p>
                      <p><span className="font-semibold">Spoj:</span> S prípojom v Kysaku</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> SAD Humenné</p>
                      <p><span className="font-semibold">Čas:</span> ~1 hodina</p>
                      <p><span className="font-semibold">Spoj:</span> Regionálne spoje</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu BARDEJOV -> PREŠOV */}
        {slug === 'bardejov-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Bardejova do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Z UNESCO mesta priamo</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 2-3€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 5min</p>
                      <p><span className="font-semibold">Spoj:</span> Každé 3 hodiny</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> od 4,48€</p>
                      <p><span className="font-semibold">Čas:</span> 45-50 min</p>
                      <p><span className="font-semibold">Spoj:</span> FlixBus 3x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu MICHALOVCE -> PREŠOV */}
        {slug === 'michalovce-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Michaloviec do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Od Zemplínskej Šíravy priamo</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> IDS Východ</p>
                      <p><span className="font-semibold">Čas:</span> S prestupom</p>
                      <p><span className="font-semibold">Spoj:</span> Cez Košice/Kysak</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> ~1€ (IDS)</p>
                      <p><span className="font-semibold">Čas:</span> ~1,5 hodiny</p>
                      <p><span className="font-semibold">Spoj:</span> Linka 072 205</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu VRANOV NAD TOPĽOU -> PREŠOV */}
        {slug === 'vranov-nad-toplou-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať z Vranova nad Topľou do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Od Domaše priamo do Prešova</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 1,80-2,70€</p>
                      <p><span className="font-semibold">Čas:</span> 56min - 1h 5min</p>
                      <p><span className="font-semibold">Spoj:</span> Každé 2 hodiny</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> ~0,90€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 7min</p>
                      <p><span className="font-semibold">Spoj:</span> Každé 3 hodiny</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu STARÁ ĽUBOVŇA -> PREŠOV */}
        {slug === 'stara-lubovna-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Starej Ľubovne do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Od Ľubovnianskeho hradu priamo</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 3-6€</p>
                      <p><span className="font-semibold">Čas:</span> ~2h 19min</p>
                      <p><span className="font-semibold">Spoj:</span> S prestupom</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> 8-13€</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 32min</p>
                      <p><span className="font-semibold">Spoj:</span> 2x denne priamo</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Špeciálny obsah pre trasu SVIDNÍK -> PREŠOV */}
        {slug === 'svidnik-presov' && (
          <>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                  <span>Ako sa dostať zo Svidníka do Prešova</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-primary-yellow/20">
                        <Car className="h-5 w-5 text-primary-yellow" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Taxi</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> <span className="text-green-600 font-bold">{minPrice}-{maxPrice}€</span></p>
                      <p><span className="font-semibold">Čas:</span> {formatDuration(route.duration_min)}</p>
                      <p><span className="font-semibold">Výhoda:</span> Od Duklianskeho pamätníka</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Train className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Vlak</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> Overiť na ZSSK</p>
                      <p><span className="font-semibold">Čas:</span> S prestupom</p>
                      <p><span className="font-semibold">Spoj:</span> Cez Giraltovce</p>
                    </div>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">Autobus</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Cena:</span> ~1€ (IDS)</p>
                      <p><span className="font-semibold">Čas:</span> ~1h 16min</p>
                      <p><span className="font-semibold">Spoj:</span> SAD 2-3x denne</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
                  <span>TOP 5 atrakcií v Prešove</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">1. Hlavná ulica a námestie</h3>
                    <p className="text-sm text-foreground/70 mb-3">Mestská pamiatková rezervácia s Katedrálou sv. Mikuláša.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Hlavná+ulica+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">2. Rákociho palác</h3>
                    <p className="text-sm text-foreground/70 mb-3">Renesančný palác z 16.-17. storočia, dnes krajské múzeum.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Rákociho+palác+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">3. Ortodoxná synagóga</h3>
                    <p className="text-sm text-foreground/70 mb-3">Múzeum židovskej kultúry v neorománsko-maurskom štýle.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Synagóga+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">4. Solivar</h3>
                    <p className="text-sm text-foreground/70 mb-3">Unikátny súbor objektov na čerpanie soli zo 17. storočia.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Solivar+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-bold text-foreground mb-2">5. Prešovská kalvária</h3>
                    <p className="text-sm text-foreground/70 mb-3">Druhá najkrajšia v bývalom Uhorsku.</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Kalvária+Prešov" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Zobraziť na mape →</a>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Related Routes Section - Interlinking pre SEO */}
        {relatedRoutes.length > 0 && (
          <section className="py-8 md:py-12 px-4 md:px-8">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Route className="h-6 w-6 text-primary-yellow" />
                Podobné trasy
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedRoutes.map((relatedRoute) => {
                  const { minPrice: relMinPrice } = calculatePrice(relatedRoute.distance_km);
                  return (
                    <Link
                      key={relatedRoute.slug}
                      href={`/taxi-trasa/${relatedRoute.slug}`}
                      className="group"
                    >
                      <Card className="p-4 hover:shadow-md transition-all hover:border-primary-yellow/50">
                        <h3 className="font-bold text-foreground group-hover:text-primary-yellow transition-colors mb-2">
                          {relatedRoute.from.name} → {relatedRoute.to.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-foreground/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {relatedRoute.distance_km} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(relatedRoute.duration_min)}
                          </span>
                        </div>
                        <p className="text-sm text-green-600 font-semibold mt-2">
                          od {relMinPrice}€
                        </p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-8 md:py-12 px-4 md:px-8 bg-foreground/5">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary-yellow" />
              Časté otázky
            </h2>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-bold text-foreground mb-3">{item.question}</h3>
                  <p className="text-foreground/70">{item.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-12 px-4 md:px-8 bg-primary-yellow/10">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Potrebujete opačnú trasu?
            </h2>
            <p className="text-foreground/70 mb-6">
              Hľadáte taxi z {route.to.name} do {route.from.name}? Vzdialenosť a čas sú rovnaké.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/taxi/${route.from.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-yellow text-foreground font-bold rounded-lg hover:bg-primary-yellow/90 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Taxi {route.from.name}
              </Link>
              <Link
                href={`/taxi/${route.to.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white font-bold rounded-lg hover:bg-foreground/90 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Taxi {route.to.name}
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 px-4 md:px-8 bg-foreground/5">
          <div className="container mx-auto max-w-6xl">
            <p className="text-sm text-foreground/50 text-center">
              Uvedené ceny sú orientačné a môžu sa líšiť v závislosti od konkrétnej taxi služby,
              typu vozidla, času jazdy a aktuálnej dopravnej situácie. Pre presnú cenu kontaktujte
              priamo vybranú taxi službu.
            </p>
          </div>
        </section>

        {/* Footer */}
        <FooterLegal />
      </div>
    </>
  );
}
