# LCP Optimalizacia - Faza 2: Znizenie z 6.8s na <2.5s

**Projekt:** taxinearme.sk (Next.js 15.5.7 App Router)
**Datum:** 2025-12-08
**Ciel:** Znizit Lighthouse LCP z 6.8s na <2.5s (idealne <2s)

---

## Diagnostika problemu

### Aktualne metriky (Lighthouse mobile - simulovane)

| Metrika | Hodnota | Ciel | Status |
|---------|---------|------|--------|
| LCP | 6.8s | <2.5s | KRITICKE |
| FCP | 1.1s | <1.8s | OK |
| TBT | 60ms | <200ms | OK |
| CLS | 0 | <0.1 | OK |
| TTI | 6.8s | <3.8s | KRITICKE |

### Klucove zistenie: LCP = TTI

**Toto je kriticka informacia!** LCP a TTI su identicke (6.8s), co znamena:
- LCP element je **blokovaný JS hydráciou**
- Na pomalých zariadeniach sa LCP element **nezobrazí**, kým nedobehne hydrácia
- Render-blocking CSS (580ms) je len cast problemu

### Skutocne metriky (bez throttlingu)
- LCP: 0.82s
- DOM Loaded: 0.47s
- Load: 0.47s

To dokazuje, ze na rychlom zariadeni je vsetko v poriadku. Problem je **simulovane spomalenie Lighthouse**.

---

## Analyza homepage komponentov

### Server Components (OK - nepotrebuju hydraciu)
| Komponent | Subor | Status |
|-----------|-------|--------|
| HomePage | `/app/page.tsx` | Server Component |
| RegionCard | `/src/components/RegionCard.tsx` | Server Component |
| GeometricLines | `/src/components/GeometricLines.tsx` | Server Component |

### Client Components (PROBLEM - vyzaduju hydraciu)
| Komponent | Subor | Pricina 'use client' | Kriticnost |
|-----------|-------|---------------------|------------|
| Header | `/src/components/Header.tsx` | useState, useRouter | VYSOKA |
| SearchPanel | `/src/components/SearchPanel.tsx` | useState, useEffect, useRouter | VYSOKA |
| ArticleBanner | `/src/components/ArticleBanner.tsx` | useState, useEffect, useRef | STREDNA |
| AlphabeticalCityList | `/src/components/AlphabeticalCityList.tsx` | useState, useEffect, fetch | STREDNA |
| HowItWorks | `/src/components/HowItWorks.tsx` | Server Component | OK |
| CookieBanner | `/src/components/cookie-banner/CookieBanner.tsx` | useState, useEffect | NIZKA (lazy) |
| Providers | `/src/components/providers.tsx` | QueryClient, useEffect | VYSOKA |

### Third-party skripty
| Skript | Strategy | Cas | Dopad |
|--------|----------|-----|-------|
| Google Analytics (gtag.js) | lazyOnload | 100ms CPU | 55KB unused JS |
| Microsoft Clarity | lazyOnload | 60ms CPU | Menej kriticke |

---

## Implementacny plan

## PRIORITA 1: Critical CSS Inlining (VYSOKA URGENCIA)

### 1.1 Zapnut optimizeCss v Next.js

**Subor:** `/Users/marianfabian/taxi-vision-studio/next.config.ts`

**Zmena:**
```typescript
const nextConfig: NextConfig = {
  // ... existujuca konfiguracia ...

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'taxinearme.sk', 'www.taxinearme.sk'],
      bodySizeLimit: '2mb',
    },
    // NOVE: Inline critical CSS
    optimizeCss: true,
  },
};
```

**Poziadavka:** Potrebuje nainstalovat `critters`:
```bash
npm install --save-dev critters
```

**Ocakavany dopad:** -580ms (eliminuje render-blocking CSS)
**Effort:** 5 minut
**Riziko:** Nizke

---

## PRIORITA 2: Konverzia Header na Server Component

### 2.1 Rozdelit Header na Server a Client casti

**Problem:** Header pouziva `useRouter` a `useState` len pre:
1. Mobile menu toggle
2. Smooth scroll navigaciu
3. Contact modal

**Riesenie:** Vytvorit `HeaderClient` wrapper len pre interaktivne casti.

**Nove subory:**

