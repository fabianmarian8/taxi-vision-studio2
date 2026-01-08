/** Migrované z: src/vite-pages/KomunikaciaPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Komunikace mezi taxikářem a zákazníkem | TaxiNearMe.cz',
  description: 'Jasná pravidla, slušnost a hranice, které by měly znát obě strany.',
  keywords: ['komunikace taxi', 'chování v taxi', 'taxikář zákazník', 'slušnost', 'taxislužby', 'pravidla taxi'],
  openGraph: {
    title: 'Jak vypadá dobrá komunikace mezi taxikářem a zákazníkem',
    description: 'Jasná pravidla, slušnost a hranice, které by měly znát obě strany.',
    url: 'https://www.taxinearme.cz/komunikacia-taxikar-zakaznik',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/komunikacia.jpg',
      width: 1200,
      height: 630,
      alt: 'Komunikace mezi taxikářem a zákazníkem'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Komunikace mezi taxikářem a zákazníkem',
    description: 'Jasná pravidla, slušnost a hranice, které by měly znát obě strany.',
    images: ['https://www.taxinearme.cz/blog-images/komunikacia.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/komunikacia-taxikar-zakaznik',
    languages: {
      'cs': 'https://www.taxinearme.cz/komunikacia-taxikar-zakaznik',
      'x-default': 'https://www.taxinearme.cz/komunikacia-taxikar-zakaznik',
    },
  }
};

export default function KomunikaciaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Jak vypadá dobrá komunikace mezi taxikářem a zákazníkem"
        description="Jasná pravidla, slušnost a hranice, které by měly znát obě strany."
        url="https://www.taxinearme.cz/komunikacia-taxikar-zakaznik"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Komunikace v taxi' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <MessageCircle className="h-2.5 w-2.5 inline mr-1" />
              Komunikace
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Jak vypadá dobrá komunikace mezi taxikářem a zákazníkem (a jak vypadá peklo)
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Jasná pravidla, slušnost a hranice, které by měly znát obě strany.
          </p>

          <ShareButton
            title="Komunikace mezi taxikářem a zákazníkem"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900 mb-0">
                Taxi je víc než jen doprava z bodu A do B – je to krátký společný prostor dvou cizích lidí. Může to být příjemná zkušenost nebo peklo, záleží na obou.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Dobrá komunikace mezi řidičem a zákazníkem může proměnit obyčejnou jízdu na profesionální zážitek, zatímco špatná komunikace dokáže spojit 10minutovou cestu na nekonečnou torturu. V tomto článku rozebereme zlatá pravidla, červené vlajky a právní rámec, který by měl znát každý, kdo nasedne do taxíku – ať už za volant, nebo na zadní sedadlo.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">Zlatá pravidla dobré komunikace</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Co funguje: 5 pilířů úspěšné jízdy</h3>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                1. Jasné zadání od začátku
              </h4>

              <p className="mb-3">
                <strong>Zákazník:</strong> Hned po nastoupení jasně řekni cíl. Pokud máš preferovanou trasu, zmiň to ihned, ne po 5 minutách jízdy. Podle britského etiketu institutu Debrett's by měl být cíl oznámen ještě před nastoupením do vozidla.
              </p>

              <p className="mb-0">
                <strong>Taxikář:</strong> Profesionální řidiči umí odhadnout náladu zákazníka do pár sekund – někdo chce rozhovor, někdo ticho. Čti řeč těla. Sluchátka = nech ho na pokoji.
              </p>
            </div>

            <div className="bg-purple-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                2. Respekt vůči prostoru druhého
              </h4>

              <p className="mb-3">
                Kvalitní taxislužby trénují řidiče rozpoznávat signály – pokud pasažér je zahleděný do telefonu nebo se dívá z okna, je to jasný odkaz pro ticho.
              </p>

              <p className="mb-0">
                <strong>Zákazník:</strong> Pokud nechceš rozhovor, stačí zdvořilá, ale krátká odpověď. Příklad: "Měl jsem dobrý večer, děkuji" vs. "Měl jsem výborný večer, byli jsme v nové čínské restauraci..." – první ukončuje, druhé zve k další konverzaci.
              </p>
            </div>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
                3. Profesionalita = peníze
              </h4>

              <p className="mb-3">
                Řidič z Česka pracující pro Bolt to vyjadřuje jasně: "Člověk, který pracuje pro lidi, si musí uvědomit, že jeho chování závisí na tom, zda dostane spropitné, dobré hodnocení a zda bude mít i nadále zákazníky".
              </p>

              <p className="mb-0">
                <strong>Taxikář:</strong> Tvůj plat závisí na hodnocení. Nebuď ten typ, co tlačí politiku, náboženství nebo si stěžuje 15 minut na život. Zkušení řidiči staví na tom, že umí rychle přečíst pasažéra a přizpůsobit se.
              </p>
            </div>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-red-600" />
                4. Bezpečnost na prvním místě
              </h4>

              <p className="mb-0">
                <strong>Oba:</strong> Profesionální řidič musí nastavit bezpečnost jako prioritu – dodržování rychlostních limitů, defenzivní jízda, žádné telefonáty během řízení. Zákazník nemá právo požadovat nezákonné manévry ani při "urgentní situaci".
              </p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                5. Transparentnost a férová hra
              </h4>

              <p className="mb-0">
                Cena by měla být jasná předem. Při taxametrových jízdách informuj o alternativních trasách a jejich dopadech – "Dálnice je rychlejší, ale je tam mýto, souhlasíte?"
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Červené vlajky: Kdy to jde do pekla
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Neakceptovatelné chování ZÁKAZNÍKA</h3>

            <div className="bg-red-100 border-l-4 border-red-600 p-6 mb-3">
              <h4 className="text-lg font-bold mb-3">Tvrdá hranice (řidič má právo ukončit jízdu):</h4>

              <p className="mb-3">Podle českého zákona o silniční dopravě může řidič odmítnout přepravu nebo ji ukončit, pokud:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Zákazník je agresivní nebo ozbrojený, nebo jeho chování vzbuzuje obavy o zdraví řidiče či bezpečnost přepravy</li>
                <li>Vzhledem ke stavu cestujícího hrozí znečištění vozidla nebo obtěžování řidiče během jízdy</li>
                <li>Zákazník navzdory upozornění kouří, konzumuje jídlo a nápoje nebo manipuluje s věcmi, které mohou omezit výhled řidiče</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg my-4">
              <h4 className="text-lg font-bold mb-3">Reálné problémy z praxe:</h4>

              <p className="mb-3">
                Opilí zákazníci, zejména v pátek a sobotu mezi půlnocí a 4:00 ráno, jsou nejčastějším zdrojem konfliktů. Australská studie ukázala, že více než polovina taxikářů identifikovala hospody a noční kluby jako hlavní zdroj agresivních pasažérů, s konzumací alkoholu jako hlavním faktorem.
              </p>

              <p className="mb-0 font-semibold">
                <strong>Co dělat při napjaté situaci:</strong><br />
                Řidič: Zůstat v klidu, vyhnout se hádce, pokud je to nutné, zastavit na bezpečném místě a požádat zákazníka o opuštění vozidla. V krajním případě volat policii.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Neakceptovatelné chování ŘIDIČE</h3>

            <div className="bg-red-100 border-l-4 border-red-600 p-6 mb-3">
              <h4 className="text-lg font-bold mb-3">Okamžité důvody ke stížnosti:</h4>

              <ul className="list-disc pl-6 space-y-2">
                <li>Neustálé telefonáty během jízdy, ignorování požadavků na tišší prostředí</li>
                <li>Nebezpečná jízda – překračování rychlosti, náhlé brzdění, agresivní akcelerace</li>
                <li>Úmyslně delší trasa na nafouknutí ceny</li>
                <li>Vnucování názorů na politiku, osobní problémy, obtěžující komentáře</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="text-lg font-bold mb-3">Varovné signály podle expertů:</h4>

              <p className="mb-0">
                Bezpečnostní studie pro taxikáře upozorňuje: 80% útoků přichází ze sedadla přímo za řidičem. Profesionální řidič si všímá rizikového chování a udržuje vizuální kontakt přes zpětné zrcátko – pokud tvůj řidič nevidí dozadu nebo se nechová opatrně, je to problém.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Český právní rámec: Co musíš vědět</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Práva a povinnosti v Česku</h3>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-green-800">Řidič má povinnost:</h4>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Přepravit cestující po nejkratší trase, pokud si zákazník nepřeje jinou</li>
                  <li>Mít ve vozidle kompletní tarifní podmínky a přepravní řád a umožnit zákazníkovi nahlédnout do nich</li>
                  <li>Vydat na požádání potvrzení o provedené přepravě obsahující datum, trasu a částku</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-blue-800">Řidič má právo odmítnout:</h4>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Přepravu bez jasně stanoveného cíle</li>
                  <li>Zákazníka s nadměrným zavazadlem, které se nevejde</li>
                  <li>Zvířata, která vzhledem k velikosti, početnosti nebo chování není možné bezpečně přepravit</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg my-4">
              <h4 className="text-lg font-bold mb-3">Zákazník má právo:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vědět cenu předem (při aplikacích je cena dohodnuta předem)</li>
                <li>Požadovat jízdu po nejkratší trase, jiná trasa pouze se souhlasem zákazníka</li>
                <li>Bezpečnou přepravu bez obav o zdraví</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 italic my-4">
              Právní základ: Zákon č. 111/1994 Sb. o silniční dopravě
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">Jak zvládnout konflikt</h2>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pro řidiče:</h3>

              <p className="mb-3">
                Aktivní naslouchání a empatie jsou klíčem. Použijte fráze jako <strong>"Rozumím vaší frustraci"</strong> na uznání emocí pasažéra. Pokud je cestující agresivní, zůstat profesionální, připomenout pravidla (např. "zákaz kouření") a vysvětlit, že vás operátor vede toto chování netolerovat.
              </p>

              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold mb-2">Osvědčený postup:</p>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Zachovej klid a profesionální tón</li>
                  <li>Uznej emoce zákazníka ("Chápu, že jste naštvaný")</li>
                  <li>Jasně vymez pravidla a hranice</li>
                  <li>Pokud situace eskaluje - bezpečně zastav a požádej o opuštění vozidla</li>
                  <li>Zdokumentuj incident a nahlaš platformě/operátorovi</li>
                </ol>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pro zákazníky:</h3>

              <p className="mb-3">
                Pokud řidič začne rozhovor na téma, se kterým nesouhlasíš, použij potlačující frázi: <strong>"Obávám se, že s vámi tam nesouhlasím, tak to téma raději nechme"</strong>. Potom se soustřeď na telefon.
              </p>

              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold mb-2">Jak elegantně ukončit nechtěný rozhovor:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>"Promiňte, ale musím dokončit něco pracovního" + soustřeď se na telefon</li>
                  <li>"Měl jsem dlouhý den, potřebuji chvíli ticha, doufám že rozumíte"</li>
                  <li>Krátké, uzavřené odpovědi bez navazování na téma</li>
                  <li>Pokud řidič pokračuje navzdory signálům - po jízdě nízké hodnocení s komentářem</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr: Základní rovnice</h2>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-xl my-4">
              <div className="space-y-4">
                <p className="text-lg">
                  <strong className="text-primary">Taxikář:</strong> Tvé chování = tvé hodnocení = tvůj příjem. Zkušení řidiči staví na tom, že umí rychle přečíst pasažéra a přizpůsobit se.
                </p>

                <p className="text-lg">
                  <strong className="text-primary">Zákazník:</strong> Slušnost nestojí nic, ale získáš s ní lepší servis. Agresivita tě nechá stát na ulici.
                </p>

                <p className="text-lg">
                  <strong className="text-primary">Oba:</strong> Taxi je víc než jen doprava z bodu A do B – je to krátký společný prostor dvou cizích lidí. Může to být příjemná zkušenost nebo peklo, záleží na obou.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg my-4 border-l-4 border-gray-400">
              <p className="text-lg font-semibold mb-2">
                Hranice jsou jednoduché: vzájemný respekt, bezpečnost a transparentnost.
              </p>
              <p className="mb-0 text-gray-700">
                Všechno ostatní se dá vyřešit.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Zdroje a fakta</h3>

              <p className="text-sm text-gray-700 mb-3">Tento článek čerpal z:</p>

              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <p className="font-semibold mb-1">Mezinárodní studie:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Taxi-Point UK (2024) – studie o komunikačních dovednostech taxikářů</li>
                    <li>Debrett's Taxi Etiquette (2024) – britské standardy chování</li>
                    <li>Journal of Current Psychology (2023) – systematické přezkoumání agrese pasažérů v dopravě</li>
                    <li>Australský institut kriminologie (1988) – agresivní chování v taxislužbách</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">České zdroje:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Zákon č. 111/1994 Sb. o silniční dopravě</li>
                    <li>Ministerstvo dopravy ČR – taxislužby</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">Praktické příručky:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>UK Taxi Insurer – bezpečnostní a komunikační protokoly</li>
                    <li>Zoom Taxi – profesionalita a zákaznický servis</li>
                    <li>001 Taxis – etiketa řidičů a hranice</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>
          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="komunikacia-taxikar-zakaznik"
            articleTitle="Často kladené otázky o komunikaci"
          />

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">Chcete vidět komplexní průvodce?</h3>
            <p className="text-center text-gray-700 mb-3">
              Zjistěte více o všech aspektech taxislužeb v Česku
            </p>
            <div className="flex justify-center">
              <Link href="/komplexny-sprievodca-taxi">
                <Button size="lg">Zobrazit průvodce</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
