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
  title: 'Temná stránka Boltu a Uberu | TaxiNearMe.cz',
  description: 'Nižší kvalita služeb a zklamání řidičů - realita rideshare platforem.',
  keywords: ['bolt uber problémy', 'rideshare platformy', 'taxi aplikace', 'bolt česko', 'uber česko', 'kritika bolt uber'],
  openGraph: {
    title: 'Temná stránka Boltu a Uberu - problémy rideshare platforem',
    description: 'Nízké provize, neférové hodnocení, surge pricing a problémy, o kterých se nemluví. Realita rideshare platforem.',
    url: 'https://www.taxinearme.cz/temna-strana-bolt-uber',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/temna-strana.jpg',
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
    title: 'Temná stránka Boltu a Uberu - problémy rideshare platforem',
    description: 'Nízké provize, neférové hodnocení, surge pricing a problémy, o kterých se nemluví. Realita rideshare platforem.',
    images: ['https://www.taxinearme.cz/blog-images/temna-strana.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/temna-strana-bolt-uber',
    languages: {
      'cs': 'https://www.taxinearme.cz/temna-strana-bolt-uber',
      'x-default': 'https://www.taxinearme.cz/temna-strana-bolt-uber',
    },
  }
};

export default function TemnaBoltUberPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Temná stránka Boltu a Uberu - problémy rideshare platforem"
        description="Nízké provize, neférové hodnocení, surge pricing a problémy, o kterých se nemluví. Realita rideshare platforem."
        url="https://www.taxinearme.cz/temna-strana-bolt-uber"
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
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Temná stránka Boltu a Uberu
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Nízké provize, neférové hodnocení, surge pricing a problémy, o kterých se nemluví. Realita rideshare platforem.
          </p>

          <ShareButton
            title="Temná stránka Boltu a Uberu - problémy rideshare platforem"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Bolt a Uber revolucí změnily taxislužby. Slibovaly flexibilitu, férové ceny a jednoduchost. Realita? Vykořisťování řidičů, nespravedlivé algoritmy a systém postavený na maximalizaci zisku na úkor lidí.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Tento článek není útok na technologii. Je to analýza toho, co se stává, když neregulovaná platforma získá monopol a přenese všechna rizika na řidiče a zákazníky.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <DollarSign className="h-8 w-8 inline mr-2 text-primary" />
              1. Provize: Kdo reálně vydělává?
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Rozdělení příjmu z jedné jízdy:</h3>

              <div className="space-y-4">
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Zákazník zaplatí</span>
                    <span className="text-2xl font-bold">350 Kč</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Provize Bolt/Uber (20-30%)</span>
                    <span className="text-xl font-bold text-red-400">-70 Kč až -105 Kč</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Benzín (cca 15-20%)</span>
                    <span className="text-xl font-bold text-red-400">-52 Kč až -70 Kč</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Opotřebení auta, údržba</span>
                    <span className="text-xl font-bold text-red-400">-35 Kč</span>
                  </div>
                </div>

                <div className="bg-green-900/50 p-4 rounded-lg border-2 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Řidiči zůstane</span>
                    <span className="text-2xl font-bold text-green-400">157 Kč až 193 Kč</span>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-xl font-bold text-center">
                = Řidič dostane 45-55% z toho, co zákazník zaplatil.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Problém: Provize rostou, platy řidičů klesají</h3>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Historie provizí Bolt/Uber:</p>
              <ul className="space-y-2">
                <li><strong>2015-2017:</strong> Provize 10-15% – Řidiči vydělávali slušně</li>
                <li><strong>2018-2020:</strong> Provize 15-20% – Začíná tlak</li>
                <li><strong>2021-2025:</strong> Provize 20-30% – Řidiči pod hranicí minimální mzdy</li>
              </ul>

              <p className="mt-4 bg-red-50 p-3 rounded">
                <strong>Výsledek:</strong> Platformy vydělávají miliardy. Řidiči stále více pracují za méně peněz.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <TrendingDown className="h-8 w-8 inline mr-2 text-primary" />
              2. Surge pricing: Kdo profituje?
            </h2>

            <p className="text-lg">
              Surge pricing = dynamické ceny. Když je velká poptávka, cena roste. Logika: Motivovat řidiče, aby šli pracovat.
            </p>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Jak to funguje v praxi:</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2">Normální cena:</p>
                  <p className="text-sm text-gray-700">Jízda z centra na letiště = 280 Kč</p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold mb-2">Surge pricing (2,5×):</p>
                  <p className="text-sm text-gray-700 mb-2">Stejná jízda = 700 Kč</p>
                  <p className="text-red-600 font-bold">Rozdíl: +420 Kč</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Kdo dostane ten rozdíl?</p>
                  <p className="text-sm text-gray-700">Řidič: +210 Kč (50%)</p>
                  <p className="text-sm text-gray-700">Platforma: +210 Kč (50%)</p>
                </div>
              </div>

              <p className="mt-4 font-bold text-gray-900">
                Platforma vydělává i když nedělá nic navíc. Řidič dělá stejnou práci, ale má vyšší riziko (stres, nespokojený zákazník).
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Problém: Zákazníci obviňují řidiče</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="mb-3">Typický scénář:</p>

              <div className="space-y-2">
                <p className="italic text-gray-700">"Proč je to tak drahé?!"</p>
                <p className="italic text-gray-700">"Vy taxikáři jste zloději!"</p>
                <p className="italic text-gray-700">→ Dá řidiči 1★</p>
              </div>

              <p className="mt-4 bg-white p-3 rounded">
                <strong>Realita:</strong> Řidič neovládá cenu. Systém ji nastavuje. Ale řidič dostane špatné hodnocení.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              3. Hodnocení: Systém postavený na strachu
            </h2>

            <p className="text-lg">
              Bolt a Uber fungují na principu: <strong>"Zákazník má vždy pravdu."</strong> Řidič je vždy pod tlakem.
            </p>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Jak systém hodnocení ničí řidiče:</h3>

              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">1. Průměr pod 4,8★ = Penalizace</p>
                  <p>Systém tě pouští až na poslední místo. Dostaneš méně jízd.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">2. Průměr pod 4,6★ = Riziko vyhození</p>
                  <p>Bolt/Uber tě může zablokovat. Žádný příjem. Žádná obrana.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">3. Falešná obvinění = Okamžité zablokování</p>
                  <p>Zákazník napíše: "Řidič se choval nevhodně." Systém: Automatické zablokování. Žádné prověření.</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Nejhorší: Žádná ochrana pro řidiče</h3>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <p className="font-semibold mb-3">Příklad z reálného života:</p>

              <div className="bg-white p-4 rounded mb-3">
                <p className="italic text-gray-700 mb-2">"Řidička Bolt odvezla opilého pasažéra. Ten po jízdě napsal: 'Řidička se chovala nevhodně.' Bolt ji okamžitě zablokoval. Žádné prověření. Žádná možnost se bránit. Příjem: 0 Kč."</p>
              </div>

              <p className="bg-gray-900 text-white p-3 rounded">
                <strong>Výsledek:</strong> Řidiči žijí ve strachu. Každý zákazník je potenciální hrozba.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Users className="h-8 w-8 inline mr-2 text-primary" />
              4. Problémy pro zákazníky
            </h2>

            <p className="text-lg">
              Nejsou to jen řidiči, kteří trpí. Zákazníci také čelí problémům.
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">1. Nestabilní kvalita</p>
                <p className="text-sm text-gray-700">Jeden den skvělý řidič, druhý den neškolený amatér. Žádná konzistence.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">2. Surge pricing šok</p>
                <p className="text-sm text-gray-700">Cena může být 3× vyšší bez upozornění. Zákazník se cítí oklamaný.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">3. Zrušené jízdy</p>
                <p className="text-sm text-gray-700">Řidič zruší jízdu po 5 minutách čekání. Zákazník musí čekat znovu.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-bold mb-3">4. Žádná ochrana</p>
                <p className="text-sm text-gray-700">Při konfliktu: Systém se skryje za automatické odpovědi. Žádná reálná podpora.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">5. Alternativy: Co funguje lépe?</h2>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Tradiční taxi vs. Bolt/Uber</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold mb-2">Tradiční taxi</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ Licencovaní řidiči (prověření, školení)</li>
                    <li>✓ Regulované ceny (žádné surge pricing)</li>
                    <li>✓ Zodpovědnost za službu (firma garantuje kvalitu)</li>
                    <li>✓ Ochrana řidičů i zákazníků</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold mb-2">Bolt/Uber</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✗ Minimální školení řidičů</li>
                    <li>✗ Nepředvídatelné ceny (surge pricing)</li>
                    <li>✗ Žádná garance kvality</li>
                    <li>✗ Žádná ochrana pro řidiče</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Proč lidé stále používají Bolt/Uber?</h3>

            <ul className="space-y-2 my-4">
              <li className="bg-blue-50 p-3 rounded">
                <strong>1. Pohodlí aplikace</strong> – Jedno kliknutí, auto přijede
              </li>
              <li className="bg-blue-50 p-3 rounded">
                <strong>2. Nižší ceny (mimo surge)</strong> – Když není špička, bývá to levnější
              </li>
              <li className="bg-blue-50 p-3 rounded">
                <strong>3. Dostupnost</strong> – Více aut než tradiční taxi
              </li>
            </ul>

            <p className="bg-yellow-50 p-4 rounded-lg my-4">
              <strong>Ale:</strong> Tyto výhody jsou postaveny na nízkých platech řidičů a absenci regulace.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Řešení: Regulace a férové podmínky</h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Co by měly udělat vlády a platformy:</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">1. Minimální mzda pro řidiče</h4>
                  <p>Garantovat, že řidiči vydělávají alespoň minimální mzdu (po odečtení nákladů).</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2. Transparentnost provizí</h4>
                  <p>Zákazník i řidič musí vědět, kolik jde platformě.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3. Férový systém hodnocení</h4>
                  <p>Hodnocení musí být prověřována. Řidič musí mít možnost se bránit.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4. Regulace surge pricingu</h4>
                  <p>Maximální limity na násobky cen (např. max 2× běžné ceny).</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr: Kdo platí cenu za "revoluci"?</h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <p className="text-xl mb-3">
                Bolt a Uber změnily taxislužby. Ale za jakou cenu?
              </p>

              <ul className="space-y-3 text-lg">
                <li>• Řidiči vydělávají méně než kdykoliv předtím</li>
                <li>• Zákazníci čelí nepředvídatelným cenám</li>
                <li>• Platformy vydělávají miliardy bez zodpovědnosti</li>
              </ul>

              <p className="text-xl font-bold mt-6">
                Toto není udržitelný model. Něco se musí změnit.
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Pro zákazníky:</p>
              <p className="text-lg">
                Když používáte Bolt/Uber, pamatujte: Za tou levnou cenou je řidič, který pracuje 12 hodin denně za minimální plat. Respektujte ho. Hodnoťte férově.
              </p>
            </div>

            <p className="text-xl font-bold text-center my-4">
              Revoluce bez regulace = chaos. Požadujme férové podmínky pro všechny.
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
