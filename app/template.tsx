'use client';

/**
 * Template Component - Next.js App Router
 *
 * Template sa re-renderuje pri každej route zmene (na rozdiel od layout).
 * Používame ho pre ScrollToTop funkcionalitu (nahradenie src/components/ScrollToTop.tsx)
 *
 * Zmeny oproti pôvodnému ScrollToTop:
 * - useLocation z react-router-dom → usePathname z next/navigation
 * - Template wrapper namiesto samostatného komponentu v App.tsx
 *
 * POZOR: Musí byť Client Component ('use client') kvôli useEffect a usePathname
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Scroll na vrch pri zmene route (pôvodná funkcionalita z ScrollToTop.tsx)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
