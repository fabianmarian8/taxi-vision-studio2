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
  title: 'Taxi navigace: Jak najít nejlepší trasu | TaxiNearMe.cz',
  description: 'Moderní nástroje a tipy pro efektivní navigaci ve městě.',
  keywords: ['taxi navigace', 'nejlepší trasa', 'gps taxi', 'navigace česko', 'waze taxi', 'google maps taxi'],
  openGraph: {
    title: 'Taxi navigace: Jak najít nejlepší trasu',
    description: 'Moderní nástroje a tipy pro efektivní navigaci ve městě.',
    url: 'https://www.taxinearme.cz/navigacia',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/navigacia.jpg',
      width: 1200,
      height: 630,
      alt: 'Taxi navigace'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Taxi navigace: Jak najít nejlepší trasu',
    description: 'Moderní nástroje a tipy pro efektivní navigaci ve městě.',
    images: ['https://www.taxinearme.cz/blog-images/navigacia.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/navigacia',
    languages: {
      'cs': 'https://www.taxinearme.cz/navigacia',
      'x-default': 'https://www.taxinearme.cz/navigacia',
    },
  }
};

export default function NavigaciaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Taxi navigace: Jak najít nejlepší trasu"
        description="Moderní nástroje a tipy pro efektivní navigaci ve městě."
        url="https://www.taxinearme.cz/navigacia"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Taxi navigace' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Navigation className="h-2.5 w-2.5 inline mr-1" />
              Navigace
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Navigace vs. lokální znalost: proč se stále řeší "nejlepší trasy"
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Když GPS lže, když zákazník "ví lépe", a jak řešit spory o trasu bez hádek
          </p>

          <ShareButton
            title="Navigace vs. lokální znalost: proč se stále řeší nejlepší trasy"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Map className="h-8 w-8 inline mr-2 text-primary" />
              Realita: GPS není všemocný
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Kdy GPS selhává</h3>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Signálové problémy</h4>
              <p>
                GPS potřebuje signál minimálně 3-4 satelitů pro základní určení polohy, ideálně 7-8 pro přesnost kolem 10 metrů. V městských kaňonech mezi výškovými budovami, v tunelech nebo při husté zástavbě signál slábne nebo úplně mizí.
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Multipath chyby</h4>
              <p>
                Když se signály odrážejí od budov, GPS přijímač se může splést o desítky metrů. Náhlé skoky v pozici - to není řidič, co bloudí, to je technologie, která neví, kde jste.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Zastaralé mapy</h4>
              <p>
                Stavby, dopravní uzavírky, jednosměrky - všechno se mění rychleji, než se aktualizují mapy. Stačí nová stavba a GPS tě posílá přes bariéry.
              </p>
            </div>

            <div className="bg-red-100 border-l-4 border-red-400 p-6 my-4">
              <p className="font-semibold text-gray-900 mb-3">Reálný případ z Arizony:</p>
              <p className="mb-2">Studie o rideshare nehodách ukázala, že řidiči slepě následující GPS:</p>
              <ul className="space-y-1 mt-3">
                <li>• Dělají nelegální odbočky přes více pruhů</li>
                <li>• Projíždějí na červenou, aby zůstali na trase</li>
                <li>• Nevšímají si chodců na přechodech</li>
                <li>• Narážejí do zastavených aut</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Londýnské "The Knowledge" vs. GPS</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Co dokáže lidský mozek</h3>

            <p>
              Londýnští taxikáři musí strávit <strong>3-4 roky</strong> učením se každé ulice, každé uličky a každé zkratky v Londýně. 320 tras v "Blue Book" musí znát zpaměti.
            </p>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h4 className="font-bold text-xl mb-3">Proč to ještě má smysl:</h4>
              <p className="mb-3">Podle vědecké studie z bioRxiv (2021) londýnští taxikáři dokážou:</p>
              <ul className="space-y-2">
                <li><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-600" />Okamžitě reagovat na dopravní kolony a uzavírky</li>
                <li><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-600" />Vyhnout se chybám typu: zákazník si mýlí "King's Road" v Chelsea s "King Street" ve Westminsteru</li>
                <li><CheckCircle2 className="h-5 w-5 inline mr-2 text-green-600" />Navigovat i v sekundární síti uliček, kde GPS má problém</li>
              </ul>

              <p className="mt-4 p-3 bg-white rounded">
                <strong>GPS alternativa:</strong> Uber řidiči ve stejném městě často "zamrzají" když se cesta zablokuje - nemají alternativní plán v hlavě. Londýnští taxikáři přepínají trasy intuitivně.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Český zákonný rámec: Jasná pravidla</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Co říká zákon</h3>
              <p className="mb-3">Podle <strong>zákona o silniční dopravě:</strong></p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">Řidič MUSÍ:</h4>
                  <ul className="space-y-1">
                    <li>• Uskutečnit přepravu po nejkratší trase, kterou umožňuje dopravní situace</li>
                    <li>• Jinou trasu může použít jen se souhlasem cestujícího, nebo na jeho návrh</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Výjimky:</h4>
                  <ul className="space-y-1">
                    <li>• Předem známá pravidelná trasa (např. letiště)</li>
                    <li>• Dopravní situace to neumožňuje (zácpa, uzavírka, nehoda)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Zákazník má právo:</h4>
                  <ul className="space-y-1">
                    <li>• Znát trasu předem</li>
                    <li>• Navrhnout jinou trasu</li>
                    <li>• Nesouhlasit s trasou a požadovat změnu</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Praktická aplikace:</h4>
              <p className="italic">
                Pokud GPS navrhne delší trasu přes dálnici (+ mýto), řidič má povinnost informovat zákazníka: <strong>"Dálnice je rychlejší, ale přidává poplatek. Můžeme jet i městem, bude to o 10 minut déle. Co si přejete?"</strong>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Hybridní systém: Nejlepší z obou světů</h2>

            <p>
              Průzkum z UK Taxi Industry (2024) ukázal, že řidiči používají GPS jako <strong>podpůrný nástroj</strong>, ne jako pána:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">GPS na:</h4>
                <ul className="space-y-2">
                  <li>• Přesné adresy (čísla domů)</li>
                  <li>• Sledování dopravy v reálném čase</li>
                  <li>• Upozornění na radary</li>
                  <li>• Neznámé oblasti mimo běžnou zónu</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Lokální znalost na:</h4>
                <ul className="space-y-2">
                  <li>• Volbu optimální trasy podle denní doby</li>
                  <li>• Obcházení známých problémových úseků</li>
                  <li>• Alternativní cesty při kolonách</li>
                  <li>• Zkratky přes obytné zóny (kde je to legální)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-4">
              <p className="text-xl font-bold text-center">
                Zlaté pravidlo: Profesionální řidič ví, kdy ignorovat GPS. Začátečník slepě sleduje mapu.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <AlertTriangle className="h-8 w-8 inline mr-2 text-yellow-600" />
              Jak řešit spor o trasu BEZ hádky
            </h2>

            <div className="space-y-8 my-4">
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Pro řidiče:</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">1. Komunikuj transparentně PŘED startem:</h4>
                    <p className="text-sm italic bg-blue-50 p-3 rounded">
                      "Obvykle jedu přes centrum, ale teď je tam kolona. Objedeme to po obvodu, bude to rychlejší."
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Nabídni možnost:</h4>
                    <p className="text-sm italic bg-blue-50 p-3 rounded">
                      "Pokud znáte lepší cestu, navigujte mě, nemám problém."
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Pokud zákazník protestuje během jízdy:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Zastav na bezpečném místě</li>
                      <li>• Ukaž mu mapu (GPS nebo papírovou)</li>
                      <li>• Vyber: "Pokračujeme touto trasou, nebo jedeme podle vašeho návrhu?"</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Používej Google Maps na obranu:</h4>
                    <p className="text-sm">
                      Pokud zákazník vidí, že GPS ukazuje stejnou trasu, často zmlkne. Jeden řidič z Bostonu: <span className="italic">"Zapnu Google Maps nahlas, aby slyšel pokyny. Ukáže mu, že nejedu blbou cestu."</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Pro zákazníky:</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Sleduj trasu v reálném čase:</h4>
                    <p className="text-sm">Zapni si vlastní Google Maps / Waze. Pokud řidič jede úplně jiným směrem, máš podklad na diskusi.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Řekni cíl jasně:</h4>
                    <p className="text-sm">Ne "centrum", ale "Václavské náměstí 5". GPS potřebuje přesnost.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Pokud něco nesedí, řekni TO OKAMŽITĚ:</h4>
                    <p className="text-sm italic">"Promiňte, ale proč jedeme touto trasou? Google mi ukazuje kratší cestu přes..."</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Zdokumentuj:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Fotka taxametru</li>
                      <li>• Screenshot GPS s trasou</li>
                      <li>• Číslo vozidla a jméno řidiče</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">5. Pokud řidič odmítne změnit trasu:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Požádej zastavit</li>
                      <li>• Zaplať to, co reálně projel</li>
                      <li>• Nahlásit taxislužbu/dispečinku</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Technologie vs. člověk: Fakta</h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Proč GPS vyhraje:</h4>
                <ul className="space-y-2">
                  <li>✓ Přístup k reálným dopravním datům</li>
                  <li>✓ Objektivní vzdálenost a čas</li>
                  <li>✓ Žádné emoce</li>
                  <li>✓ Funguje 24/7 i v neznámých městech</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Proč člověk vyhraje:</h4>
                <ul className="space-y-2">
                  <li>✓ Kontextové chápání (uzavírky, eventy)</li>
                  <li>✓ Flexibilní adaptace</li>
                  <li>✓ Zná "lokální tajemství"</li>
                  <li>✓ Intuice založená na letech zkušeností</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 p-8 rounded-lg my-4">
              <p className="text-2xl font-bold text-center mb-3">Výsledek:</p>
              <p className="text-xl text-center">
                <strong>Hybridní přístup = winner.</strong>
              </p>
              <p className="text-center mt-4">
                Studie londýnských taxikářů ukázala: řidiči s hlubokými mentálními mapami dokážou rychleji reagovat na změny než GPS systémy, které vyžadují manuální input.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr: Pravidla jasné hry</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Pro řidiče:</h4>
                <ul className="space-y-1">
                  <li>✓ GPS je pomocník, ne tvůj šéf</li>
                  <li>✓ Komunikuj alternativy předem</li>
                  <li>✓ Znej zákon: nejkratší trasa = standard, jiná jen se souhlasem</li>
                  <li>✓ Nevnucuj "svou" trasu, nabízej možnosti</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Pro zákazníky:</h4>
                <ul className="space-y-1">
                  <li>✓ Sleduj si trasu v reálném čase</li>
                  <li>✓ Řekni jasný cíl od začátku</li>
                  <li>✓ Pokud něco nesedí, mluv OKAMŽITĚ, ne po 10 minutách</li>
                  <li>✓ Zdokumentuj, pokud je potřeba reklamovat</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Bottom line:</p>
              <p className="text-lg">
                Dobrý řidič používá GPS jako nástroj, ne jako náhradu za mozek. Dobrý zákazník komunikuje jasně a sleduje, kam jede. Spory se řeší mapou, ne křikem.
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
            articleTitle="Často kladené otázky o taxi navigaci"
          />

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">Chcete vidět komplexní průvodce taxislužbami?</h3>
            <p className="text-center text-gray-700 mb-3">
              Přečtěte si vše, co potřebujete vědět o taxi v Česku.
            </p>
            <div className="flex justify-center">
              <Link href="/komplexny-sprievodca-taxi">
                <Button size="lg" className="gap-2">
                  Zobrazit průvodce
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