**`/src/components/HeaderServer.tsx`:**
```typescript
// Server Component - BEZ 'use client'
import Link from "next/link";
import { HeaderClientWrapper } from "./HeaderClientWrapper";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#f5a623] border-b border-foreground/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8 py-1.5 md:py-4">
        <div className="flex items-center justify-between">
          {/* Staticka cast - renderuje sa na serveri */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/" className="home-button" title="Domovska stranka Taxi NearMe">
              <span>D</span><span>o</span><span>m</span><span>o</span><span>v</span>
            </Link>
          </div>

          {/* Desktop nav - staticke linky */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/#cities" className="text-sm font-bold hover:text-foreground/70">
              Mesta
            </Link>
            <Link href="/#how-it-works" className="text-sm font-bold hover:text-foreground/70">
              Ako to funguje
            </Link>
            <Link href="/o-nas" className="text-sm font-bold hover:text-foreground/70">
              O nas
            </Link>
            <Link href="/kontakt" className="text-sm font-bold hover:text-foreground/70">
              Kontakt
            </Link>
          </nav>

          {/* Klient wrapper pre +pridat a hamburger */}
          <HeaderClientWrapper />
        </div>
      </div>
    </header>
  );
};
```

**`/src/components/HeaderClientWrapper.tsx`:**
```typescript
'use client';

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ContactFormModal } from "./ContactFormModal";
import { MobileMenu } from "./MobileMenu";

export const HeaderClientWrapper = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsContactModalOpen(true)} className="home-button">
          <span>+</span><span>p</span><span>r</span><span>i</span><span>d</span><span>a</span><span>t</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu - renderuje sa len ked je otvorene */}
      {isMobileMenuOpen && <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />}

      {/* Contact modal - lazy loaded */}
      <ContactFormModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </>
  );
};
```

**Ocakavany dopad:** Znizi velkost hydratacneho JS o ~40%
**Effort:** 30 minut
**Riziko:** Stredne (treba testovat smooth scroll)

---

## PRIORITA 3: Dynamic Import pre komponenty pod foldom

### 3.1 Lazy load ArticleBanner

**Subor:** `/Users/marianfabian/taxi-vision-studio/app/page.tsx`

**Zmena:**
```typescript
// PRED
import { ArticleBanner } from '@/components/ArticleBanner';

// PO
import dynamic from 'next/dynamic';

const ArticleBanner = dynamic(() =>
  import('@/components/ArticleBanner').then(mod => ({ default: mod.ArticleBanner })),
  {
    ssr: true,
    loading: () => <div className="h-48 bg-foreground/5 rounded-xl animate-pulse" />
  }
);
```

### 3.2 Lazy load AlphabeticalCityList

**Zmena:**
```typescript
const AlphabeticalCityList = dynamic(() =>
  import('@/components/AlphabeticalCityList').then(mod => ({ default: mod.AlphabeticalCityList })),
  {
    ssr: true,
    loading: () => (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({length: 26}).map((_, i) => (
          <div key={i} className="h-10 bg-foreground/5 rounded animate-pulse" />
        ))}
      </div>
    )
  }
);
```

### 3.3 Lazy load HowItWorks

**Zmena:**
```typescript
const HowItWorks = dynamic(() =>
  import('@/components/HowItWorks').then(mod => ({ default: mod.HowItWorks })),
  { ssr: true }
);
```

**Ocakavany dopad:** Znizi initial JS bundle o ~25KB
**Effort:** 15 minut
**Riziko:** Nizke

---

## PRIORITA 4: Partytown pre third-party skripty

### 4.1 Instalacia Partytown

```bash
npm install @builder.io/partytown
```

### 4.2 Konfiguracia v next.config.ts

**Zmena:**
```typescript
const nextConfig: NextConfig = {
  experimental: {
    // ... existujuce ...
  },
  // Partytown - presunie third-party skripty do web workera
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ... existujuce security headers ...
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};
```

### 4.3 Uprava layout.tsx

**Subor:** `/Users/marianfabian/taxi-vision-studio/app/layout.tsx`

