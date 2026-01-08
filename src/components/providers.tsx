'use client';

/**
 * Providers Component - Client Component pre Next.js App Router
 *
 * Obsahuje všetky React Context providery, ktoré potrebujú byť Client Components:
 * - QueryClientProvider (@tanstack/react-query)
 * - TooltipProvider (shadcn/ui)
 * - Toaster komponenty (toast notifikácie)
 * - Cookie consent inicializácia
 *
 * POZOR: Tento komponent MUSÍ mať 'use client' directive, pretože používa:
 * - useState, useEffect hooks
 * - React Query client state
 * - Radix UI providers (interaktívne komponenty)
 */

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import {
  getCookieConsent,
  hasValidConsent,
  saveCookieConsent
} from './cookie-banner/cookieManager';

export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient vytvorený v useState - zabráni zdieľaniu stavu medzi SSR requestmi
  const [queryClient] = useState(() => new QueryClient());
  // Cookie consent inicializácia (z pôvodného App.tsx)
  useEffect(() => {
    // Aplikuj uložený consent pri načítaní stránky
    if (hasValidConsent()) {
      const consent = getCookieConsent();
      if (consent) {
        // Re-aplikuj consent nastavenia (spustí tracking služby ak je súhlas)
        saveCookieConsent(consent.preferences);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
