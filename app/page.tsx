/**
 * Homepage - Next.js App Router
 *
 * LCP Optimalizácia Fáza 2:
 * - Dynamic imports pre komponenty pod foldom (lazy loading)
 * - Suspense boundaries pre streaming SSR
 * - Server Component s vnoreným Client Components pre optimálne SEO
 */

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPinIcon } from '@/components/icons/MapPinIcon';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchPanel } from '@/components/SearchPanel';
import { RegionCard } from '@/components/RegionCard';
import { GeometricLines } from '@/components/GeometricLines';
import { getRegionsData } from '@/data/cities';
import routePagesData from '../src/data/route-pages.json';

// Dynamic imports pro komponenty pod foldem - snižuje initial JS bundle
// Tyto komponenty nejsou viditelné při prvním renderování (below the fold)
const AlphabeticalCityList = dynamic(
  () => import('@/components/AlphabeticalCityList').then((mod) => ({ default: mod.AlphabeticalCityList })),
  {
    ssr: true,
    loading: () => <AlphabeticalCityListSkeleton />,
  }
);

const ArticleBanner = dynamic(
  () => import('@/components/ArticleBanner').then((mod) => ({ default: mod.ArticleBanner })),
  {
    ssr: true,
    loading: () => <div className="h-48 bg-foreground/5 rounded-xl animate-pulse" />,
  }
);

const HowItWorks = dynamic(
  () => import('@/components/HowItWorks').then((mod) => ({ default: mod.HowItWorks })),
  {
    ssr: true,
    loading: () => <HowItWorksSkeleton />,
  }
);

