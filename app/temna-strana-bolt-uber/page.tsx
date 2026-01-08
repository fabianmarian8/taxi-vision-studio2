/** Migrované z: src/vite-pages/TemnaBoltUberPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, TrendingDown, DollarSign, Users, Shield , ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Temná stránka Boltu a Uberu | TaxiNearMe.sk',
  description: 'Nižšia kvalita služieb a sklamanie vodičov - realita rideshare platforiem.',
  keywords: ['bolt uber problémy', 'rideshare platformy', 'taxi aplikácie', 'bolt slovensko', 'uber slovensko', 'kritika bolt uber'],
  openGraph: {
    title: 'Temná stránka Boltu a Uberu - problémy rideshare platforiem',
    description: 'Nízke provízie, neférové hodnotenie, surge pricing a problémy, o ktorých sa nehovorí. Realita rideshare platforiem.',
    url: 'https://www.taxinearme.sk/temna-strana-bolt-uber',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/temna-strana.jpg',
      width: 1200,
      height: 630,
      alt: 'Temná stránka Bolt/Uber'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Temná stránka Boltu a Uberu - problémy rideshare platforiem',
    description: 'Nízke provízie, neférové hodnotenie, surge pricing a problémy, o ktorých sa nehovorí. Realita rideshare platforiem.',
    images: ['https://www.taxinearme.sk/blog-images/temna-strana.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/temna-strana-bolt-uber',
    languages: {
      'sk': 'https://www.taxinearme.sk/temna-strana-bolt-uber',
      'x-default': 'https://www.taxinearme.sk/temna-strana-bolt-uber',
    },
  }
};

export default function TemnaBoltUberPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Temná stránka Boltu a Uberu - problémy rideshare platforiem"
        description="Nízke provízie, neférové hodnotenie, surge pricing a problémy, o ktorých sa nehovorí. Realita rideshare platforiem."
        url="https://www.taxinearme.sk/temna-strana-bolt-uber"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Temná stránka Bolt/Uber' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <AlertCircle className="h-2.5 w-2.5 inline mr-1" />
              Analýza
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Temná stránka Boltu a Uberu
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Nízke provízie, neférové hodnotenie, surge pricing a problémy, o ktorých sa nehovorí. Realita rideshare platforiem.
          </p>

          <ShareButton
            title="Temná stránka Boltu a Uberu - problémy rideshare platforiem"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Bolt a Uber revolúciou zmenili taxislužby. Sľubovali flexibilitu, férové ceny a jednoduchosť. Realita? Vykorisťovanie vodičov, nespravodlivé algoritmy a systém postavený na maximalizácii zisku na úkor ľudí.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Tento článok nie je útok na technológiu. Je to analýza toho, čo sa stáva, keď neregulovaná platforma získa monopol a prenesie všetky riziká na vodičov a zákazníkov.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <DollarSign className="h-8 w-8 inline mr-2 text-primary" />
              1. Provízie: Kto reálne zarába?
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Rozdelenie príjmu z jednej jazdy:</h3>

              <div className="space-y-4">
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Zákazník zaplatí</span>
                    <span className="text-2xl font-bold">€15,00</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Provízia Bolt/Uber (20-30%)</span>
                    <span className="text-xl font-bold text-red-400">-€3,00 až -€4,50</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Benzín (cca 15-20%)</span>
                    <span className="text-xl font-bold text-red-400">-€2,25 až -€3,00</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Opotrebenie auta, údržba</span>
                    <span className="text-xl font-bold text-red-400">-€1,50</span>
                  </div>
                </div>

                <div className="bg-green-900/50 p-4 rounded-lg border-2 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Vodičovi zostane</span>
                    <span className="text-2xl font-bold text-green-400">€6,75 až €8,25</span>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-xl font-bold text-center">
                = Vodič dostane 45-55% z toho, čo zákazník zaplatil.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Problém: Provízie rastú, platy vodičov klesajú</h3>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">História provízií Bolt/Uber:</p>
              <ul className="space-y-2">
                <li><strong>2015-2017:</strong> Provízie 10-15% – Vodiči zarábali slušne</li>
                <li><strong>2018-2020:</strong> Provízie 15-20% – Začína tlak</li>
                <li><strong>2021-2025:</strong> Provízie 20-30% – Vodiči pod hranicou minimálnej mzdy</li>
              </ul>

              <p className="mt-4 bg-red-50 p-3 rounded">
                <strong>Výsledok:</strong> Platformy zarábajú miliardy. Vodiči stále viac pracujú za menej peňazí.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <TrendingDown className="h-8 w-8 inline mr-2 text-primary" />
              2. Surge pricing: Kto profituje?
            </h2>

            <p className="text-lg">
              Surge pricing = dynamické ceny. Keď je veľký dopyt, cena rastie. Logika: Motivovať vodičov, aby išli pracovať.
            </p>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Ako to funguje v praxi:</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2">Normálna cena:</p>
                  <p className="text-sm text-gray-700">Jazda z centra na letisko = €12</p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2">Surge pricing (2,5×):</p>
                  <p className="text-sm text-gray-700 mb-2">Rovnaká jazda = €30</p>
                  <p className="text-red-600 font-bold">Rozdiel: +€18</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Kto dostane ten rozdiel?</p>
                  <p className="text-sm text-gray-700">Vodič: +€9 (50%)</p>
                  <p className="text-sm text-gray-700">Platforma: +€9 (50%)</p>
                </div>
              </div>

              <p className="mt-4 font-bold text-gray-900">
                Platforma zarába aj keď nerobí nič navyše. Vodič robí rovnakú prácu, ale má vyššie riziko (stres, nespokojný zákazník).
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Problém: Zákazníci obviňujú vodičov</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="mb-3">Typický scenár:</p>

              <div className="space-y-2">
                <p className="italic text-gray-700">"Prečo je to také drahé?!"</p>
                <p className="italic text-gray-700">"Vy taxikári ste zlodeji!"</p>
                <p className="italic text-gray-700">→ Dá vodičovi 1★</p>
              </div>

              <p className="mt-4 bg-white p-3 rounded">
                <strong>Realita:</strong> Vodič neovláda cenu. Systém ju nastavuje. Ale vodič dostane zlé hodnotenie.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              3. Hodnotenia: Systém postavený na strachu
            </h2>

            <p className="text-lg">
              Bolt a Uber fungujú na princípe: <strong>"Zákazník má vždy pravdu."</strong> Vodič je vždy pod tlakom.
            </p>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Ako systém hodnotení ničí vodičov:</h3>

              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">1. Priemer pod 4,8★ = Penalizácia</p>
                  <p>Systém ťa púšťa až na posledné miesto. Dostaneš menej jázd.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">2. Priemer pod 4,6★ = Riziko vyhodenia</p>
                  <p>Bolt/Uber ťa môže zablokovať. Žiadny príjem. Žiadna obrana.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">3. Falošné obvinenia = Okamžitá blokovanie</p>
                  <p>Zákazník napíše: "Vodič sa správal nevhodne." Systém: Automatická blokovanie. Žiadne preverenie.</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Najhoršie: Žiadna ochrana pre vodičov</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Príklad z reálneho života:</p>

              <div className="bg-white p-4 rounded mb-3">
                <p className="italic text-gray-700 mb-2">"Vodička Bolt odviezla opitého pasažiera. Ten po jazde napísal: 'Vodička sa správala nevhodne.' Bolt ju okamžite zablokoval. Žiadne preverenie. Žiadna možnosť sa brániť. Príjem: 0€."</p>
              </div>

              <p className="bg-gray-900 text-white p-3 rounded">
                <strong>Výsledok:</strong> Vodiči žijú v strachu. Každý zákazník je potenciálna hrozba.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Users className="h-8 w-8 inline mr-2 text-primary" />
              4. Problémy pre zákazníkov
            </h2>

            <p className="text-lg">
              Nie sú to len vodiči, ktorí trpia. Zákazníci tiež čelia problémom.
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">1. Nestabilná kvalita</p>
                <p className="text-sm text-gray-700">Jeden deň skvelý vodič, druhý deň neškolený amatér. Žiadna konzistencia.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">2. Surge pricing šok</p>
                <p className="text-sm text-gray-700">Cena môže byť 3× vyššia bez upozornenia. Zákazník sa cíti oklamaný.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">3. Zrušené jazdy</p>
                <p className="text-sm text-gray-700">Vodič zruší jazdu po 5 minútach čakania. Zákazník musí čakať znova.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">4. Žiadna ochrana</p>
                <p className="text-sm text-gray-700">Pri konflikte: Systém sa skryje za automatické odpovede. Žiadna reálna podpora.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">5. Alternatívy: Čo funguje lepšie?</h2>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Tradičné taxi vs. Bolt/Uber</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold mb-2">Tradičné taxi</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ Licencovaní vodiči (preverení, školení)</li>
                    <li>✓ Regulované ceny (žiadne surge pricing)</li>
                    <li>✓ Zodpovednosť za službu (firma garantuje kvalitu)</li>
                    <li>✓ Ochrana vodičov aj zákazníkov</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold mb-2">Bolt/Uber</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✗ Minimálne školenie vodičov</li>
                    <li>✗ Nepredvídateľné ceny (surge pricing)</li>
                    <li>✗ Žiadna garancia kvality</li>
                    <li>✗ Žiadna ochrana pre vodičov</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Prečo ľudia stále používajú Bolt/Uber?</h3>

            <ul className="space-y-2 my-4">
              <li className="bg-blue-50 p-3 rounded">
                <strong>1. Pohodlie aplikácie</strong> – Jedno kliknutie, auto príde
              </li>
              <li className="bg-blue-50 p-3 rounded">
                <strong>2. Nižšie ceny (mimo surge)</strong> – Keď nie je špička, býva to lacnejšie
              </li>
              <li className="bg-blue-50 p-3 rounded">
                <strong>3. Dostupnosť</strong> – Viac áut než tradičné taxi
              </li>
            </ul>

            <p className="bg-yellow-50 p-4 rounded-lg my-4">
              <strong>Ale:</strong> Tieto výhody sú postavené na nízkych platoch vodičov a absencii regulácie.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Riešenie: Regulácia a férové podmienky</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Čo by mali urobiť vlády a platformy:</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">1. Minimálna mzda pre vodičov</h4>
                  <p>Garantovať, že vodiči zarábajú aspoň minimálnu mzdu (po odpočte nákladov).</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2. Transparentnosť provízií</h4>
                  <p>Zákazník aj vodič musia vedieť, koľko ide platforme.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3. Férový systém hodnotení</h4>
                  <p>Hodnotenia musia byť preverované. Vodič musí mať možnosť sa brániť.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4. Regulácia surge pricingu</h4>
                  <p>Maximálne limity na násobky cien (napr. max 2× bežnej ceny).</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver: Kto platí cenu za "revolúciu"?</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl mb-3">
                Bolt a Uber zmenili taxislužby. Ale za akú cenu?
              </p>

              <ul className="space-y-3 text-lg">
                <li>• Vodiči zarábajú menej než kedykoľvek predtým</li>
                <li>• Zákazníci čelia nepredvídateľným cenám</li>
                <li>• Platformy zarábajú miliardy bez zodpovednosti</li>
              </ul>

              <p className="text-xl font-bold mt-6">
                Toto nie je udržateľný model. Niečo sa musí zmeniť.
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Pre zákazníkov:</p>
              <p className="text-lg">
                Keď používate Bolt/Uber, pamätajte: Za tou lacnou cenou je vodič, ktorý pracuje 12 hodín denne za minimálny plat. Rešpektujte ho. Hodnote férovo.
              </p>
            </div>

            <p className="text-xl font-bold text-center my-4">
              Revolúcia bez regulácie = chaos. Požadujme férové podmienky pre všetkých.
            </p>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>

          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="temna-strana-bolt-uber"
            articleTitle="Často kladené otázky o Bolt a Uber"
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
