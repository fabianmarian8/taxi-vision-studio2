'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3 } from 'lucide-react';
import {
  CookiePreferences,
  hasValidConsent,
  saveCookieConsent
} from './cookieManager';

export const CookieBanner = () => {
  // Mounted state pro prevenci hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // vždy povoleno
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Nejprve nastavíme mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Poté kontrolujeme consent - jen po mountnutí (client-side)
  useEffect(() => {
    if (!mounted) return;

    // Delay zobrazení banneru o 100ms po DOMContentLoaded
    // Toto zajistí, že hlavní obsah se stane LCP elementem, ne cookie banner
    const showBannerAfterLCP = () => {
      if (!hasValidConsent()) {
        // Počkej 100ms aby hlavní obsah stihl být LCP
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    // Pokud je DOM už načtený, spusť hned
    if (document.readyState === 'complete') {
      showBannerAfterLCP();
    } else {
      window.addEventListener('load', showBannerAfterLCP);
      return () => window.removeEventListener('load', showBannerAfterLCP);
    }
  }, [mounted]);

  // Listener pro znovuotevření nastavení
  useEffect(() => {
    if (!mounted) return;

    const handleReopenSettings = () => {
      setIsVisible(true);
      setShowDetails(false);
    };

    window.addEventListener('cookieSettingsRequested', handleReopenSettings);
    return () => {
      window.removeEventListener('cookieSettingsRequested', handleReopenSettings);
    };
  }, [mounted]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    saveCookieConsent(prefs); // Používáme cookieManager funkci
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // necessary nemohou být vypnuty
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Nerenderuj nic dokud není mounted (prevence hydration mismatch)
  // nebo dokud není banner viditelný
  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-3 pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={() => !showDetails && setIsVisible(false)}
      />

      {/* Cookie Banner */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 rounded-xl md:rounded-2xl overflow-hidden pointer-events-auto border md:border-2 border-black/20">
        
        {/* Černé kostkované pozadí (taxameter style) */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #000 0px,
              #000 20px,
              transparent 20px,
              transparent 40px
            )`
          }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleRejectAll}
          className="absolute top-1.5 right-1.5 md:top-2.5 md:right-2.5 p-1 md:p-1.5 hover:bg-black/10 rounded-full transition-colors z-10"
          aria-label="Zavřít"
        >
          <X className="w-3 h-3 md:w-4 md:h-4 text-black" />
        </button>

        <div className="relative p-3 md:p-5">
          {/* Header */}
          <div className="mb-3 md:mb-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                <Cookie className="w-3 h-3 md:w-5 md:h-5 text-black" />
                <h2 className="text-sm md:text-xl font-bold text-black">
                  Ahoj! 🍪 Potřebujeme Tvůj Souhlas
                </h2>
              </div>

              <p className="text-black/80 text-xs md:text-sm leading-relaxed">
                Používáme cookies, abychom ti mohli poskytnout nejlepší možnou zkušenost na našem webu.
                Pomáhají nám pochopit, jak používáš náš web, a zlepšovat naše služby.
              </p>
            </div>
          </div>

          {/* Detailní nastavení */}
          {showDetails && (
            <div className="space-y-2 md:space-y-2.5 mb-3 md:mb-4 bg-black/10 rounded-lg md:rounded-xl p-2.5 md:p-4 backdrop-blur-sm">
              <h3 className="font-bold text-black text-sm md:text-base mb-2 md:mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                Nastavení Cookies
              </h3>

              {/* Nezbytné cookies */}
              <div className="flex items-start gap-2 md:gap-2.5 p-2 md:p-2.5 bg-white/30 rounded-md md:rounded-lg">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="mt-0.5 w-3 h-3 md:w-3.5 md:h-3.5 accent-black"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black text-xs md:text-sm mb-0.5">Nezbytné Cookies (Vždy aktivní)</h4>
                  <p className="text-black/70 text-[10px] md:text-xs">
                    Tyto cookies jsou nezbytné pro základní funkce webu.
                    Bez nich by web nefungoval správně.
                  </p>
                </div>
              </div>

              {/* Funkční cookies */}
              <div className="flex items-start gap-2 md:gap-2.5 p-2 md:p-2.5 bg-white/20 rounded-md md:rounded-lg hover:bg-white/30 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={() => togglePreference('functional')}
                  className="mt-0.5 w-3 h-3 md:w-3.5 md:h-3.5 accent-black cursor-pointer"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black text-xs md:text-sm mb-0.5">Funkční Cookies</h4>
                  <p className="text-black/70 text-[10px] md:text-xs">
                    Umožňují pokročilé funkce jako je zapamatování si tvých preferencí
                    a nastavení.
                  </p>
                </div>
              </div>

              {/* Analytické cookies */}
              <div className="flex items-start gap-2 md:gap-2.5 p-2 md:p-2.5 bg-white/20 rounded-md md:rounded-lg hover:bg-white/30 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="mt-0.5 w-3 h-3 md:w-3.5 md:h-3.5 accent-black cursor-pointer"
                />
                <div className="flex-1 flex items-start gap-1.5">
                  <div className="flex-1">
                    <h4 className="font-bold text-black text-xs md:text-sm mb-0.5 flex items-center gap-1.5">
                      Analytické Cookies
                      <BarChart3 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </h4>
                    <p className="text-black/70 text-[10px] md:text-xs">
                      Pomáhají nám pochopit, jak návštěvníci používají web.
                      Sbíráme anonymní statistiky.
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketingové cookies */}
              <div className="flex items-start gap-2 md:gap-2.5 p-2 md:p-2.5 bg-white/20 rounded-md md:rounded-lg hover:bg-white/30 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="mt-0.5 w-3 h-3 md:w-3.5 md:h-3.5 accent-black cursor-pointer"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black text-xs md:text-sm mb-0.5">Marketingové Cookies</h4>
                  <p className="text-black/70 text-[10px] md:text-xs">
                    Používají se na zobrazování relevantních reklam a měření
                    efektivity reklamních kampaní.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 min-w-[90px] md:min-w-[130px] px-2.5 md:px-4 py-2 md:py-2.5 bg-black text-yellow-400 font-bold rounded-md md:rounded-lg
                       hover:bg-black/90 transition-colors text-xs md:text-sm"
            >
              ✅ Přijmout Vše
            </button>

            {showDetails ? (
              <button
                onClick={handleAcceptSelected}
                className="flex-1 min-w-[90px] md:min-w-[130px] px-2.5 md:px-4 py-2 md:py-2.5 bg-white/90 text-black font-bold rounded-md md:rounded-lg
                         hover:bg-white transition-colors text-xs md:text-sm"
              >
                💾 Uložit Výběr
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 min-w-[90px] md:min-w-[130px] px-2.5 md:px-4 py-2 md:py-2.5 bg-white/90 text-black font-bold rounded-md md:rounded-lg
                         hover:bg-white transition-colors text-xs md:text-sm"
              >
                ⚙️ Přizpůsobit
              </button>
            )}

            <button
              onClick={handleRejectAll}
              className="w-full md:w-auto px-2.5 md:px-4 py-1.5 md:py-2.5 text-black font-semibold hover:text-black/70
                       transition-colors underline text-xs md:text-sm"
            >
              Odmítnout Vše
            </button>
          </div>

          {/* Footer info */}
          <p className="mt-2.5 md:mt-4 text-black/60 text-[10px] md:text-xs text-center">
            Více informací o cookies najdeš v našich{' '}
            <a href="/ochrana-soukromi" className="underline hover:text-black">
              zásadách ochrany osobních údajů
            </a>
          </p>
        </div>
      </div>

    </div>
  );
};