// Skeleton komponenty pro loading states (below-the-fold komponenty)
function HowItWorksSkeleton() {
  return (
    <section className="py-12 md:py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="h-8 w-48 bg-foreground/10 rounded mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-foreground/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

function AlphabeticalCityListSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-6">
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} className="w-8 h-8 md:w-10 md:h-10 bg-foreground/10 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 bg-foreground/10 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Note: Globální metadata je definována v app/layout.tsx
// HomePage je Server Component, který obsahuje vnořené Client Components (Header, SearchPanel, ArticleBanner)

export default function HomePage() {
  const regions = getRegionsData();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header má z-50 (definované v komponente) - sticky navrchu */}
      <Header />

      {/* Hero Section */}
      <section className="pt-4 pb-6 md:pt-8 md:pb-8 px-4 md:px-8 relative hero-3d-bg z-10">
        <GeometricLines variant="hero" count={10} />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-2 md:space-y-3">
            {/* Taxi Logo - preloaded v layout.tsx pro lepší LCP */}
            <div className="mb-0">
              <Image
                src="/taxi-nearme-logo.webp"
                alt="Taxi NearMe - Český katalog taxislužeb"
                className="h-24 md:h-36 lg:h-44 xl:h-52 w-auto mx-auto rounded-2xl"
                width={600}
                height={327}
                sizes="(max-width: 640px) 176px, (max-width: 768px) 264px, (max-width: 1024px) 322px, 380px"
                priority
                fetchPriority="high"
              />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl text-foreground max-w-2xl mx-auto font-black px-4">
              Kompletní katalog taxislužeb v České republice
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-foreground/80 max-w-2xl mx-auto font-medium px-4">
              Najděte spolehlivé taxi kdekoliv jste - rychle, jednoduše a vždy nablízku.
            </p>
          </div>
        </div>
      </section>

      {/* Black line separator - z-10 */}
      <div className="border-b border-foreground/30 relative z-10"></div>

      {/* ZMĚNA: Odstraněn společný <div className="bg-white"> wrapper.
         Nyní jsou sekce přímými sourozenci Headeru a Hero sekce.
         Aplikujeme bg-white na každou sekci zvlášť.
      */}

      {/* SEARCH SECTION */}
      <section className="pt-6 pb-12 md:pt-8 md:pb-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <SearchPanel />
          </div>
        </div>
      </section>

      {/* REGIONS GRID */}
      <section id="cities" className="py-7 md:py-12 lg:py-14 px-2 md:px-5 bg-white relative">
        <GeometricLines variant="subtle" count={6} />
        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-5 md:mb-7 lg:mb-10">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 text-foreground">
              Taxislužby v České republice
            </h2>
            <p className="text-xs md:text-base text-foreground/90 font-bold px-2">
              Vyberte si kraj a najděte spolehlivé taxi ve vašem městě
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-5">
            {regions.map((region) => (
              <RegionCard
                key={region.slug}
                name={region.name}
                slug={region.slug}
                citiesCount={region.citiesCount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Alphabetical City/Municipality List */}
      <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8 bg-gradient-to-b from-white to-foreground/5 relative">
        <GeometricLines variant="subtle" count={6} />
        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground">
              Všechna města a obce v České republice
            </h2>
            <p className="text-sm md:text-base text-foreground/90 font-bold px-4">
              Vyberte si písmeno a najděte taxi ve vašem městě nebo obci
            </p>
            <p className="text-xs md:text-sm text-foreground/70 font-semibold mt-2">
              600+ měst s taxislužbami + 6 200 obcí s odkazy na nejbližší taxi
            </p>
          </div>
          <AlphabeticalCityList />
        </div>
      </section>

      {/* Article Banner / Blog */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center">
            <ArticleBanner />
          </div>
        </div>
      </section>

      {/* Popular Routes Section - only show if routes exist */}
      {routePagesData.routes.length > 0 && (
        <section className="py-12 md:py-16 px-4 md:px-8 bg-gradient-to-b from-foreground/5 to-white relative">
          <GeometricLines variant="subtle" count={4} />
          <div className="container mx-auto max-w-6xl relative">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground">
                Populární trasy
              </h2>
              <p className="text-sm md:text-base text-foreground/90 font-bold px-4">
                Nejvyhledávanější taxi transfery v Česku a do Německa
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {(routePagesData.routes as Array<{slug: string; origin: string; destination: string; distance_km: number; duration_min: number}>).map((route) => (
                <Link key={route.slug} href={`/trasa/${route.slug}`}>
                  <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-foreground/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2 text-base md:text-lg">
                          {route.origin} → {route.destination.split(' ')[0]}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-foreground/70">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-primary-yellow" />
                            {route.distance_km} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-primary-yellow" />
                            {route.duration_min} min
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-foreground/30 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <div className="bg-white">
        <HowItWorks />
      </div>

      {/* Map Section with 3D Effect */}
      <section className="py-7 md:py-12 lg:py-14 px-2 md:px-5 bg-white relative">
        <GeometricLines variant="section" count={8} />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center mb-5 md:mb-7 lg:mb-10">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 text-foreground">
              Dostupné všude
            </h2>
            <p className="text-xs md:text-sm text-foreground/90 font-bold px-2">
              Napište nám pokud tu chybí Vaše lokalita
            </p>
          </div>

          <div className="perspective-1000">
            <div className="relative bg-card rounded-xl md:rounded-2xl p-5 md:p-7 lg:p-10 card-3d min-h-[180px] md:min-h-[240px] flex items-center justify-center overflow-hidden">

              <div className="relative z-10 text-center px-2">
                <MapPinIcon
                  className="h-10 md:h-12 lg:h-14 w-10 md:w-12 lg:w-14 text-foreground mx-auto mb-2 md:mb-4"
                  strokeWidth={2.5}
                />
                <h3 className="text-sm md:text-base lg:text-lg font-semibold mb-2 md:mb-2 text-foreground">
                  Databáze taxislužeb z celé České republiky
                </h3>
                <p className="text-foreground/70 text-xs md:text-sm lg:text-base font-medium">
                  Připojte se k tisícům uživatelů, kteří jednoduše nacházejí taxíky
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with 3D Border */}
      <footer className="border-t border-foreground/30 py-5 md:py-7 px-2 md:px-5 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>

        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            <div className="text-xs md:text-sm text-foreground font-bold text-center md:text-left">
              © 2025 Taxi NearMe. Všechna práva vyhrazena.
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-5">
              <Link
                href="/ochrana-soukromi"
                className="text-xs md:text-sm text-foreground font-bold hover:text-foreground/70 transition-colors duration-200"
                title="Ochrana soukromí a GDPR"
              >
                Ochrana soukromí
              </Link>
              <Link
                href="/podminky-pouzivani"
                className="text-xs md:text-sm text-foreground font-bold hover:text-foreground/70 transition-colors duration-200"
                title="Podmínky používání služby"
              >
                Podmínky používání
              </Link>
              <Link
                href="/kontakt"
                className="text-xs md:text-sm text-foreground font-bold hover:text-foreground/70 transition-colors duration-200"
                title="Kontaktní formulář"
              >
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
