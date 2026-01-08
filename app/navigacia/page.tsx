/** Migrované z: src/vite-pages/NavigaciaPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, Navigation, Map, AlertTriangle, CheckCircle2 , ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Taxi navigácia: Ako nájsť najlepšiu trasu | TaxiNearMe.sk',
  description: 'Moderné nástroje a tipy pre efektívnu navigáciu v meste.',
  keywords: ['taxi navigácia', 'najlepšia trasa', 'gps taxi', 'navigácia slovensko', 'waze taxi', 'google maps taxi'],
  openGraph: {
    title: 'Taxi navigácia: Ako nájsť najlepšiu trasu',
    description: 'Moderné nástroje a tipy pre efektívnu navigáciu v meste.',
    url: 'https://www.taxinearme.sk/navigacia',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/navigacia.jpg',
      width: 1200,
      height: 630,
      alt: 'Taxi navigácia'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Taxi navigácia: Ako nájsť najlepšiu trasu',
    description: 'Moderné nástroje a tipy pre efektívnu navigáciu v meste.',
    images: ['https://www.taxinearme.sk/blog-images/navigacia.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/navigacia',
    languages: {
      'sk': 'https://www.taxinearme.sk/navigacia',
      'x-default': 'https://www.taxinearme.sk/navigacia',
    },
  }
};

export default function NavigaciaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Taxi navigácia: Ako nájsť najlepšiu trasu"
        description="Moderné nástroje a tipy pre efektívnu navigáciu v meste."
        url="https://www.taxinearme.sk/navigacia"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Taxi navigácia' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Navigation className="h-2.5 w-2.5 inline mr-1" />
              Navigácia
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Navigácia vs. lokálna znalosť: prečo sa stále riešia "najlepšie trasy"
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Keď GPS klame, keď zákazník "vie lepšie", a ako riešiť spory o trasu bez hádok
          </p>

          <ShareButton
            title="Navigácia vs. lokálna znalosť: prečo sa stále riešia najlepšie trasy"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Map className="h-8 w-8 inline mr-2 text-primary" />
              Realita: GPS nie je všemocný
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Kedy GPS zlyhá</h3>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Signálové problémy</h4>
              <p>
                GPS potrebuje signál minimálne 3-4 satelitov pre základné určenie polohy, ideálne 7-8 pre presnosť okolo 10 metrov. V mestských kaňonoch medzi výškovými budovami, v tuneloch alebo pri hustej zástavbe signál slabne alebo úplne mizne.
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Multipath chyby</h4>
              <p>
                Keď sa signály odrážajú od budov, GPS prijímač sa môže pomýliť o desiatky metrov. Náhle skoky v pozícii - to nie je vodič, čo blúdi, to je technológia, ktorá nevie, kde ste.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Zastaralé mapy</h4>
              <p>
                Stavby, dopravné uzávery, jednosmerky - všetko sa mení rýchlejšie, ako sa aktualizujú mapy. Stačí nová stavba a GPS ťa posiela cez bariéry.
              </p>
            </div>

            <div className="bg-red-100 border-l-4 border-red-400 p-6 my-4">
              <p className="font-semibold text-gray-900 mb-3">Reálny prípad z Arizony:</p>
              <p className="mb-2">Štúdia o rideshare nehodách ukázala, že vodiči slepo nasledujúci GPS:</p>
              <ul className="space-y-1 mt-3">
                <li>• Robia nelegálne odbočky cez viacero pruhov</li>
                <li>• Prechádzajú cez červenú, aby zostali na trase</li>
                <li>• Nevšímajú si chodcov na priechodoch</li>
                <li>• Zrážajú sa so zastavenými autami</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Londýnske "The Knowledge" vs. GPS</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Čo dokáže ľudský mozog</h3>

            <p>
              Londýnski taxikári musia stráviť <strong>3-4 roky</strong> učením sa každej ulice, každej uličky a každého skratu v Londýne. 320 trás v "Blue Book" musia vedieť naspamäť.
            </p>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h4 className="font-bold text-xl mb-3">Prečo to ešte má zmysel:</h4>
              <p className="mb-3">Podľa vedeckej štúdie z bioRxiv (2021) londýnski taxikári dokážu:</p>
              <ul className="space-y-2">
                <li><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-600" />Okamžite reagovať na dopravné kolóny a uzávery</li>
                <li><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-600" />Vyhnúť sa chybám typu: zákazník si mýli "King's Road" v Chelsea s "King Street" vo Westminsteri</li>
                <li><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-600" />Navigovať aj v sekundárnej sieti uličiek, kde GPS má problém</li>
              </ul>

              <p className="mt-4 p-3 bg-white rounded">
                <strong>GPS alternatíva:</strong> Uber vodiči v rovnakom meste často "zamŕzajú" keď sa cesta zablokuje - nemajú alternatívny plán v hlave. Londýnski taxikári prepínajú trasy intuitívne.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Slovenský zákonný rámec: Jasné pravidlá</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Čo hovorí zákon</h3>
              <p className="mb-3">Podľa <strong>zákona č. 56/2012 Z.z. o cestnej doprave:</strong></p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">Vodič MUSÍ:</h4>
                  <ul className="space-y-1">
                    <li>• Uskutočniť prepravu po najkratšej trase, ktorú umožňuje dopravná situácia</li>
                    <li>• Inú trasu môže použiť len so súhlasom cestujúceho, alebo na jeho návrh</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Výnimky:</h4>
                  <ul className="space-y-1">
                    <li>• Vopred známa pravidelná trasa (napr. letiská)</li>
                    <li>• Dopravná situácia to neumožňuje (zápcha, uzávera, nehoda)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Zákazník má právo:</h4>
                  <ul className="space-y-1">
                    <li>• Poznať trasu vopred</li>
                    <li>• Navrhnúť inú trasu</li>
                    <li>• Nesúhlasiť s trasou a požadovať zmenu</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Praktická aplikácia:</h4>
              <p className="italic">
                Ak GPS navrhne dlhšiu trasu cez diaľnicu (+ mýto), vodič má povinnosť informovať zákazníka: <strong>"Diaľnica je rýchlejšia, ale pridáva 3 € mýto. Môžeme ísť aj mestom, bude to o 10 minút dlhšie. Čo si prajete?"</strong>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Hybridný systém: Najlepšie z oboch svetov</h2>

            <p>
              Prieskum z UK Taxi Industry (2024) ukázal, že vodiči používajú GPS ako <strong>podporný nástroj</strong>, nie ako pána:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">📱 GPS na:</h4>
                <ul className="space-y-2">
                  <li>• Presné adresy (čísla domov)</li>
                  <li>• Sledovanie dopravy v reálnom čase</li>
                  <li>• Upozornenia na radary</li>
                  <li>• Neznáme oblasti mimo bežnej zóny</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">🧠 Lokálna znalosť na:</h4>
                <ul className="space-y-2">
                  <li>• Voľba optimálnej trasy podľa dennej doby</li>
                  <li>• Obídenie známych problémových úsekov</li>
                  <li>• Alternatívne cesty pri kolónach</li>
                  <li>• Skraty cez obytné zóny (kde je to legálne)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-4">
              <p className="text-xl font-bold text-center">
                Zlaté pravidlo: Profesionálny vodič vie, kedy ignorovať GPS. Začiatočník slepne sleduje mapu.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <AlertTriangle className="h-8 w-8 inline mr-2 text-yellow-600" />
              Ako riešiť spor o trasu BEZ hádky
            </h2>

            <div className="space-y-8 my-4">
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Pre vodičov:</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">1. Komunikuj transparentne PRED štartom:</h4>
                    <p className="text-sm italic bg-blue-50 p-3 rounded">
                      "Zvyčajne idem cez centrum, ale teraz je tam kolóna. Obídeme to po obvode, bude to rýchlejšie."
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Ponúkni možnosť:</h4>
                    <p className="text-sm italic bg-blue-50 p-3 rounded">
                      "Ak poznáte lepšiu cestu, navigujte ma, nemám problém."
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Ak zákazník protestuje počas jazdy:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Zastaň na bezpečnom mieste</li>
                      <li>• Ukáž mu mapu (GPS alebo papierovú)</li>
                      <li>• Vyber: "Pokračujeme touto trasou, alebo ideme podľa vášho návrhu?"</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Používaj Google Maps na obranu:</h4>
                    <p className="text-sm">
                      Ak zákazník vidí, že GPS ukazuje rovnakú trasu, často zmĺkne. Jeden vodič z Bostonu: <span className="italic">"Zapnem Google Maps nahlas, aby počul pokyny. Ukáže mu, že neidem blbú cestu."</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Pre zákazníkov:</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Sleduj trasu v reálnom čase:</h4>
                    <p className="text-sm">Zapni si vlastný Google Maps / Waze. Ak vodič ide úplne iným smerom, máš podklad na diskusiu.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Povedz cieľ jasne:</h4>
                    <p className="text-sm">Nie "centrum", ale "Hlavné námestie 5". GPS potrebuje presnosť.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Ak niečo nesedí, povedz TO OKAMŽITE:</h4>
                    <p className="text-sm italic">"Prepáčte, ale prečo ideme touto trasou? Google mi ukazuje kratšiu cestu cez..."</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Zdokumentuj:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Fotka taxametra</li>
                      <li>• Screenshot GPS s trasou</li>
                      <li>• Číslo vozidla a meno vodiča</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">5. Ak vodič odmietne zmeniť trasu:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Požiadaj zastaviť</li>
                      <li>• Zaplať to, čo reálne prešiel</li>
                      <li>• Nahlásiť taxislužbu/dispečingu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Technológia vs. človek: Fakty</h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Prečo GPS vyhrá:</h4>
                <ul className="space-y-2">
                  <li>✓ Prístup k reálnym dopravným dátam</li>
                  <li>✓ Objektívna vzdialenosť a čas</li>
                  <li>✓ Žiadne emócie</li>
                  <li>✓ Funguje 24/7 aj v neznámych mestách</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Prečo človek vyhrá:</h4>
                <ul className="space-y-2">
                  <li>✓ Kontextové chápanie (uzávery, eventy)</li>
                  <li>✓ Flexibilná adaptácia</li>
                  <li>✓ Pozná "lokálne tajomstvá"</li>
                  <li>✓ Intuícia založená na rokoch skúseností</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 p-8 rounded-lg my-4">
              <p className="text-2xl font-bold text-center mb-3">Výsledok:</p>
              <p className="text-xl text-center">
                <strong>Hybridný prístup = winner.</strong>
              </p>
              <p className="text-center mt-4">
                Štúdia Londýnskych taxikárov ukázala: vodiči s hlbokými mentálnymi mapami dokážu rýchlejšie reagovať na zmeny ako GPS systémy, ktoré vyžadujú manuálny input.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver: Pravidlá jasnej hry</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Pre vodičov:</h4>
                <ul className="space-y-1">
                  <li>✓ GPS je pomocník, nie tvoj šéf</li>
                  <li>✓ Komunikuj alternatívy vopred</li>
                  <li>✓ Poznaj zákon: najkratšia trasa = štandard, iná len so súhlasom</li>
                  <li>✓ Nevnucuj "svoju" trasu, ponúkaj možnosti</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Pre zákazníkov:</h4>
                <ul className="space-y-1">
                  <li>✓ Sleduj si trasu v reálnom čase</li>
                  <li>✓ Povedz jasný cieľ od začiatku</li>
                  <li>✓ Ak niečo nesedí, hovor OKAMŽITE, nie po 10 minútach</li>
                  <li>✓ Zdokumentuj, ak je potrebné reklamovať</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Bottom line:</p>
              <p className="text-lg">
                Dobrý vodič používa GPS ako nástroj, nie ako náhradu za mozog. Dobrý zákazník komunikuje jasne a sleduje, kam ide. Spory sa riešia mapou, nie krikom.
              </p>
            </div>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>
          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="taxi-navigacia"
            articleTitle="Často kladené otázky o taxi navigácii"
          />

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">Chcete vidieť komplexný sprievodca taxislužbami?</h3>
            <p className="text-center text-gray-700 mb-3">
              Prečítajte si všetko, čo potrebujete vedieť o taxi na Slovensku.
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
