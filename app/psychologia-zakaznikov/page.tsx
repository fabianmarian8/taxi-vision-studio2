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
  title: 'Psychologie zákazníků v taxi | TaxiNearMe.cz',
  description: 'Jak rozumět chování zákazníků a zlepšit kvalitu služby.',
  keywords: ['psychologie zákazníků', 'chování pasažérů', 'typologie zákazníků', 'taxislužby', 'customer service taxi'],
  openGraph: {
    title: 'Psychologie zákazníků v taxi - typologie pasažérů',
    description: 'Od tichého profesionála po toxického pasažéra. Jak rozpoznat typy zákazníků a přizpůsobit jim svou komunikaci.',
    url: 'https://www.taxinearme.cz/psychologia-zakaznikov',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/psycholog.jpg',
      width: 1200,
      height: 630,
      alt: 'Psychologie zákazníků v taxi'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Psychologie zákazníků v taxi - typologie pasažérů',
    description: 'Od tichého profesionála po toxického pasažéra. Jak rozpoznat typy zákazníků a přizpůsobit jim svou komunikaci.',
    images: ['https://www.taxinearme.cz/blog-images/psycholog.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/psychologia-zakaznikov',
    languages: {
      'cs': 'https://www.taxinearme.cz/psychologia-zakaznikov',
      'x-default': 'https://www.taxinearme.cz/psychologia-zakaznikov',
    },
  }
};

export default function PsychologiaZakaznikovPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Psychologie zákazníků v taxi - typologie pasažérů"
        description="Od tichého profesionála po toxického pasažéra. Jak rozpoznat typy zákazníků a přizpůsobit jim svou komunikaci."
        url="https://www.taxinearme.cz/psychologia-zakaznikov"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Psychologie zákazníků' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Brain className="h-2.5 w-2.5 inline mr-1" />
              Psychologie
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Psychologie zákazníků v taxi: Typologie pasažérů
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Od tichého profesionála po toxického pasažéra. Jak rozpoznat typy zákazníků a přizpůsobit jim svou komunikaci.
          </p>

          <ShareButton
            title="Psychologie zákazníků v taxi - typologie pasažérů"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Každý den vozíte desítky různých lidí. Každý má jiná očekávání, nálady, komunikační styly a hranice. Pochopení psychologie zákazníků vám pomůže lépe reagovat, předcházet konfliktům a zlepšit hodnocení.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Taxi není jen o přepravě z bodu A do bodu B. Je to psychologická hra – čtení nálad, pochopení potřeb a přizpůsobení se různým typům osobností. Někteří chtějí ticho, jiní konverzaci. Někteří důvěřují GPS, jiní chtějí navigovat sami.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Users className="h-8 w-8 inline mr-2 text-primary" />
              Typologie zákazníků: 10 hlavních typů
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">1. Tichý profesionál</h3>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Nastoupí, řekne adresu, sedne si dozadu</li>
                <li>• Dívá se do mobilu, notebooku nebo z okna</li>
                <li>• Nulový small talk, nereaguje na konverzaci</li>
                <li>• Platí, řekne "děkuji", odejde</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Ticho, rychlost, profesionalitu. Nechce rozhovor ani hudbu.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Respektuj ticho. Neotevírej zbytečná témata. Jezdi plynule, efektivně. Toto je jeden z nejlehčích typů – nedělej nic navíc.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">2. Unavený</h3>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Viditelně vyčerpaný – z práce, z noční, z letiště</li>
                <li>• Sedne si, zavře oči nebo se opře o okno</li>
                <li>• Minimální komunikace</li>
                <li>• Možná usne</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Klid, hladkou jízdu, žádný ruch.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Vypni hudbu nebo ji pusť velmi potichu. Jezdi plynule, vyhýbej se prudkým zatáčkám a zastavováním. Když přijedeš na místo, oznam mu to jemně.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">3. Příjemný konverzátor</h3>

            <div className="bg-gray-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Nastoupí s úsměvem, pozdraví</li>
                <li>• Zeptá se "Jak se máte?", "Jak se dnes jezdí?"</li>
                <li>• Přirozený, lehký rozhovor</li>
                <li>• Necítíš se pod tlakem</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Příjemný, lidský rozhovor. Bez nátlaku, bez toxicity.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Toto je nejlepší scénář. Odpovídej přirozeně, klidně se zeptej "Jak vám běží den?" Vytvoř příjemnou atmosféru. Toto jsou zákazníci, kteří dávají 5★.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">4. Small talk mánie</h3>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Nastoupí a okamžitě začne mluvený vodopád</li>
                <li>• Povídání o počasí, politice, práci, rodině, sousedech, historii taxislužby</li>
                <li>• Nechce poslouchat – chce mluvit</li>
                <li>• Může trvat celou jízdu bez přestávky</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Posluchače. Potřebuje vypustit tlak, sdílet pocity.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Souhlas hlavou, občas "hm", "ano", "rozumím". Nemusíš odpovídat moc – stačí poslouchat. Vyhýbej se kontroverzním tématům. Toto je psychologická práce navíc, ale obvykle nechává dobrý tip.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">5. GPS odborník</h3>

            <div className="bg-orange-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Hned po nastoupení: "Jeďte přes..."</li>
                <li>• Má otevřený Google Maps, sleduje trasu</li>
                <li>• Pokud se odchýlíš: "Proč jedete touto?"</li>
                <li>• Často hlasná kontrola: "Tady doprava!" "Ne, rovně!"</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Kontrolu nad trasou. Potřebuje mít pocit, že ho "neokrádáš".</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Klid. Zeptej se na začátku: "Máte nějakou preferovanou trasu?" Pokud opravdu jede zbytečně delší cestou podle Google, vysvětli proč (zácpa, uzavírka). Vyhni se konfliktu – pokud trvá na trase, jeď podle něj.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">6. Kontrolorka</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Okamžitě kontroluje: klimatizaci, pás, cenu</li>
                <li>• Připomínky: "Můžete vypnout hudbu?" "Je tu horko."</li>
                <li>• Sleduje taxametr/cenu v aplikaci</li>
                <li>• Kritický pohled na všechno</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Dokonalost. Čistotu. Přesnost. Pocit kontroly.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Reaguj rychle na připomínky. Uklidňující komunikace: "Samozřejmě, přepnu klimatizaci." Nevnímej to osobně – to není o tobě, to je jejich osobnost.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">7. Opilý pasažér (zvládnutelný)</h3>

            <div className="bg-purple-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Viditelně pod vlivem alkoholu</li>
                <li>• Hlasný, ale přátelský</li>
                <li>• Může zapomenout adresu nebo ji neumí přesně zadat</li>
                <li>• Riziko zvracení</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Bezpečný odvoz domů. Možná trochu trpělivosti.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-blue-50 p-3 rounded">
                ✓ Před jízdou se ujisti, že zná přesnou adresu. Měj připravené hygienické sáčky. Otevři okno pro čerstvý vzduch. Pokud je příliš opilý nebo agresivní → ODMÍTNI jízdu (viz článek "Alkohol a noční život").
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">8. Toxický pasažér</h3>

            <div className="bg-red-100 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Agresivní tón hned od nástupu</li>
                <li>• Vyhrožování: "Když pojedete delší, dám vám 1★"</li>
                <li>• Ponižování: "Vy taxikáři..."</li>
                <li>• Neúcta k tvé práci</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Dominanci. Potřebuje se cítit nad tebou.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-red-50 p-3 rounded">
                ✓ Nereaguj emočně. Klid, profesionalita. Pokud překročí hranici (nadávky, vyhrožování) → ZASTAV a vypusť ho. Tvá bezpečnost &gt; jedna jízda. Nahlaš incident platformě.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">9. Rodina s dětmi</h3>

            <div className="bg-green-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Rodiče s malými dětmi</li>
                <li>• Chaos při nastupování (kočárek, tašky, sedačka)</li>
                <li>• Děti mohou plakat, křičet nebo se ptát</li>
                <li>• Rodiče jsou ve stresu</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekávají:</p>
              <p>Trpělivost, pochopení, pomoc.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-green-100 p-3 rounded">
                ✓ Pomož s batožinou. Jezdi opatrně a plynule. Nebuď naštvaný, že to trvá déle – rodiče to ocení. Výsledek: dobrý tip a 5★.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">10. Senior / Starší osoba</h3>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Charakteristika:</p>
              <ul className="space-y-1">
                <li>• Pomalejší nástup/výstup</li>
                <li>• Občas zmatený ohledně adresy nebo platby</li>
                <li>• Potřebuje více času a prostoru</li>
                <li>• Často chce povídat</li>
              </ul>

              <p className="font-semibold mb-3 mt-4">Co očekává:</p>
              <p>Respekt, trpělivost, pomoc.</p>

              <p className="font-semibold mb-3 mt-4">Jak se chovat:</p>
              <p className="bg-green-50 p-3 rounded">
                ✓ Počkej, než bezpečně nastoupí/vystoupí. Pomož s batožinou. Jasná, pomalá komunikace. Pokud mluví, poslouchej. Nezrychluj – bezpečnost je důležitější než minuta.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <MessageCircle className="h-8 w-8 inline mr-2 text-primary" />
              Psychologické triky pro lepší interakci
            </h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">1. Prvních 10 sekund rozhoduje</h3>

              <p className="mb-3">
                Zákazník tě hodnotí okamžitě – už když nastupuje. Oční kontakt, úsměv, pozdrav – to jsou signály profesionality.
              </p>

              <p className="font-semibold">Co udělat:</p>
              <ul className="space-y-1 mt-2">
                <li>✓ Oční kontakt přes zpětné zrcátko</li>
                <li>✓ Přátelský pozdrav: "Dobrý den"</li>
                <li>✓ Potvrď destinaci: "Jedeme na...?"</li>
              </ul>
            </div>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">2. Čti signály – kdy mluvit, kdy mlčet</h3>

              <p className="font-semibold mb-3">Signály pro TICHO:</p>
              <ul className="space-y-1 mb-3">
                <li>• Sluchátka v uších</li>
                <li>• Dívá se do mobilu celou dobu</li>
                <li>• Jednoslovné odpovědi: "Ano", "Ne"</li>
                <li>• Zavřené oči</li>
              </ul>

              <p className="font-semibold mb-3">Signály pro ROZHOVOR:</p>
              <ul className="space-y-1">
                <li>• Otevřený oční kontakt</li>
                <li>• Zeptá se na něco: "Jak se jezdí?", "Odkud jste?"</li>
                <li>• Uvolněná atmosféra</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">3. Vyhýbej se kontroverzím</h3>

              <p className="mb-3">Témata, která nikdy neotevírat první:</p>
              <ul className="space-y-2">
                <li>❌ Politika</li>
                <li>❌ Náboženství</li>
                <li>❌ Národnostní/rasová témata</li>
                <li>❌ Sexuální témata</li>
                <li>❌ Příliš osobní otázky</li>
              </ul>

              <p className="mt-4 bg-white p-3 rounded">
                <strong>Zlaté pravidlo:</strong> Nech rozhovor vést zákazník. Ty jen reaguj.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr: Taxi je psychologická profese</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Nejsi jen řidič. Jsi:</p>
              <ul className="space-y-2 text-lg">
                <li>✓ Psycholog (čteš lidi)</li>
                <li>✓ Mediátor (uklidňuješ konflikty)</li>
                <li>✓ Terapeut (posloucháš příběhy)</li>
                <li>✓ Profesionál (vytváříš bezpečný prostor)</li>
              </ul>
            </div>

            <p className="text-lg">
              Pochopení psychologie zákazníků ti pomůže nejen získat lepší hodnocení a tipy, ale i snížit stres a vyhnout se konfliktům. Každý pasažér je jiný – klíč je číst signály a přizpůsobit se.
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
            articleTitle="Často kladené otázky o psychologii zákazníků"
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
