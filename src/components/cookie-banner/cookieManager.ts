// Cookie Management Utility
// GDPR compliant cookie management system

// Type definitions for external services
interface GtagFunction {
  (command: string, action: string, params: Record<string, string>): void;
}

interface FbqFunction {
  (command: string, action: string): void;
}

interface ClarityFunction {
  (...args: unknown[]): void;
  q?: unknown[];
}

declare global {
  interface Window {
    gtag?: GtagFunction;
    fbq?: FbqFunction;
    clarity?: ClarityFunction;
  }
}

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  timestamp: string;
  version: string; // pro tracking změn v cookie policy
}

const CONSENT_KEY = 'cookieConsent';
const CONSENT_VERSION = '1.0';

/**
 * Získá uložený cookie consent z localStorage
 */
export const getCookieConsent = (): CookieConsent | null => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
};

/**
 * Uloží cookie consent do localStorage
 */
export const saveCookieConsent = (preferences: CookiePreferences): void => {
  const consent: CookieConsent = {
    preferences,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    
    // Spusť callback funkce pro aktivaci/deaktivaci služeb
    applyConsent(preferences);
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
};

/**
 * Kontrola zda existuje platný consent
 */
export const hasValidConsent = (): boolean => {
  const consent = getCookieConsent();
  if (!consent) return false;

  // Kontrola zda je consent v platné verzi
  if (consent.version !== CONSENT_VERSION) {
    // Smaž starý consent
    clearCookieConsent();
    return false;
  }

  // Volitelné: Kontrola expirace (například po 6 měsících)
  const consentDate = new Date(consent.timestamp);
  const monthsOld = (Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsOld > 6) {
    clearCookieConsent();
    return false;
  }
  
  return true;
};

/**
 * Smaže cookie consent
 */
export const clearCookieConsent = (): void => {
  localStorage.removeItem(CONSENT_KEY);
};

/**
 * Aplikuje consent nastavení na externí služby
 */
const applyConsent = (preferences: CookiePreferences): void => {
  // Google Analytics
  if (preferences.analytics) {
    enableGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }

  // Facebook Pixel
  if (preferences.marketing) {
    enableFacebookPixel();
  } else {
    disableFacebookPixel();
  }

  // Microsoft Clarity běží vždy (ignoruje consent)
  enableMicrosoftClarity();

  // Další služby...
};

/**
 * Google Analytics aktivace
 */
const enableGoogleAnalytics = (): void => {
  // Příklad integrace s Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
    console.log('✅ Google Analytics enabled');
  }
};

/**
 * Google Analytics deaktivace
 */
const disableGoogleAnalytics = (): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied'
    });
    console.log('❌ Google Analytics disabled');
  }
};

/**
 * Facebook Pixel aktivace
 */
const enableFacebookPixel = (): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('consent', 'grant');
    console.log('✅ Facebook Pixel enabled');
  }
};

/**
 * Facebook Pixel deaktivace
 */
const disableFacebookPixel = (): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('consent', 'revoke');
    console.log('❌ Facebook Pixel disabled');
  }
};

/**
 * Microsoft Clarity aktivace
 * POZNÁMKA: Clarity je načtený v layout.tsx a běží vždy (ignoruje cookie consent)
 */
const enableMicrosoftClarity = (): void => {
  // Clarity běží vždy z layout.tsx - tato funkce nic nedělá
  if (typeof window !== 'undefined' && window.clarity) {
    console.log('✅ Microsoft Clarity is running (always-on tracking)');
  }
};

/**
 * Microsoft Clarity deaktivace
 * POZNÁMKA: Clarity běží vždy - tato funkce je deaktivována
 */
const disableMicrosoftClarity = (): void => {
  // Clarity má běžet vždy - nedeaktivujeme ho
  console.log('⚠️ Microsoft Clarity deactivation skipped (always-on tracking)');
};

/**
 * Helper funkce - kontrola zda je konkrétní typ cookie povolen
 */
export const isCookieTypeEnabled = (type: keyof CookiePreferences): boolean => {
  const consent = getCookieConsent();
  if (!consent) return type === 'necessary'; // Necessary jsou vždy povoleny
  return consent.preferences[type];
};

/**
 * Otevři cookie nastavení znovu (pro tlačítko v patičce)
 */
export const reopenCookieSettings = (): void => {
  clearCookieConsent();
  // Trigger reload nebo event pro zobrazení banneru
  window.dispatchEvent(new Event('cookieSettingsRequested'));
};

/**
 * Export cookie preferencí jako JSON (pro audit)
 */
export const exportCookiePreferences = (): string => {
  const consent = getCookieConsent();
  return JSON.stringify(consent, null, 2);
};
