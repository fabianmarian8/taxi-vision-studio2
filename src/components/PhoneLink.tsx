'use client';

import { ReactNode } from 'react';

interface PhoneLinkProps {
  phone: string;
  serviceName: string;
  cityName: string;
  citySlug?: string;
  className?: string;
  title?: string;
  children?: ReactNode;
}

export function PhoneLink({
  phone,
  serviceName,
  cityName,
  citySlug,
  className = '',
  title,
  children
}: PhoneLinkProps) {
  const handleClick = () => {
    // GA4 Click-to-Call tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_to_call', {
        event_category: 'engagement',
        event_label: `${serviceName} - ${cityName}`,
        phone_number: phone,
        service_name: serviceName,
        city_name: cityName
      });
    }

    // Supabase click tracking (non-blocking)
    if (citySlug) {
      fetch('/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'phone_click',
          city_slug: citySlug,
          service_name: serviceName,
          phone_number: phone,
        }),
      }).catch(() => {
        // Ignore tracking errors - non-critical
      });
    }
  };

  return (
    <a
      href={`tel:${phone}`}
      className={className}
      title={title}
      onClick={handleClick}
    >
      {children || phone}
    </a>
  );
}
