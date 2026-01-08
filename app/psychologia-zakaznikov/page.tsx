/** Migrované z: src/vite-pages/PsychologiaZakaznikovPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, Brain, Users, MessageCircle , ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Psychológia zákazníkov v taxi | TaxiNearMe.sk',
  description: 'Ako rozumieť správaniu zákazníkov a zlepšiť kvalitu služby.',
  keywords: ['psychológia zákazníkov', 'správanie pasažierov', 'typológia zákazníkov', 'taxislužby', 'customer service taxi'],
  openGraph: {
    title: 'Psychológia zákazníkov v taxi - typológia pasažierov',
    description: 'Od tichého profesionála po toxického pasažiera. Ako rozpoznať typy zákazníkov a prispôsobiť im svoju komunikáciu.',
    url: 'https://www.taxinearme.sk/psychologia-zakaznikov',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/psycholog.jpg',
      width: 1200,
      height: 630,
      alt: 'Psychológia zákazníkov v taxi'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Psychológia zákazníkov v taxi - typológia pasažierov',
    description: 'Od tichého profesionála po toxického pasažiera. Ako rozpoznať typy zákazníkov a prispôsobiť im svoju komunikáciu.',
    images: ['https://www.taxinearme.sk/blog-images/psycholog.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/psychologia-zakaznikov',
    languages: {
      'sk': 'https://www.taxinearme.sk/psychologia-zakaznikov',
      'x-default': 'https://www.taxinearme.sk/psychologia-zakaznikov',
    },
  }
};

export default function PsychologiaZakaznikovPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Psychológia zákazníkov v taxi - typológia pasažierov"
        description="Od tichého profesionála po toxického pasažiera. Ako rozpoznať typy zákazníkov a prispôsobiť im svoju komunikáciu."
        url="https://www.taxinearme.sk/psychologia-zakaznikov"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Psychológia zákazníkov' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Brain className="h-2.5 w-2.5 inline mr-1" />
              Psychológia
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Psychológia zákazníkov v taxi: Typológia pasažierov
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Od tichého profesionála po toxického pasažiera. Ako rozpoznať typy zákazníkov a prispôsobiť im svoju komunikáciu.
          </p>

          <ShareButton
            title="Psychológia zákazníkov v taxi - typológia pasažierov"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Každý deň vozíte desiatky rôznych ľudí. Každý má iné očakávania, nálady, komunikačné štýly a hranice. Pochopenie psychológie zákazníkov vám pomôže lepšie reagovať, predchádzať konfliktom a zlepšiť hodnotenia.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Taxi nie je len o preprave z bodu A do bodu B. Je to psychologická hra – čítanie nálad, pochopenie potrieb a prispôsobenie sa rôznym typom osobností. Niektorí chcú ticho, iní konverzáciu. Niektorí dôverujú GPS, iní chcú navigovať sami.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Users className="h-8 w-8 inline mr-2 text-primary" />
              Typológia zákazníkov: 10 hlavných typov
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">1. Tichý profesionál</h3>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Nastúpi, povie adresu, sadne si dozadu</li>
                <li>• Pozerá do mobilu, notebooku alebo z okna</li>
                <li>• Nulový small talk, nereaguje na konverzáciu</li>
                <li>• Platí, povie "ďakujem", odíde</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Ticho, rýchlosť, profesionalitu. Nechce rozhovor ani hudbu.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Rešpektuj ticho. Neotváraj zbytočné témy. Jazdi plynulo, efektívne. Toto je jeden z najľahších typov – nerob nič navyše.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">2. Unavený</h3>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Viditeľne vyčerpaný – z práce, z nočnej, z letiska</li>
                <li>• Sadne si, zatvorí oči alebo sa oprá o okno</li>
                <li>• Minimálna komunikácia</li>
                <li>• Možno zaspí</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Pokoj, hladkú jazdu, žiadny ruch.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Vypni hudbu alebo pustíš ju veľmi potichu. Jazdi plynulo, vyhýbaj sa prudkým zákrutám a zastavovaniam. Keď prídeš na miesto, oznám mu to jemne.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">3. Príjemný konverzačník</h3>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Nastúpi s úsmevom, pozdraví</li>
                <li>• Spýta sa "Ako sa máte?", "Ako sa dnes jazdí?"</li>
                <li>• Prirodzený, ľahký rozhovor</li>
                <li>• Necítiš sa pod tlakom</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Príjemný, ľudský rozhovor. Bez nátlaku, bez toxicity.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Toto je naj scenár. Odpovedaj prirodzene, kľudne sa spýtaj "Ako vám beží deň?" Vytvor príjemnú atmosféru. Toto sú zákazníci, ktorí dávajú 5★.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">4. Small talk mania</h3>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Nastúpi a okamžite začne mluvený vodopád</li>
                <li>• Rozprávanie o počasí, politike, práci, rodine, susedoch, histórii taxislužby</li>
                <li>• Nechce počúvať – chce hovoriť</li>
                <li>• Môže trvať celú jazdu bez prestávky</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Poslucháča. Potrebuje vypustiť tlak, zdieľať pocity.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Súhlas hlavou, občas "hm", "áno", "rozumiem". Nemusíš odpovedať veľa – stačí počúvať. Vyhýbaj sa kontroverzným témam. Toto je psychologická práca navyš, ale zvyčajne necháva dobrý tip.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">5. GPS odborník</h3>

            <div className="bg-orange-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Hneď po nastúpení: "Choďte cez..."</li>
                <li>• Má otvorený Google Maps, sleduje trasu</li>
                <li>• Ak sa odchýliš: "Prečo idete touto?"</li>
                <li>• Často hlasná kontrola: "Tu doprava!" "Nie, rovno!"</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Kontrolu nad trasou. Potrebuje mať pocit, že ho "neokrádaš".</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Kľud. Spýtaj sa na začiatku: "Máte nejakú preferovanú trasu?" Ak naozaj ide zbytočne dlhšou cestou podľa Google, vysvetli prečo (zápcha, uzávierka). Vyhni sa konfliktu – ak trvá na trase, choď podľa neho.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">6. Kontrolórka</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Okamžite kontroluje: klimatizáciu, pás, cenu</li>
                <li>• Pripomienky: "Môžete vypnúť hudbu?" "Je tu horúco."</li>
                <li>• Sleduje taxameter/cenu v aplikácii</li>
                <li>• Kritický pohľad na všetko</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Dokonalosť. Čistotu. Presnosť. Pocit kontroly.</p>

              <p className="font-semibold mb-3 mt-4">Ako se správať:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Reaguj rýchlo na pripomienky. Upokojujúca komunikácia: "Samozrejme, prepnem klimatizáciu." Nevnímaj to osobne – to nie je o tebe, to je ich osobnosť.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">7. Opitý pasažier (zvládnuteľný)</h3>

            <div className="bg-purple-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Viditeľne pod vplyvom alkoholu</li>
                <li>• Hlasný, ale priateľský</li>
                <li>• Môže zabudnúť adresu alebo ju nevie presne zadať</li>
                <li>• Riziko zvracania</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Bezpečný odvoz domov. Možno trochu trpezlivosti.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Pred jazdou sa ubezpeč, že vie presnú adresu. Maj pripravené hygienické vrecká. Otvor okno pre čerstvý vzduch. Ak je príliš opitý alebo agresívny → ODMIETNI jazdu (vidieť článok "Alkohol a nočný život").
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">8. Toxický pasažier</h3>

            <div className="bg-red-100 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Agresívny tón hneď od nástupu</li>
                <li>• Vyhrážky: "Keď pôjdete dlhšou, dám vám 1★"</li>
                <li>• Ponižovanie: "Vy taxikári..."</li>
                <li>• Neúcta k tvojej práci</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Dominanciu. Potrebuje sa cítiť nad tebou.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-red-50 p-3 rounded">
                ✓ Nereaguj emočne. Kľud, profesionalita. Ak prekročí hranicu (nadávky, vyhrážky) → ZASTAV a vypusť ho. Tvoja bezpečnosť &gt; jedna jazda. Nahláš incident platforme.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">9. Rodina s deťmi</h3>

            <div className="bg-green-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Rodičia s malými deťmi</li>
                <li>• Chaos pri nastupovaní (kočík, tašky, sedačka)</li>
                <li>• Deti môžu plakať, kričať alebo sa pýtať</li>
                <li>• Rodičia sú stresovaní</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakávajú:</p>
              <p>Trpezlivosť, pochopenie, pomoc.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-green-100 p-3 rounded">
                ✓ Pomôž s batožinou. Jazdi opatrne a plynulo. Nebuď nahnevaný, že to trvá dlhšie – rodičia to oceňujú. Výsledok: dobrý tip a 5★.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">10. Senior / Staršia osoba</h3>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Pomalší nástup/výstup</li>
                <li>• Občas zmätený ohľadom adresy alebo platby</li>
                <li>• Potrebuje viac času a priestoru</li>
                <li>• Často chce rozprávať</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Čo očakáva:</p>
              <p>Rešpekt, trpezlivosť, pomoc.</p>

              <p className="font-semibold mb-3 mt-4">Ako sa správať:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Počkaj, kým bezpečne nastúpi/vystúpi. Pomôž s batožinou. Jasná, pomalá komunikácia. Ak hovorí, počúvaj. Nezrýchľuj – bezpečnosť je dôležitejšia než minúta.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <MessageCircle className="h-8 w-8 inline mr-2 text-primary" />
              Psychologické triky pre lepšiu interakciu
            </h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">1. Prvých 10 sekúnd rozhoduje</h3>

              <p className="mb-3">
                Zákazník ťa hodnotí okamžite – už keď nastupuje. Očný kontakt, úsmev, pozdrav – to sú signály profesionality.
              </p>

              <p className="font-semibold">Čo urobiť:</p>
              <ul className="space-y-1 mt-2">
                <li>✓ Očný kontakt cez spätné zrkadlo</li>
                <li>✓ Priateľský pozdrav: "Dobrý deň"</li>
                <li>✓ Potvrď destináciu: "Ideme na...?"</li>
              </ul>
            </div>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">2. Čítaj signály – kedy hovoriť, kedy mlčať</h3>

              <p className="font-semibold mb-3">Signály pre TICHO:</p>
              <ul className="space-y-1 mb-3">
                <li>• Slúchadlá v ušiach</li>
                <li>• Pozerá do mobilu celý čas</li>
                <li>• Jednostručné odpovede: "Áno", "Nie"</li>
                <li>• Zatvorené oči</li>
              </ul>

              <p className="font-semibold mb-3">Signály pre ROZHOVOR:</p>
              <ul className="space-y-1">
                <li>• Otvorený očný kontakt</li>
                <li>• Spýta sa niečo: "Ako sa jazdí?", "Odkiaľ ste?"</li>
                <li>• Uvoľnená atmosféra</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">3. Vyhýbaj sa kontroverziám</h3>

              <p className="mb-3">Témy, ktoré nikdy neotvárať prvý:</p>
              <ul className="space-y-2">
                <li>❌ Politika</li>
                <li>❌ Náboženstvo</li>
                <li>❌ Národnostné/rasové témy</li>
                <li>❌ Sexuálne témy</li>
                <li>❌ Príliš osobné otázky</li>
              </ul>

              <p className="mt-4 bg-white p-3 rounded">
                <strong>Zlaté pravidlo:</strong> Nech rozhovor vedie zákazník. Ty len reaguj.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver: Taxi je psychologická profesia</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Nie si len vodič. Si:</p>
              <ul className="space-y-2 text-lg">
                <li>✓ Psychológ (čítaš ľudí)</li>
                <li>✓ Mediátor (upokojuješ konflikty)</li>
                <li>✓ Terapeut (počúvaš príbehy)</li>
                <li>✓ Profesionál (vytváraš bezpečný priestor)</li>
              </ul>
            </div>

            <p className="text-lg">
              Pochopenie psychológie zákazníkov ti pomôže nielen získať lepšie hodnotenia a tipy, ale aj znížiť stres a vyhnúť sa konfliktom. Každý pasažier je iný – kľúč je čítať signály a prispôsobiť sa.
            </p>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>
          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="psychologia-zakaznikov"
            articleTitle="Často kladené otázky o psychológii zákazníkov"
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
