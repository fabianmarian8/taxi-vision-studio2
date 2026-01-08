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
  title: 'Čo všetko musí zniesť vodič taxi | TaxiNearMe.sk',
  description: 'Realita práce taxikára - výzvy, stres a každodenné situácie.',
  keywords: ['práca taxikára', 'realita taxi', 'stres vodič', 'výzvy taxislužby', 'život taxikára'],
  openGraph: {
    title: 'Čo všetko musí zniesť vodič taxi',
    description: 'Realita práce taxikára - výzvy, stres a každodenné situácie.',
    url: 'https://www.taxinearme.sk/co-musi-zniest-vodic',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/vodic.jpg',
      width: 1200,
      height: 630,
      alt: 'Čo všetko musí zniesť vodič taxi'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Čo všetko musí zniesť vodič taxi',
    description: 'Realita práce taxikára - výzvy, stres a každodenné situácie.',
    images: ['https://www.taxinearme.sk/blog-images/vodic.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/co-musi-zniest-vodic',
    languages: {
      'sk': 'https://www.taxinearme.sk/co-musi-zniest-vodic',
      'x-default': 'https://www.taxinearme.sk/co-musi-zniest-vodic',
    },
  }
};

export default function CoMusiZniestVodicPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Čo všetko musí zniesť vodič taxi"
        description="Realita práce taxikára - výzvy, stres a každodenné situácie."
        url="https://www.taxinearme.sk/co-musi-zniest-vodic"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Čo musí zniesť vodič' }
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
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Čo všetko musí zniesť vodič taxi
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Dlhé hodiny, toxickí zákazníci, neférové hodnotenia a neustály stres. Realita, o ktorej sa veľa nehovorí.
          </p>

          <ShareButton
            title="Čo všetko musí zniesť vodič taxi - peklo analýza"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Taxi nie je glamour. Nie je to len "sadneš do auta, vozíš ľudí, zarábať peniaze". Je to fyzicky, psychicky a emocionálne vyčerpávajúca práca. A väčšina ľudí nemá ani len predstavu, čo všetko vodiči denne znášajú.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Tento článok nie je na sťažovanie. Je to realita. Bez príkras. Bez filtra. Pre tých, ktorí uvažujú o práci vodiča, aj pre tých, ktorí chcú pochopiť, prečo ich vodič niekedy vyzerá unavene, prečo reaguje defenzívne, alebo prečo nemá energiu na rozhovory.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Clock className="h-8 w-8 inline mr-2 text-primary" />
              1. Fyzická vyčerpanosť: 10-14 hodín denne za volantom
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Typický deň vodiča:</h3>

              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">06:00 – Začiatok</p>
                  <p>Vstaneš, káva, vyrazíš</p>
                </div>
                <div>
                  <p className="font-bold mb-2">06:30 – 10:00 – Ranná špička</p>
                  <p>Letisko, obchodné štvrte, zápchy, nervózni zákazníci</p>
                </div>
                <div>
                  <p className="font-bold mb-2">10:00 – 14:00 – Mŕtva zóna</p>
                  <p>Málo jázd, čakáš, čakáš, platíš benzín, čakáš</p>
                </div>
                <div>
                  <p className="font-bold mb-2">14:00 – 18:00 – Popoludňajšia špička</p>
                  <p>Znova zápchy, stres, vyčerpanosť</p>
                </div>
                <div>
                  <p className="font-bold mb-2">18:00 – 22:00 – Večerné hodiny</p>
                  <p>Reštaurácie, bary, prvé opité skupiny</p>
                </div>
                <div>
                  <p className="font-bold mb-2">22:00 – 03:00 – Najrizikovejšie hodiny</p>
                  <p>Opitý zákazníci, agresívne správanie, riziko zvracania/konfliktu</p>
                </div>
              </div>

              <p className="mt-6 text-xl font-bold">
                = 12-16 hodín v sedačke. Denne.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Fyzické následky:</h3>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Bolesť chrbta</p>
                <p className="text-sm text-gray-700">Chronické problémy s chrbtom a bedrovým kĺbom</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Zlý krvný obeh</p>
                <p className="text-sm text-gray-700">Žilová nedostatočnosť, opuchy nôh</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Nezdravá strava</p>
                <p className="text-sm text-gray-700">Fast food na pumpe, žiadny čas na poriadne jedlo</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Únava očí</p>
                <p className="text-sm text-gray-700">Hodiny sledovania cesty, nočné svetlá, displeje</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Heart className="h-8 w-8 inline mr-2 text-primary" />
              2. Psychická záťaž: Život pod gilotínou hviezdičiek
            </h2>

            <p className="text-lg">
              Tvoj príjem nezávisí len od toho, koľko jazdíš. Závisí od toho, ako ťa hodnotia. A hodnotenie je často subjektívne, neférové a môže ťa zničiť.
            </p>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Realita hviezdičiek:</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded">
                  <p className="font-semibold mb-2">Scenár 1: Zápcha</p>
                  <p className="text-sm text-gray-700 mb-2">Stojíš v kolóne 20 minút. Zákazník nervózny. Dáš mu 3★: "Meškal."</p>
                  <p className="text-red-600 font-bold">→ Tvoj priemer klesá.</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <p className="font-semibold mb-2">Scenár 2: Cena</p>
                  <p className="text-sm text-gray-700 mb-2">Systém nastaví surge pricing. Zákazník: "Drahé! 2★"</p>
                  <p className="text-red-600 font-bold">→ Nie je to tvoja vina, ale ty ideš dole.</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <p className="font-semibold mb-2">Scenár 3: Odmietnutie</p>
                  <p className="text-sm text-gray-700 mb-2">Odmietneš opitého agresívneho pasažiera. On ťa nahlási za "nevhodné správanie".</p>
                  <p className="text-red-600 font-bold">→ Systém ťa zablokuje. Žiadny príjem.</p>
                </div>
              </div>
            </div>

            <p className="text-xl font-bold text-center my-4 p-6 bg-red-100 rounded-lg">
              Žiješ v neustálom strachu: Každá jazda môže byť tá, ktorá ti zničí rating.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              3. Bezpečnostné riziká: Najnebezpečnejšie povolanie v USA
            </h2>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Štatistiky z USA:</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">30-60×</p>
                  <p className="text-sm">vyššie riziko vraždy než priemer pracujúcich</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">82%</p>
                  <p className="text-sm">útokov sa stáva v noci</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">94%</p>
                  <p className="text-sm">útokov pochádza zvnútra vozidla</p>
                </div>
                <div className="bg-red-900/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold mb-2">80%</p>
                  <p className="text-sm">útokov prichádza zo sedadla za vodičom</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Riziká, ktoré vodiči denne čelia:</h3>

            <ul className="space-y-3 my-4">
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Lúpeže</strong> – Pasažier ťa môže ohroziť, ukradnúť príjem, zmizieť
              </li>
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Fyzické útoky</strong> – Opitý/agresívny zákazník ťa udrie, kopne, pľuje
              </li>
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Sexuálne obťažovanie</strong> – Nevhodné návrhy, dotýkanie, slovné obťažovanie
              </li>
              <li className="bg-red-50 p-4 rounded-lg">
                <strong>Falošné obvinenia</strong> – Zákazník tvrdí, že si sa správal nevhodne → okamžitá blokovanie
              </li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <TrendingDown className="h-8 w-8 inline mr-2 text-primary" />
              4. Finančný tlak: Zarábať = žiť pod tlakom
            </h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Rozklad výdavkov (mesačne):</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Provízia platformy (Bolt/Uber)</span>
                  <span className="font-bold text-red-600">-20% až -30%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Benzín</span>
                  <span className="font-bold text-red-600">-400€ až -600€</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Údržba, pneumatiky, opravy</span>
                  <span className="font-bold text-red-600">-150€ až -300€</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Poistenie, licencie</span>
                  <span className="font-bold text-red-600">-100€ až -200€</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded">
                  <span>Daňový odpočet auta</span>
                  <span className="font-bold text-red-600">-200€ až -400€</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-900 text-white rounded-lg">
                <p className="text-xl font-bold">= Z €3000 hrubého príjmu ti zostane €1200-1500 čistého.</p>
              </div>
            </div>

            <p className="text-lg">
              A to je pri 60-70 hodinách týždenne. Nie je to "ľahký výdělok".
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">5. Emocionálna izolácia: Nikto to nechápe</h2>

            <div className="bg-purple-50 p-6 rounded-lg my-4">
              <p className="text-lg mb-3">
                Povieš kamarátom, rodine: "Som vyčerpaný." Odpoveď: "No veď len sedíš v aute..."
              </p>

              <p className="font-semibold mb-3">Realita:</p>
              <ul className="space-y-2">
                <li>• Neustála koncentrácia (nehody, chodci, cyklistů, GPS)</li>
                <li>• Psychická záťaž (toxickí zákazníci, hodnotenia, stres)</li>
                <li>• Žiadny sociálny život (pracuješ večery, víkendy, sviatky)</li>
                <li>• Žiadna rodina (prídeš domov o 3:00, rodina spí)</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Poníženie a neúcta</h2>

            <p>Veľa ľudí na teba pozerá zhora. "Len taxikár." "Nemáš lepšiu prácu?" "Čo si nevyštudoval?"</p>

            <div className="bg-red-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Typické situácie:</h3>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Zákazník:</p>
                  <p className="italic text-gray-700">"Ty taxikári ste všetci rovnakí – okrádači."</p>
                </div>

                <div>
                  <p className="font-semibold">Zákazník:</p>
                  <p className="italic text-gray-700">"Nemáš lepšiu prácu?"</p>
                </div>

                <div>
                  <p className="font-semibold">Zákazník:</p>
                  <p className="italic text-gray-700">"Daj mi 5★, alebo ti dám 1★."</p>
                </div>
              </div>

              <p className="mt-4 text-gray-900">
                <strong>A ty musíš mlčať. Lebo ak odpovieš → zlé hodnotenie → menej príjmu.</strong>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">7. Najhoršie: Systém ťa neochráni</h2>

            <p className="text-lg">
              Platformy (Bolt, Uber) fungujú na princípe: <strong>"Zákazník má vždy pravdu."</strong>
            </p>

            <div className="bg-gray-900 text-white p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Príklady:</h3>

              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-2">1. Falošné obvinenie</p>
                  <p>Zákazník napíše: "Vodič sa správal nevhodne." Systém: Okamžitá blokovanie, žiadne preverenie.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">2. Neférové hodnotenie</p>
                  <p>Zákazník dá 1★ za zápchu. Systém: Tvoj priemer klesá, menej jázd.</p>
                </div>

                <div>
                  <p className="font-bold mb-2">3. Žiadna podpora</p>
                  <p>Nahlášaš incident. Odpoveď platformy: Automatický email, žiadna reálna pomoc.</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver: Prečo vodiči odchádzajú</h2>

            <p className="text-lg">
              Mnohí vodiči začnú s nadšením. "Flexibilný čas, slušný príjem, prečo nie?"
            </p>

            <p className="text-lg mt-4">
              Po 6 mesiacoch: Vyčerpaní, frustrovaní, vyhorení. Odídu.
            </p>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Dôvody odchodu:</h3>

              <ul className="space-y-2">
                <li>✓ Nízky reálny príjem (po odpočte nákladov)</li>
                <li>✓ Fyzická vyčerpanosť</li>
                <li>✓ Neustálý stres z hodnotení</li>
                <li>✓ Žiadna ochrana pred toxickými zákazníkmi</li>
                <li>✓ Žiadny sociálny život</li>
                <li>✓ Žiadna perspektíva rastu</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <p className="text-xl font-bold mb-3">Pre zákazníkov:</p>
              <p className="text-lg">
                Ak váš vodič vyzerá unavene, ak nechce rozprávať, ak reaguje defenzívne – teraz viete prečo. Nie je to osobné. Je to výsledok stovák hodín pod tlakom.
              </p>
            </div>

            <p className="text-xl font-bold text-center my-4">
              Rešpektujte vodičov. Oni robia prácu, ktorú väčšina ľudí nevydrží ani mesiac.
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
            articleTitle="Často kladené otázky o práci taxikára"
          />

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">Chcete vidieť komplexný sprievodca taxislužbami?</h3>
            <p className="text-center text-gray-700 mb-3">
              Prečítajte si všetko, čo potrebujete vedieť o taxi na Slovensku v roku 2025.
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
