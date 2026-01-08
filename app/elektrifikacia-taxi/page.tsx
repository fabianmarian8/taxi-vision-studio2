/** Migrované z: src/vite-pages/ElektrifikaciaPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, Zap, TrendingUp, Leaf, DollarSign , ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Elektrifikácia taxislužby na Slovensku | TaxiNearMe.sk',
  description: 'Budúcnosť taxi je elektrická. Analýza trendu a výhod elektromobilov v taxislužbách.',
  keywords: ['elektromobily taxi', 'budúcnosť taxi', 'zelená doprava', 'ekologické taxi', 'elektromobily slovensko', 'elektrické auto taxi'],
  openGraph: {
    title: 'Elektrifikácia taxislužby na Slovensku',
    description: 'Budúcnosť taxi je elektrická. Analýza trendu a výhod elektromobilov v taxislužbách.',
    url: 'https://www.taxinearme.sk/elektrifikacia-taxi',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/elektricke-auta.jpg',
      width: 1200,
      height: 630,
      alt: 'Elektrifikácia taxislužby na Slovensku'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Elektrifikácia taxislužby na Slovensku',
    description: 'Budúcnosť taxi je elektrická. Analýza trendu a výhod elektromobilov v taxislužbách.',
    images: ['https://www.taxinearme.sk/blog-images/elektricke-auta.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/elektrifikacia-taxi',
    languages: {
      'sk': 'https://www.taxinearme.sk/elektrifikacia-taxi',
      'x-default': 'https://www.taxinearme.sk/elektrifikacia-taxi',
    },
  }
};

export default function ElektrifikaciaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Elektrifikácia taxislužby na Slovensku"
        description="Budúcnosť taxi je elektrická. Analýza trendu a výhod elektromobilov v taxislužbách."
        url="https://www.taxinearme.sk/elektrifikacia-taxi"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Elektrifikácia taxi' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Zap className="h-2.5 w-2.5 inline mr-1" />
              Elektrifikácia
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Budúcnosť taxislužby na Slovensku: elektrické autá
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Budúcnosť taxi je elektrická. Analýza trendu a výhod elektromobilov v taxislužbách na Slovensku.
          </p>

          <ShareButton
            title="Budúcnosť taxislužby na Slovensku: elektrické autá, zdieľanie, autonómne vozidlá"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Taxislužby prechádzajú najväčšou transformáciou od zavedenia taxametra. Elektrifikácia, zdieľanie jázd a autonómne vozidlá menia nielen technológiu, ale celý koncept mestskej mobility.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Zap className="h-8 w-8 inline mr-2 text-primary" />
              Elektrifikácia: z výnimky na štandard
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Situácia na Slovensku</h3>

            <p>
              Elektrické taxíky už nie sú sci-fi ani na Slovensku. V Bratislave jazdí niekoľko Tesla vozidiel, v Martine funguje taxislužba s elektromobilmi.
            </p>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3">Nabíjacia infraštruktúra rastie</h4>
              <p className="mb-3">
                Podľa údajov z portálu MojElektromobil.sk sa na Slovensku k 31. decembru 2024 nachádza:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 mb-2">2 424</p>
                  <p className="text-sm">verejných nabíjacích bodov</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 mb-2">+34%</p>
                  <p className="text-sm">medziročný nárast</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Reálne čísla z Česka</h4>
              <p>
                <strong>Tesla Model 3</strong> používaná ako taxi dosiahla prevádzkové náklady <strong>6,93 Kč/km</strong> oproti <strong>12,6 Kč/km</strong> u Škody Superb 2.0 TSI so spaľovacím motorom.
              </p>
              <p className="mt-3 text-xl font-bold text-gray-900">
                To znamená takmer <span className="text-green-600">50% úsporu</span> prevádzkových nákladov.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Viedeň ako príklad blízkej budúcnosti</h3>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 my-4">
              <p className="font-semibold mb-3">Od januára 2025 platí vo Viedni radikálne pravidlo:</p>
              <p className="text-lg">
                <strong>Všetky nové taxíky musia byť elektrické.</strong>
              </p>
              <p className="mt-3">
                Rakúsko podporuje prechod dotáciami až <strong>10 000 €</strong> na vozidlo. Hybridné a elektrické vozidlá tvoria už <strong>70-75% flotíl</strong> veľkých taxislužieb.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Pre Slovensko je tento príklad relevantný – sme susedná krajina s podobnými podmienkami. Ak Viedeň dokáže prejsť na elektromobilitu v taxislužbách, slovenské mestá môžu nasledovať.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <DollarSign className="h-8 w-8 inline mr-2 text-primary" />
              Ekonomika elektrických taxíkov
            </h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3 text-green-700">✓ Výhody</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Nižšie náklady na „palivo" – elektrina je lacnejšia ako benzín/nafta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Minimálna údržba – žiadne výmeny oleja, menej opotrebovaných dielov</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Tichá prevádzka – vyšší komfort pre zákazníkov</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Nulové emisie v mestách – prístup do nízkoemisných zón</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3 text-red-700">⚠ Výzvy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Vyššia počiatočná investícia (Tesla Model 3 vs. Škoda Octavia)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Nutnosť nabíjacej infraštruktúry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Časové straty pri nabíjaní (hoci rýchlonabíjačky 400 kW sa šíria)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Nižší dojazd v zime</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <TrendingUp className="h-8 w-8 inline mr-2 text-primary" />
              Zdieľanie jázd: efektívnejšie využitie vozidiel
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Ride-hailing vs. klasické taxi</h3>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="mb-3">
                Európsky trh zdieľania jázd (ride-hailing) bol v roku 2024 hodnote <strong>32,1 mld. USD</strong> a očakáva sa rast o <strong>5,2% ročne</strong> do 2034.
              </p>
              <p>
                Uber a Bolt dominujú, no na Slovensku je situácia špecifická – silná pozícia lokálnych operátorov a aplikácie ako Hopin.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Carpooling – nedoceňovaný segment</h3>

            <p>
              BlaBlaCar v Európe dosahuje <strong>253 mil. €</strong> ročne na 80 miliónov rezervácií. Medzimestské zdieľanie jázd rastie o <strong>17,9% ročne</strong> – rýchlejšie ako mestské taxi.
            </p>

            <p className="bg-blue-50 p-4 rounded mt-4">
              Pre Slovensko s relatívne malými vzdialenosťami medzi mestami je to zaujímavý model.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">Autonómne vozidlá: revolúcia, ktorá prichádza</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Waymo – líder robotaxi</h3>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <p className="mb-3">
                Waymo (dcérska spoločnosť Alphabetu/Google) prevádzkuje v roku 2025 komerčné robotaxi služby v <strong>6 amerických mestách</strong>: Phoenix, San Francisco, Los Angeles, Austin, Atlanta a Silicon Valley.
              </p>

              <div className="grid md:grid-cols-2 gap-4 my-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 mb-2">200 000</p>
                  <p className="text-sm">platených jázd týždenne</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 mb-2">1 mil.</p>
                  <p className="text-sm">míľ mesačne</p>
                </div>
              </div>

              <h4 className="font-bold text-lg mb-3 mt-6">Kľúčové čísla bezpečnosti:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span><strong>84%</strong> menej zranení v porovnaní s ľudskými vodičmi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span><strong>73%</strong> menej nehôd vyžadujúcich airbag</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span>Žiadny smrteľný úraz za celú dobu prevádzky</span>
                </li>
              </ul>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Tesla a iní hráči</h3>

            <p>
              Tesla ohlásila <strong>Cybercab</strong> – robotaxi bez volantu a pedálov, ktoré má byť dostupné do roku 2027 za cenu pod <strong>30 000 USD</strong>. V júni 2025 spustila testovaciu službu v Austine.
            </p>

            <p className="bg-yellow-50 p-4 rounded my-4">
              Čínske firmy ako Baidu Apollo Go prevádzkujú <strong>400 robotaxi</strong> vo Wuhane s cenou iba <strong>4 CNY (0,55 USD)</strong> za základnú jazdu – oproti 18 CNY za klasické taxi.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Realita pre Slovensko</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Autonómne taxíky na Slovensku neprídu skôr ako za <strong>5-10 rokov</strong>. Dôvody:</p>
              <ul className="space-y-2">
                <li>• Potreba HD máp – Waymo a iní najprv mapujú každú ulicu</li>
                <li>• Legislatíva – Slovensko nemá zákony pre autonómnu dopravu</li>
                <li>• Infraštruktúra – potreba 5G sietí, komunikácie V2X</li>
                <li>• Investície – robotaxi vyžadujú stovky miliónov € na vývoj</li>
              </ul>
              <p className="mt-4 font-semibold">
                Ale trend je jasný: autonómne vozidlá budú súčasťou taxislužieb do roku 2035.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Leaf className="h-8 w-8 inline mr-2 text-green-600" />
              Dopad na komfort a environmentálny след
            </h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Komfort pre cestujúcich</h4>
                <ul className="space-y-2">
                  <li>✓ Tichá jazda – žiadne vibrácie motora</li>
                  <li>✓ Plynulé zrýchlenie</li>
                  <li>✓ Lepší interiér (Tesla, Ioniq 5)</li>
                  <li>✓ Klimatizácia bez spustenia motora</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Environmentálny dopad</h4>
                <ul className="space-y-2">
                  <li>✓ Tesla Model 3 ušetrí podľa odhadov 10 mil. libier CO2 pri 4 mil. elektrických míľ</li>
                  <li>✓ Žiadne emisie výfukových plynov v mestách</li>
                  <li>⚠ Výroba batérií má ekologický dopad</li>
                  <li>⚠ Dekarbonizácia elektrickej siete je kľúčová</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Slovenský kontext: čo môžeme čakať?</h2>

            <div className="space-y-8 my-4">
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Krátkodobá perspektíva (2025-2027)</h3>
                <ul className="space-y-2">
                  <li>• Rast elektrických taxíkov v Bratislave a väčších mestách</li>
                  <li>• Povinnosť registrácie SK vozidiel od 1.1.2025 – všetky taxíky musia mať slovenské ŠPZ</li>
                  <li>• Rozširovanie nabíjacej siete – plány na ultrarýchle nabíjačky pozdĺž D1</li>
                  <li>• Dominancia Uber/Bolt v ride-hailingu, lokálne appky ako Hopin</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Strednodobá perspektíva (2028-2032)</h3>
                <ul className="space-y-2">
                  <li>• Majoritný podiel elektromobilov v taxi flotilách veľkých miest</li>
                  <li>• Prvé pilotné projekty autonómnych vozidiel (možno v spolupráci s Viedňou)</li>
                  <li>• Carpool/rideshare medzi BA-ZA-KE-PP</li>
                  <li>• Prísnejšie emisné zóny – zvýhodnenie/nutnosť EV v centrách</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Dlhodobá perspektíva (2033+)</h3>
                <ul className="space-y-2">
                  <li>• Autonómne taxíky v Bratislave a možno Košiciach</li>
                  <li>• Zdieľané autonómne flotily – auto ako služba, nie majetok</li>
                  <li>• Integrovaná MaaS platforma (Mobility-as-a-Service) – jedno tiketo na všetky druhy dopravy</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">
                Budúcnosť taxislužieb je elektrická, zdieľaná a čiastočne autonómna.
              </p>

              <p className="mb-3">Pre slovenských prevádzkovateľov je teraz čas:</p>
              <ol className="space-y-2 pl-6">
                <li><strong>1.</strong> Investovať do elektromobilov – ekonomika funguje, infraštruktúra sa zlepšuje</li>
                <li><strong>2.</strong> Zvážiť digitálne kanály – mobilné aplikácie rozšíria zákaznícku základňu</li>
                <li><strong>3.</strong> Sledovať reguláciu – Viedeň už požaduje EV, Bratislava môže nasledovať</li>
              </ol>

              <p className="mt-6">
                Pre cestujúcich to znamená: tichšie, čistejšie a lacnejšie cesty.<br />
                Pre vodičov: nové výzvy, ale aj príležitosti.<br />
                Pre mestá: šancu zlepšiť kvalitu ovzdušia a znížiť hluk.
              </p>

              <p className="text-xl font-bold mt-6 text-center">
                Otázka nie je, či sa to stane. Otázka je, ako rýchlo sa Slovensko adaptuje.
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
            articleSlug="elektrifikacia-taxi"
            articleTitle="Často kladené otázky o elektromobilite v taxi"
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
