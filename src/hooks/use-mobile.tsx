import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Začíname s undefined aby sme predišli hydration mismatch
  // Na serveri aj klientovi bude prvotná hodnota undefined
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Tento kód sa spustí LEN na klientovi
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    // Nastavíme skutočnú hodnotu po mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Vraciame undefined kým nie je hook inicializovaný na klientovi
  // Komponenty ktoré používajú tento hook musia správne handlovať undefined
  return isMobile;
}
