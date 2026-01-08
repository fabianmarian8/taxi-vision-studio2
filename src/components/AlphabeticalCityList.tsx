'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { slovakCities } from '@/data/cities';

interface LocationItem {
  name: string;
  slug: string;
  region: string;
  type: 'city' | 'municipality';
  taxiCount?: number;
}

interface MunicipalityData {
  name: string;
  district: string;
  region: string;
  slug: string;
}

export function AlphabeticalCityList() {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lazy load municipalities - len pri prvom renderovaní
  useEffect(() => {
    const loadMunicipalities = async () => {
      try {
        const res = await fetch('/api/municipalities');
        const data = await res.json();
        setMunicipalities(data);
      } catch (error) {
        console.error('Failed to load municipalities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMunicipalities();
  }, []);

  // Cities sú vždy dostupné (importované staticky, malá veľkosť)
  const cities: LocationItem[] = useMemo(() => {
    return slovakCities.map((city) => ({
      name: city.name,
      slug: city.slug,
      region: city.region,
      type: 'city' as const,
      taxiCount: city.taxiServices?.length || 0,
    }));
  }, []);

  // Combine cities and municipalities
  const allLocations: LocationItem[] = useMemo(() => {
    // Get city slugs to avoid duplicates
    const citySlugs = new Set(cities.map((c) => c.slug));

    // Filter out municipalities that have same slug as cities and remove duplicates
    const seenSlugs = new Set<string>();
    const municipalityItems = municipalities
      .filter((mun) => {
        if (citySlugs.has(mun.slug) || seenSlugs.has(mun.slug)) {
          return false;
        }
        seenSlugs.add(mun.slug);
        return true;
      })
      .map((mun) => ({
        name: mun.name,
        slug: mun.slug,
        region: mun.region,
        type: 'municipality' as const,
      }));

    return [...cities, ...municipalityItems].sort((a, b) =>
      a.name.localeCompare(b.name, 'sk')
    );
  }, [cities, municipalities]);

  // Get unique first letters
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    allLocations.forEach((loc) => {
      const firstLetter = loc.name.charAt(0).toUpperCase();
      letters.add(firstLetter);
    });
    return Array.from(letters).sort((a, b) => a.localeCompare(b, 'sk'));
  }, [allLocations]);

  // Filter locations by selected letter
  const filteredLocations = useMemo(() => {
    return allLocations.filter(
      (loc) => loc.name.charAt(0).toUpperCase() === selectedLetter
    );
  }, [allLocations, selectedLetter]);

  return (
    <div className="w-full">
      {/* Alphabet Filter */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap justify-center gap-1 md:gap-2">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`
                w-8 h-8 md:w-10 md:h-10 rounded-lg font-black text-xs md:text-sm
                transition-colors duration-200
                ${
                  selectedLetter === letter
                    ? 'bg-primary-yellow text-foreground scale-110'
                    : 'bg-card text-foreground/70 hover:bg-foreground/5'
                }
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-center mb-4 md:mb-6">
        <p className="text-sm md:text-base text-foreground/70 font-semibold">
          {isLoading ? (
            'Načítavam obce...'
          ) : (
            <>
              Zobrazených <strong>{filteredLocations.length}</strong> miest/obcí
              začínajúcich na písmeno <strong>{selectedLetter}</strong>
            </>
          )}
        </p>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-foreground/5 rounded-lg p-3 md:p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Locations Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
          {filteredLocations.map((location) => (
            <Link
              key={location.slug}
              href={`/taxi/${location.slug}`}
              className="perspective-1000 group"
            >
              <div className="card-3d transition-colors bg-card rounded-lg p-3 md:p-4 h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin
                        className={`h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 ${
                          location.type === 'city'
                            ? 'text-success'
                            : 'text-foreground/40'
                        }`}
                      />
                      <h3 className="font-bold text-sm md:text-base text-foreground truncate">
                        {location.name}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-foreground/60 truncate">
                      {location.region}
                    </p>
                    {location.type === 'city' && location.taxiCount! > 0 && (
                      <p className="text-xs text-success font-semibold mt-1">
                        {location.taxiCount} {location.taxiCount === 1 ? 'taxi' : 'taxíkov'}
                      </p>
                    )}
                  </div>
                  {location.type === 'municipality' && (
                    <span className="text-[10px] md:text-xs bg-foreground/10 px-1.5 py-0.5 rounded text-foreground/70 font-medium flex-shrink-0">
                      obec
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filteredLocations.length === 0 && (
        <div className="text-center py-12 text-foreground/60">
          <p>Žiadne mestá alebo obce na písmeno {selectedLetter}</p>
        </div>
      )}
    </div>
  );
}
