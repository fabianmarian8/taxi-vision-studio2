'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

interface TaxiPromoBannerProps {
  cityName: string;
  locationText: string; // "ve městě" nebo "v obci"
  taxiCount: number;
}

export function TaxiPromoBanner({ cityName, locationText, taxiCount }: TaxiPromoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Vždy rozbalovací banner (globální nastavení)
  const isCollapsible = true;

  // Plný obsah bannera
  const BannerContent = () => (
    <div
      className="relative text-center p-8 rounded-2xl overflow-hidden shadow-lg"
      style={{
        backgroundImage: 'url(/images/taxi-partner-bg.jpg)',
        backgroundSize: '99%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'white'
      }}
    >
      <div className="relative z-10">
        <h3 className="font-bold text-xl text-gray-900 mb-2">
          Ste taxislužba {locationText} {cityName}?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Získejte lepší pozici a více zákazníků
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/pre-taxiky"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg"
          >
            <Star className="h-4 w-4" />
            Zobrazit nabídku
          </Link>
          <a
            href="/images/taxi-partner-preview.png"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-400 hover:border-purple-600 transition-all shadow-lg hover:shadow-xl hover:scale-110 transform rotate-3 hover:rotate-0"
          >
            <img
              src="/images/taxi-partner-preview.png"
              alt="Ukázka partnerské stránky"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white font-bold text-xs py-1 text-center">
              KLIK!
            </span>
          </a>
        </div>
      </div>
    </div>
  );

  // Rozbalovací banner pro obce s méně než 3 taxislužbami
  if (isCollapsible) {
    return (
      <section className="py-4 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-4xl">
          {/* Sbalený stav - jen otázka */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <span className="font-bold text-gray-900">
              Ste taxislužba {locationText} {cityName}?
            </span>
            <span className="flex items-center gap-2 text-gray-500 group-hover:text-gray-700">
              {isExpanded ? (
                <>
                  <span className="text-sm">Zavřít</span>
                  <ChevronUp className="h-5 w-5" />
                </>
              ) : (
                <>
                  <span className="text-sm">Zobrazit více</span>
                  <ChevronDown className="h-5 w-5" />
                </>
              )}
            </span>
          </button>

          {/* Rozbalený obsah */}
          {isExpanded && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <BannerContent />
            </div>
          )}
        </div>
      </section>
    );
  }

  // Plný banner pro města s 3+ taxislužbami
  return (
    <section className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-4xl">
        <BannerContent />
      </div>
    </section>
  );
}
