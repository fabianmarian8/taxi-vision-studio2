'use client';

import { useEffect, useRef, useCallback, useId, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface CityRouteMapProps {
  fromLat: number;
  fromLng: number;
  fromName: string;
  toLat: number;
  toLng: number;
  toName: string;
}

function CityRouteMapInner({
  fromLat,
  fromLng,
  fromName,
  toLat,
  toLng,
  toName,
}: CityRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const fromPosition: L.LatLngExpression = [fromLat, fromLng];
  const toPosition: L.LatLngExpression = [toLat, toLng];

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
      .bindPopup(`<div class="font-bold">${fromName}</div><div class="text-sm">Štart</div>`);

    // Add end marker
    L.marker(toPosition, { icon: endIcon })
      .addTo(map)
      .bindPopup(`<div class="font-bold">${toName}</div><div class="text-sm">Cieľ</div>`);

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
    <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10 relative">
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

// Wrapper to handle SSR and hydration
export function CityRouteMap(props: CityRouteMapProps) {
  const uniqueId = useId();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 50);

    return () => {
      clearTimeout(timer);
      setShouldRender(false);
    };
  }, [props.fromLat, props.fromLng, props.toLat, props.toLng]);

  if (!shouldRender) {
    return (
      <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10 bg-foreground/5 flex items-center justify-center">
        <span className="text-foreground/50">Načítavam mapu...</span>
      </div>
    );
  }

  return <CityRouteMapInner key={`map-${uniqueId}-${props.fromLat}-${props.toLat}`} {...props} />;
}

export default CityRouteMap;
