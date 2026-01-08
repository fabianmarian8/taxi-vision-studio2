/**
 * Blog Article: Hodnotenie vodičov
 *
 * Migrované z: src/vite-pages/HodnotenieVodicovPage.tsx
 *
 * Zmeny oproti Vite verzii:
 * - SEOHead → generateMetadata
 * - Link z react-router → next/link
 * - handleShare → ShareButton komponent ('use client')
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { GeometricLines } from '@/components/GeometricLines';
import { Button } from '@/components/ui/button';
import { Calendar, Star, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ArticleFAQ } from '@/components/ArticleFAQ';
import { SEOBreadcrumbs } from '@/components/SEOBreadcrumbs';
import { ShareButton } from '@/components/ShareButton';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Ako funguje hodnotenie vodičov v taxi aplikáciách | Taxi NearMe',
  description:
    'Prečo môžeš jedným klikom zničiť niekomu prácu. 4★ nie je dobré hodnotenie - je to penalizácia.',
  keywords: [
    'hodnotenie vodičov',
    'taxi aplikácie',
    'uber rating',
    'bolt hodnotenie',
    'taxislužby',
    'recenzie taxi',
  ],
  openGraph: {
    title: 'Ako funguje hodnotenie vodičov v taxi aplikáciách',
    description:
      'Prečo môžeš jedným klikom zničiť niekomu prácu. 4★ nie je dobré hodnotenie - je to penalizácia.',
    type: 'article',
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15',
    locale: 'sk_SK',
    url: 'https://www.taxinearme.sk/hodnotenie-vodicov',
    images: [
      {
        url: 'https://www.taxinearme.sk/blog-images/hodnotenie.jpg',
        width: 1200,
        height: 630,
        alt: 'Hodnotenie vodičov v taxi aplikáciách',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Ako funguje hodnotenie vodičov v taxi aplikáciách',
    description:
      'Prečo môžeš jedným klikom zničiť niekomu prácu. 4★ nie je dobré hodnotenie - je to penalizácia.',
    images: ['https://www.taxinearme.sk/blog-images/hodnotenie.jpg'],
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/hodnotenie-vodicov',
    languages: {
      'sk': 'https://www.taxinearme.sk/hodnotenie-vodicov',
      'x-default': 'https://www.taxinearme.sk/hodnotenie-vodicov',
    },
  },
};

export default function HodnotenieVodicovPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Ako funguje hodnotenie vodičov v taxi aplikáciách"
        description="Prečo môžeš jedným klikom zničiť niekomu prácu. 4★ nie je dobré hodnotenie - je to penalizácia."
        url="https://www.taxinearme.sk/hodnotenie-vodicov"
        publishedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[{ label: 'Hodnotenie vodičov' }]} />

        {/* Hero Section */}
        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Star className="h-2.5 w-2.5 inline mr-1" />
              Hodnotenie
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Ako funguje hodnotenie vodičov v taxi aplikáciách
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Prečo môžeš jedným klikom zničiť niekomu prácu. 4★ nie je dobré hodnotenie - je to
            penalizácia.
          </p>

          <ShareButton title="Ako funguje hodnotenie vodičov v taxi aplikáciách" />
        </div>
      </section>
      </div>

      {/* Article Content with WHITE BACKGROUND */}
      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                <AlertTriangle className="h-5 w-5 inline mr-2 text-yellow-600" />
                Poviem to bez obalu:
              </p>
              <p className="text-gray-800">
                Hviezdičky v taxi aplikácii nie sú hra. Jedno tvoje kliknutie môže znamenať, že
                konkrétny vodič dostane menej jázd, príde o stovky eur mesačne, alebo ho systém
                úplne odstaví.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Vodič taxi nie je sanitka ani psychológ. Predsa sa často nachádza v situáciách,
              ktoré vyžadujú rozhodnutie: Vziať problémového zákazníka, alebo radšej odmietnuť?
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              1. 4★ nie je &quot;dobré hodnotenie&quot;. Je to penalizácia.
            </h2>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-3">
              <p className="font-semibold text-gray-900">Bežná veta zákazníka:</p>
              <p className="italic text-gray-700">&quot;Nič extra, tak 4★.&quot;</p>
              <p className="mt-3 text-gray-800">
                <strong>Realita:</strong> Platformy tlačia vodičov k priemeru 4,8★. Každý pokles o
                desatinku znamená: menej priorizovaných jázd, menej príjmu, viac stresu.
              </p>
            </div>

            <p>
              Pre vodiča rozdiel medzi 4,7★ a 4,9★ = či ho systém bude púšťať dopredu alebo ho
              hodí na dno.
            </p>

            <p className="font-semibold text-lg">
              Ak bola jazda <strong>bezpečná, normálna, auto čisté, vodič korektný</strong> → 4★
              je trest, nie hodnotenie.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              2. Väčšina nízkych hodnotení trestá niečo, za čo vodič nemôže
            </h2>

            <p>Ľudia dávajú zlé hodnotenia za veci mimo kontroly vodiča:</p>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Zápcha</p>
                <p className="text-sm text-gray-700">
                  Vodič neovláda semafory ani nehody na ceste
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Cena</p>
                <p className="text-sm text-gray-700">Tarifu nastavuje systém, nie vodič</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Počasie</p>
                <p className="text-sm text-gray-700">Vodič neriadi dážď ani sneh</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Uzávierky</p>
                <p className="text-sm text-gray-700">Vodič neplánuje cestné práce</p>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Typické scenáre:</h3>

            <div className="space-y-4 my-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Drahé, dám 3★&quot;</p>
                <p className="text-sm text-gray-700">→ Tarifu nastavuje systém, nie vodič</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Meškal, dám 2★&quot;</p>
                <p className="text-sm text-gray-700">→ Stál v zápche, neovláda semafory</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Nič extra, tak 4★&quot;</p>
                <p className="text-sm text-gray-700">
                  → Sme v taxi, nie v divadle. Bezpečne, včas, v tichu = perfektná jazda
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Pohádali sme sa, dám mu 1★&quot;</p>
                <p className="text-sm text-gray-700">
                  → Vodič odmietol porušiť pravidlá / riskovať
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              3. Najšpinavšia časť: krivé obvinenia a blokácie bez dôkazov
            </h2>

            <p>Téma o ktorej sa veľmi nehovorí, ale v systéme existuje:</p>

            <ul className="space-y-2 my-4">
              <li>Obvinenia z &quot;nevhodného správania&quot;</li>
              <li>Obťažovanie</li>
              <li>Pocit &quot;cítila som sa nepríjemne&quot;</li>
            </ul>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Ako to funguje:</h3>
              <ol className="space-y-3">
                <li>
                  <strong>1.</strong> Zákazník napíše: &quot;Vodič sa správal nevhodne / obťažoval
                  ma / cítila som sa ohrozená&quot;
                </li>
                <li>
                  <strong>2.</strong> Systém: okamžite zablokuje vodiča, odstaví mu príjem, neraz
                  bez reálneho preverenia faktov
                </li>
                <li>
                  <strong>3.</strong> Vodič: nemá priestor sa brániť, nevie čo presne sa mu kladie
                  za vinu, je &quot;odpálený&quot;
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              4. Ako by mal vyzerať férový systém hodnotenia
            </h2>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Tri veci:</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    1. Nefungovať na princípe: zákazník má vždy pravdu
                  </h4>
                  <p>Extrémne hodnotenie (1★ + ťažký komentár) by malo ísť pod lupu</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">
                    2. Pozerať sa na dáta, nie len na emóciu
                  </h4>
                  <p>Hľadať vzorce, nie jednorazové výbuchy</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3. Dovoliť vodičovi sa brániť</h4>
                  <p>Vodič má mať možnosť reagovať a poskytnúť svoju verziu</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              5. Návod pre zákazníkov: ako hodnotiť férovo
            </h2>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">✓ Hodnoť vodiča za to, čo ovplyvní:</h3>
              <ul className="space-y-2">
                <li>• Jazdil agresívne, riskoval</li>
                <li>• Bol arogantný, hrubý, nerešpektoval ťa</li>
                <li>• Auto bolo špinavé, odporný zápach</li>
                <li>• Vedome ťa ťahal zbytočne dlhšou trasou</li>
                <li>• Ignoroval dohodu, správal sa vyslovene neprofesionálne</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">✗ Toto NIE JE dôvod na 1-3★:</h3>
              <ul className="space-y-2">
                <li>• Cena (vypočítala aplikácia)</li>
                <li>• Zápchy, nehody, uzávierky</li>
                <li>• Tvoje vlastné nervy, zlý deň, opitosť</li>
                <li>
                  • To, že vodič odmietol: jazdiť 80 v meste, porušiť dopravné predpisy, zastaviť
                  na zákaze, urobiť z auta diskotéku o 3:00 ráno
                </li>
              </ul>
            </div>

            <p className="text-xl font-bold text-center my-4 p-6 bg-gray-100 rounded-lg">
              Jednoduché pravidlo: &quot;Hodnotím vodiča len za to, čo reálne držal v
              rukách.&quot;
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Záver: Hviezdičky sú zbraň</h2>

            <p className="text-lg">
              Nechceme od teba, aby si bol &quot;dobráčik&quot; a rozdával 5★ stále. Chceme iba:{' '}
              <strong>férové hodnotenie za to, čo vodič reálne ovplyvnil.</strong>
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="font-semibold text-lg mb-3">Dôsledok nespravodlivého hodnotenia:</p>
              <ul className="space-y-2">
                <li>
                  • Dobrí vodiči časom odídu (unavení z toho, že žijú pod gilotínou hviezdičiek)
                </li>
                <li>
                  • Zostanú tí, ktorí to berú len ako dočasnú robotu, bez vzťahu k práci
                </li>
                <li>
                  • Ty ako zákazník skončíš v službe, kde: vodiči nemajú motiváciu, systém je
                  napnutý, kvalita ide dole
                </li>
              </ul>
            </div>

            <p className="text-xl font-bold text-center my-4">Rozmýšľaj, kam mieris.</p>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>

          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="hodnotenie-vodicov"
            articleTitle="Často kladené otázky o hodnotení vodičov"
          />

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">
              Chcete vidieť komplexný sprievodca taxislužbami?
            </h3>
            <p className="text-center text-gray-700 mb-3">
              Prečítajte si všetko, čo potrebujete vedieť o taxi na Slovensku v roku 2025.
            </p>
            <div className="flex justify-center">
              <Link href="/komplexny-sprievodca-taxi">
                <Button size="lg" className="gap-2">
                  Zobraziť sprievodcu
                  <ArrowLeft className="h-2.5 w-2.5 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
