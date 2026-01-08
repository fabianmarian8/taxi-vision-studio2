'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = 'G-XM0ES676GB';

// gtag type is already declared in cookieManager.ts
// Using type assertion for the extended gtag config call

function GoogleAnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if gtag is available (loaded from layout.tsx)
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!pathname || typeof gtag !== 'function') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Track page view on route change
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTracking />
    </Suspense>
  );
}
