'use client';

import { ReactNode } from 'react';

interface TrackedPhoneButtonProps {
  phone: string;
  serviceName: string;
  citySlug: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

export function TrackedPhoneButton({
  phone,
  serviceName,
  citySlug,
  className = '',
  title,
  children
}: TrackedPhoneButtonProps) {
  const handleClick = () => {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_to_call', {
        event_category: 'engagement',
        event_label: `${serviceName} - ${citySlug}`,
        phone_number: phone,
        service_name: serviceName,
      });
    }

    // Supabase click tracking (non-blocking)
    fetch('/api/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'phone_click',
        city_slug: citySlug,
        service_name: serviceName,
        phone_number: phone,
      }),
    }).catch(() => {});
  };

  return (
    <a
      href={`tel:${phone.replace(/\s/g, '')}`}
      className={className}
      title={title}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
