/**
 * NearbyMunicipalities - Zobrazuje najbližšie obce v okolí
 *
 * Zlepšuje interné prelinkovanie pre SEO - používa geografickú blízkosť
 */

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Municipality, findNearbyMunicipalities } from '@/data/municipalities';
import { District, getDistrictForMunicipality, createDistrictSlug } from '@/data/districts';
import { getCityBySlug } from '@/data/cities';

interface NearbyMunicipalitiesProps {
  currentMunicipality: Municipality;
  allMunicipalities?: Municipality[]; // Deprecated - kept for backwards compatibility
  district: District;
  regionSlug: string;
  limit?: number;
}

export function NearbyMunicipalities({
  currentMunicipality,
  district,
  regionSlug,
  limit = 12,
}: NearbyMunicipalitiesProps) {
  // Find nearby municipalities by geographic distance
  const nearbyMunicipalities = findNearbyMunicipalities(currentMunicipality, limit, false);

  if (nearbyMunicipalities.length === 0) {
    return null;
  }

  // Helper to check if municipality has taxi services
  const hasTaxiServices = (mun: Municipality): boolean => {
    const city = getCityBySlug(mun.slug);
    return !!(city && city.taxiServices.length > 0);
  };

  // Helper to get correct URL for any municipality
  const getMunicipalityUrl = (mun: Municipality): string => {
    const cityWithTaxi = getCityBySlug(mun.slug);
    if (cityWithTaxi && cityWithTaxi.taxiServices.length > 0) {
      return `/taxi/${cityWithTaxi.slug}`;
    }
    // Get district info for hierarchical URL
    const munDistrict = getDistrictForMunicipality(mun);
    if (munDistrict) {
      return `/taxi/${munDistrict.regionSlug}/${munDistrict.slug}/${mun.slug}`;
    }
    // Fallback to current district if same district
    if (mun.district === district.name) {
      return `/taxi/${regionSlug}/${district.slug}/${mun.slug}`;
    }
    // Last resort - use slug only
    return `/taxi/${mun.slug}`;
  };

  // Group municipalities by district for display
  const sameDistrictMunicipalities = nearbyMunicipalities.filter(m => m.district === currentMunicipality.district);
  const otherDistrictMunicipalities = nearbyMunicipalities.filter(m => m.district !== currentMunicipality.district);

  return (
    <section className="py-8 px-4 md:px-8 bg-white border-t border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Okolie obce {currentMunicipality.name}
          </h2>
          <Link
            href={`/taxi/${regionSlug}/${district.slug}`}
            className="text-sm font-medium text-primary-yellow hover:underline flex items-center gap-1"
          >
            Okres {district.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Same district municipalities */}
        {sameDistrictMunicipalities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-foreground/60 mb-2">V okrese {district.name}:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {sameDistrictMunicipalities.map((mun) => {
                const hasTaxi = hasTaxiServices(mun);
                return (
                  <Link
                    key={mun.slug}
                    href={getMunicipalityUrl(mun)}
                    className={`group flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      hasTaxi
                        ? 'bg-yellow-50 hover:bg-yellow-100 ring-1 ring-yellow-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin
                      className={`h-3.5 w-3.5 flex-shrink-0 ${
                        hasTaxi ? 'text-yellow-600' : 'text-foreground/40 group-hover:text-foreground/60'
                      }`}
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {mun.name}
                    </span>
                    {hasTaxi && (
                      <span className="text-[9px] bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded font-bold ml-auto flex-shrink-0">
                        TAXI
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Other district municipalities */}
        {otherDistrictMunicipalities.length > 0 && (
          <div>
            <p className="text-sm text-foreground/60 mb-2">V blízkych okresoch:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {otherDistrictMunicipalities.map((mun) => {
                const hasTaxi = hasTaxiServices(mun);
                return (
                  <Link
                    key={mun.slug}
                    href={getMunicipalityUrl(mun)}
                    className={`group flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      hasTaxi
                        ? 'bg-yellow-50 hover:bg-yellow-100 ring-1 ring-yellow-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin
                      className={`h-3.5 w-3.5 flex-shrink-0 ${
                        hasTaxi ? 'text-yellow-600' : 'text-foreground/40 group-hover:text-foreground/60'
                      }`}
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {mun.name}
                    </span>
                    {hasTaxi && (
                      <span className="text-[9px] bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded font-bold ml-auto flex-shrink-0">
                        TAXI
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-foreground/60 text-center">
          Zobrazené obce sú najbližšie k obci {currentMunicipality.name} podľa vzdialenosti
        </p>
      </div>
    </section>
  );
}
