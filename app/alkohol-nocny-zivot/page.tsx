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
  title: 'Alkohol, noční život a taxík | TaxiNearMe.cz',
  description: 'Hranice mezi službou a záchrannou misí. Kdy může řidič odmítnout jízdu a jak se chovat v noci.',
  keywords: ['taxi bezpečnost', 'alkohol taxi', 'noční život', 'opilý zákazník', 'taxislužby', 'chování v taxi'],
  openGraph: {
    title: 'Alkohol, noční život a taxík',
    description: 'Hranice mezi službou a záchrannou misí. Kdy může řidič odmítnout jízdu a jak se chovat v noci.',
    url: 'https://www.taxinearme.cz/alkohol-nocny-zivot',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/alkohol.jpg',
      width: 1200,
      height: 630,
      alt: 'Alkohol, noční život a taxík'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Alkohol, noční život a taxík',
    description: 'Hranice mezi službou a záchrannou misí. Kdy může řidič odmítnout jízdu a jak se chovat v noci.',
    images: ['https://www.taxinearme.cz/blog-images/alkohol.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/alkohol-nocny-zivot',
    languages: {
      'cs': 'https://www.taxinearme.cz/alkohol-nocny-zivot',
      'x-default': 'https://www.taxinearme.cz/alkohol-nocny-zivot',
    },
  }
};

export default function AlkoholNocnyZivotPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Alkohol, noční život a taxík"
        description="Hranice mezi službou a záchrannou misí. Kdy může řidič odmítnout jízdu a jak se chovat v noci."
        url="https://www.taxinearme.cz/alkohol-nocny-zivot"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Alkohol a noční život' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <AlertCircle className="h-2.5 w-2.5 inline mr-1" />
              Bezpečnost
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Alkohol, noční život a taxík
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Hranice mezi službou a záchrannou misí. Kdy může řidič odmítnout jízdu a jak se chovat v noci.
          </p>

          <ShareButton
            title="Alkohol, noční život a taxík"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Když hodiny ukážou půlnoc a z klubů a barů se valí unavený a často podnapilý dav, taxikáři vstupují do své nejrizikovější pracovní směny.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Odvoz opilých zákazníků je součást práce, ale kde končí služba a začíná osobní riziko? Řidič taxi není sanitka ani psycholog. Přesto se často nachází v situacích, které vyžadují rozhodnutí: Vzít problémového zákazníka, nebo raději odmítnout?
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              Čísla, která mluví jasnou řečí
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Globální statistiky</h3>

              <p className="mb-3">
                Práce taxikáře patří mezi nejnebezpečnější povolání. V USA jsou řidiči taxi 30-60× více ohroženi násilím a vraždou než průměr pracujících.
              </p>

              <div className="grid md:grid-cols-2 gap-4 my-4">
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">82%</p>
                  <p className="text-sm">fatálních útoků se stává v noci</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">94%</p>
                  <p className="text-sm">útoků pochází zevnitř vozidla</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">80%</p>
                  <p className="text-sm">útoků přichází ze sedadla přímo za řidičem</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">66%</p>
                  <p className="text-sm">útočníků je mladších než 20 let</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Právní rámec: Kdy může řidič odmítnout jízdu?</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Český kontext</h3>
              <p>
                V Česku platí pro řidiče úplná nulová tolerance alkoholu (0,0% BAC), přičemž profesionální řidiči včetně taxikářů musí dodržovat tento limit.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Kdy je odmítnutí jízdy LEGITIMNÍ</h3>

            <div className="space-y-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">1. Bezpečnostní důvody</h4>
                <ul className="space-y-1">
                  <li>• Násilné chování</li>
                  <li>• Obscénní gesta</li>
                  <li>• Hlasné nadávky</li>
                  <li>• Vyhrožování</li>
                  <li>• Viditelná opilost s agresivním chováním</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">2. Neznámá destinace</h4>
                <p>Řidič má právo znát přesnou adresu cíle. Neurčité odpovědi jako "Někde v centru" nebo "Řeknu cestou" jsou důvodem k odmítnutí.</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">3. Platební schopnost</h4>
                <p>Řidič může požadovat zálohu nebo část sumy předem, pokud existuje podezření, že pasažér nebude schopen zaplatit.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Praktické scénáře: Kdy říct NE</h2>

            <div className="space-y-8 my-4">
              <div className="border-l-4 border-yellow-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Scénář 1: Viditelně opilý pasažér</h3>

                <p className="font-semibold mb-2">Signály:</p>
                <ul className="space-y-1 mb-3">
                  <li>• Nesrozumitelná řeč</li>
                  <li>• Nejistá chůze</li>
                  <li>• Hlasitost</li>
                  <li>• Agresivní chování</li>
                </ul>

                <p className="font-semibold mb-2">Správný postup:</p>
                <ol className="space-y-1">
                  <li>1. Komunikuj jasně a klidně</li>
                  <li>2. Upozorni, že není ve stavu bezpečné přepravy</li>
                  <li>3. Nabídni alternativu (počkat, zavolat někoho)</li>
                  <li>4. Pokud odmítne – odmítni jízdu</li>
                </ol>
              </div>

              <div className="border-l-4 border-orange-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Scénář 2: Skupina mladých opilých pasažérů</h3>

                <p className="bg-red-100 p-3 rounded mb-3">
                  <strong>Riziko:</strong> 80% útoků přichází ze sedadla přímo za řidičem.
                </p>

                <p className="font-semibold mb-2">Správný postup:</p>
                <ol className="space-y-1">
                  <li>1. Požádej pasažéry, aby neseděli přímo za tebou</li>
                  <li>2. Ideálně je posaď naproti, kde je vidíš</li>
                  <li>3. Měj připravené hygienické sáčky</li>
                  <li>4. Informuj dispečink o cíli a změně trasy</li>
                  <li>5. Při agresivním chování zastav a vypusť pasažéry</li>
                </ol>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Bezpečnostní tipy pro řidiče</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Před jízdou</h3>

              <p className="mb-3">
                <strong>Navázání očního kontaktu je klíčové.</strong> Ukaž pasažérovi: "Vidím tě, ty vidíš mě, dokážu tě identifikovat."
              </p>

              <p className="font-semibold mb-3">Kontrolní seznam:</p>
              <ul className="space-y-2">
                <li>✓ Navázání očního kontaktu</li>
                <li>✓ Posouzení stavu pasažéra (opilost, agresivita)</li>
                <li>✓ Potvrzení přesné adresy</li>
                <li>✓ Informování dispečinku</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr: Tvá bezpečnost má přednost</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Červená čára</p>
              <p className="text-lg">
                Tvá bezpečnost má VŽDY přednost před povinností péče.
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
            articleTitle="Často kladené otázky o nočním životě a taxi"
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
