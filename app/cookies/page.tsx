/** Migrované z: src/vite-pages/Cookies.tsx */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FooterLegal } from "@/components/FooterLegal";
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const metadata: Metadata = {
  title: 'Zásady používania súborov cookies – TaxiNearMe.cz',
  description: 'Informácie o tom, ako používame cookies na našej webovej stránke TaxiNearMe.cz. Zistite viac o typoch cookies a ako spravovať svoje preferencie.',
  openGraph: {
    title: 'Zásady používania súborov cookies – TaxiNearMe.cz',
    description: 'Informácie o tom, ako používame cookies na našej webovej stránke TaxiNearMe.cz. Zistite viac o typoch cookies a ako spravovať svoje preferencie.',
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: `${SEO_CONSTANTS.siteUrl}/cookies`,
    siteName: SEO_CONSTANTS.siteName,
    images: [
      {
        url: SEO_CONSTANTS.defaultImage,
        width: SEO_CONSTANTS.defaultImageWidth,
        height: SEO_CONSTANTS.defaultImageHeight,
        alt: 'Zásady cookies - Taxi NearMe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Zásady používania súborov cookies – TaxiNearMe.cz',
    description: 'Informácie o tom, ako používame cookies na našej webovej stránke.',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/cookies`,
    languages: {
      [SEO_CONSTANTS.language]: `${SEO_CONSTANTS.siteUrl}/cookies`,
      'x-default': `${SEO_CONSTANTS.siteUrl}/cookies`,
    },
  },
};

const Cookies = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto max-w-4xl px-8 py-24">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na hlavnú stránku
          </Button>
        </Link>

        <h1 className="text-5xl md:text-6xl font-black mb-8 text-foreground">
          Zásady používania súborov cookies – TaxiNearMe.cz
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-lg text-foreground/90 leading-relaxed">
            Dátum účinnosti: 14. 11. 2025
          </p>

          {/* 1. Čo sú cookies */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              1. Čo sú cookies
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies sú malé textové súbory, ktoré sa ukladajú do vášho zariadenia (počítač, tablet, telefón)
              pri návšteve webových stránok. Umožňujú stránke rozpoznať vaše zariadenie, zapamätať si vaše
              voľby a zlepšovať fungovanie a služby webu.
            </p>
          </section>

          {/* 2. Kto cookies používa */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              2. Kto cookies používa
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Správcom cookies na webovej stránke{" "}
              <a href="https://www.taxinearme.cz" className="underline">
                www.taxinearme.cz
              </a>{" "}
              je:
            </p>
            <div className="bg-card p-6 rounded-lg border-2 border-foreground/10">
              <p className="text-foreground/80 leading-relaxed">
                <strong>Marián Fabian</strong>
                <br />
                IČO: 47 340 860
                <br />
                DIČ: 1086305902
                <br />
                Miesto podnikania / sídlo: Gorkého 769/8, 962 31 Sliač, Slovenská republika
                <br />
                E-mail:{" "}
                <a href="mailto:info@taxinearme.cz" className="underline">
                  info@taxinearme.cz
                </a>
                <br />
                <br />
                Zapísaný v živnostenskom registri: Okresný úrad Banská Bystrica
                <br />
                <br />
                <strong>Orgán dozoru:</strong>
                <br />
                Slovenská obchodná inšpekcia (SOI)
                <br />
                Inšpektorát SOI pre Banskobystrický kraj
                <br />
                Dolná 46, 974 00 Banská Bystrica 1
                <br />
                E-mail:{" "}
                <a href="mailto:bb@soi.sk" className="underline">
                  bb@soi.sk
                </a>
                <br />
                Web:{" "}
                <a href="https://www.soi.sk" target="_blank" rel="noopener noreferrer" className="underline">
                  www.soi.sk
                </a>
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Okrem nás používajú cookies aj tretie strany (najmä Google a Microsoft) na analytické
              a reklamné účely.
            </p>
          </section>

          {/* 3. Aké typy cookies používame */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              3. Aké typy cookies používame
            </h2>

            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-foreground mb-2">a) Nevyhnutné cookies</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>zabezpečujú základné fungovanie webu</li>
                  <li>bez nich stránka nemusí správne fungovať</li>
                  <li>ukladajú sa aj bez vášho súhlasu</li>
                </ul>
              </div>

              <div className="bg-card p-5 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-foreground mb-2">b) Preferenčné cookies</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>zapamätanie si jazyka alebo určitých nastavení používateľa</li>
                </ul>
              </div>

              <div className="bg-card p-5 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-foreground mb-2">c) Štatistické (analytické) cookies</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>slúžia na meranie návštevnosti a analýzu správania používateľov</li>
                  <li>nástroje: Google Analytics, Microsoft Clarity</li>
                  <li className="font-semibold">spracúvajú sa len na základe vášho súhlasu</li>
                </ul>
              </div>

              <div className="bg-card p-5 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-foreground mb-2">d) Marketingové cookies</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>používajú sa na zobrazovanie relevantnej reklamy (napr. Google AdSense)</li>
                  <li>môžu kombinovať informácie z viacerých webov</li>
                  <li className="font-semibold">spracúvajú sa len na základe vášho súhlasu</li>
                </ul>
              </div>
            </div>

            <p className="text-foreground/70 text-sm italic mt-4">
              Konkrétne názvy a doby platnosti cookies sa môžu meniť podľa nastavení jednotlivých služieb.
            </p>
          </section>

          {/* 4. Ako udeľujete a odvolávate súhlas */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              4. Ako udeľujete a odvolávate súhlas
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Pri prvej návšteve webu sa zobrazí cookie lišta, v ktorej si môžete vybrať:
            </p>
            <div className="bg-card p-6 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-foreground">„Prijať všetko"</p>
                  <p className="text-foreground/70 text-sm">
                    súhlasíte so všetkými voliteľnými cookies
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-bold text-foreground">„Prispôsobiť"</p>
                  <p className="text-foreground/70 text-sm">
                    vyberiete si kategórie, s ktorými súhlasíte
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-bold text-foreground">„Odmietnuť všetko"</p>
                  <p className="text-foreground/70 text-sm">
                    zamietnete všetky voliteľné cookies (zostanú len nevyhnutné)
                  </p>
                </div>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Svoj súhlas môžete kedykoľvek zmeniť alebo odvolať cez odkaz{" "}
              <strong>„Nastavenia cookies"</strong> (nachádza sa v pätičke webu alebo v cookie lište).
            </p>
          </section>

          {/* 5. Nastavenia prehliadača */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              5. Nastavenia prehliadača
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies môžete blokovať alebo vymazať aj priamo vo svojom prehliadači. V takom prípade
              však niektoré časti webu nemusia fungovať správne. Postup nájdete v nastaveniach
              prehliadača (Chrome, Firefox, Safari a pod.).
            </p>
          </section>

          {/* 6. Cookies tretích strán a prenos údajov */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              6. Cookies tretích strán a prenos údajov
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies spojené s nástrojmi Google a Microsoft môžu viesť k prenosu údajov do tretích
              krajín (najmä USA). Tieto služby používajú vlastné zásady ochrany osobných údajov,
              ktoré odporúčame preštudovať na ich webových stránkach.
            </p>
          </section>

          {/* 7. Zmeny zásad cookies */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              7. Zmeny zásad cookies
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Tieto zásady môžu byť aktualizované. Aktuálna verzia je vždy dostupná na tejto stránke.
            </p>
          </section>

          <div className="mt-12 p-6 bg-card rounded-lg border-2 border-foreground/10">
            <p className="text-foreground/80 leading-relaxed">
              Viac informácií o spracúvaní osobných údajov nájdete v našich{" "}
              <Link href="/ochrana-sukromia" className="font-bold underline hover:text-foreground/70">
                Zásadách ochrany osobných údajov
              </Link>
              .
            </p>
          </div>
        </div>

        <Link href="/">
          <Button className="mt-12" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na hlavnú stránku
          </Button>
        </Link>
      </div>

      <FooterLegal />
    </div>
  );
};

export default Cookies;
