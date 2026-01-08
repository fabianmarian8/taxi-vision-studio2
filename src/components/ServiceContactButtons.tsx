'use client';

import { Phone, Globe, MessageCircle } from 'lucide-react';

interface ServiceContactButtonsProps {
  phone?: string;
  website?: string;
  whatsapp?: string;
  serviceName: string;
  cityName: string;
  citySlug?: string;
  variant?: 'hero' | 'cta';
}

export function ServiceContactButtons({
  phone,
  website,
  whatsapp,
  serviceName,
  cityName,
  citySlug,
  variant = 'hero'
}: ServiceContactButtonsProps) {
  const handlePhoneClick = () => {
    // GA4 Click-to-Call tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_to_call', {
        event_category: 'engagement',
        event_label: `${serviceName} - ${cityName}`,
        phone_number: phone || '',
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
      }).catch(() => {});
    }
  };

  const handleWhatsAppClick = () => {
    // GA4 WhatsApp tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: `${serviceName} - ${cityName}`,
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
          event_type: 'whatsapp_click',
          city_slug: citySlug,
          service_name: serviceName,
          phone_number: whatsapp,
        }),
      }).catch(() => {});
    }
  };

  // Format WhatsApp number (remove spaces and +)
  const formatWhatsApp = (num: string) => num.replace(/[\s+]/g, '');

  if (variant === 'cta') {
    return phone ? (
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={`tel:${phone}`}
          onClick={handlePhoneClick}
          className="inline-flex items-center gap-3 partner-accent-btn font-black text-2xl px-8 py-4 rounded-xl transition-all"
        >
          <Phone className="h-7 w-7" />
          {phone}
        </a>
        {whatsapp && (
          <a
            href={`https://wa.me/${formatWhatsApp(whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-4 rounded-xl transition-all"
          >
            <MessageCircle className="h-6 w-6" />
            WhatsApp
          </a>
        )}
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={handlePhoneClick}
          className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black text-xl md:text-2xl px-8 py-4 rounded-xl transition-colors"
        >
          <Phone className="h-6 w-6" />
          {phone}
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${formatWhatsApp(whatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-4 rounded-xl transition-all"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      )}
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-6 py-4 rounded-xl transition-all"
        >
          <Globe className="h-5 w-5" />
          Navštíviť web
        </a>
      )}
    </div>
  );
}
