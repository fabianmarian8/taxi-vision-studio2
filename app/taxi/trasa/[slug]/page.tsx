import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { SEOBreadcrumbs } from '@/components/SEOBreadcrumbs';
import { MapPin, Clock, Car, Phone, ArrowRight } from 'lucide-react';
import { getCityBySlug, type CityData } from '@/data/cities';
import { getMunicipalityBySlug, findNearestCitiesWithTaxis, type Municipality } from '@/data/municipalities';

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

// Parsuje slug "abovce-tornala" na { from: "abovce", to: "tornala" }
function parseRouteSlug(slug: string): { from: string; to: string } | null {
  const parts = slug.split('-');
  if (parts.length < 2) return null;

  // Skúsime rôzne kombinácie pre prípad viacslovných názvov
  // Pre jednoduchosť: prvé slovo = from, zvyšok = to
  // Neskôr: sofistikovanejšie parsovanie
  const from = parts[0];
  const to = parts.slice(1).join('-');

  return { from, to };
}

// Nájde lokalitu (mesto alebo obec) podľa slug
function findLocation(slug: string): { type: 'city'; data: CityData } | { type: 'municipality'; data: Municipality } | null {
  const city = getCityBySlug(slug);
  if (city) return { type: 'city', data: city };

  const municipality = getMunicipalityBySlug(slug);
  if (municipality) return { type: 'municipality', data: municipality };

  return null;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseRouteSlug(slug);

  if (!parsed) {
    return { title: 'Trasa nenájdená' };
  }

  const fromLocation = findLocation(parsed.from);
  const toLocation = findLocation(parsed.to);

  if (!fromLocation || !toLocation) {
    return { title: 'Trasa nenájdená' };
  }

  const fromName = fromLocation.data.name;
  const toName = toLocation.data.name;

  return {
    title: `Taxi ${fromName} → ${toName} | Cena, vzdialenosť, kontakty`,
    description: `Potrebujete taxi z ${fromName} do ${toName}? Nájdite najbližšie taxislužby, orientačnú cenu a kontakty.`,
    robots: {
      index: false,  // noindex - nechceme indexovať route pages
      follow: true,
    },
  };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const parsed = parseRouteSlug(slug);

  if (!parsed) {
    notFound();
  }

  const fromLocation = findLocation(parsed.from);
  const toLocation = findLocation(parsed.to);

  if (!fromLocation || !toLocation) {
    notFound();
  }

  const fromName = fromLocation.data.name;
  const toName = toLocation.data.name;
  const fromSlug = fromLocation.type === 'city'
    ? fromLocation.data.slug
    : `banskobystricky-kraj/rimavska-sobota/${fromLocation.data.slug}`; // TODO: dynamický región
  const toSlug = toLocation.type === 'city'
    ? toLocation.data.slug
    : `banskobystricky-kraj/rimavska-sobota/${toLocation.data.slug}`;

  // Vypočítaj vzdialenosť a cenu
  let distance = 0;
  let duration = 0;

  if (fromLocation.data.latitude && fromLocation.data.longitude &&
      toLocation.data.latitude && toLocation.data.longitude) {
    // Haversine formula pre vzdušnú vzdialenosť
    const R = 6371;
    const dLat = (toLocation.data.latitude - fromLocation.data.latitude) * Math.PI / 180;
    const dLon = (toLocation.data.longitude - fromLocation.data.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(fromLocation.data.latitude * Math.PI / 180) *
              Math.cos(toLocation.data.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const airDistance = R * c;

    // Cestná vzdialenosť je cca 1.3x vzdušná
    distance = Math.round(airDistance * 1.3 * 10) / 10;
    duration = Math.round(distance * 1.5); // cca 1.5 min/km
  }

  const priceMin = Math.ceil(2 + distance * 0.85);
  const priceMax = Math.ceil(2 + distance * 1.15);

  // Nájdi taxislužby v cieľovom meste (alebo najbližšie)
  let taxiServices: CityData['taxiServices'] = [];
  let taxiCityName = '';
  let taxiCitySlug = '';

  if (toLocation.type === 'city' && toLocation.data.taxiServices.length > 0) {
    taxiServices = toLocation.data.taxiServices;
    taxiCityName = toLocation.data.name;
    taxiCitySlug = toLocation.data.slug;
  } else if (fromLocation.type === 'city' && fromLocation.data.taxiServices.length > 0) {
    taxiServices = fromLocation.data.taxiServices;
    taxiCityName = fromLocation.data.name;
    taxiCitySlug = fromLocation.data.slug;
  } else if (fromLocation.type === 'municipality') {
    // Nájdi najbližšie taxi
    const nearest = findNearestCitiesWithTaxis(fromLocation.data, 1);
    if (nearest.length > 0) {
      taxiServices = nearest[0].city.taxiServices;
      taxiCityName = nearest[0].city.name;
      taxiCitySlug = nearest[0].city.slug;
    }
  }

  const breadcrumbItems = [
    { label: fromName, href: `/taxi/${fromSlug}` },
    { label: `→ ${toName}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <SEOBreadcrumbs items={breadcrumbItems} />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Taxi {fromName} <ArrowRight className="inline h-8 w-8 text-primary-yellow" /> {toName}
          </h1>
          <p className="text-lg text-foreground/70">
            Orientačné informácie o trase a dostupných taxislužbách
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <MapPin className="h-8 w-8 text-primary-yellow mx-auto mb-2" />
            <p className="text-sm text-foreground/60">Vzdialenosť</p>
            <p className="text-2xl font-bold text-foreground">{distance} km</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Clock className="h-8 w-8 text-primary-yellow mx-auto mb-2" />
            <p className="text-sm text-foreground/60">Čas jazdy</p>
            <p className="text-2xl font-bold text-foreground">~{duration} min</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Car className="h-8 w-8 text-primary-yellow mx-auto mb-2" />
            <p className="text-sm text-foreground/60">Odhadovaná cena</p>
            <p className="text-2xl font-bold text-foreground">{priceMin}–{priceMax} €</p>
          </div>
        </div>

        {/* Taxi services */}
        {taxiServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Taxislužby z {taxiCityName}
            </h2>
            <div className="space-y-3">
              {taxiServices.slice(0, 5).map((service, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                  <div>
                    <p className="font-bold text-foreground">{service.name}</p>
                    <p className="text-sm text-foreground/60">{taxiCityName}</p>
                  </div>
                  {service.phone && (
                    <a
                      href={`tel:${service.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Volať
                    </a>
                  )}
                </div>
              ))}
            </div>
            <Link
              href={`/taxi/${taxiCitySlug}`}
              className="block text-center text-primary-yellow hover:underline mt-4"
            >
              Zobraziť všetky taxislužby v {taxiCityName} →
            </Link>
          </div>
        )}

        {/* Links to locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/taxi/${fromSlug}`}
            className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors"
          >
            <p className="text-sm text-foreground/60 mb-1">Východisko</p>
            <p className="text-lg font-bold text-foreground">{fromName}</p>
            <p className="text-sm text-primary-yellow mt-2">Zobraziť detail →</p>
          </Link>
          <Link
            href={`/taxi/${toSlug}`}
            className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors"
          >
            <p className="text-sm text-foreground/60 mb-1">Cieľ</p>
            <p className="text-lg font-bold text-foreground">{toName}</p>
            <p className="text-sm text-primary-yellow mt-2">Zobraziť detail →</p>
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-foreground/40 text-center mt-8">
          * Uvedené údaje sú orientačné. Skutočná cena závisí od konkrétnej taxislužby a aktuálnych podmienok.
        </p>
      </main>
    </div>
  );
}
