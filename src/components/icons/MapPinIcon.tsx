/**
 * MapPin Icon - Client Component Wrapper
 *
 * Wrapper pre Lucide MapPin ikonu, ktorý umožňuje použitie v Server Components.
 * Tento komponent je Client Component, ale môže byť importovaný do Server Components.
 */

'use client';

import { MapPin } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const MapPinIcon = (props: LucideProps) => {
  return <MapPin {...props} />;
};
