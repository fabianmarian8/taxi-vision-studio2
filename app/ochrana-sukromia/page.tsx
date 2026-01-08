/** Migrované z: src/vite-pages/PrivacyPolicy.tsx */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FooterLegal } from "@/components/FooterLegal";
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const metadata: Metadata = {
  title: 'Zásady ochrany osobných údajov – TaxiNearMe.cz',
  description: 'Informácie o tom, ako spracúvame a chránime vaše osobné údaje v súlade s GDPR. Zistite viac o vašich právach a našich záväzkoch.',
  openGraph: {
    title: 'Zásady ochrany osobných údajov – TaxiNearMe.cz',
    description: 'Informácie o tom, ako spracúvame a chránime vaše osobné údaje v súlade s GDPR. Zistite viac o vašich právach a našich záväzkoch.',
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: `${SEO_CONSTANTS.siteUrl}/ochrana-sukromia`,
    siteName: SEO_CONSTANTS.siteName,
    images: [
      {
        url: SEO_CONSTANTS.defaultImage,
        width: SEO_CONSTANTS.defaultImageWidth,
        height: SEO_CONSTANTS.defaultImageHeight,
        alt: 'Ochrana súkromia - Taxi NearMe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Zásady ochrany osobných údajov – TaxiNearMe.cz',
    description: 'Informácie o tom, ako spracúvame a chránime vaše osobné údaje v súlade s GDPR.',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/ochrana-sukromia`,
    languages: {
      [SEO_CONSTANTS.language]: `${SEO_CONSTANTS.siteUrl}/ochrana-sukromia`,
      'x-default': `${SEO_CONSTANTS.siteUrl}/ochrana-sukromia`,
    },
  },
};

const PrivacyPolicy = () => {
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
          Zásady ochrany osobných údajov – TaxiNearMe.cz
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-lg text-foreground/90 leading-relaxed">
            Dátum účinnosti: 14. 11. 2025
          </p>

          {/* 1. Prevádzkovateľ */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              1. Prevádzkovateľ
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Prevádzkovateľom webovej stránky{" "}
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
              Prevádzkovateľ spracúva osobné údaje v súlade s Nariadením (EÚ) 2016/679 (GDPR)
              a zákonom č. 18/2018 Z. z. o ochrane osobných údajov.
            </p>
          </section>

          {/* 2. Aké osobné údaje spracúvame */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              2. Aké osobné údaje spracúvame
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Pri používaní webu môžeme spracúvať najmä tieto kategórie údajov:
            </p>

            <div className="space-y-4 ml-4">
              <div className="bg-card p-4 rounded-lg border-l-4 border-foreground">
                <h3 className="font-bold text-foreground mb-2">1. Údaje o používaní webu</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>IP adresa, typ zariadenia, typ a verzia prehliadača, operačný systém</li>
                  <li>dátum a čas prístupu, zdroj návštevy, prekliky a správanie na stránke</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-foreground">
                <h3 className="font-bold text-foreground mb-2">2. Údaje z cookies a podobných technológií</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>technické cookies potrebné na zobrazenie webu</li>
                  <li>štatistické cookies (napr. Google Analytics, Microsoft Clarity)</li>
                  <li>marketingové cookies (napr. Google AdSense, Google Ads)</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-foreground">
                <h3 className="font-bold text-foreground mb-2">3. Údaje z kontaktného formulára</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>meno</li>
                  <li>email</li>
                  <li>telefónne číslo</li>
                  <li>webstránka</li>
                  <li>adresa (ak ju používateľ uvedie)</li>
                  <li>obsah správy</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-foreground">
                <h3 className="font-bold text-foreground mb-2">4. Údaje o taxi firmách zverejnených v katalógu</h3>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                  <li>názov firmy</li>
                  <li>webová stránka</li>
                  <li>telefónne číslo</li>
                </ul>
                <p className="text-foreground/70 text-xs mt-2 italic">
                  Tieto údaje sa týkajú podnikateľských subjektov a obvykle nepredstavujú osobné údaje
                  fyzických osôb, pokiaľ nie je údaj zároveň prepojený na konkrétnu fyzickú osobu.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Účely a právne základy spracúvania */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              3. Účely a právne základy spracúvania
            </h2>

            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">a) Prevádzka a bezpečnosť webu</h3>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Účel:</strong> technické fungovanie, zabezpečenie, odhalenie zneužívania
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Právny základ:</strong> oprávnený záujem prevádzkovateľa (čl. 6 ods. 1 písm. f GDPR)
                </p>
                <p className="text-foreground/80 text-sm">
                  <strong>Údaje:</strong> IP adresa, technické logy, nevyhnutné cookies
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">b) Štatistika a zlepšovanie služby</h3>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Účel:</strong> analýza návštevnosti a používania webu, zlepšovanie obsahu a funkcií
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Právny základ:</strong> súhlas používateľa (čl. 6 ods. 1 písm. a GDPR)
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Nástroje:</strong> Google Analytics, Microsoft Clarity
                </p>
                <p className="text-foreground/80 text-sm">
                  <strong>Údaje:</strong> údaje o správaní na webe, anonymizované alebo pseudonymizované identifikátory
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">c) Zobrazovanie reklamy</h3>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Účel:</strong> zobrazovanie kontextovej a personalizovanej reklamy
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Právny základ:</strong> súhlas používateľa (čl. 6 ods. 1 písm. a GDPR)
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Nástroj:</strong> Google AdSense a súvisiace služby spoločnosti Google
                </p>
                <p className="text-foreground/80 text-sm">
                  <strong>Údaje:</strong> cookies, online identifikátory, informácie o správaní na webe
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">d) Komunikácia cez kontaktný formulár</h3>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Účel:</strong> vybavenie dopytu, spätná väzba, doplnenie alebo úprava údajov o taxi firme
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Právny základ:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm mb-2">
                  <li>predzmluvné vzťahy a plnenie zmluvy (čl. 6 ods. 1 písm. b GDPR), ak ide o žiadosť o zaradenie/úpravu záznamu</li>
                  <li>oprávnený záujem (čl. 6 ods. 1 písm. f GDPR), ak ide o bežnú komunikáciu</li>
                </ul>
                <p className="text-foreground/80 text-sm">
                  <strong>Údaje:</strong> meno, email, telefón, webstránka, adresa, obsah správy
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">e) Účtovníctvo a právne povinnosti</h3>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Účel:</strong> splnenie zákonných povinností v oblasti daní a účtovníctva
                </p>
                <p className="text-foreground/80 text-sm mb-2">
                  <strong>Právny základ:</strong> zákonná povinnosť (čl. 6 ods. 1 písm. c GDPR)
                </p>
                <p className="text-foreground/80 text-sm">
                  <strong>Údaje:</strong> údaje uvedené na daňových dokladoch, ak v budúcnosti dôjde k úplatným službám
                </p>
              </div>
            </div>
          </section>

          {/* 4. Ako dlho údaje uchovávame */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              4. Ako dlho údaje uchovávame
            </h2>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li className="leading-relaxed">
                <strong>technické logy:</strong> spravidla max. 1 rok, pokiaľ nie je potrebné dlhšie uchovanie (napr. pri bezpečnostnom incidente)
              </li>
              <li className="leading-relaxed">
                <strong>analytické údaje:</strong> podľa nastavení nástrojov (typicky 14–26 mesiacov)
              </li>
              <li className="leading-relaxed">
                <strong>marketingové cookies:</strong> podľa nastavení príslušnej služby (zvyčajne niekoľko mesiacov až 2 roky)
              </li>
              <li className="leading-relaxed">
                <strong>údaje z kontaktného formulára:</strong> po dobu riešenia dopytu a následne max. 3 roky pre prípad obrany právnych nárokov
              </li>
              <li className="leading-relaxed">
                <strong>účtovné doklady:</strong> 10 rokov od konca účtovného obdobia
              </li>
            </ul>
          </section>

          {/* 5. Príjemcovia osobných údajov */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              5. Príjemcovia osobných údajov
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Vaše údaje môžu byť spracúvané aj týmito kategóriami príjemcov:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li className="leading-relaxed">
                poskytovatelia hostingu a infraštruktúry (GitHub, Vercel, prípadne ďalší poskytovatelia serverov)
              </li>
              <li className="leading-relaxed">
                poskytovateľ domény a DNS (napr. Websupport, Cloudflare)
              </li>
              <li className="leading-relaxed">
                poskytovatelia analytických a reklamných služieb (Google Ireland Limited, Google LLC, Microsoft)
              </li>
              <li className="leading-relaxed">
                poskytovateľ emailovej služby na doručovanie správ z formulárov
              </li>
              <li className="leading-relaxed">
                účtovník/účtovnícka kancelária (pri fakturácii a účtovníctve)
              </li>
              <li className="leading-relaxed">
                orgány verejnej moci, ak to vyžaduje právny predpis
              </li>
            </ul>
          </section>

          {/* 6. Prenos do tretích krajín */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              6. Prenos do tretích krajín
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              V rámci používania služieb Google (Analytics, AdSense) a Microsoft Clarity môže dochádzať
              k prenosu údajov do tretích krajín, najmä do USA. Prenos prebieha na základe štandardných
              zmluvných doložiek EÚ alebo iného vhodného mechanizmu podľa GDPR.
            </p>
          </section>

          {/* 7. Práva dotknutých osôb */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              7. Práva dotknutých osôb
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Máte najmä tieto práva:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li className="leading-relaxed">
                <strong>právo na prístup</strong> k svojim osobným údajom
              </li>
              <li className="leading-relaxed">
                <strong>právo na opravu</strong> nepresných alebo neúplných údajov
              </li>
              <li className="leading-relaxed">
                <strong>právo na vymazanie</strong> („právo na zabudnutie") v prípadoch podľa GDPR
              </li>
              <li className="leading-relaxed">
                <strong>právo na obmedzenie spracúvania</strong>
              </li>
              <li className="leading-relaxed">
                <strong>právo namietať</strong> proti spracúvaniu založenému na oprávnenom záujme
              </li>
              <li className="leading-relaxed">
                <strong>právo na prenosnosť údajov</strong> (ak je spracúvanie založené na súhlase alebo zmluve a prebieha automatizovane)
              </li>
              <li className="leading-relaxed">
                <strong>právo kedykoľvek odvolať súhlas</strong> so spracúvaním, ak je spracúvanie založené na súhlase; odvolanie sa nedotýka zákonnosti spracúvania pred jeho odvolaním
              </li>
              <li className="leading-relaxed">
                <strong>právo podať sťažnosť</strong> na Úrad na ochranu osobných údajov SR
                (Hraničná 12, 820 07 Bratislava 27,{" "}
                <a href="https://www.dataprotection.gov.sk" target="_blank" rel="noopener noreferrer" className="underline">
                  www.dataprotection.gov.sk
                </a>
                )
              </li>
            </ul>
          </section>

          {/* 8. Uplatnenie práv */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              8. Uplatnenie práv
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Svoje práva môžete uplatniť zaslaním emailu na:{" "}
              <a href="mailto:info@taxinearme.cz" className="font-bold underline">
                info@taxinearme.cz
              </a>
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Žiadosti vybavujeme spravidla do 1 mesiaca od doručenia, vo výnimočných prípadoch
              môže byť lehota predĺžená v súlade s GDPR.
            </p>
          </section>

          {/* 9. Bezpečnosť osobných údajov */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              9. Bezpečnosť osobných údajov
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Prevádzkovateľ prijíma primerané technické a organizačné opatrenia na ochranu osobných
              údajov pred stratou, zneužitím alebo neoprávneným prístupom. Prístup k údajom majú len
              osoby, ktoré ho nevyhnutne potrebujú a sú viazané mlčanlivosťou.
            </p>
          </section>

          {/* 10. Zmeny zásad */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              10. Zmeny zásad
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Tieto zásady môžu byť aktualizované, napríklad pri zmene právnych predpisov alebo našich
              služieb. Aktuálna verzia je vždy zverejnená na tejto stránke.
            </p>
          </section>

          <div className="mt-12 p-6 bg-card rounded-lg border-2 border-foreground/10">
            <p className="text-foreground/80 leading-relaxed">
              <strong>Ďakujeme za Vašu dôveru.</strong> Záleží nám na Vašom súkromí a zaväzujeme sa
              chrániť Vaše osobné údaje v súlade s najvyššími normami bezpečnosti a v plnom súlade
              so slovenskou a európskou legislatívou.
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

export default PrivacyPolicy;
