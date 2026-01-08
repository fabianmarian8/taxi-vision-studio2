'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useId } from 'react';
import { Skeleton } from './ui/skeleton';

// Dynamically import RouteMap to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import('./RouteMap').then((mod) => mod.RouteMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

interface RouteMapWrapperProps {
  fromLat: number;
  fromLng: number;
  fromName: string;
  fromSlug: string;
  toLat: number;
  toLng: number;
  toName: string;
  toSlug: string;
  distance: number;
  roadDistance?: number;
  duration?: number;
  priceMin?: number;
  priceMax?: number;
}

export function RouteMapWrapper(props: RouteMapWrapperProps) {
  const uniqueId = useId();
  const [shouldRender, setShouldRender] = useState(false);

  // Delay rendering to ensure clean mount
  useEffect(() => {
    // Small delay to ensure DOM is clean
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
      <div className="w-full h-[350px] md:h-[400px] rounded-xl overflow-hidden border-2 border-foreground/10">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return <RouteMap key={`map-${uniqueId}-${props.fromLat}-${props.toLat}`} {...props} />;
}
