/** Migrované z: src/vite-pages/CoMusiZniestVodicPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, Clock, Shield, TrendingDown, Heart , ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Co všechno musí snést řidič taxi | TaxiNearMe.cz',
  description: 'Realita práce taxikáře - výzvy, stres a každodenní situace.',
  keywords: ['práce taxikáře', 'realita taxi', 'stres řidič', 'výzvy taxislužby', 'život taxikáře'],
  openGraph: {
    title: 'Co všechno musí snést řidič taxi',
    description: 'Realita práce taxikáře - výzvy, stres a každodenní situace.',
    url: 'https://www.taxinearme.cz/co-musi-zniest-vodic',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/vodic.jpg',
      width: 1200,
      height: 630,
      alt: 'Co všechno musí snést řidič taxi'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Co všechno musí snést řidič taxi',
    description: 'Realita práce taxikáře - výzvy, stres a každodenní situace.',
    images: ['https://www.taxinearme.cz/blog-images/vodic.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/co-musi-zniest-vodic',
    languages: {
      'cs': 'https://www.taxinearme.cz/co-musi-zniest-vodic',
      'x-default': 'https://www.taxinearme.cz/co-musi-zniest-vodic',
    },
  }
};

export default function CoMusiZniestVodicPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Co všechno musí snést řidič taxi"
        description="Realita práce taxikáře - výzvy, stres a každodenní situace."
        url="https://www.taxinearme.cz/co-musi-zniest-vodic"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Co musí snést řidič' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <AlertTriangle className="h-2.5 w-2.5 inline mr-1" />
              Realita
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. leden 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Co všechno musí snést řidič taxi
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Dlouhé hodiny, toxičtí zákazníci, neférová hodnocení a neustálý stres. Realita, o které se moc nemluví.
          </p>

          <ShareButton
            title="Co všechno musí snést řidič taxi - peklo analýza"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Taxi není glamour. Není to jen "sedneš do auta, vozíš lidi, vyděláváš peníze". Je to fyzicky, psychicky a emocionálně vyčerpávající práce. A většina lidí nemá ani ponětí, co všechno řidiči denně snášejí.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Tento článek není na stěžování. Je to realita. Bez příkras. Bez filtru. Pro ty, kteří uvažují o práci řidiče, i pro ty, kteří chtějí pochopit, proč jejich řidič někdy vypadá unaveně, proč reaguje defenzivně, nebo proč nemá energii na rozhovory.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Clock className="h-8 w-8 inline mr-2 text-primary" />
              1. Fyzická vyčerpanost: 10-14 hodin denně za volantem
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Typický den řidiče:</h3>

              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">06:00 – Začátek</p>
                  <p>Vstaneš, káva, vyrazíš</p>
                </div>
                <div>
                  <p className="font-bold mb-2">06:30 – 10:00 – Ranní špička</p>
                  <p>Letiště, obchodní čtvrti, zácpy, nervózní zákazníci</p>
                </div>
                <div>
                  <p className="font-bold mb-2">10:00 – 14:00 – Mrtvá zóna</p>
                  <p>Málo jízd, čekáš, čekáš, platíš benzín, čekáš</p>
                </div>
                <div>
                  <p className="font-bold mb-2">14:00 – 18:00 – Odpolední špička</p>
                  <p>Znovu zácpy, stres, vyčerpanost</p>
                </div>
                <div>
                  <p className="font-bold mb-2">18:00 – 22:00 – Večerní hodiny</p>
                  <p>Restaurace, bary, první opilé skupiny</p>
                </div>
                <div>
                  <p className="font-bold mb-2">22:00 – 03:00 – Nejrizikovější hodiny</p>
                  <p>Opilí zákazníci, agresivní chování, riziko zvracení/konfliktu</p>
                </div>
              </div>

              <p className="mt-6 text-xl font-bold">
                = 12-16 hodin v sedačce. Denně.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Fyzické následky:</h3>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Bolest zad</p>
                <p className="text-sm text-gray-700">Chronické problémy se zády a bederním kloubem</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Špatný krevní oběh</p>
                <p className="text-sm text-gray-700">Žilní nedostatečnost, otoky nohou</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Nezdravá strava</p>
                <p className="text-sm text-gray-700">Fast food na pumpě, žádný čas na pořádné jídlo</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Únava očí</p>
                <p className="text-sm text-gray-700">Hodiny sledování cesty, noční světla, displeje</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Heart className="h-8 w-8 inline mr-2 text-primary" />
              2. Psychická zátěž: Život pod gilotinou hvězdiček
            </h2>

            <p className="text-lg">
              Tvůj příjem nezávisí jen na tom, kolik jezdíš. Závisí na tom, jak tě hodnotí. A hodnocení je často subjektivní, neférové a může tě zničit.
            </p>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Realita hvězdiček:</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded">
                  <p className="font-semibold mb-2">Scénář 1: Zácpa</p>
                  <p className="text-sm text-gray-700 mb-2">Stojíš v koloně 20 minut. Zákazník nervózní. Dá ti 3★: "Meškal."</p>
                  <p className="text-red-600 font-bold">→ Tvůj průměr klesá.</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <p className="font-semibold mb-2">Scénář 2: Cena</p>
                  <p className="text-sm text-gray-700 mb-2">Systém nastaví surge pricing. Zákazník: "Drahé! 2★"</p>
                  <p className="text-red-600 font-bold">→ Není to tvoje vina, ale ty jdeš dolů.</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <p className="font-semibold mb-2">Scénář 3: Odmítnutí</p>
                  <p className="text-sm text-gray-700 mb-2">Odmítneš opilého agresivního pasažéra. On tě nahlásí za "nevhodné chování".</p>
                  <p className="text-red-600 font-bold">→ Systém tě zablokuje. Žádný příjem.</p>
                </div>
              </div>
            </div>

            <p className="text-xl font-bold text-center my-4 p-6 bg-red-100 rounded-lg">
              Žiješ v neustálém strachu: Každá jízda může být ta, která ti zničí rating.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              3. Bezpečnostní rizika: Nejnebezpečnější povolání v USA
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Statistiky z USA:</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">30-60×</p>
                  <p className="text-sm">vyšší riziko vraždy než průměr pracujících</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">82%</p>
                  <p className="text-sm">útoků se stává v noci</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">94%</p>
                  <p className="text-sm">útoků pochází zevnitř vozidla</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">80%</p>
                  <p className="text-sm">útoků přichází ze sedadla za řidičem</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Rizika, kterým řidiči denně čelí:</h3>

            <ul className="space-y-3 my-4">
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Loupeže</strong> – Pasažér tě může ohrozit, ukrást příjem, zmizet
              </li>
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Fyzické útoky</strong> – Opilý/agresivní zákazník tě udeří, kopne, plivne
              </li>
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Sexuální obtěžování</strong> – Nevhodné návrhy, dotýkání, slovní obtěžování
              </li>
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Falešná obvinění</strong> – Zákazník tvrdí, že ses choval nevhodně → okamžité zablokování
              </li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <TrendingDown className="h-8 w-8 inline mr-2 text-primary" />
              4. Finanční tlak: Vydělávat = žít pod tlakem
            </h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Rozklad výdajů (měsíčně):</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Provize platformy (Bolt/Uber)</span>
                  <span className="font-bold text-red-600">-20% až -30%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Benzín</span>
                  <span className="font-bold text-red-600">-10 000 Kč až -15 000 Kč</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Údržba, pneumatiky, opravy</span>
                  <span className="font-bold text-red-600">-3 750 Kč až -7 500 Kč</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Pojištění, licence</span>
                  <span className="font-bold text-red-600">-2 500 Kč až -5 000 Kč</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Daňový odpočet auta</span>
                  <span className="font-bold text-red-600">-5 000 Kč až -10 000 Kč</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-900 text-white rounded-lg">
                <p className="text-xl font-bold">= Ze 75 000 Kč hrubého příjmu ti zůstane 30 000-37 500 Kč čistého.</p>
              </div>
            </div>

            <p className="text-lg">
              A to je při 60-70 hodinách týdně. Není to "lehký výdělek".
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">5. Emocionální izolace: Nikdo to nechápe</h2>

            <div className="bg-purple-50 p-6 rounded-lg my-4">
              <p className="text-lg mb-3">
                Povíš kamarádům, rodině: "Jsem vyčerpaný." Odpověď: "No vždyť jen sedíš v autě..."
              </p>

              <p className="font-semibold mb-3">Realita:</p>
              <ul className="space-y-2">
                <li>• Neustálá koncentrace (nehody, chodci, cyklisti, GPS)</li>
                <li>• Psychická zátěž (toxičtí zákazníci, hodnocení, stres)</li>
                <li>• Žádný sociální život (pracuješ večery, víkendy, svátky)</li>
                <li>• Žádná rodina (přijdeš domů ve 3:00, rodina spí)</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Ponížení a neúcta</h2>

            <p>Hodně lidí se na tebe dívá svrchu. "Jen taxikář." "Nemáš lepší práci?" "Co sis nevystudoval?"</p>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Typické situace:</h3>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Zákazník:</p>
                  <p className="italic text-gray-700">"Vy taxikáři jste všichni stejní – zloději."</p>
                </div>

                <div>
                  <p className="font-semibold">Zákazník:</p>
                  <p className="italic text-gray-700">"Nemáš lepší práci?"</p>
                </div>

                <div>
                  <p className="font-semibold">Zákazník:</p>
                  <p className="italic text-gray-700">"Dej mi 5★, nebo ti dám 1★."</p>
                </div>
              </div>

              <p className="mt-4 text-gray-900">
                <strong>A ty musíš mlčet. Protože když odpovíš → špatné hodnocení → méně příjmu.</strong>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">7. Nejhorší: Systém tě neochrání</h2>

            <p className="text-lg">
              Platformy (Bolt, Uber) fungují na principu: <strong>"Zákazník má vždy pravdu."</strong>
            </p>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Příklady:</h3>

              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">1. Falešné obvinění</p>
                  <p>Zákazník napíše: "Řidič se choval nevhodně." Systém: Okamžité zablokování, žádné prověření.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">2. Neférové hodnocení</p>
                  <p>Zákazník dá 1★ za zácpu. Systém: Tvůj průměr klesá, méně jízd.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">3. Žádná podpora</p>
                  <p>Nahlásíš incident. Odpověď platformy: Automatický email, žádná reálná pomoc.</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr: Proč řidiči odcházejí</h2>

            <p className="text-lg">
              Mnozí řidiči začnou s nadšením. "Flexibilní čas, slušný příjem, proč ne?"
            </p>

            <p className="text-lg mt-4">
              Po 6 měsících: Vyčerpaní, frustrovaní, vyhořelí. Odejdou.
            </p>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Důvody odchodu:</h3>

              <ul className="space-y-2">
                <li>✓ Nízký reálný příjem (po odečtení nákladů)</li>
                <li>✓ Fyzická vyčerpanost</li>
                <li>✓ Neustálý stres z hodnocení</li>
                <li>✓ Žádná ochrana před toxickými zákazníky</li>
                <li>✓ Žádný sociální život</li>
                <li>✓ Žádná perspektiva růstu</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Pro zákazníky:</p>
              <p className="text-lg">
                Pokud váš řidič vypadá unaveně, pokud nechce mluvit, pokud reaguje defenzivně – teď víte proč. Není to osobní. Je to výsledek stovek hodin pod tlakem.
              </p>
            </div>

            <p className="text-xl font-bold text-center my-4">
              Respektujte řidiče. Oni dělají práci, kterou většina lidí nevydrží ani měsíc.
            </p>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>

          </article>

          {/* FAQ Section */}
          <ArticleFAQ
            articleSlug="co-musi-zniest-vodic"
            articleTitle="Často kladené otázky o práci taxikáře"
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
