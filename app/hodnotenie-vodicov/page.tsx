/**
 * Blog Article: Hodnocení řidičů
 *
 * Migrováno z: src/vite-pages/HodnotenieVodicovPage.tsx
 *
 * Změny oproti Vite verzi:
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
  title: 'Jak funguje hodnocení řidičů v taxi aplikacích | Taxi NearMe',
  description:
    'Proč můžeš jedním klikem zničit někomu práci. 4★ není dobré hodnocení - je to penalizace.',
  keywords: [
    'hodnocení řidičů',
    'taxi aplikace',
    'uber rating',
    'bolt hodnocení',
    'taxislužby',
    'recenze taxi',
  ],
  openGraph: {
    title: 'Jak funguje hodnocení řidičů v taxi aplikacích',
    description:
      'Proč můžeš jedním klikem zničit někomu práci. 4★ není dobré hodnocení - je to penalizace.',
    type: 'article',
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15',
    locale: 'cs_CZ',
    url: 'https://www.taxinearme.cz/hodnotenie-vodicov',
    images: [
      {
        url: 'https://www.taxinearme.cz/blog-images/hodnotenie.jpg',
        width: 1200,
        height: 630,
        alt: 'Hodnocení řidičů v taxi aplikacích',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Jak funguje hodnocení řidičů v taxi aplikacích',
    description:
      'Proč můžeš jedním klikem zničit někomu práci. 4★ není dobré hodnocení - je to penalizace.',
    images: ['https://www.taxinearme.cz/blog-images/hodnotenie.jpg'],
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/hodnotenie-vodicov',
    languages: {
      'cs': 'https://www.taxinearme.cz/hodnotenie-vodicov',
      'x-default': 'https://www.taxinearme.cz/hodnotenie-vodicov',
    },
  },
};

export default function HodnotenieVodicovPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Jak funguje hodnocení řidičů v taxi aplikacích"
        description="Proč můžeš jedním klikem zničit někomu práci. 4★ není dobré hodnocení - je to penalizace."
        url="https://www.taxinearme.cz/hodnotenie-vodicov"
        publishedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[{ label: 'Hodnocení řidičů' }]} />

        {/* Hero Section */}
        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Star className="h-2.5 w-2.5 inline mr-1" />
              Hodnocení
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Jak funguje hodnocení řidičů v taxi aplikacích
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Proč můžeš jedním klikem zničit někomu práci. 4★ není dobré hodnocení - je to
            penalizace.
          </p>

          <ShareButton title="Jak funguje hodnocení řidičů v taxi aplikacích" />
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
                Řeknu to bez obalu:
              </p>
              <p className="text-gray-800">
                Hvězdičky v taxi aplikaci nejsou hra. Jedno tvoje kliknutí může znamenat, že
                konkrétní řidič dostane méně jízd, přijde o stovky eur měsíčně, nebo ho systém
                úplně odstaví.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Řidič taxi není sanitka ani psycholog. Přesto se často nachází v situacích,
              které vyžadují rozhodnutí: Vzít problémového zákazníka, nebo raději odmítnout?
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              1. 4★ není &quot;dobré hodnocení&quot;. Je to penalizace.
            </h2>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-3">
              <p className="font-semibold text-gray-900">Běžná věta zákazníka:</p>
              <p className="italic text-gray-700">&quot;Nic extra, tak 4★.&quot;</p>
              <p className="mt-3 text-gray-800">
                <strong>Realita:</strong> Platformy tlačí řidiče k průměru 4,8★. Každý pokles o
                desetinku znamená: méně priorizovaných jízd, méně příjmu, více stresu.
              </p>
            </div>

            <p>
              Pro řidiče rozdíl mezi 4,7★ a 4,9★ = zda ho systém bude pouštět dopředu nebo ho
              hodí na dno.
            </p>

            <p className="font-semibold text-lg">
              Pokud byla jízda <strong>bezpečná, normální, auto čisté, řidič korektní</strong> → 4★
              je trest, ne hodnocení.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              2. Většina nízkých hodnocení trestá něco, za co řidič nemůže
            </h2>

            <p>Lidé dávají špatná hodnocení za věci mimo kontrolu řidiče:</p>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Zácpa</p>
                <p className="text-sm text-gray-700">
                  Řidič neovládá semafory ani nehody na cestě
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Cena</p>
                <p className="text-sm text-gray-700">Tarif nastavuje systém, ne řidič</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Počasí</p>
                <p className="text-sm text-gray-700">Řidič neřídí déšť ani sníh</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">❌ Uzavírky</p>
                <p className="text-sm text-gray-700">Řidič neplánuje silniční práce</p>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Typické scénáře:</h3>

            <div className="space-y-4 my-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Drahé, dám 3★&quot;</p>
                <p className="text-sm text-gray-700">→ Tarif nastavuje systém, ne řidič</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Měl zpoždění, dám 2★&quot;</p>
                <p className="text-sm text-gray-700">→ Stál v zácpě, neovládá semafory</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Nic extra, tak 4★&quot;</p>
                <p className="text-sm text-gray-700">
                  → Jsme v taxi, ne v divadle. Bezpečně, včas, v tichu = perfektní jízda
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">&quot;Pohádali jsme se, dám mu 1★&quot;</p>
                <p className="text-sm text-gray-700">
                  → Řidič odmítl porušit pravidla / riskovat
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              3. Nejšpinavější část: křivá obvinění a blokace bez důkazů
            </h2>

            <p>Téma, o které se moc nemluví, ale v systému existuje:</p>

            <ul className="space-y-2 my-4">
              <li>Obvinění z &quot;nevhodného chování&quot;</li>
              <li>Obtěžování</li>
              <li>Pocit &quot;cítila jsem se nepříjemně&quot;</li>
            </ul>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Jak to funguje:</h3>
              <ol className="space-y-3">
                <li>
                  <strong>1.</strong> Zákazník napíše: &quot;Řidič se choval nevhodně / obtěžoval
                  mě / cítila jsem se ohrožena&quot;
                </li>
                <li>
                  <strong>2.</strong> Systém: okamžitě zablokuje řidiče, odstaví mu příjem, nezřídka
                  bez reálného prověření faktů
                </li>
                <li>
                  <strong>3.</strong> Řidič: nemá prostor se bránit, neví co přesně se mu klade
                  za vinu, je &quot;odpálen&quot;
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              4. Jak by měl vypadat férový systém hodnocení
            </h2>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Tři věci:</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    1. Nefungovat na principu: zákazník má vždy pravdu
                  </h4>
                  <p>Extrémní hodnocení (1★ + těžký komentář) by mělo jít pod lupu</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">
                    2. Dívat se na data, ne jen na emoce
                  </h4>
                  <p>Hledat vzorce, ne jednorázové výbuchy</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3. Dovolit řidiči se bránit</h4>
                  <p>Řidič má mít možnost reagovat a poskytnout svou verzi</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              5. Návod pro zákazníky: jak hodnotit férově
            </h2>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">✓ Hodnoť řidiče za to, co ovlivní:</h3>
              <ul className="space-y-2">
                <li>• Jezdil agresivně, riskoval</li>
                <li>• Byl arogantní, hrubý, nerespektoval tě</li>
                <li>• Auto bylo špinavé, odporný zápach</li>
                <li>• Vědomě tě táhl zbytečně delší trasou</li>
                <li>• Ignoroval dohodu, choval se vyloženě neprofesionálně</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">✗ Toto NENÍ důvod na 1-3★:</h3>
              <ul className="space-y-2">
                <li>• Cena (vypočítala aplikace)</li>
                <li>• Zácpy, nehody, uzavírky</li>
                <li>• Tvoje vlastní nervy, špatný den, opilost</li>
                <li>
                  • To, že řidič odmítl: jezdit 80 ve městě, porušit dopravní předpisy, zastavit
                  na zákazu, udělat z auta diskotéku ve 3:00 ráno
                </li>
              </ul>
            </div>

            <p className="text-xl font-bold text-center my-4 p-6 bg-gray-100 rounded-lg">
              Jednoduché pravidlo: &quot;Hodnotím řidiče jen za to, co reálně držel v
              rukou.&quot;
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Závěr: Hvězdičky jsou zbraň</h2>

            <p className="text-lg">
              Nechceme od tebe, abys byl &quot;dobrák&quot; a rozdával 5★ pořád. Chceme pouze:{' '}
              <strong>férové hodnocení za to, co řidič reálně ovlivnil.</strong>
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="font-semibold text-lg mb-3">Důsledek nespravedlivého hodnocení:</p>
              <ul className="space-y-2">
                <li>
                  • Dobří řidiči časem odejdou (unavení z toho, že žijí pod gilotinou hvězdiček)
                </li>
                <li>
                  • Zůstanou ti, kteří to berou jen jako dočasnou práci, bez vztahu k práci
                </li>
                <li>
                  • Ty jako zákazník skončíš ve službě, kde: řidiči nemají motivaci, systém je
                  napjatý, kvalita jde dolů
                </li>
              </ul>
            </div>

            <p className="text-xl font-bold text-center my-4">Přemýšlej, kam míříš.</p>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>

          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="hodnotenie-vodicov"
            articleTitle="Často kladené dotazy o hodnocení řidičů"
          />

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">
              Chcete vidět komplexního průvodce taxislužbami?
            </h3>
            <p className="text-center text-gray-700 mb-3">
              Přečtěte si vše, co potřebujete vědět o taxi v Česku v roce 2025.
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
