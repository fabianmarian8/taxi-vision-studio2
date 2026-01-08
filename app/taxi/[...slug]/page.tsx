/**
 * Catch-all Taxi Route - Handles all /taxi/* URLs
 *
 * URL Patterns:
 * - /taxi/[citySlug]                           → City/Municipality page
 * - /taxi/[citySlug]/[serviceSlug]             → Taxi service detail page
 * - /taxi/[regionSlug]/[districtSlug]          → District page (NEW - hierarchical)
 * - /taxi/[regionSlug]/[districtSlug]/[munSlug] → Hierarchical municipality page (NEW)
 *
 * The catch-all route eliminates Next.js route conflicts by handling all patterns
 * in a single route with intelligent pattern matching.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { HowItWorks } from '@/components/HowItWorks';
import { GeometricLines } from '@/components/GeometricLines';
import { CityFAQ } from '@/components/CityFAQ';
import { CityContent } from '@/components/CityContent';
import { SEOBreadcrumbs } from '@/components/SEOBreadcrumbs';
import { LocalBusinessSchema } from '@/components/schema/LocalBusinessSchema';
import { TaxiServiceSchema } from '@/components/schema/TaxiServiceSchema';
import { MapPin, Phone, Globe, Crown, ArrowLeft, Star, BadgeCheck, CheckCircle2, ArrowRight, Clock, Award, Car, MessageCircle, Eye, FileText, ScrollText, Users, Facebook, Instagram, Mail } from 'lucide-react';
import { getCityBySlug, createRegionSlug, slovakCities, getRegionBySlug, type CityData, type TaxiService, findNearbyCitiesWithTaxis } from '@/data/cities';
import { NearbyCitiesSection } from '@/components/NearbyCitiesSection';
import { getMunicipalityBySlug, findNearestCitiesWithTaxis, allMunicipalities, type Municipality } from '@/data/municipalities';
import {
  getDistrictBySlugAndRegion,
  getDistrictsByRegionSlug,
  getMunicipalitiesByDistrictSlug,
  getDistrictForMunicipality,
  createDistrictSlug,
  isValidRegionSlug,
  isValidDistrictSlug,
  getAllDistricts,
  type District
} from '@/data/districts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateUrl } from '@/utils/urlUtils';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { RouteMapWrapper } from '@/components/RouteMapWrapper';
import { generateUniqueServiceContent, generateUniqueMetaDescription } from '@/utils/contentVariations';
import { GoogleReviewsSection } from '@/components/GoogleReviewsSection';
import { fetchGoogleReviews } from '@/lib/google-reviews';
import { ServiceContactButtons } from '@/components/ServiceContactButtons';
import { PhoneLink } from '@/components/PhoneLink';
import { TrackedPhoneButton } from '@/components/TrackedPhoneButton';
import { TaxiGallery } from '@/components/TaxiGallery';
import { TaxiPricelist } from '@/components/TaxiPricelist';
import { MunicipalityInfo } from '@/components/MunicipalityInfo';
import { NearbyMunicipalities } from '@/components/NearbyMunicipalities';
import { ReportNumberButton } from '@/components/ReportNumberModal';
import { OwnerClaimButton } from '@/components/OwnerClaimButton';
import { getMunicipalityStats } from '@/lib/municipality-data';
import { TaxiPromoBanner } from '@/components/TaxiPromoBanner';
import { getApprovedPartnerData } from '@/lib/partner-data';
import { checkPartnerOwnership } from '@/lib/partner-ownership';
import { checkCityEditAccess } from '@/lib/city-ownership';
import { getPartnerSkinClass, normalizePartnerSkin } from '@/lib/partner-skins';
import { PartnerPageWrapper, CityEditorProvider, EditableCityDescription } from '@/components/inline-editor';
import { EditableHeroTitle, EditableDescription, EditableHeroImage, EditableGallery, EditableServices, EditableContactButtons, EditablePhoneButton } from '@/components/partner/PartnerPageContent';

import {
  getLocationBySlug,
  locationToMunicipality,
  locations,
  type Location
} from '@/data/locations';
import {
  generateMetaDescription as generateDeclensionMetaDescription,
  generateIntroText,
  getLocativePhrase,
  getAccusativePhrase,
  getGenitivePhrase
} from '@/utils/declensions';

// ISR: Revalidate every 60 seconds for partner data updates
// Partners can edit their profiles in real-time, so we need fresh data
export const revalidate = 60;

// Enable dynamic params for all patterns
export const dynamicParams = true;

// ============================================================================
// ROUTE PATTERN DETECTION
// ============================================================================

type RouteType =
  | { type: 'city'; city: CityData }
  | { type: 'municipality'; municipality: Municipality }
  | { type: 'location'; location: Location }
  | { type: 'service'; city: CityData; service: TaxiService; serviceSlug: string }
  | { type: 'district'; district: District; regionSlug: string }
  | { type: 'hierarchical'; municipality: Municipality; district: District; regionSlug: string }
  | { type: 'redirect'; to: string }
  | { type: 'notFound' };

function createServiceSlug(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function detectRouteType(slugArray: string[]): RouteType {
  if (slugArray.length === 1) {
    // Pattern: /taxi/[slug]
    const slug = slugArray[0];

    // Check if it's a main city with taxi services
    const city = getCityBySlug(slug);
    if (city) {
      return { type: 'city', city };
    }

    // Check if it's a special location (Tale, Chopok, etc.)
    const location = getLocationBySlug(slug);
    if (location) {
      return { type: 'location', location };
    }

    // Check if it's a municipality (village without taxi)
    const municipality = getMunicipalityBySlug(slug);
    if (municipality) {
      // For backward compatibility, redirect to hierarchical URL
      const district = getDistrictForMunicipality(municipality);
      if (district) {
        return {
          type: 'redirect',
          to: `/taxi/${district.regionSlug}/${district.slug}/${slug}`
        };
      }
      // Fallback: show municipality page at old URL
      return { type: 'municipality', municipality };
    }

    return { type: 'notFound' };
  }

  if (slugArray.length === 2) {
    // Pattern: /taxi/[first]/[second]
    // Could be: /taxi/citySlug/serviceSlug OR /taxi/regionSlug/districtSlug
    const [first, second] = slugArray;

    // First, check if it's a city + service pattern
    const city = getCityBySlug(first);
    if (city) {
      const service = city.taxiServices.find(s => createServiceSlug(s.name) === second);
      if (service) {
        // Check if service has redirect
        if (service.redirectTo) {
          return { type: 'redirect', to: service.redirectTo };
        }
        return { type: 'service', city, service, serviceSlug: second };
      }
    }

    // Then, check if it's a region + district pattern (hierarchical)
    if (isValidRegionSlug(first)) {
      const district = getDistrictBySlugAndRegion(second, first);
      if (district) {
        return { type: 'district', district, regionSlug: first };
      }
    }

    return { type: 'notFound' };
  }

  if (slugArray.length === 3) {
    // Pattern: /taxi/[regionSlug]/[districtSlug]/[municipalitySlug]
    const [regionSlug, districtSlug, munSlug] = slugArray;

    // Validate region and district
    const district = getDistrictBySlugAndRegion(districtSlug, regionSlug);
    if (!district) {
      return { type: 'notFound' };
    }

    // IMPORTANT: Check if it's a main city with taxi services FIRST
    // If so, redirect to the primary URL to avoid duplicate content
    const cityWithTaxi = getCityBySlug(munSlug);
    if (cityWithTaxi && cityWithTaxi.taxiServices.length > 0) {
      return {
        type: 'redirect',
        to: `/taxi/${cityWithTaxi.slug}`
      };
    }

    // Check if it's a location
    const location = getLocationBySlug(munSlug);
    if (location) {
       // Locations are not usually hierarchical, but if accessed this way, redirect to canonical
       return {
         type: 'redirect',
         to: `/taxi/${location.slug}`
       };
    }

    // Find municipality (village without taxi in our DB)
    const municipality = getMunicipalityBySlug(munSlug);
    if (municipality) {
      // Also check if this municipality is actually a city with taxi services
      // (in case it exists in both lists)
      const cityCheck = getCityBySlug(municipality.slug);
      if (cityCheck && cityCheck.taxiServices.length > 0) {
        return {
          type: 'redirect',
          to: `/taxi/${cityCheck.slug}`
        };
      }
      return { type: 'hierarchical', municipality, district, regionSlug };
    }

    return { type: 'notFound' };
  }

  return { type: 'notFound' };
}

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

export function generateStaticParams() {
  const params: { slug: string[] }[] = [];

  // 1. Main cities: /taxi/[citySlug]
  slovakCities.forEach(city => {
    params.push({ slug: [city.slug] });

    // 2. Taxi services: /taxi/[citySlug]/[serviceSlug]
    city.taxiServices.forEach(service => {
      params.push({ slug: [city.slug, createServiceSlug(service.name)] });
    });
  });

  // 3. Locations: /taxi/[locationSlug]
  locations.forEach(location => {
    params.push({ slug: [location.slug] });
  });

  // 4. Districts: /taxi/[regionSlug]/[districtSlug]
  const districts = getAllDistricts();
  districts.forEach(district => {
    params.push({ slug: [district.regionSlug, district.slug] });
  });

  // Note: We don't pre-generate all 2897 municipalities - they use ISR

  return params;
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const routeType = detectRouteType(slug);
  const baseUrl = 'https://www.taxinearme.sk';
  const siteName = 'TaxiNearMe';
  const currentYear = new Date().getFullYear();

  switch (routeType.type) {
    case 'city': {
      const { city } = routeType;
      const currentUrl = `${baseUrl}/taxi/${city.slug}`;
      const taxiCount = city.taxiServices?.length || 0;
      const taxiServicesList = city.taxiServices.slice(0, 3).map(s => s.name).join(', ');
      const locationText = city.isVillage ? 'v obci' : 'v meste';
      const countText = taxiCount > 5 ? `${taxiCount}+` : taxiCount > 0 ? `${taxiCount}` : '';

      // Pre obce (isVillage) iný formát - bez "Taxi" v nadpise
      const titlePrefix = city.isVillage ? '' : 'Taxi ';
      const description = countText
        ? `${city.isVillage ? 'Taxislužba' : 'Taxi'} ${locationText} ${city.name} - ${countText} taxislužieb s telefónnymi číslami. ${taxiServicesList ? `${taxiServicesList}.` : ''} Objednajte taxi jednoducho.`
        : `${city.isVillage ? 'Taxislužba' : 'Taxi'} ${locationText} ${city.name} - Kontakty na taxislužby. Objednajte taxi jednoducho.`;

      // Title format: "Streda nad Bodrogom - 1 taxislužba" pre obce, "Taxi Bratislava - 15+ taxislužieb" pre mestá
      const titleWithCount = countText
        ? `${titlePrefix}${city.name} - ${countText} ${taxiCount === 1 ? 'taxislužba' : 'taxislužieb'} | ${siteName}`
        : `${titlePrefix}${city.name} - Taxislužby | ${siteName}`;

      return {
        title: titleWithCount,
        description,
        keywords: city.keywords || [`taxi ${city.name}`, `taxislužby ${city.name}`, `taxi ${city.region}`, 'objednať taxi'],
        openGraph: {
          title: `${titlePrefix}${city.name} - ${countText ? countText + (taxiCount === 1 ? ' taxislužba' : ' taxislužieb') : 'Taxislužby'}`,
          description,
          type: 'website',
          locale: 'sk_SK',
          url: currentUrl,
          siteName,
          images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
        },
        alternates: { canonical: currentUrl },
      };
    }

    case 'location': {
      const { location } = routeType;
      const currentUrl = `${baseUrl}/taxi/${location.slug}`;
      
      return {
        title: `${location.metaDescription.split('-')[0].trim()} | ${siteName}`,
        description: location.metaDescription,
        keywords: [`taxi ${location.name}`, `taxislužba ${location.name}`, `taxi ${location.district}`, `taxi ${location.region}`],
        openGraph: {
          title: `Taxi ${location.name} - Taxislužby`,
          description: location.metaDescription,
          type: 'website',
          locale: 'sk_SK',
          url: currentUrl,
          siteName,
          images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
        },
        alternates: { canonical: currentUrl },
      };
    }

    case 'municipality': {
      const { municipality } = routeType;
      const nearestCities = findNearestCitiesWithTaxis(municipality, 1);
      const nearestCity = nearestCities[0];
      const currentUrl = `${baseUrl}/taxi/${municipality.slug}`;
      const description = `Taxi v obci ${municipality.name} - Najbližšie taxislužby v meste ${nearestCity?.city.name} (${nearestCity?.distance} km). Objednajte taxi jednoducho.`;

      return {
        title: `Taxi ${municipality.name} - Taxislužby v okolí | ${siteName}`,
        description,
        keywords: [`taxi ${municipality.name}`, `taxislužby ${municipality.name}`, `taxi ${municipality.district}`, `taxi ${municipality.region}`],
        openGraph: {
          title: `Taxi ${municipality.name} - Taxislužby v okolí`,
          description,
          type: 'website',
          locale: 'sk_SK',
          url: currentUrl,
          siteName,
          images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
        },
        alternates: { canonical: currentUrl },
      };
    }

    case 'service': {
      const { city, service, serviceSlug } = routeType;
      const currentUrl = `${baseUrl}/taxi/${city.slug}/${serviceSlug}`;
      const description = generateUniqueMetaDescription(service.name, city.name, service.phone || '');

      return {
        title: `${service.name} - Taxi ${city.name} | ${siteName}`,
        description,
        keywords: [service.name, `taxi ${city.name}`, `taxislužba ${city.name}`, `${service.name} ${city.name}`],
        openGraph: {
          title: `${service.name} - Taxi ${city.name}`,
          description,
          type: 'website',
          locale: 'sk_SK',
          url: currentUrl,
          siteName,
          images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
        },
        alternates: { canonical: currentUrl },
      };
    }

    case 'district': {
      const { district, regionSlug } = routeType;
      const currentUrl = `${baseUrl}/taxi/${regionSlug}/${district.slug}`;
      const description = `Taxi v okrese ${district.name} - Zoznam ${district.municipalitiesCount} obcí a miest s taxislužbami. Objednajte taxi jednoducho.`;

      return {
        title: `Taxi okres ${district.name} - ${district.municipalitiesCount} obcí | ${siteName}`,
        description,
        keywords: [`taxi ${district.name}`, `taxislužby okres ${district.name}`, `taxi ${district.region}`, 'taxi obce'],
        openGraph: {
          title: `Taxi okres ${district.name} - ${district.municipalitiesCount} obcí`,
          description,
          type: 'website',
          locale: 'sk_SK',
          url: currentUrl,
          siteName,
          images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
        },
        alternates: { canonical: currentUrl },
      };
    }

    case 'hierarchical': {
      const { municipality, district, regionSlug } = routeType;
      const nearestCities = findNearestCitiesWithTaxis(municipality, 1);
      const nearestCity = nearestCities[0];
      const currentUrl = `${baseUrl}/taxi/${regionSlug}/${district.slug}/${municipality.slug}`;
      let description = `Taxi v obci ${municipality.name}, okres ${district.name} - Najbližšie taxislužby v meste ${nearestCity?.city.name} (${nearestCity?.distance} km). Objednajte taxi.`;
      let keywords = [`taxi ${municipality.name}`, `taxi okres ${district.name}`, `taxislužby ${municipality.name}`, `taxi ${district.region}`];
      let title = `Taxi ${municipality.name} - okres ${district.name} | ${siteName}`;

      // SEO optimalizácia pre Lešť - multilingválne dopyty pre NATO vojská
      if (municipality.slug === 'lest-vojensky-obvod') {
        title = `Taxi Lešť NATO base - Military Taxi Service | ${siteName}`;
        description = `Reliable 24/7 Taxi service for NATO personnel at Lešť military base. English speaking drivers, transfers to Zvolen, Banská Bystrica, and Airports (Vienna, Budapest). Book via WhatsApp.`;
        keywords = [
          ...keywords,
          'Taxi Lest', 'NATO base taxi', 'Taxi Force Lest', 'Lest military area transport', // EN
          'Táxi Lešť', 'transporte base militar', // PT
          'Taxi base militar Lešť', // ES
          'Taxi vojašnica Lešť', // SI
          'Taxi baza militară Lešť', // RO
          'Taxi Truppenübungsplatz Lešť', // DE
          'Vojenský újezd Lešť taxi' // CZ
        ];
      }

      // SEO optimalizácia pre VŠETKY obce bez taxislužieb - korektné slovenské skloňovanie
      if (nearestCity) {
        const nearestCitiesMultiple = findNearestCitiesWithTaxis(municipality, 2);
        const cityNames = nearestCitiesMultiple.map(c => c.city.name).join(', ');

        title = `Taxi ${municipality.name} – najbližšie taxislužby (${cityNames}) | ${siteName}`;
        // Generované meta description s korektným skloňovaním
        description = generateDeclensionMetaDescription(
          { slug: municipality.slug, name: municipality.name },
          nearestCitiesMultiple.map(c => ({
            city: { slug: c.city.slug, name: c.city.name },
            roadDistance: c.roadDistance,
            duration: c.duration
          }))
        );
        // Dynamické keywords s korektným skloňovaním
        const accusativeForm = getAccusativePhrase(municipality.slug, municipality.name);
        keywords = [
          `taxi ${municipality.name}`,
          `taxi ${accusativeForm.replace('do ', '')}`, // "taxi do Aboviec" → "taxi Aboviec"
          `taxislužba ${municipality.name}`,
          `taxi ${nearestCity.city.name}`,
          `taxi okres ${district.name}`,
          `najbližšie taxi ${municipality.name}`
        ];
      }

      return {
        title,
        description,
        keywords,
        openGraph: {
          title,
          description,
          type: 'website',
          locale: 'sk_SK',
          url: currentUrl,
          siteName,
          images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
        },
        alternates: { canonical: currentUrl },
      };
    }

    default:
      return {
        title: 'Stránka nenájdená',
        description: 'Požadovaná stránka nebola nájdená',
      };
  }
}

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

// ============================================================================
// UNIVERSAL LIST VIEW - Vylepšený dizajn s úpravami od oponenta
// H1: 28-32px, Riadok: 80px, Logo: 40px s fallback, Akcia podľa typu
// Aplikované na VŠETKY mestá a obce s taxislužbami
// ============================================================================

function createServiceSlugForList(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function UniversalListView({
  city,
  regionSlug,
  locationText,
  partnerRatings,
  isAdmin = false
}: {
  city: CityData;
  regionSlug: string;
  locationText: string;
  partnerRatings: Map<string, { rating: number; count: number }>;
  isAdmin?: boolean;
}) {
  // Separate services by tier (redirectTo = partner redirect, counts as partner)
  const partners = city.taxiServices.filter(s => s.isPartner || s.redirectTo);
  const premiums = city.taxiServices.filter(s => s.isPremium && !s.isPartner && !s.redirectTo);
  const standard = city.taxiServices.filter(s => !s.isPremium && !s.isPartner && !s.redirectTo);

  // Shuffle Premium services using deterministic daily seed
  const dailySeed = new Date().toISOString().slice(0, 10);
  const shuffledPremiums = [...premiums].sort((a, b) => {
    const hashA = `${dailySeed}-${a.name}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hashB = `${dailySeed}-${b.name}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hashA - hashB;
  });

  // Sort standard alphabetically
  const sortedStandard = [...standard].sort((a, b) => a.name.localeCompare(b.name, 'sk'));

  // Combine: Partners first, then shuffled Premium, then alphabetical standard
  const allServices = [...partners, ...shuffledPremiums, ...sortedStandard];

  // Helper: Určenie primárnej akcie podľa typu služby
  const getPrimaryAction = (service: TaxiService) => {
    // Ak má telefón, primárna akcia je volanie
    if (service.phone) {
      return { type: 'phone' as const, value: service.phone };
    }
    // Ak má len web, primárna akcia je web
    if (service.website) {
      return { type: 'web' as const, value: service.website };
    }
    // Bez kontaktu
    return null;
  };

  // Initial data for city editor
  const cityEditorData = {
    name: city.name,
    description: city.description,
    meta_description: city.metaDescription,
    keywords: city.keywords,
    hero_image: city.heroImage,
  };

  return (
    <CityEditorProvider
      initialData={cityEditorData}
      isAdmin={isAdmin}
      citySlug={city.slug}
    >
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LocalBusinessSchema city={city} />
      <Header />

      <SEOBreadcrumbs
        items={[
          { label: city.region, href: `/kraj/${regionSlug}` },
          { label: city.name },
        ]}
      />

      {/* H1 header - 28-32px podľa oponenta */}
      <section className="pt-4 pb-3 px-4 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-[28px] md:text-[32px] font-black text-foreground leading-tight">
            {city.isVillage ? city.name : `Taxi ${city.name}`}
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            {city.taxiServices.length} {city.taxiServices.length === 1 ? 'taxislužba' : 'taxislužieb'} • {city.region}
          </p>
          {/* City description - editable by admin */}
          {city.description && (
            <EditableCityDescription fieldKey="description" className="text-base">
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">
                {city.description}
              </p>
            </EditableCityDescription>
          )}
        </div>
      </section>

      {/* Kompaktný List View - 80px riadky podľa oponenta */}
      <section className="py-2 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="divide-y divide-gray-100">
            {allServices.map((service, index) => {
              const serviceSlug = createServiceSlug(service.name);
              // Služba s redirectTo na partner stránku sa tiež zobrazí ako partner
              const isPartner = service.isPartner || !!service.redirectTo;
              const isPremium = service.isPremium;
              const ratingData = partnerRatings.get(service.name);
              const primaryAction = getPrimaryAction(service);

              // Získaj iniciály pre fallback logo (40x40px podľa oponenta)
              const initials = service.name
                .split(' ')
                .filter(word => word.length > 0)
                .slice(0, 2)
                .map(word => word.charAt(0).toUpperCase())
                .join('');

              // Typ služby pre vizuálne odlíšenie
              const serviceType = isPartner ? 'partner' : isPremium ? 'premium' : 'standard';

              // Partner hero image pre pozadie
              const partnerHeroImage = service.partnerData?.heroImage;

              return (
                <div
                  key={index}
                  className={`py-3 px-3 transition-colors relative overflow-hidden ${
                    isPartner
                      ? 'bg-purple-50 hover:bg-purple-100'
                      : isPremium
                      ? 'bg-amber-50 hover:bg-amber-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Partner background image - fade from middle to right */}
                  {isPartner && partnerHeroImage && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: 0,
                        bottom: 0,
                        left: '50%',
                        right: 0,
                        backgroundImage: `url(${partnerHeroImage})`,
                        backgroundPosition: 'center 75%',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
                      }}
                    />
                  )}
                  {/* Hlavný riadok - logo, názov, akcia */}
                  <div className="flex items-center gap-3 relative z-10" style={{ minHeight: '56px' }}>
                  {/* Logo/Iniciály - 40x40px s fallback podľa oponenta */}
                  <Link href={`/taxi/${city.slug}/${serviceSlug}`} className="flex-shrink-0">
                    {service.logo ? (
                      <img
                        src={service.logo}
                        alt={`${service.name} logo`}
                        className={`w-10 h-10 rounded-full object-cover transition-transform hover:scale-105 ${
                          isPartner
                            ? 'ring-2 ring-purple-300'
                            : isPremium
                            ? 'ring-2 ring-amber-300'
                            : 'ring-1 ring-gray-200'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 ${
                          isPartner
                            ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                            : isPremium
                            ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                            : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                        }`}
                      >
                        {initials || '?'}
                      </div>
                    )}
                  </Link>

                  {/* Stredná časť - Názov + info (hierarchia textu podľa oponenta) */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/taxi/${city.slug}/${serviceSlug}`}
                      className="block group"
                    >
                      {/* Názov - tučne, väčší */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-base group-hover:text-foreground/80 transition-colors line-clamp-1">
                          {service.name}
                        </span>
                      </div>

                      {/* Partner popis - pod názvom, nad odznakmi */}
                      {isPartner && (
                        <p className="text-xs text-foreground/60 mt-0.5">
                          Profesionálna preprava s dôrazom na spoľahlivosť, bezpečnosť a komfort.
                        </p>
                      )}

                      {/* Sekundárne info - menšie, šedé */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Badge */}
                        {isPartner && (
                          <>
                            <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">
                              PARTNER
                            </span>
                            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                              <BadgeCheck className="h-3 w-3" />
                              OVERENÉ
                            </span>
                          </>
                        )}
                        {isPremium && !isPartner && (
                          <>
                            <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded font-bold">
                              PREMIUM
                            </span>
                            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                              <BadgeCheck className="h-3 w-3" />
                              OVERENÉ
                            </span>
                          </>
                        )}
                        {/* Neoverené badge pre štandardné služby */}
                        {!isPartner && !isPremium && (
                          <span className="text-[10px] bg-gray-400 text-white px-1.5 py-0.5 rounded font-medium">
                            Neoverené
                          </span>
                        )}

                        {/* Rating - malé, len pre ne-partnerov (partneri majú veľký baner) */}
                        {ratingData && !isPartner && (
                          <span className="flex items-center gap-0.5 text-xs text-foreground/60">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {ratingData.rating.toFixed(1)}
                            <span className="text-foreground/40">({ratingData.count})</span>
                          </span>
                        )}

                        {/* Web indicator */}
                        {service.website && (
                          <span className="flex items-center gap-0.5 text-xs text-foreground/40">
                            <Globe className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Pravá strana - Primárna akcia podľa typu (oponent) */}
                  {primaryAction && (
                    primaryAction.type === 'phone' ? (
                      <TrackedPhoneButton
                        phone={primaryAction.value}
                        serviceName={service.name}
                        citySlug={city.slug}
                        className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                          isPartner
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200'
                        }`}
                        title={`Zavolať ${service.name}`}
                      >
                        <Phone className="h-4 w-4" />
                        <span>VOLAŤ</span>
                      </TrackedPhoneButton>
                    ) : (
                      <a
                        href={primaryAction.value.startsWith('http') ? primaryAction.value : `https://${primaryAction.value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                          isPartner
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                            : isPremium
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        }`}
                        title={`Web ${service.name}`}
                        style={{ minWidth: '100px' }}
                      >
                        <Globe className="h-4 w-4" />
                        <span>WEB</span>
                      </a>
                    )
                  )}
                  </div>

                  {/* Google Rating Baner - LEN pre Partnerov */}
                  {isPartner && ratingData && (
                    <div className="mt-2 px-3 py-2 bg-white rounded-lg border border-purple-200 shadow-sm">
                      {/* Google rating */}
                      <div className="flex items-center gap-2">
                        {/* Google logo */}
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        {/* Hviezdy */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(ratingData.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Hodnotenie a počet */}
                        <span className="font-bold text-gray-900">{ratingData.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({ratingData.count} hodnotení)</span>
                        {/* Verified badge */}
                        <BadgeCheck className="h-4 w-4 text-purple-600 ml-auto" />
                      </div>
                    </div>
                  )}

                  {/* Telefónne číslo + Nahlásiť nefunkčné - globálne pre všetky služby */}
                  {service.phone && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 relative z-10">
                      <p className="text-sm text-foreground/60">
                        {service.phone}
                      </p>
                      <ReportNumberButton
                        serviceName={service.name}
                        servicePhone={service.phone}
                        cityName={city.name}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state podľa oponenta */}
          {allServices.length === 0 && (
            <div className="py-12 text-center">
              <MapPin className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/60 font-medium">
                Žiadne taxislužby nenájdené
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Partner & Premium info banner */}
      <TaxiPromoBanner
        cityName={city.name}
        locationText={locationText}
        taxiCount={city.taxiServices.length}
      />

      <CityContent citySlug={city.slug} cityName={city.name} />
      <NearbyCitiesSection
        nearbyCities={findNearbyCitiesWithTaxis(city, 6)}
        currentCityName={city.name}
      />
      <CityFAQ cityName={city.name} citySlug={city.slug} isVillage={city.isVillage} />
      <HowItWorks />
      <Footer />
    </div>
    </CityEditorProvider>
  );
}

// Helper to fetch ratings for partner services
async function getPartnerRatings(services: TaxiService[]): Promise<Map<string, { rating: number; count: number }>> {
  const ratings = new Map<string, { rating: number; count: number }>();

  const partnerServices = services.filter(s => s.isPartner && s.partnerData?.googlePlaceId);

  await Promise.all(
    partnerServices.map(async (service) => {
      const placeId = service.partnerData?.googlePlaceId;
      if (placeId) {
        const result = await fetchGoogleReviews(placeId);
        if (result.success && result.data) {
          ratings.set(service.name, {
            rating: result.data.rating,
            count: result.data.user_ratings_total
          });
        }
      }
    })
  );

  return ratings;
}

async function CityPage({ city }: { city: CityData }) {
  const regionSlug = createRegionSlug(city.region);
  // Pre obce s isVillage: true používame "v obci", inak "v meste"
  const locationText = city.isVillage ? 'v obci' : 'v meste';

  // Fetch ratings for partner services
  const partnerRatings = await getPartnerRatings(city.taxiServices);

  // Check if current user is admin (for inline city editing)
  const { isAdmin } = await checkCityEditAccess();

  // Všetky mestá používajú vylepšený List View dizajn od oponenta
  return <UniversalListView city={city} regionSlug={regionSlug} locationText={locationText} partnerRatings={partnerRatings} isAdmin={isAdmin} />;

}
// Helper to sort services by tier: Partner > Premium > Standard > Alphabetical
function sortServicesByTier(services: TaxiService[]) {
  return [...services].sort((a, b) => {
    // 1. Partner (check isPartner OR redirectTo which implies partner linking)
    const aPartner = a.isPartner || !!a.redirectTo;
    const bPartner = b.isPartner || !!b.redirectTo;
    
    if (aPartner && !bPartner) return -1;
    if (!aPartner && bPartner) return 1;

    // 2. Premium
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;

    // 3. Alphabetical
    return a.name.localeCompare(b.name, 'sk');
  });
}

function MunicipalityPage({ municipality, isHierarchical = false, district, overrideNearestCities, customContent, customFaqs, hideNearbyTaxisSection = false, priceOverride, ctaOverride, whatsappNumber }: {
  municipality: Municipality;
  isHierarchical?: boolean;
  district?: District;
  overrideNearestCities?: Array<{ city: CityData; distance: number; roadDistance: number; duration: number }>;
  customContent?: { intro: string; transport: string; attractions: string };
  customFaqs?: Array<{ question: string; answer: string }>;
  hideNearbyTaxisSection?: boolean;
  priceOverride?: { min: number; max: number };
  ctaOverride?: { text: string; href: string; heroImage?: string; logo?: string };
  whatsappNumber?: string;
}) {
  // Check if this municipality is actually a city with taxi services
  const cityWithTaxi = getCityBySlug(municipality.slug);
  const hasTaxiServices = cityWithTaxi && cityWithTaxi.taxiServices.length > 0;

  const nearestCities = overrideNearestCities || (hasTaxiServices ? [] : findNearestCitiesWithTaxis(municipality, 3));
  const regionSlug = createRegionSlug(municipality.region);
  const actualDistrict = district || getDistrictForMunicipality(municipality);

  // Get municipalities in the same district for internal linking
  const municipalitiesInDistrict = actualDistrict
    ? getMunicipalitiesByDistrictSlug(actualDistrict.slug)
    : [];

  // Get municipality statistics (PSČ, population, area)
  const municipalityStats = getMunicipalityStats(
    municipality.slug,
    municipality.name,
    municipality.district
  );

  const breadcrumbItems = isHierarchical && actualDistrict
    ? [
        { label: municipality.region, href: `/kraj/${regionSlug}` },
        { label: `Okres ${actualDistrict.name}`, href: `/taxi/${regionSlug}/${actualDistrict.slug}` },
        { label: municipality.name },
      ]
    : [
        { label: municipality.region, href: `/kraj/${regionSlug}` },
        { label: municipality.name },
      ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      <SEOBreadcrumbs items={breadcrumbItems} />

      {/* Above The Fold dizajn - pre VŠETKY obce bez taxislužieb */}
      {!hasTaxiServices && nearestCities.length > 0 ? (
        <section className="relative bg-gradient-to-br from-primary-yellow/10 via-white to-primary-yellow/5">
          <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
            {/* H1 + Pravdivá veta */}
            <div className="mb-6">
              <p className="text-sm text-foreground/60 mb-1">
                {isHierarchical && actualDistrict ? `Okres ${actualDistrict.name}` : municipality.region}
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-tight">
                Taxi {municipality.name}
              </h1>
              <p className="text-base md:text-lg text-foreground/70 mt-3 max-w-2xl">
                {generateIntroText({ slug: municipality.slug, name: municipality.name })}
              </p>
            </div>

            {/* TOP 3 TAXI KARTY S VOLÁŤ - ABOVE THE FOLD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {nearestCities.slice(0, 3).flatMap(({ city, roadDistance, duration }) =>
                city.taxiServices.slice(0, 1).map((service, idx) => {
                  const isPartner = service.isPartner || !!service.redirectTo;
                  const isPremium = service.isPremium && !isPartner;
                  const serviceSlug = createServiceSlug(service.name);
                  const serviceDetailUrl = `/taxi/${city.slug}/${serviceSlug}`;
                  return (
                    <div
                      key={`${city.slug}-${idx}`}
                      className={`rounded-xl p-4 shadow-lg border-2 ${
                        isPartner
                          ? 'bg-gradient-to-br from-purple-50 to-white border-purple-300'
                          : isPremium
                          ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Header - meno + badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <Link href={serviceDetailUrl} className={`font-bold text-lg hover:underline ${isPartner ? 'text-purple-900' : 'text-foreground'}`}>
                            <h3>{service.name}</h3>
                          </Link>
                          <Link href={`/taxi/${city.slug}`} className="text-sm text-foreground/60 hover:underline">
                            {city.name}
                          </Link>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {isPartner && (
                            <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              PARTNER
                            </span>
                          )}
                          {/* Trust signál s dátumom */}
                          {(isPartner || isPremium) ? (
                            <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3" />
                              Overené: 01/2026
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-400 text-white px-2 py-0.5 rounded font-medium">
                              Neoverené
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info - vzdialenosť + čas */}
                      <div className="flex items-center gap-3 text-sm text-foreground/70 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {roadDistance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          ~{duration} min
                        </span>
                      </div>

                      {/* VOLÁŤ BUTTON - tel: link */}
                      {service.phone && (
                        <a
                          href={`tel:${service.phone.replace(/\s/g, '')}`}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-bold text-white transition-all shadow-md hover:shadow-lg ${
                            isPartner
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <Phone className="h-5 w-5" />
                          VOLÁŤ
                        </a>
                      )}

                      {/* Telefónne číslo + Nahlásiť nefunkčné */}
                      {service.phone && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-foreground/60">
                            {service.phone}
                          </p>
                          <ReportNumberButton
                            serviceName={service.name}
                            servicePhone={service.phone}
                            cityName={city.name}
                          />
                        </div>
                      )}

                      {/* Sekundárny link na profil - dôležité pre interné linkovanie */}
                      <Link
                        href={serviceDetailUrl}
                        className="block text-center text-xs text-foreground/50 hover:text-foreground/70 hover:underline mt-2 pt-2 border-t border-gray-100"
                      >
                        Zobraziť profil →
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mapa - MENŠIA, pod kartami */}
            {municipality.latitude && municipality.longitude &&
             nearestCities[0].city.latitude && nearestCities[0].city.longitude && (
              <div className="rounded-xl overflow-hidden shadow-lg h-[250px] md:h-[300px]">
                <RouteMapWrapper
                  fromLat={municipality.latitude}
                  fromLng={municipality.longitude}
                  fromName={municipality.name}
                  fromSlug={municipality.slug}
                  toLat={nearestCities[0].city.latitude}
                  toLng={nearestCities[0].city.longitude}
                  toName={nearestCities[0].city.name}
                  toSlug={nearestCities[0].city.slug}
                  distance={nearestCities[0].distance}
                  roadDistance={nearestCities[0].roadDistance}
                  duration={nearestCities[0].duration}
                  priceMin={priceOverride?.min}
                  priceMax={priceOverride?.max}
                />
              </div>
            )}

            {/* Link na všetky služby v najbližšom meste */}
            <div className="mt-6 text-center">
              <Link
                href={`/taxi/${nearestCities[0].city.slug}`}
                className="inline-flex items-center gap-2 text-primary-yellow hover:underline font-semibold"
              >
                Zobraziť všetky taxislužby v {nearestCities[0].city.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Breadcrumb */}
            <div className="mt-6 pt-4 border-t border-foreground/10">
              <Link
                href={isHierarchical && actualDistrict ? `/taxi/${regionSlug}/${actualDistrict.slug}` : `/kraj/${regionSlug}`}
                className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {isHierarchical && actualDistrict ? `Späť na okres ${actualDistrict.name}` : `Späť na ${municipality.region}`}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* PÔVODNÝ Above The Fold dizajn */
        <section className="relative bg-gradient-to-br from-primary-yellow/10 via-white to-primary-yellow/5">
          <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

              {/* Ľavá strana - Info */}
              <div className="lg:col-span-2 flex flex-col">
                <div className="mb-4">
                  <p className="text-sm text-foreground/60 mb-1">
                    {isHierarchical && actualDistrict ? `Okres ${actualDistrict.name}` : municipality.region}
                  </p>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-tight">
                    {municipality.name}
                  </h1>
                  <p className="text-sm sm:text-base text-foreground/70 mt-2">
                    Objednajte si taxi v okolí
                  </p>
                </div>

                {!hasTaxiServices && nearestCities.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {ctaOverride?.heroImage ? (
                      // Partner štýl tlačidlo s hero obrázkom
                      <Link
                        href={ctaOverride.href}
                        className="relative flex items-center gap-4 w-full px-5 py-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-purple-200 hover:border-purple-300"
                      >
                        {/* Hero image na pozadí */}
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            top: 0,
                            bottom: 0,
                            left: '40%',
                            right: 0,
                            backgroundImage: `url(${ctaOverride.heroImage})`,
                            backgroundPosition: 'center 75%',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.4) 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.4) 100%)'
                          }}
                        />
                        {/* Logo */}
                        {ctaOverride.logo && (
                          <img
                            src={ctaOverride.logo}
                            alt={ctaOverride.text}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-300 flex-shrink-0 relative z-10"
                          />
                        )}
                        <div className="flex-1 relative z-10">
                          <span className="font-bold text-lg text-gray-900">{ctaOverride.text}</span>
                          <div className="flex items-center gap-2 text-sm text-purple-600 font-semibold">
                            <Phone className="h-4 w-4" />
                            Zobraziť kontakt
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-purple-400 relative z-10" />
                      </Link>
                    ) : (
                      // Štandardné zelené tlačidlo
                      <Link
                        href={ctaOverride?.href || `/taxi/${nearestCities[0].city.slug}`}
                        className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl text-lg"
                      >
                        <Phone className="h-6 w-6" />
                        {ctaOverride?.text || `Taxislužby v ${nearestCities[0].city.name}`}
                      </Link>
                    )}
                    {whatsappNumber && (
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/\s/g, '').replace(/^0/, '421')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1da851] transition-all shadow-lg hover:shadow-xl text-lg"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}

                {hasTaxiServices && cityWithTaxi && (
                  <>
                    <div className="bg-primary-yellow/10 rounded-xl p-4 mb-4">
                      <p className="text-sm font-semibold text-foreground/80">
                        ✓ V obci {municipality.name} máme {cityWithTaxi.taxiServices.length} taxislužieb
                      </p>
                    </div>
                    <Link
                      href="#taxi-sluzby"
                      className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl text-lg"
                    >
                      <Phone className="h-6 w-6" />
                      Zobraziť taxislužby
                    </Link>
                  </>
                )}
              </div>

              {/* Pravá strana - Mapa */}
              {!hasTaxiServices && nearestCities.length > 0 &&
               municipality.latitude && municipality.longitude &&
               nearestCities[0].city.latitude && nearestCities[0].city.longitude && (
                <div className="lg:col-span-3">
                  <div className="rounded-xl overflow-hidden shadow-lg h-[400px] md:h-[350px] lg:h-full lg:min-h-[350px]">
                    <RouteMapWrapper
                      fromLat={municipality.latitude}
                      fromLng={municipality.longitude}
                      fromName={municipality.name}
                      fromSlug={municipality.slug}
                      toLat={nearestCities[0].city.latitude}
                      toLng={nearestCities[0].city.longitude}
                      toName={nearestCities[0].city.name}
                      toSlug={nearestCities[0].city.slug}
                      distance={nearestCities[0].distance}
                      roadDistance={nearestCities[0].roadDistance}
                      duration={nearestCities[0].duration}
                      priceMin={priceOverride?.min}
                      priceMax={priceOverride?.max}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Breadcrumb - navigácia */}
            <div className="mt-6 pt-4 border-t border-foreground/10">
              <Link
                href={isHierarchical && actualDistrict ? `/taxi/${regionSlug}/${actualDistrict.slug}` : `/kraj/${regionSlug}`}
                className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {isHierarchical && actualDistrict ? `Späť na okres ${actualDistrict.name}` : `Späť na ${municipality.region}`}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Custom Content Section for Locations */}
      {customContent && (
        <section className="py-12 px-4 md:px-8 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none text-foreground/80">
              <h2 className="text-2xl font-bold text-foreground mb-4">O lokalite {municipality.name}</h2>
              <p className="mb-6">{customContent.intro}</p>
              
              <h3 className="text-xl font-bold text-foreground mb-3">Doprava a Taxi</h3>
              <p className="mb-6">{customContent.transport}</p>
              
              <h3 className="text-xl font-bold text-foreground mb-3">Zaujímavosti</h3>
              <p>{customContent.attractions}</p>
            </div>
          </div>
        </section>
      )}

      {hasTaxiServices && cityWithTaxi && (
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8 relative bg-white">
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-black mb-4 text-foreground">
                Taxislužby {cityWithTaxi.isVillage ? 'v obci' : 'v meste'} {municipality.name}
              </h2>
            </div>

            <div className="grid gap-2">
              {cityWithTaxi.taxiServices.map((service, index) => (
                <Card key={index} className="perspective-1000">
                  <div className="card-3d  transition-all">
                    <CardHeader className="pb-1 pt-3 md:pt-3.5 px-3 md:px-4">
                      <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-1.5 md:gap-2">
                        <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 text-success" />
                        {service.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 md:pb-3.5 px-3 md:px-4">
                      <div className="flex flex-col gap-1 md:gap-1.5 text-xs md:text-sm">
                        {service.phone && (
                          <div className="flex items-center gap-1.5 md:gap-2 font-medium text-foreground">
                            <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 text-primary-yellow" />
                            {service.phone}
                          </div>
                        )}
                        {service.website && (
                          <div className="flex items-center gap-1.5 md:gap-2 font-medium text-foreground">
                            <Globe className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 text-info" />
                            <span>{truncateUrl(service.website)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ďalšie obce v okrese - interné prelinkovanie */}
      {actualDistrict && municipalitiesInDistrict.length > 1 && (
        <NearbyMunicipalities
          currentMunicipality={municipality}
          allMunicipalities={municipalitiesInDistrict}
          district={actualDistrict}
          regionSlug={regionSlug}
          limit={12}
        />
      )}

      {/* Lokálne dátové FAQ pre obce bez taxislužieb */}
      {!hasTaxiServices && nearestCities.length > 0 ? (
        <CityFAQ
          cityName={municipality.name}
          citySlug={municipality.slug}
          isVillage={true}
          customItems={[
            {
              question: `Kde nájdem najbližšie taxi ${getAccusativePhrase(municipality.slug, municipality.name)}?`,
              answer: `Najbližšie taxi ${getAccusativePhrase(municipality.slug, municipality.name)} je ${getGenitivePhrase(nearestCities[0].city.slug, nearestCities[0].city.name)} (${nearestCities[0].roadDistance} km, cca ${nearestCities[0].duration} min). V okolí evidujeme taxislužby aj v ${nearestCities.slice(1).map(c => c.city.name).join(' a ')}.`
            },
            {
              question: `Koľko stojí taxi ${getAccusativePhrase(municipality.slug, municipality.name)}?`,
              answer: `Orientačná cena taxi ${getGenitivePhrase(nearestCities[0].city.slug, nearestCities[0].city.name)} ${getAccusativePhrase(municipality.slug, municipality.name)} je ${Math.ceil(2 + nearestCities[0].roadDistance * 0.85)}€ - ${Math.ceil(2 + nearestCities[0].roadDistance * 1.15)}€. Finálna cena závisí od konkrétnej taxislužby a času jazdy.`
            },
            {
              question: `Je ${getLocativePhrase(municipality.slug, municipality.name).replace(/^V /i, 'v ')} taxislužba?`,
              answer: `${getLocativePhrase(municipality.slug, municipality.name)} momentálne neevidujeme žiadnu taxislužbu. Odporúčame využiť taxi z okolitých miest - najbližšie sú ${nearestCities.map(c => `${c.city.name} (${c.roadDistance} km)`).join(', ')}.`
            }
          ]}
        />
      ) : (
        /* Štandardné FAQ pre ostatné obce */
        (customFaqs || !customContent) && (
          <CityFAQ cityName={municipality.name} citySlug={municipality.slug} isVillage={true} customItems={customFaqs} />
        )
      )}

      {/* Najčastejšie ciele - intent sekcia pre obce bez taxi */}
      {!hasTaxiServices && nearestCities.length > 0 && (
        <section className="py-8 md:py-12 px-4 md:px-8 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-foreground">
              Najčastejšie ciele z {municipality.name}
            </h2>
            <p className="text-sm text-foreground/70 mb-6">
              Kam najčastejšie cestujú ľudia z {municipality.name}? Tu sú obľúbené destinácie:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nearestCities.map(({ city, roadDistance }) => (
                <Link
                  key={city.slug}
                  href={`/taxi/trasa/${municipality.slug}-${city.slug}`}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-primary-yellow hover:shadow-md transition-all text-center"
                >
                  <MapPin className="h-5 w-5 text-primary-yellow mb-2" />
                  <span className="font-bold text-foreground">{municipality.name} → {city.name}</span>
                  <span className="text-xs text-foreground/60">{roadDistance} km</span>
                </Link>
              ))}
              {/* Okresné mesto */}
              {actualDistrict && (
                <Link
                  href={`/taxi/${regionSlug}/${actualDistrict.slug}`}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-primary-yellow hover:shadow-md transition-all text-center"
                >
                  <MapPin className="h-5 w-5 text-primary-yellow mb-2" />
                  <span className="font-bold text-foreground">Okres {actualDistrict.name}</span>
                  <span className="text-xs text-foreground/60">Všetky taxi</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Informácie o obci - SEO obsah na spodku */}
      <MunicipalityInfo
        name={municipality.name}
        district={municipality.district}
        region={municipality.region}
        slug={municipality.slug}
        latitude={municipality.latitude}
        longitude={municipality.longitude}
        postalCode={municipalityStats.postalCode}
        population={municipalityStats.population}
        area={municipalityStats.area}
      />

      {/* HowItWorks - SKRYTÉ pre obce bez taxi (šablónový obsah) */}
      {hasTaxiServices && <HowItWorks />}
      <Footer />
    </div>
  );
}

function DistrictPage({ district, regionSlug }: { district: District; regionSlug: string }) {
  const municipalities = getMunicipalitiesByDistrictSlug(district.slug);

  // Helper function to get correct URL for municipality/city
  // Cities with taxi services get primary URL, others get hierarchical URL
  const getMunicipalityUrl = (mun: Municipality): string => {
    const cityWithTaxi = getCityBySlug(mun.slug);
    if (cityWithTaxi && cityWithTaxi.taxiServices.length > 0) {
      return `/taxi/${cityWithTaxi.slug}`;
    }
    return `/taxi/${regionSlug}/${district.slug}/${mun.slug}`;
  };

  // Check if municipality has taxi services (for visual indicator)
  const hasTaxiServices = (mun: Municipality): boolean => {
    const city = getCityBySlug(mun.slug);
    return !!(city && city.taxiServices.length > 0);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      <SEOBreadcrumbs
        items={[
          { label: district.region, href: `/kraj/${regionSlug}` },
          { label: `Okres ${district.name}` },
        ]}
      />

      <section className="pt-4 md:pt-6 py-8 md:py-12 lg:py-16 px-4 md:px-8 relative">
        <GeometricLines variant="hero" count={8} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-8 md:mb-12 rounded-xl md:rounded-2xl overflow-hidden relative p-6 md:p-10 lg:p-12">
            <div className="absolute inset-0 hero-3d-bg" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-6 text-foreground">
                Taxi okres {district.name}
              </h1>
              <p className="text-sm sm:text-base md:text-xl font-semibold px-2 sm:px-4 text-foreground/90">
                {district.municipalitiesCount} obcí a miest v okrese {district.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-black mb-6 text-foreground text-center">
            Všetky obce v okrese {district.name}
          </h2>
          <p className="text-center text-foreground/70 mb-8">
            Kliknite na obec pre zobrazenie najbližších taxislužieb
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
            {municipalities.map((municipality) => {
              const hasTaxi = hasTaxiServices(municipality);
              return (
                <Link
                  key={municipality.slug}
                  href={getMunicipalityUrl(municipality)}
                  className="perspective-1000 group"
                >
                  <div className={`card-3d  transition-all rounded-lg p-3 md:p-4 h-full ${hasTaxi ? 'bg-yellow-50 ring-1 ring-yellow-300' : 'bg-card'}`}>
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 transition-colors ${hasTaxi ? 'text-yellow-600' : 'text-foreground/40 group-hover:text-success'}`} />
                      <span className="font-semibold text-sm md:text-base text-foreground truncate">
                        {municipality.name}
                      </span>
                      {hasTaxi && (
                        <span className="text-[10px] bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded font-bold ml-auto flex-shrink-0">TAXI</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 px-4 md:px-8 bg-foreground/5">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-xl md:text-2xl font-black mb-4 text-foreground">
            Hľadáte taxi v okrese {district.name}?
          </h2>
          <p className="text-foreground/80 mb-6">
            Vyberte si obec zo zoznamu vyššie a nájdite najbližšie taxislužby vo vašom okolí.
            Všetky obce v okrese {district.name} sú prepojené s najbližšími mestami, kde nájdete dostupné taxislužby.
          </p>
          <Link
            href={`/kraj/${regionSlug}`}
            className="inline-block bg-primary-yellow text-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary-yellow/90 transition-colors"
          >
            Zobraziť všetky okresy v kraji {district.region}
          </Link>
        </div>
      </section>

      <HowItWorks />
      <Footer />
    </div>
  );
}

async function ServicePage({ city, service, serviceSlug }: { city: CityData; service: TaxiService; serviceSlug: string }) {
  const regionSlug = createRegionSlug(city.region);
  // Pre obce s isVillage: true používame "v obci", inak "v meste"
  const locationText = city.isVillage ? 'v obci' : 'v meste';
  const content = generateUniqueServiceContent({
    serviceName: service.name,
    cityName: city.name,
    regionName: city.region,
    phone: service.phone,
  });

  const isPartner = service.isPartner;
  const isPremium = service.isPremium;

  // Partner page - full branded page
  if (isPartner) {
    // Fetch approved data from Supabase (partner portal changes)
    const approvedData = await getApprovedPartnerData(serviceSlug);

    // Check if current user is owner (for inline editing)
    const { isOwner, draftData, partnerId, draftId } = await checkPartnerOwnership(serviceSlug);

    // Merge approved data with cities.json data (approved data takes precedence if not null/empty)
    const partnerData = service.partnerData;

    // Use approved gallery if defined (even empty array means partner cleared it)
    // undefined = not set, use fallback; [] = explicitly cleared
    const mergedGallery = approvedData?.gallery !== undefined
      ? approvedData.gallery
      : service.gallery;

    // Use approved hero image if defined (null/empty = partner removed it)
    const heroImage = approvedData?.hero_image_url !== undefined
      ? approvedData.hero_image_url
      : partnerData?.heroImage;

    // Use approved description if defined (empty string = partner cleared it)
    const mergedDescription = approvedData?.description !== undefined
      ? approvedData.description
      : partnerData?.description;

    // Hero image positioning from approved data
    const heroImageZoom = approvedData?.hero_image_zoom || 100;
    const heroImagePosX = approvedData?.hero_image_pos_x || 50;
    const heroImagePosY = approvedData?.hero_image_pos_y || 50;

    // Social links from approved data - build full URLs
    const mergedFacebook = approvedData?.social_facebook
      ? (approvedData.social_facebook.startsWith('http')
          ? approvedData.social_facebook
          : `https://facebook.com/${approvedData.social_facebook}`)
      : null;
    const mergedInstagram = approvedData?.social_instagram
      ? (approvedData.social_instagram.startsWith('http')
          ? approvedData.social_instagram
          : `https://instagram.com/${approvedData.social_instagram}`)
      : null;
    const mergedEmail = approvedData?.email || null;

    const templateVariant = normalizePartnerSkin(
      draftData?.template_variant ?? approvedData?.template_variant ?? null
    );
    const skinClass = getPartnerSkinClass(templateVariant);

    // Build initial data for inline editor (draft data overrides approved data)
    const initialEditorData = {
      company_name: draftData?.company_name ?? approvedData?.company_name ?? service.name,
      description: draftData?.description ?? mergedDescription ?? '',
      phone: draftData?.phone ?? approvedData?.phone ?? service.phone ?? '',
      email: draftData?.email ?? mergedEmail ?? '',
      website: draftData?.website ?? approvedData?.website ?? service.website ?? '',
      hero_title: draftData?.hero_title ?? approvedData?.hero_title ?? service.name,
      hero_subtitle: draftData?.hero_subtitle ?? approvedData?.hero_subtitle ?? `Profesionálna taxislužba ${locationText} ${city.name}`,
      hero_image_url: draftData?.hero_image_url ?? heroImage ?? undefined,
      hero_image_zoom: draftData?.hero_image_zoom ?? heroImageZoom,
      hero_image_pos_x: draftData?.hero_image_pos_x ?? heroImagePosX,
      hero_image_pos_y: draftData?.hero_image_pos_y ?? heroImagePosY,
      services: draftData?.services ?? approvedData?.services ?? undefined,
      services_description: draftData?.services_description ?? approvedData?.services_description ?? partnerData?.servicesDescription ?? '',
      gallery: draftData?.gallery ?? mergedGallery ?? [],
      social_facebook: draftData?.social_facebook ?? approvedData?.social_facebook ?? '',
      social_instagram: draftData?.social_instagram ?? approvedData?.social_instagram ?? '',
      whatsapp: draftData?.whatsapp ?? approvedData?.whatsapp ?? '',
      booking_url: draftData?.booking_url ?? approvedData?.booking_url ?? partnerData?.bookingUrl ?? '',
      pricelist_url: draftData?.pricelist_url ?? approvedData?.pricelist_url ?? partnerData?.pricelistUrl ?? '',
      transport_rules_url: draftData?.transport_rules_url ?? approvedData?.transport_rules_url ?? partnerData?.transportRulesUrl ?? '',
      contact_url: draftData?.contact_url ?? approvedData?.contact_url ?? partnerData?.contactUrl ?? '',
      template_variant: templateVariant,
    };

    return (
      <PartnerPageWrapper
        isOwner={isOwner}
        initialData={initialEditorData}
        partnerId={partnerId}
        draftId={draftId}
        partnerSlug={serviceSlug}
        citySlug={city.slug}
      >
      <div className={`min-h-screen overflow-x-hidden partner-page-bg partner-skin ${skinClass}`}>
        <TaxiServiceSchema
          service={service}
          city={city}
          citySlug={city.slug}
          serviceSlug={serviceSlug}
        />
        <Header partnerSlug={serviceSlug} isOwner={isOwner} />

        {/* Hero Section - Partner */}
        <section className="pt-0 pb-8 md:pb-12">
          {/* Breadcrumbs */}
          <div className="container mx-auto max-w-4xl px-4">
            <SEOBreadcrumbs
              items={[
                { label: city.region, href: `/kraj/${regionSlug}` },
                { label: city.name, href: `/taxi/${city.slug}` },
                { label: service.name },
              ]}
            />
          </div>

          {/* Hero with constrained width */}
          <div className="container mx-auto max-w-4xl px-4">
            <Link
              href={`/taxi/${city.slug}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-bold mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Späť na zoznam taxislužieb
            </Link>

            {/* Hero image container (uses Supabase approved positioning if available) */}
            {heroImage && (
              <EditableHeroImage
                defaultImage={heroImage}
                defaultZoom={heroImageZoom}
                defaultPosX={heroImagePosX}
                defaultPosY={heroImagePosY}
                partnerId={partnerId}
              >
              <div
                className="relative rounded-xl md:rounded-2xl overflow-hidden mb-6 md:mb-8 h-[200px] md:h-[260px]"
              >
                <div
                  className="absolute inset-0 bg-no-repeat"
                  style={{
                    backgroundImage: 'var(--hero-image)',
                    backgroundPosition: 'var(--hero-pos-x) var(--hero-pos-y)',
                    backgroundSize: 'var(--hero-zoom)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-8">
                  {/* Badges */}
                  <div className="flex gap-1.5 md:gap-2 mb-2 md:mb-4">
                    <div className="bg-green-500 text-white text-[10px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1">
                      <BadgeCheck className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      OVERENÉ
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 text-[10px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      PARTNER
                    </div>
                    {service.nonstop && (
                      <div className="bg-blue-600 text-white text-[10px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        NONSTOP
                      </div>
                    )}
                  </div>

                  <EditableHeroTitle defaultValue={service.name} />

                  {/* Web & Contact buttons in hero - at bottom */}
                  <div className="flex gap-2 md:gap-3 mt-2 md:mt-3">
                    {service.website && (
                      <a
                        href={service.website.startsWith('http') ? service.website : `https://${service.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-colors"
                      >
                        <Globe className="h-4 w-4 md:h-5 md:w-5" />
                        <span>Web</span>
                      </a>
                    )}
                    {partnerData?.contactUrl && (
                      <a
                        href={partnerData.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-colors"
                      >
                        <Users className="h-4 w-4 md:h-5 md:w-5" />
                        <span>Kontakt</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              </EditableHeroImage>
            )}

            {/* Fallback gradient hero if no image - Mobile optimized */}
            {!heroImage && (
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden mb-6 md:mb-8 partner-hero-fallback p-5 md:p-12">
                {/* Badges */}
                <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6">
                  <div className="bg-green-500 text-white text-[10px] md:text-sm font-black px-2 md:px-4 py-0.5 md:py-1.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="h-2.5 w-2.5 md:h-4 md:w-4" />
                    OVERENÉ
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 text-[10px] md:text-sm font-black px-2 md:px-4 py-0.5 md:py-1.5 rounded-full flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 md:h-4 md:w-4" />
                    PARTNER
                  </div>
                  {service.nonstop && (
                    <div className="bg-blue-600 text-white text-[10px] md:text-sm font-black px-2 md:px-4 py-0.5 md:py-1.5 rounded-full flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 md:h-4 md:w-4" />
                      NONSTOP
                    </div>
                  )}
                </div>

                <EditableHeroTitle defaultValue={service.name} />
              </div>
            )}

            {/* Contact buttons - mobile optimized with live preview */}
            <div className="space-y-3 mb-6">
              {/* Primary CTA - Phone - full width - EDITABLE */}
              <EditablePhoneButton defaultPhone={service.phone || ''} citySlug={city.slug} serviceName={service.name} />

              {/* Additional phone numbers (static - not editable) */}
              {(service.phone2 || service.phone3) && (
                <div className="flex flex-wrap gap-2">
                  {service.phone2 && (
                    <a
                      href={`tel:${service.phone2}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/80 hover:bg-green-600 text-white font-bold text-sm px-3 py-2.5 rounded-lg transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {service.phone2}
                    </a>
                  )}
                  {service.phone3 && (
                    <a
                      href={`tel:${service.phone3}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/80 hover:bg-green-600 text-white font-bold text-sm px-3 py-2.5 rounded-lg transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {service.phone3}
                    </a>
                  )}
                </div>
              )}

              {/* Secondary buttons - EDITABLE with live preview */}
              <EditableContactButtons
                defaultLinks={{
                  whatsapp: partnerData?.whatsapp || '',
                  booking_url: partnerData?.bookingUrl || '',
                  pricelist_url: partnerData?.pricelistUrl || '',
                  transport_rules_url: partnerData?.transportRulesUrl || '',
                  email: mergedEmail || '',
                  facebook: approvedData?.social_facebook || '',
                  instagram: approvedData?.social_instagram || '',
                  website: service.website || '',
                  contact_url: partnerData?.contactUrl || '',
                }}
                citySlug={city.slug}
                serviceName={service.name}
              />
            </div>

            {/* Gallery - under contact buttons (uses merged gallery from Supabase approved data) */}
            <EditableGallery
              defaultImages={mergedGallery || []}
              serviceName={service.name}
              partnerId={partnerId}
            />

            {/* About / Description Section - editable */}
            <EditableDescription defaultValue={mergedDescription || ''} />

            {/* Services Section - uses initialEditorData for live preview */}
            {initialEditorData.services && initialEditorData.services.length > 0 && (
              <EditableServices defaultServices={initialEditorData.services}>
                <div className="mt-6 md:mt-8 partner-card rounded-xl p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">Ponúkané služby</h2>
                  <div className="flex flex-wrap gap-2">
                    {initialEditorData.services.map((svc: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 partner-tag rounded-full text-sm font-medium"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </EditableServices>
            )}

            {/* Custom description / services - Mobile optimized */}
            {service.customDescription && (
              <div className="mt-6 md:mt-8 partner-card rounded-xl p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">Naše služby</h2>
                <div className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                  {service.customDescription}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section - Mobile optimized */}
        <section className="py-8 md:py-16 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-xl md:text-3xl font-black text-foreground mb-6 md:mb-8 text-center">
              Prečo si vybrať {service.name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div className="flex md:flex-col items-center md:text-center p-4 md:p-6 partner-card rounded-xl gap-3 md:gap-0">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full partner-accent-bg flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                  <BadgeCheck className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <div className="flex-1 md:flex-none">
                  <h3 className="font-bold text-sm md:text-lg text-foreground md:mb-2">Overená taxislužba</h3>
                  <p className="text-foreground/70 text-xs md:text-base">Partner program zaručuje kvalitu a spoľahlivosť.</p>
                </div>
              </div>
              <div className="flex md:flex-col items-center md:text-center p-4 md:p-6 partner-card rounded-xl gap-3 md:gap-0">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full partner-accent-bg flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                  <Phone className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <div className="flex-1 md:flex-none">
                  <h3 className="font-bold text-sm md:text-lg text-foreground md:mb-2">Rýchly kontakt</h3>
                  <p className="text-foreground/70 text-xs md:text-base">Jednoduché objednanie taxi telefonicky.</p>
                </div>
              </div>
              <div className="flex md:flex-col items-center md:text-center p-4 md:p-6 partner-card rounded-xl gap-3 md:gap-0">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full partner-accent-bg flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                  <Star className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <div className="flex-1 md:flex-none">
                  <h3 className="font-bold text-sm md:text-lg text-foreground md:mb-2">Profesionálny prístup</h3>
                  <p className="text-foreground/70 text-xs md:text-base">Skúsení vodiči a kvalitné vozidlá.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cenník - ak má partner pricelist */}
        {partnerData?.pricelist && partnerData.pricelist.length > 0 && (
          <section className="py-8 px-4 md:px-8 pb-16">
            <div className="container mx-auto max-w-4xl">
              <TaxiPricelist
                pricelist={partnerData.pricelist}
                pricePerKm={partnerData.pricePerKm}
                paymentMethods={partnerData.paymentMethods}
                serviceName={service.name}
              />
            </div>
          </section>
        )}

        {/* Google Reviews Section - Dynamic */}
        {partnerData?.googlePlaceId && (
          <GoogleReviewsSection
            placeId={partnerData.googlePlaceId}
            serviceName={service.name}
            googleMapsUrl={partnerData.googleMapsUrl}
          />
        )}

        {/* CTA Section - Mobile optimized */}
        <section className="py-8 md:py-16 px-4 md:px-8 partner-cta">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-xl md:text-3xl font-black mb-2 md:mb-4">
              Potrebujete taxi {partnerData?.customCtaTitle ? partnerData.customCtaTitle : `${locationText} ${city.name}${partnerData?.secondaryCity ? ` alebo v obci ${partnerData.secondaryCity}` : ''}`}?
            </h2>
            <p className="partner-cta-muted mb-4 md:mb-6 text-sm md:text-lg">
              Zavolajte nám a odvezieme vás kam potrebujete.
            </p>
            <ServiceContactButtons
              phone={service.phone}
              whatsapp={partnerData?.whatsapp}
              serviceName={service.name}
              cityName={city.name}
              citySlug={city.slug}
              variant="cta"
            />
          </div>
        </section>

        {/* Other services - Mobile optimized - hidden for premium/partner */}
        {city.taxiServices.length > 1 && !service.isPremium && !service.isPartner && (
          <section className="py-8 md:py-16 px-4 md:px-8 bg-foreground/5">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-lg md:text-2xl font-black mb-4 md:mb-6 text-foreground text-center">
                Ďalšie taxislužby {locationText} {city.name}
              </h2>
              <div className="grid gap-2 md:gap-3">
                {[...city.taxiServices]
                  .filter((s) => s.name !== service.name)
                  .slice(0, 5)
                  .map((otherService, index) => {
                    const otherSlug = createServiceSlug(otherService.name);
                    return (
                      <Card key={index} className="perspective-1000">
                        <Link href={`/taxi/${city.slug}/${otherSlug}`}>
                          <div className="card-3d  transition-all p-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-foreground flex-shrink-0" />
                              <span className="font-bold text-foreground">{otherService.name}</span>
                            </div>
                          </div>
                        </Link>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
      </PartnerPageWrapper>
    );
  }

  // Získaj iniciály pre fallback logo
  const initials = service.name
    .split(' ')
    .filter(word => word.length > 0 && !['taxi', 'TAXI', 'Taxi'].includes(word))
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('') || service.name.charAt(0).toUpperCase();

  return (
    <>
      {/* pb-24 na mobile pre sticky footer (80px footer + safe area) */}
      <div className="min-h-screen bg-gray-50 overflow-x-hidden pb-24 md:pb-0">
        <TaxiServiceSchema
          service={service}
          city={city}
          citySlug={city.slug}
          serviceSlug={serviceSlug}
        />
        <Header />

        {/* Kompaktné breadcrumbs - len späť */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto max-w-4xl px-4 py-3">
            <Link
              href={`/taxi/${city.slug}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{city.name}</span>
              <span className="text-gray-400">({city.taxiServices.length} taxislužieb)</span>
            </Link>
          </div>
        </div>

        {/* Profilová sekcia - zlúčená karta */}
        <section className="bg-white">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            {/* Logo + Názov + Badge */}
            <div className="flex items-start gap-4 mb-6">
              {/* Logo/Iniciály */}
              {service.logo ? (
                <img
                  src={service.logo}
                  alt={`${service.name} logo`}
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl object-cover ${
                    isPremium
                      ? 'ring-2 ring-amber-300'
                      : 'ring-1 ring-gray-200'
                  }`}
                />
              ) : (
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold ${
                  isPremium
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {initials}
                </div>
              )}

              {/* Názov a info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {service.name}
                  </h1>
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                      <Star className="h-3 w-3" />
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{service.address ? service.address : `${city.name}, ${city.region}`}</span>
                </div>
                {/* Overená taxislužba badge - len pre Premium/Partner */}
                {(isPremium || isPartner) && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Overená taxislužba</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hlavné CTA tlačidlo - cez celú šírku */}
            {service.phone && (
              <a
                href={`tel:${service.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg text-lg"
              >
                <Phone className="h-6 w-6" />
                <span>Zavolať {service.phone}</span>
              </a>
            )}

            {/* Webová stránka - sekundárne */}
            {service.website && (
              <a
                href={service.website.startsWith('http') ? service.website : `https://${service.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
              >
                <Globe className="h-5 w-5" />
                <span>Navštíviť web</span>
              </a>
            )}

            {/* Galéria fotiek */}
            {service.gallery && service.gallery.length > 0 && (
              <TaxiGallery images={service.gallery} serviceName={service.name} />
            )}
          </div>
        </section>

        {/* O taxislužbe - SEO content */}
        <section className="py-6 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                O taxislužbe
              </h2>
              {service.customDescription ? (
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {service.customDescription}
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{content.intro}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{content.disclaimer}</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Promo banner for non-Premium/Partner services */}
        {!isPremium && !isPartner && (
          <section className="px-4 pb-6">
            <div className="container mx-auto max-w-4xl space-y-3">
              {/* Upgrade banner */}
              <div className="bg-gradient-to-r from-purple-50 to-amber-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Ste majiteľom?</p>
                      <p className="text-gray-500 text-xs">Získajte lepšiu pozíciu</p>
                    </div>
                  </div>
                  <Link
                    href="/pre-taxiky"
                    className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
                  >
                    Zistiť viac
                  </Link>
                </div>
              </div>

              {/* Owner claim - update info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-gray-600 text-sm">Potrebujete aktualizovať údaje?</p>
                  <OwnerClaimButton
                    serviceName={service.name}
                    servicePhone={service.phone}
                    cityName={city.name}
                    citySlug={city.slug}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Ďalšie taxislužby */}
        {city.taxiServices.length > 1 && (
          <section className="px-4 pb-6">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Ďalšie taxislužby {locationText} {city.name}
              </h2>
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {[...city.taxiServices]
                  .sort((a, b) => a.name.localeCompare(b.name, 'sk'))
                  .filter((s) => s.name !== service.name)
                  .slice(0, 5)
                  .map((otherService, index) => {
                    const otherSlug = createServiceSlug(otherService.name);
                    return (
                      <Link
                        key={index}
                        href={`/taxi/${city.slug}/${otherSlug}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{otherService.name}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>

      {/* Sticky Footer - vždy viditeľné na mobile */}
      {service.phone && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] z-50 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Taxislužba</span>
              <p className="font-bold text-gray-900 truncate max-w-[150px]">{service.name}</p>
            </div>
            <a
              href={`tel:${service.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
            >
              <Phone className="h-5 w-5" />
              <span>Zavolať</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-foreground/30 py-8 md:py-12 px-4 md:px-8 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="text-xs md:text-sm text-foreground font-bold text-center md:text-left">
            © 2025 Taxi NearMe. Všetky práva vyhradené.
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link href="/ochrana-sukromia" className="text-xs md:text-sm text-foreground font-bold hover:text-foreground/70 transition-colors duration-200">
              Ochrana súkromia
            </Link>
            <Link href="/podmienky-pouzivania" className="text-xs md:text-sm text-foreground font-bold hover:text-foreground/70 transition-colors duration-200">
              Podmienky používania
            </Link>
            <Link href="/kontakt" className="text-xs md:text-sm text-foreground font-bold hover:text-foreground/70 transition-colors duration-200">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// LOCATION PAGE COMPONENT
// ============================================================================

function LocationPage({ location }: { location: Location }) {
  const municipality = locationToMunicipality(location);
  const nearestCity = getCityBySlug(location.nearestCitySlug);
  
  let nearestCities: Array<{ city: CityData; distance: number; roadDistance: number; duration: number }> = [];
  
  if (nearestCity) {
     // Define specific estimates for known locations to match real-world routing
     let distance = 8;
     let roadDistance = 12;
     let duration = 15;

     switch (location.slug) {
       case 'chopok-juh':
         distance = 12; // Air
         roadDistance = 18; // User verified
         duration = 25; 
         break;
       case 'tale':
         distance = 7;
         roadDistance = 11; // User verified
         duration = 15; 
         break;
       case 'krpacovo':
         distance = 8; 
         roadDistance = 12; // User verified
         duration = 18; 
         break;
     }

     nearestCities = [{
        city: nearestCity,
        distance, 
        roadDistance, 
        duration
     }];
  }

  return <MunicipalityPage 
    municipality={municipality} 
    overrideNearestCities={nearestCities} 
    customContent={location.content}
    customFaqs={location.faqs}
  />;
}


// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function TaxiCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const routeType = detectRouteType(slug);

  switch (routeType.type) {
    case 'city':
      return <CityPage city={routeType.city} />;

    case 'municipality':
      return <MunicipalityPage municipality={routeType.municipality} />;

    case 'location':
      return <LocationPage location={routeType.location} />;

    case 'service':
      return <ServicePage city={routeType.city} service={routeType.service} serviceSlug={routeType.serviceSlug} />;

    case 'district':
      return <DistrictPage district={routeType.district} regionSlug={routeType.regionSlug} />;

    case 'hierarchical': {
      // Lešť vojenský obvod - mapa na Zvolen, skryť sekciu "Najbližšie taxislužby", vlastná cena
      let overrideNearestCities: Array<{ city: CityData; distance: number; roadDistance: number; duration: number }> | undefined;
      let hideNearbyTaxis = false;
      let priceOverride: { min: number; max: number } | undefined;
      let ctaOverride: { text: string; href: string; heroImage?: string; logo?: string } | undefined;

      if (routeType.municipality.slug === 'lest-vojensky-obvod') {
        const zvolen = getCityBySlug('zvolen');
        if (zvolen) {
          overrideNearestCities = [{
            city: zvolen,
            distance: 38,
            roadDistance: 38,
            duration: 40
          }];
        }
        hideNearbyTaxis = true;
        priceOverride = { min: 40, max: 46 };
        ctaOverride = {
          text: 'Lešť Taxi (vojenský obvod)',
          href: '/taxi/zvolen/lest-taxi-vojensky-obvod',
          heroImage: '/logos/fast-taxi-zvolen-hero.jpg',
          logo: '/logos/fast-taxi-zvolen.webp'
        };
      }

      // WhatsApp číslo pre Lešť
      const whatsappNumber = routeType.municipality.slug === 'lest-vojensky-obvod' ? '0902048583' : undefined;

      return <MunicipalityPage
        municipality={routeType.municipality}
        isHierarchical={true}
        district={routeType.district}
        overrideNearestCities={overrideNearestCities}
        hideNearbyTaxisSection={hideNearbyTaxis}
        priceOverride={priceOverride}
        ctaOverride={ctaOverride}
        whatsappNumber={whatsappNumber}
      />;
    }

    case 'redirect':
      permanentRedirect(routeType.to);
      // permanentRedirect() throws, but we need return for ESLint no-fallthrough rule
      return null;

    case 'notFound':
    default:
      notFound();
  }
}
