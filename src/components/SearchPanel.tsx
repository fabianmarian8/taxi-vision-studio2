'use client';

import { Search, MapPin, Loader2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { findNearestCity } from "@/lib/locationUtils";
import { czechCities } from "@/data/cities";
import { allMunicipalities } from "@/data/municipalities";
import { locations } from "@/data/locations";
import { looksLikePostalCode, findByPostalCode, normalizePostalCode } from "@/data/postal-codes";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  FloatingPortal,
} from "@floating-ui/react";

/**
 * Normalizuje text - odstraní diakritiku a převede na malá písmena
 * Např. "Praha" -> "praha", "Brno" -> "brno"
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const SearchPanel = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Array<{ name: string; region: string; district?: string; slug: string; type: 'city' | 'municipality' | 'location' }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Floating UI setup - automaticky drží dropdown pripojený k input kontajneru
  const { refs, floatingStyles } = useFloating({
    open: showDropdown && filteredResults.length > 0,
    placement: 'bottom-start',
    middleware: [
      offset(8), // 8px medzera pod inputom
      flip({ fallbackPlacements: ['top-start'] }), // ak niet miesta dole, ukáž hore
      shift({ padding: 16 }), // 16px od okrajov viewportu
      size({
        apply({ availableHeight, elements }) {
          // Nastav max výšku podľa dostupného priestoru
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight - 16, 320)}px`,
          });
        },
        padding: 16,
      }),
    ],
    whileElementsMounted: autoUpdate, // automaticky aktualizuje pozíciu pri scroll/resize
  });

  // Filter cities AND municipalities based on search input (supports PSČ)
  useEffect(() => {
    if (searchValue.trim()) {
      const trimmedSearch = searchValue.trim();

      // Check if searching by postal code (PSČ)
      if (looksLikePostalCode(trimmedSearch)) {
        const pscResult = findByPostalCode(trimmedSearch);
        if (pscResult) {
          // Found city by PSČ
          const normalizedPsc = normalizePostalCode(trimmedSearch) || trimmedSearch;
          setFilteredResults([{
            name: pscResult.name,
            region: `PSČ ${normalizedPsc}${pscResult.district ? ` (${pscResult.district})` : ''}`,
            slug: pscResult.slug,
            type: 'city' as const
          }]);
          setShowDropdown(true);
          setSelectedIndex(-1);
          return;
        }
      }

      const normalizedSearch = normalizeText(trimmedSearch);

      // Search in cities (with taxi services) - supports search without diacritics
      // Obce s isVillage: true dostanú type 'municipality' pre správne zobrazenie odznaku
      const filteredCities = czechCities
        .filter((city) => normalizeText(city.name).includes(normalizedSearch))
        .map((city) => ({
          name: city.name,
          region: city.region,
          slug: city.slug,
          type: city.isVillage ? 'municipality' as const : 'city' as const
        }));

      // Search in locations (resorts, poi)
      const filteredLocations = locations
        .filter((loc) => normalizeText(loc.name).includes(normalizedSearch))
        .map((loc) => ({
          name: loc.name,
          region: loc.region,
          district: loc.district,
          slug: loc.slug,
          type: 'location' as const
        }));

      // Search in municipalities (without taxi services in our DB)
      const filteredMunicipalities = allMunicipalities
        .filter((mun) => normalizeText(mun.name).includes(normalizedSearch))
        .filter((mun) => !czechCities.some(city => city.slug === mun.slug)) // Exclude duplicates
        .map((mun) => ({ name: mun.name, region: mun.region, district: mun.district, slug: mun.slug, type: 'municipality' as const }));

      // Combine: cities first, then locations, then municipalities
      const combined = [...filteredCities, ...filteredLocations, ...filteredMunicipalities];
      setFilteredResults(combined);
      setShowDropdown(combined.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredResults([]);
      setShowDropdown(false);
    }
  }, [searchValue]);

  // Close dropdown when clicking outside (but not on floating dropdown)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const floatingElement = refs.floating.current;

      // Don't close if clicking inside container or floating dropdown
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      if (floatingElement && floatingElement.contains(target)) {
        return;
      }

      setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs.floating]);

  const navigateToLocation = (slug: string, name: string) => {
    router.push(`/taxi/${slug}`);
    setShowDropdown(false);
    setSearchValue("");
    toast.success(`Navigace na ${name}`);
  };

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error("Zadejte název města, obce nebo PSČ");
      return;
    }

    const trimmedSearch = searchValue.trim();

    // Check if searching by postal code (PSČ)
    if (looksLikePostalCode(trimmedSearch)) {
      const pscResult = findByPostalCode(trimmedSearch);
      if (pscResult) {
        navigateToLocation(pscResult.slug, pscResult.name);
        toast.success(`Nalezeno podle PSČ: ${pscResult.name}`);
        return;
      } else {
        toast.error("PSČ nebylo nalezeno v databázi. Zkuste zadat název města.");
        return;
      }
    }

    const normalizedSearch = normalizeText(trimmedSearch);

    // Try exact match first in cities (supports search without diacritics)
    const exactCityMatch = czechCities.find(
      (city) => normalizeText(city.name) === normalizedSearch
    );

    if (exactCityMatch) {
      navigateToLocation(exactCityMatch.slug, exactCityMatch.name);
      return;
    }

    // Try exact match in locations
    const exactLocationMatch = locations.find(
      (loc) => normalizeText(loc.name) === normalizedSearch
    );

    if (exactLocationMatch) {
      navigateToLocation(exactLocationMatch.slug, exactLocationMatch.name);
      return;
    }

    // Try exact match in municipalities
    const exactMunMatch = allMunicipalities.find(
      (mun) => normalizeText(mun.name) === normalizedSearch
    );

    if (exactMunMatch) {
      navigateToLocation(exactMunMatch.slug, exactMunMatch.name);
      return;
    }

    // Use first filtered result
    if (filteredResults.length > 0) {
      navigateToLocation(filteredResults[0].slug, filteredResults[0].name);
    } else {
      toast.error("Město/obec nebyly nalezeny. Zkuste jiný název nebo PSČ.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
          const selected = filteredResults[selectedIndex];
          navigateToLocation(selected.slug, selected.name);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleLocationClick = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error("Váš prohlížeč nepodporuje geolokaci");
      return;
    }
    setIsLoadingLocation(true);

    // Request user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=cs`
          );

          if (!response.ok) {
            throw new Error("Nepodařilo se získat informace o poloze");
          }

          const data = await response.json();

          // Extract city name and region from the response
          const detectedCity = data.address?.city ||
                      data.address?.town ||
                      data.address?.village ||
                      data.address?.municipality ||
                      "";

          const detectedRegion = data.address?.state || "";

          // Check if the detected city exists in our database
          const cityInDatabase = czechCities.find(
            (city) =>
              city.name.toLowerCase() === detectedCity.toLowerCase()
          );

          // Check if city has taxi services
          const hasTaxiServices = cityInDatabase && cityInDatabase.taxiServices && cityInDatabase.taxiServices.length > 0;

          if (cityInDatabase && hasTaxiServices) {
            // City found in database with taxi services, navigate to it directly
            toast.success(`Poloha nalezena: ${cityInDatabase.name}`);
            router.push(`/taxi/${cityInDatabase.slug}`);
          } else {
            // City not in database or has no taxi services, find nearest city from our list
            if (cityInDatabase && !hasTaxiServices) {
              toast.info(`${detectedCity} nemá zatím taxislužby. Hledám nejbližší město...`);
            } else {
              toast.info("Hledám nejbližší město z našeho seznamu...");
            }

            const nearestCity = await findNearestCity(
              latitude,
              longitude,
              detectedRegion,
              detectedCity  // Exclude the detected city from search
            );

            if (nearestCity) {
              const nearestCityData = czechCities.find(
                (c) => c.name === nearestCity
              );

              if (nearestCityData) {
                toast.success(
                  detectedCity
                    ? `Nejbližší město: ${nearestCity} (jste v: ${detectedCity})`
                    : `Nejbližší město nalezeno: ${nearestCity}`
                );
                router.push(`/taxi/${nearestCityData.slug}`);
              }
            } else {
              toast.error("Nepodařilo se najít nejbližší město z našeho seznamu");
            }
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          toast.error("Chyba při získávání informací o poloze");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);

        // GeolocationPositionError codes:
        // PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            toast.error("Přístup k poloze byl zamítnut. Prosím, povolte přístup v nastavení prohlížeče.");
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error("Informace o poloze nejsou dostupné");
            break;
          case 3: // TIMEOUT
            toast.error("Čas na získání polohy vypršel");
            break;
          default:
            toast.error(`Chyba při získávání polohy (kód: ${error.code})`);
            console.error("Geolocation error:", error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4" ref={containerRef}>
      {/* Search Input Container - toto je reference element pre Floating UI */}
      <div
        ref={refs.setReference}
        className="bg-card rounded-[4px] border border-foreground/20 p-1.5 md:p-2 flex items-center gap-1.5 md:gap-2"
      >
        <div className="flex-1 flex items-center gap-2 md:gap-3 px-2 md:px-4">
          <Search className="h-4 w-4 md:h-5 md:w-5 text-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Název města, obce nebo PSČ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchValue.trim() && filteredResults.length > 0) {
                setShowDropdown(true);
              }
            }}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground text-foreground font-medium"
          />
        </div>

        <Button
          variant="secondary"
          size="icon"
          onClick={handleSearch}
          className="rounded-[4px] h-10 w-10 md:h-12 md:w-12 flex-shrink-0"
          aria-label="Vyhledat"
        >
          <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={handleLocationClick}
          disabled={isLoadingLocation}
          className="rounded-[4px] h-10 w-10 md:h-12 md:w-12 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Použít moji polohu"
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </Button>
      </div>

      {/* Autocomplete Dropdown - renderované cez FloatingPortal mimo DOM hierarchie */}
      {showDropdown && filteredResults.length > 0 && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: 9999,
              width: refs.reference.current?.getBoundingClientRect().width || 'auto',
            }}
            className="bg-card rounded-[4px] border border-foreground/20 overflow-y-auto shadow-lg"
          >
            {filteredResults.slice(0, 10).map((result, index) => (
              <button
                key={`${result.slug}-${result.district || index}`}
                onClick={() => navigateToLocation(result.slug, result.name)}
                className={`w-full text-left px-4 md:px-6 py-2.5 md:py-3 hover:bg-foreground/5 active:bg-foreground/10 transition-colors border-b border-foreground/5 last:border-b-0 ${
                  index === selectedIndex ? "bg-foreground/10" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm md:text-base text-foreground">{result.name}</div>
                  {result.type === 'municipality' && (
                    <span className="text-xs bg-foreground/10 px-1.5 py-0.5 rounded text-foreground/70">obec</span>
                  )}
                  {result.type === 'location' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">lokalita</span>
                  )}
                </div>
                <div className="text-xs md:text-sm text-foreground/60 mt-0.5">
                  {result.district ? `Okres ${result.district}, ${result.region}` : result.region}
                </div>
              </button>
            ))}
            {filteredResults.length > 10 && (
              <div className="px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm text-foreground/60 text-center border-t border-foreground/10">
                Zobrazeno prvních 10 z {filteredResults.length} výsledků
              </div>
            )}
          </div>
        </FloatingPortal>
      )}

      <p className="text-center text-xs md:text-sm text-foreground font-bold mt-3 md:mt-4">
        Nebo použijte svou polohu pro okamžité vyhledání taxíků v okolí
      </p>
    </div>
  );
};
