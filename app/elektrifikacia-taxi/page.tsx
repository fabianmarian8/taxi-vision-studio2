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
  title: 'Elektrifikace taxislužby v Česku | TaxiNearMe.cz',
  description: 'Budoucnost taxi je elektrická. Analýza trendu a výhod elektromobilů v taxislužbách.',
  keywords: ['elektromobily taxi', 'budoucnost taxi', 'zelená doprava', 'ekologické taxi', 'elektromobily česko', 'elektrické auto taxi'],
  openGraph: {
    title: 'Elektrifikace taxislužby v Česku',
    description: 'Budoucnost taxi je elektrická. Analýza trendu a výhod elektromobilů v taxislužbách.',
    url: 'https://www.taxinearme.cz/elektrifikacia-taxi',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/elektricke-auta.jpg',
      width: 1200,
      height: 630,
      alt: 'Elektrifikace taxislužby v Česku'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Elektrifikace taxislužby v Česku',
    description: 'Budoucnost taxi je elektrická. Analýza trendu a výhod elektromobilů v taxislužbách.',
    images: ['https://www.taxinearme.cz/blog-images/elektricke-auta.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/elektrifikacia-taxi',
    languages: {
      'cs': 'https://www.taxinearme.cz/elektrifikacia-taxi',
      'x-default': 'https://www.taxinearme.cz/elektrifikacia-taxi',
    },
  }
};

