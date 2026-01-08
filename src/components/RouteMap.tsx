'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPrecomputedDistance, estimateRoadTaxiPrice } from '@/utils/routing';
import { Car, Clock, Navigation } from 'lucide-react';

// Fix for default marker icons - using localized assets
const startIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom green icon for destination - using localized asset
const endIcon = L.icon({
  iconUrl: '/leaflet/marker-icon-2x-green.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteMapProps {
  fromLat: number;
  fromLng: number;
  fromName: string;
  fromSlug: string; // Municipality slug for precomputed lookup
  toLat: number;
  toLng: number;
  toName: string;
  toSlug: string; // City slug for precomputed lookup
  distance: number; // Fallback distance (air distance)
  roadDistance?: number; // Manual override
  duration?: number; // Manual override
  priceMin?: number; // Manual price override
  priceMax?: number; // Manual price override
}

export function RouteMap({
  fromLat,
  fromLng,
  fromName,
  fromSlug,
  toLat,
  toLng,
  toName,
  toSlug,
  distance: airDistance,
  roadDistance: manualRoadDistance,
  duration: manualDuration,
  priceMin: manualPriceMin,
  priceMax: manualPriceMax,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const fromPosition: L.LatLngExpression = [fromLat, fromLng];
  const toPosition: L.LatLngExpression = [toLat, toLng];

  // Get precomputed distance (synchronous, no API call)
  const precomputed = getPrecomputedDistance(fromSlug, toSlug);
  const hasPrecomputed = precomputed !== null;

  // Determine final road distance and duration
  let roadDistance = 0;
  let duration = 0;
  let isAccurate = false;

  if (manualRoadDistance) {
    // 1. Manual override (highest priority - from props)
    roadDistance = manualRoadDistance;
    duration = manualDuration || Math.round(roadDistance * 1.5);
    isAccurate = true;
  } else if (hasPrecomputed) {
    // 2. Precomputed database
    roadDistance = precomputed.roadDistance;
    duration = precomputed.duration;
    isAccurate = true;
  } else {
    // 3. Fallback estimation
    roadDistance = Math.round(airDistance * 2.0 * 10) / 10;
    duration = Math.round(roadDistance * 1.5); // Rough estimate: 40 km/h average
    isAccurate = false;
  }

  // Cena - manuálny override má prioritu
  const calculatedPrice = estimateRoadTaxiPrice(roadDistance);
  const price = {
    min: manualPriceMin ?? calculatedPrice.min,
    max: manualPriceMax ?? calculatedPrice.max,
  };

  // Initialize map
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
    }).setView(fromPosition, 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add start marker
    L.marker(fromPosition, { icon: startIcon })
      .addTo(map)
      .bindPopup(`<div class="font-bold">${fromName}</div><div class="text-sm">Začiatok trasy</div>`);

    // Add end marker
    L.marker(toPosition, { icon: endIcon })
      .addTo(map)
      .bindPopup(`<div class="font-bold">${toName}</div><div class="text-sm">Taxislužby</div>`);

    // Add straight line between points (dashed for visual representation)
    L.polyline([fromPosition, toPosition], {
      color: '#fbbf24',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10',
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds([fromPosition, toPosition]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;
  }, [fromLat, fromLng, toLat, toLng, fromName, toName]);

  // Initialize and cleanup map
  useEffect(() => {
    // Small delay to ensure container is ready
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  return (
    <div className="space-y-4">
      {/* Route Info Box */}
      <div className="bg-gradient-to-r from-primary-yellow/20 to-primary-yellow/10 rounded-xl p-4 border border-primary-yellow/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Navigation className="h-5 w-5 text-primary-yellow mb-1" />
            <span className="text-xs text-foreground/60 font-medium">Vzdialenosť</span>
            <span className="text-lg font-black text-foreground">
              {roadDistance} km
            </span>
            {isAccurate && (
              <span className="text-[10px] text-foreground/70">po ceste</span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <Clock className="h-5 w-5 text-primary-yellow mb-1" />
            <span className="text-xs text-foreground/60 font-medium">Čas jazdy</span>
            <span className="text-lg font-black text-foreground">
              {duration} min
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Car className="h-5 w-5 text-primary-yellow mb-1" />
            <span className="text-xs text-foreground/60 font-medium">Odhadovaná cena</span>
            <span className="text-lg font-black text-foreground">
              {price.min}€ - {price.max}€*
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer pre ceny - len mobile, nad mapou */}
      <p className="text-xs text-center text-foreground/50 md:hidden">
        * Uvedené ceny sú orientačné a môžu sa líšiť v závislosti od konkrétnej taxi služby.
      </p>

      {/* Map */}
      <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10 relative">
        <div
          ref={mapContainerRef}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Disclaimer pre ceny - desktop, pod mapou */}
      <p className="text-xs text-center text-foreground/50 mt-3 hidden md:block">
        * Uvedené ceny sú orientačné a môžu sa líšiť v závislosti od konkrétnej taxi služby, typu vozidla, času jazdy a aktuálnej dopravnej situácie.
      </p>
    </div>
  );
}