**Zmena:**
```typescript
import { Partytown } from '@builder.io/partytown/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <head>
        {/* Partytown - presunie GA a Clarity do web workera */}
        <Partytown debug={false} forward={['dataLayer.push', 'clarity']} />

        {/* Google Analytics - teraz cez Partytown */}
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'granted',
              });
              gtag('js', new Date());
              gtag('config', 'G-XM0ES676GB');
            `,
          }}
        />
        <script
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=G-XM0ES676GB"
        />

        {/* Microsoft Clarity - cez Partytown */}
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "u5uwq9jn6t");
            `,
          }}
        />

        {/* Ostatne existujuce meta tagy */}
      </head>
      <body>
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  );
}
```

**Ocakavany dopad:** -160ms CPU (GA + Clarity off main thread)
**Effort:** 20 minut
**Riziko:** Stredne (treba overit ci GA funguje spravne)

---

## PRIORITA 5: Streaming SSR s Suspense

### 5.1 Pridanie Suspense boundaries

**Subor:** `/Users/marianfabian/taxi-vision-studio/app/page.tsx`

**Zmena:**
```typescript
import { Suspense } from 'react';

export default function HomePage() {
  const regions = getRegionsData();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero Section - zobrazí sa okamzite */}
      <section className="pt-4 pb-6 md:pt-8 md:pb-8 px-4 md:px-8 relative hero-3d-bg z-10">
        <GeometricLines variant="hero" count={10} />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-2 md:space-y-3">
            <div className="mb-0">
              <Image
                src="/taxi-nearme-logo.webp"
                alt="Taxi NearMe"
                className="h-24 md:h-36 lg:h-44 xl:h-52 w-auto mx-auto rounded-2xl"
                width={600}
                height={327}
                priority
              />
            </div>
            <h1 className="text-sm md:text-lg lg:text-xl text-foreground max-w-2xl mx-auto font-black px-4">
              Kompletny katalog taxisluzieb na Slovensku
            </h1>
          </div>
        </div>
      </section>

      {/* Search - streamovany */}
      <Suspense fallback={<SearchPanelSkeleton />}>
        <section className="pt-6 pb-12 md:pt-8 md:pb-16 px-4 md:px-8 bg-white">
          <div className="container mx-auto max-w-6xl">
            <SearchPanel />
          </div>
        </section>
      </Suspense>

      {/* Regions - streamovane */}
      <Suspense fallback={<RegionsSkeleton />}>
        <section id="cities" className="py-7 md:py-12 lg:py-14 px-2 md:px-5 bg-white relative">
          <GeometricLines variant="subtle" count={6} />
          <div className="container mx-auto max-w-7xl relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-5">
              {regions.map((region) => (
                <RegionCard key={region.slug} {...region} />
              ))}
            </div>
          </div>
        </section>
      </Suspense>

      {/* Zvysok stranky - streamovany */}
      <Suspense fallback={<ContentSkeleton />}>
        <AlphabeticalCityList />
        <ArticleBanner />
        <HowItWorks />
      </Suspense>

      <Footer />
    </div>
  );
}

// Skeleton komponenty
function SearchPanelSkeleton() {
  return (
    <section className="pt-6 pb-12 px-4 bg-white">
      <div className="container mx-auto max-w-2xl">
        <div className="h-14 bg-foreground/10 rounded-lg animate-pulse" />
      </div>
    </section>
  );
}

function RegionsSkeleton() {
  return (
    <section className="py-7 px-2 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="h-20 bg-foreground/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Ocakavany dopad:** FCP a LCP sa mozu znizit o 500-1000ms
**Effort:** 20 minut
**Riziko:** Nizke

---

## PRIORITA 6: CSS Code Splitting (EXPERIMENTALNE)

### 6.1 Analyze CSS velkost

Aktualne CSS subory:
- `72210df6504a979c.css` - 16KB (render-blocking 631ms)
- `1dad44020d712f0a.css` - 3KB (render-blocking 159ms)

### 6.2 Manualne rozdelenie globals.css

**Problem:** Cely `globals.css` (459 riadkov) sa nacitava aj ked stranka nepotrebuje vsetky styly.

**Riesenie:** Rozdelit na:
1. `critical.css` - len above-the-fold styly (~100 riadkov)
2. `components.css` - UI komponenty (lazy load)
3. `utilities.css` - pomocne triedy (lazy load)

**POZNAMKA:** Toto je komplexna zmena, ktora vyzaduje viac casu. Odporucam implementovat az po vyhodnoteni dopadu priority 1-5.

---

## PRIORITA 7: Partial Prerendering (EXPERIMENTALNE - Next.js 15)

### 7.1 Zapnut PPR

**Subor:** `/Users/marianfabian/taxi-vision-studio/next.config.ts`

**Zmena:**
```typescript
const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
    serverActions: { /* ... */ },
    optimizeCss: true,
  },
};
```

**POZNAMKA:** PPR je este experimentalna feature v Next.js 15. Moze sposobit nestabilitu.

**Ocakavany dopad:** Dramaticke znizenie TTI (staticke casti sa zobrazia okamzite)
**Effort:** 5 minut (zapnut) + debugging
**Riziko:** VYSOKE (experimental feature)

---

## Suhrn implementacneho planu

### Faza A: Nizke riziko, rychla implementacia (1 hodina)

| # | Priorita | Zmena | Cas | Ocakavany dopad |
|---|----------|-------|-----|-----------------|
| 1 | VYSOKA | optimizeCss + critters | 10 min | -580ms |
| 3 | VYSOKA | Dynamic imports | 15 min | -25KB JS |
| 5 | STREDNA | Suspense streaming | 20 min | -500ms |

**Ocakavany celkovy dopad:** LCP z 6.8s na ~5.0s

### Faza B: Stredne riziko (2 hodiny)

| # | Priorita | Zmena | Cas | Ocakavany dopad |
|---|----------|-------|-----|-----------------|
| 2 | VYSOKA | Header refactor | 30 min | -40% hydration JS |
| 4 | STREDNA | Partytown | 30 min | -160ms CPU |

**Ocakavany celkovy dopad:** LCP z ~5.0s na ~3.5s

### Faza C: Vysoke riziko (experimentalne)

| # | Priorita | Zmena | Cas | Ocakavany dopad |
|---|----------|-------|-----|-----------------|
| 6 | NIZKA | CSS splitting | 2+ hod | -300ms |
| 7 | NIZKA | PPR | 30 min | -1000ms+ |

**Ocakavany celkovy dopad:** LCP z ~3.5s na <2.5s

---

## Verifikacia po implementacii

### 1. Lokalne testovanie
```bash
npm run build
npm run start
```

### 2. Lighthouse CI
```bash
npx lighthouse http://localhost:3000 --view --preset=desktop
npx lighthouse http://localhost:3000 --view --preset=mobile
```

### 3. WebPageTest
- Otestovat na https://www.webpagetest.org
- Vyber: Mobile 4G, Moto G4

### 4. Google Search Console
- Monitorovat Core Web Vitals 24-48 hodin po deployi

---

## Rozhodovacia matica

| Ak LCP po Faze A je... | Odporucanie |
|------------------------|-------------|
| <3.5s | Faza B nie je nutna, monitorovat |
| 3.5s - 4.5s | Implementovat Fazu B |
| >4.5s | Implementovat Fazu B + C |

---

## Potencialne problemy a riesenia

### Problem 1: Partytown blokuje GA data
**Riesenie:** Otestovat v staging prostredi, porovnat GA data pred/po

### Problem 2: Smooth scroll nefunguje po Header refactore
**Riesenie:** Pouzit `scroll-behavior: smooth` CSS alebo natívne `<a href="#section">`

### Problem 3: CLS pri lazy loading
**Riesenie:** Pridať min-height na skeleton komponenty

### Problem 4: PPR sposobuje hydration mismatch
**Riesenie:** Vypnut PPR, pouzit len Suspense

---

## Zavery a odporucania

### Okamzite kroky (dnes)
1. Nainstalovat `critters`: `npm install --save-dev critters`
2. Zapnut `optimizeCss: true` v next.config.ts
3. Pridat dynamic imports pre komponenty pod foldom

### Nasledujuce kroky (tento tyzden)
4. Refaktorovat Header na Server Component
5. Implementovat Partytown pre GA/Clarity

### Dlhodobe (po vyhodnoteni)
6. Zvazit CSS splitting ak je LCP stale >2.5s
7. Testovat PPR v Next.js 15 canary

---

**Ocakavany vysledok:**
- LCP: 6.8s -> 2.0-2.5s
- TTI: 6.8s -> 3.0-3.5s
- Performance Score: 50 -> 80+

---

*Plan vytvoreny: 2025-12-08*
*Autor: Claude Code*
*Verzia Next.js: 15.5.7*