export default function ElektrifikaciaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Elektrifikace taxislužby v Česku"
        description="Budoucnost taxi je elektrická. Analýza trendu a výhod elektromobilů v taxislužbách."
        url="https://www.taxinearme.cz/elektrifikacia-taxi"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Elektrifikace taxi' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Zap className="h-2.5 w-2.5 inline mr-1" />
              Elektrifikace
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Budoucnost taxislužby v Česku: elektrická auta
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Budoucnost taxi je elektrická. Analýza trendu a výhod elektromobilů v taxislužbách v Česku.
          </p>

          <ShareButton
            title="Budoucnost taxislužby v Česku: elektrická auta, sdílení, autonomní vozidla"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Taxislužby procházejí největší transformací od zavedení taxametru. Elektrifikace, sdílení jízd a autonomní vozidla mění nejen technologii, ale celý koncept městské mobility.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Zap className="h-8 w-8 inline mr-2 text-primary" />
              Elektrifikace: z výjimky na standard
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Situace v Česku</h3>

            <p>
              Elektrické taxíky už nejsou sci-fi ani v Česku. V Praze jezdí několik Tesla vozidel, v Brně funguje taxislužba s elektromobily.
            </p>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3">Nabíjecí infrastruktura roste</h4>
              <p className="mb-3">
                V České republice se rychle rozšiřuje síť nabíjecích stanic:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 mb-2">3 000+</p>
                  <p className="text-sm">veřejných nabíjecích bodů</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 mb-2">+40%</p>
                  <p className="text-sm">meziroční nárůst</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="font-bold text-lg mb-3">Reálná čísla z provozu</h4>
              <p>
                <strong>Tesla Model 3</strong> používaná jako taxi dosáhla provozních nákladů <strong>6,93 Kč/km</strong> oproti <strong>12,6 Kč/km</strong> u Škody Superb 2.0 TSI se spalovacím motorem.
              </p>
              <p className="mt-3 text-xl font-bold text-gray-900">
                To znamená téměř <span className="text-green-600">50% úsporu</span> provozních nákladů.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Vídeň jako příklad blízké budoucnosti</h3>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 my-4">
              <p className="font-semibold mb-3">Od ledna 2025 platí ve Vídni radikální pravidlo:</p>
              <p className="text-lg">
                <strong>Všechny nové taxíky musí být elektrické.</strong>
              </p>
              <p className="mt-3">
                Rakousko podporuje přechod dotacemi až <strong>10 000 €</strong> na vozidlo. Hybridní a elektrická vozidla tvoří již <strong>70-75% flotil</strong> velkých taxislužeb.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Pro Česko je tento příklad relevantní – jsme sousední země s podobnými podmínkami. Pokud Vídeň dokáže přejít na elektromobilitu v taxislužbách, česká města mohou následovat.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <DollarSign className="h-8 w-8 inline mr-2 text-primary" />
              Ekonomika elektrických taxíků
            </h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3 text-green-700">Výhody</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Nižší náklady na "palivo" – elektřina je levnější než benzín/nafta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Minimální údržba – žádné výměny oleje, méně opotřebovaných dílů</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Tichý provoz – vyšší komfort pro zákazníky</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Nulové emise ve městech – přístup do nízkoemisních zón</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3 text-red-700">Výzvy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Vyšší počáteční investice (Tesla Model 3 vs. Škoda Octavia)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Nutnost nabíjecí infrastruktury</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Časové ztráty při nabíjení (ačkoli rychlonabíječky 400 kW se šíří)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Nižší dojezd v zimě</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <TrendingUp className="h-8 w-8 inline mr-2 text-primary" />
              Sdílení jízd: efektivnější využití vozidel
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Ride-hailing vs. klasické taxi</h3>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="mb-3">
                Evropský trh sdílení jízd (ride-hailing) byl v roce 2024 v hodnotě <strong>32,1 mld. USD</strong> a očekává se růst o <strong>5,2% ročně</strong> do 2034.
              </p>
              <p>
                Uber a Bolt dominují, v Česku je situace specifická – silná pozice lokálních operátorů a aplikací jako Liftago.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Carpooling – nedoceňovaný segment</h3>

            <p>
              BlaBlaCar v Evropě dosahuje <strong>253 mil. €</strong> ročně na 80 milionů rezervací. Meziměstské sdílení jízd roste o <strong>17,9% ročně</strong> – rychleji než městské taxi.
            </p>

            <p className="bg-blue-50 p-4 rounded mt-4">
              Pro Česko s relativně malými vzdálenostmi mezi městy je to zajímavý model.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">Autonomní vozidla: revoluce, která přichází</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Waymo – lídr robotaxi</h3>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <p className="mb-3">
                Waymo (dceřiná společnost Alphabetu/Google) provozuje v roce 2025 komerční robotaxi služby v <strong>6 amerických městech</strong>: Phoenix, San Francisco, Los Angeles, Austin, Atlanta a Silicon Valley.
              </p>

              <div className="grid md:grid-cols-2 gap-4 my-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 mb-2">200 000</p>
                  <p className="text-sm">placených jízd týdně</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 mb-2">1 mil.</p>
                  <p className="text-sm">mil měsíčně</p>
                </div>
              </div>

              <h4 className="font-bold text-lg mb-3 mt-6">Klíčová čísla bezpečnosti:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span><strong>84%</strong> méně zranění ve srovnání s lidskými řidiči</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span><strong>73%</strong> méně nehod vyžadujících airbag</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span>Žádný smrtelný úraz za celou dobu provozu</span>
                </li>
              </ul>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Tesla a další hráči</h3>

            <p>
              Tesla ohlásila <strong>Cybercab</strong> – robotaxi bez volantu a pedálů, které má být dostupné do roku 2027 za cenu pod <strong>30 000 USD</strong>. V červnu 2025 spustila testovací službu v Austinu.
            </p>

            <p className="bg-yellow-50 p-4 rounded my-4">
              Čínské firmy jako Baidu Apollo Go provozují <strong>400 robotaxi</strong> ve Wuhanu s cenou pouze <strong>4 CNY (0,55 USD)</strong> za základní jízdu – oproti 18 CNY za klasické taxi.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Realita pro Česko</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Autonomní taxíky v Česku nepřijdou dříve než za <strong>5-10 let</strong>. Důvody:</p>
              <ul className="space-y-2">
                <li>• Potřeba HD map – Waymo a další nejprve mapují každou ulici</li>
                <li>• Legislativa – Česko nemá zákony pro autonomní dopravu</li>
                <li>• Infrastruktura – potřeba 5G sítí, komunikace V2X</li>
                <li>• Investice – robotaxi vyžadují stovky milionů € na vývoj</li>
              </ul>
              <p className="mt-4 font-semibold">
                Ale trend je jasný: autonomní vozidla budou součástí taxislužeb do roku 2035.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Leaf className="h-8 w-8 inline mr-2 text-green-600" />
              Dopad na komfort a environmentální stopu
            </h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Komfort pro cestující</h4>
                <ul className="space-y-2">
                  <li>✓ Tichá jízda – žádné vibrace motoru</li>
                  <li>✓ Plynulé zrychlení</li>
                  <li>✓ Lepší interiér (Tesla, Ioniq 5)</li>
                  <li>✓ Klimatizace bez spuštění motoru</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Environmentální dopad</h4>
                <ul className="space-y-2">
                  <li>✓ Tesla Model 3 ušetří podle odhadů 10 mil. liber CO2 při 4 mil. elektrických mil</li>
                  <li>✓ Žádné emise výfukových plynů ve městech</li>
                  <li>⚠ Výroba baterií má ekologický dopad</li>
                  <li>⚠ Dekarbonizace elektrické sítě je klíčová</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Český kontext: co můžeme čekat?</h2>

            <div className="space-y-8 my-4">
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Krátkodobá perspektiva (2025-2027)</h3>
                <ul className="space-y-2">
                  <li>• Růst elektrických taxíků v Praze a větších městech</li>
                  <li>• Rozšiřování nabíjecí sítě – plány na ultrarychlé nabíječky podél D1</li>
                  <li>• Dominance Uber/Bolt v ride-hailingu, lokální appky jako Liftago</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Střednědobá perspektiva (2028-2032)</h3>
                <ul className="space-y-2">
                  <li>• Majoritní podíl elektromobilů v taxi flotilách velkých měst</li>
                  <li>• První pilotní projekty autonomních vozidel (možná ve spolupráci s Vídní)</li>
                  <li>• Carpool/rideshare mezi Praha-Brno-Ostrava-Plzeň</li>
                  <li>• Přísnější emisní zóny – zvýhodnění/nutnost EV v centrech</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-400 pl-6">
                <h3 className="text-xl font-bold mb-3">Dlouhodobá perspektiva (2033+)</h3>
                <ul className="space-y-2">
                  <li>• Autonomní taxíky v Praze a možná Brně</li>
                  <li>• Sdílené autonomní flotily – auto jako služba, ne majetek</li>
                  <li>• Integrovaná MaaS platforma (Mobility-as-a-Service) – jeden lístek na všechny druhy dopravy</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">
                Budoucnost taxislužeb je elektrická, sdílená a částečně autonomní.
              </p>

              <p className="mb-3">Pro české provozovatele je nyní čas:</p>
              <ol className="space-y-2 pl-6">
                <li><strong>1.</strong> Investovat do elektromobilů – ekonomika funguje, infrastruktura se zlepšuje</li>
                <li><strong>2.</strong> Zvážit digitální kanály – mobilní aplikace rozšíří zákaznickou základnu</li>
                <li><strong>3.</strong> Sledovat regulaci – Vídeň již požaduje EV, Praha může následovat</li>
              </ol>

              <p className="mt-6">
                Pro cestující to znamená: tišší, čistší a levnější cesty.<br />
                Pro řidiče: nové výzvy, ale i příležitosti.<br />
                Pro města: šanci zlepšit kvalitu ovzduší a snížit hluk.
              </p>

              <p className="text-xl font-bold mt-6 text-center">
                Otázka není, zda se to stane. Otázka je, jak rychle se Česko adaptuje.
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
            articleTitle="Často kladené otázky o elektromobilitě v taxi"
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
