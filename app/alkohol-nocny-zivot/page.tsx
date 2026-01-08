/** Migrované z: src/vite-pages/AlkoholNocnyZivotPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Alkohol, nočný život a taxík | TaxiNearMe.sk',
  description: 'Hranica medzi službou a záchrannou misiou. Kedy môže vodič odmietnuť jazdu a ako sa správať v noci.',
  keywords: ['taxi bezpečnosť', 'alkohol taxi', 'nočný život', 'opitý zákazník', 'taxislužby', 'správanie v taxi'],
  openGraph: {
    title: 'Alkohol, nočný život a taxík',
    description: 'Hranica medzi službou a záchrannou misiou. Kedy môže vodič odmietnuť jazdu a ako sa správať v noci.',
    url: 'https://www.taxinearme.sk/alkohol-nocny-zivot',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/alkohol.jpg',
      width: 1200,
      height: 630,
      alt: 'Alkohol, nočný život a taxík'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Alkohol, nočný život a taxík',
    description: 'Hranica medzi službou a záchrannou misiou. Kedy môže vodič odmietnuť jazdu a ako sa správať v noci.',
    images: ['https://www.taxinearme.sk/blog-images/alkohol.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/alkohol-nocny-zivot',
    languages: {
      'sk': 'https://www.taxinearme.sk/alkohol-nocny-zivot',
      'x-default': 'https://www.taxinearme.sk/alkohol-nocny-zivot',
    },
  }
};

export default function AlkoholNocnyZivotPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Alkohol, nočný život a taxík"
        description="Hranica medzi službou a záchrannou misiou. Kedy môže vodič odmietnuť jazdu a ako sa správať v noci."
        url="https://www.taxinearme.sk/alkohol-nocny-zivot"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Alkohol a nočný život' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <AlertCircle className="h-2.5 w-2.5 inline mr-1" />
              Bezpečnosť
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Alkohol, nočný život a taxík
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Hranica medzi službou a záchrannou misiou. Kedy môže vodič odmietnuť jazdu a ako sa správať v noci.
          </p>

          <ShareButton
            title="Alkohol, nočný život a taxík"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Keď hodiny ukážu polnoc a z klubov a barov sa valí unavený a často podnapitý dav, taxikári vstupujú do svojej najrizikovejšej pracovnej zmeny.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Odvoz opitých zákazníkov je súčasť práce, ale kde končí služba a začína osobné riziko? Vodič taxi nie je sanitka ani psychológ. Predsa sa často nachádza v situáciách, ktoré vyžadujú rozhodnutie: Vziať problémového zákazníka, alebo radšej odmietnuť?
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              Čísla, ktoré hovoria jasnou rečou
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Globálne štatistiky</h3>

              <p className="mb-3">
                Práca taxikára patrí medzi najnebezpečnejšie povolania. V USA sú vodiči taxi 30-60× viac ohrození násilím a vraždou než priemer pracujúcich.
              </p>

              <div className="grid md:grid-cols-2 gap-4 my-4">
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">82%</p>
                  <p className="text-sm">fatálnych útokov sa stáva v noci</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">94%</p>
                  <p className="text-sm">útokov pochádza zvnútra vozidla</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">80%</p>
                  <p className="text-sm">útokov prichádza zo sedadla priamo za vodičom</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">66%</p>
                  <p className="text-sm">útočníkov je mladších ako 20 rokov</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Právny rámec: Kedy môže vodič odmietnuť jazdu?</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Slovenský kontext</h3>
              <p>
                Na Slovensku platí pre vodičov úplná nulová tolerancia alkoholu (0,0% BAC), pričom profesionálni vodiči vrátane taxikárov musia dodržiavať tento limit.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Kedy je odmietnutie jazdy LEGITÍMNE</h3>

            <div className="space-y-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">1. Bezpečnostné dôvody</h4>
                <ul className="space-y-1">
                  <li>• Násilné správanie</li>
                  <li>• Obscénne gestá</li>
                  <li>• Hlasné nadávky</li>
                  <li>• Vyhrážky</li>
                  <li>• Viditeľné opitie s agresívnym správaním</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">2. Neznáma destinácia</h4>
                <p>Vodič má právo poznať presnú adresu cieľa. Neurčité odpovede ako "Niekde v centre" alebo "Poviem cestou" sú dôvodom na odmietnutie.</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">3. Platobná schopnosť</h4>
                <p>Vodič môže požadovať zálohu alebo časť sumy vopred, ak existuje podozrenie, že pasažier nebude schopný zaplatiť.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Praktické scenáre: Kedy povedať NIE</h2>

            <div className="space-y-8 my-4">
              <div className="border-l-4 border-yellow-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Scenár 1: Viditeľne opitý pasažier</h3>

                <p className="font-semibold mb-2">Signály:</p>
                <ul className="space-y-1 mb-3">
                  <li>• Nezrozumiteľná reč</li>
                  <li>• Neistá chôdza</li>
                  <li>• Hlasnosť</li>
                  <li>• Agresívne správanie</li>
                </ul>

                <p className="font-semibold mb-2">Správny postup:</p>
                <ol className="space-y-1">
                  <li>1. Komunikuj jasne a pokojne</li>
                  <li>2. Upozorni, že nie je v stave bezpečnej prepravy</li>
                  <li>3. Ponúkni alternatívu (počkať, zavolať niekoho)</li>
                  <li>4. Ak odmietne – odmietni jazdu</li>
                </ol>
              </div>

              <div className="border-l-4 border-orange-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Scenár 2: Skupina mladých opitých pasažierov</h3>

                <p className="bg-red-100 p-3 rounded mb-3">
                  <strong>Riziko:</strong> 80% útokov prichádza zo sedadla priamo za vodičom.
                </p>

                <p className="font-semibold mb-2">Správny postup:</p>
                <ol className="space-y-1">
                  <li>1. Požiadaj pasažierov, aby nesedeli priamo za tebou</li>
                  <li>2. Ideálne ich posadi naproti, kde ich vidíš</li>
                  <li>3. Maj nachystané hygienické vrecká</li>
                  <li>4. Informuj dispečing o cieli a zmene trasy</li>
                  <li>5. Pri agresívnom správaní zastav a vypusť pasažierov</li>
                </ol>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Bezpečnostné tipy pre vodičov</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pred jazdou</h3>

              <p className="mb-3">
                <strong>Nadviazanie očného kontaktu je kľúčové.</strong> Ukáž pasažierovi: "Vidím ťa, ty vidíš mňa, dokážem ťa identifikovať."
              </p>

              <p className="font-semibold mb-3">Kontrolný zoznam:</p>
              <ul className="space-y-2">
                <li>✓ Nadviazanie očného kontaktu</li>
                <li>✓ Posúdenie stavu pasažiera (opitosť, agresivita)</li>
                <li>✓ Potvrdenie presnej adresy</li>
                <li>✓ Informovanie dispečingu</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver: Tvoja bezpečnosť má prednosť</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Červená čiara</p>
              <p className="text-lg">
                Tvoja bezpečnosť má VŽDY prednosť pred povinnosťou starostlivosti.
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
            articleSlug="alkohol-nocny-zivot"
            articleTitle="Často kladené otázky o nočnom živote a taxi"
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
