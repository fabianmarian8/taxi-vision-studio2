'use client';

import dynamic from 'next/dynamic';

// Dynamický import pre client-side only rendering (Leaflet vyžaduje window)
const CityRouteMap = dynamic(
  () => import('./CityRouteMap').then((mod) => mod.CityRouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10 bg-foreground/5 flex items-center justify-center">
        <span className="text-foreground/50">Načítavam mapu...</span>
      </div>
    ),
  }
);

interface CityRouteMapWrapperProps {
  fromLat: number;
  fromLng: number;
  fromName: string;
  toLat: number;
  toLng: number;
  toName: string;
}

export function CityRouteMapWrapper(props: CityRouteMapWrapperProps) {
  return <CityRouteMap {...props} />;
}

export default CityRouteMapWrapper;
