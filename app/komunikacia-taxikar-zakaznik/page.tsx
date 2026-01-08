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
  title: 'Komunikácia medzi taxikárom a zákazníkom | TaxiNearMe.sk',
  description: 'Jasné pravidlá, slušnosť a hranice, ktoré by mali poznať obe strany.',
  keywords: ['komunikácia taxi', 'správanie v taxi', 'taxikár zákazník', 'slušnosť', 'taxislužby', 'pravidlá taxi'],
  openGraph: {
    title: 'Ako vyzerá dobrá komunikácia medzi taxikárom a zákazníkom',
    description: 'Jasné pravidlá, slušnosť a hranice, ktoré by mali poznať obe strany.',
    url: 'https://www.taxinearme.sk/komunikacia-taxikar-zakaznik',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/komunikacia.jpg',
      width: 1200,
      height: 630,
      alt: 'Komunikácia medzi taxikárom a zákazníkom'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Komunikácia medzi taxikárom a zákazníkom',
    description: 'Jasné pravidlá, slušnosť a hranice, ktoré by mali poznať obe strany.',
    images: ['https://www.taxinearme.sk/blog-images/komunikacia.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/komunikacia-taxikar-zakaznik',
    languages: {
      'sk': 'https://www.taxinearme.sk/komunikacia-taxikar-zakaznik',
      'x-default': 'https://www.taxinearme.sk/komunikacia-taxikar-zakaznik',
    },
  }
};

export default function KomunikaciaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Ako vyzerá dobrá komunikácia medzi taxikárom a zákazníkom"
        description="Jasné pravidlá, slušnosť a hranice, ktoré by mali poznať obe strany."
        url="https://www.taxinearme.sk/komunikacia-taxikar-zakaznik"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Komunikácia v taxi' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <MessageCircle className="h-2.5 w-2.5 inline mr-1" />
              Komunikácia
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Ako vyzerá dobrá komunikácia medzi taxikárom a zákazníkom (a ako vyzerá peklo)
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Jasné pravidlá, slušnosť a hranice, ktoré by mali poznať obe strany.
          </p>

          <ShareButton
            title="Komunikácia medzi taxikárom a zákazníkom"
          />
        </div>
      </section>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900 mb-0">
                Taxi je viac než len doprava z bodu A do B – je to krátky spoločný priestor dvoch cudzích ľudí. Môže to byť príjemná skúsenosť alebo peklo, záleží na oboch.
              </p>
            </div>

            <p className="text-sm leading-relaxed">
              Dobrá komunikácia medzi vodičom a zákazníkom môže premeniť obyčajnú jazdu na profesionálny zážitok, zatiaľ čo zlá komunikácia dokáže spojiť 10-minútovú cestu na nekonečnú tortúru. V tomto článku rozoberieme zlaté pravidlá, červené vlajky a právny rámec, ktorý by mal poznať každý, kto sadne do taxíka – či už za volant, alebo na zadné sedadlo.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">Zlaté pravidlá dobrej komunikácie</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Čo funguje: 5 pilierov úspešnej jazdy</h3>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                1. Jasné zadanie od začiatku
              </h4>

              <p className="mb-3">
                <strong>Zákazník:</strong> Hneď po nastúpení jasne povedz cieľ. Ak máš preferovanú trasu, spomeň to ihneď, nie po 5 minútach jazdy. Podľa britského etiketu inštitútu Debrett's by si mal cieľ oznámiť ešte pred nastúpením do vozidla.
              </p>

              <p className="mb-0">
                <strong>Taxikár:</strong> Profesionálni vodiči vedia odhadnúť náladu zákazníka do pár sekúnd – niekto chce rozhovor, niekto ticho. Čítaj telesnú reč. Slúchadlá = nechaj ho na pokoji.
              </p>
            </div>

            <div className="bg-purple-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                2. Rešpekt voči priestoru druhého
              </h4>

              <p className="mb-3">
                Kvalitné taxislužby trénujú vodičov rozpoznávať signály – ak pasažier je zahľadený do telefónu alebo pozerá von oknom, je to jasný odkaz pre ticho.
              </p>

              <p className="mb-0">
                <strong>Zákazník:</strong> Ak nechceš rozhovor, stačí zdvorilá, ale krátka odpoveď. Príklad: "Mal som dobrý večer, ďakujem" vs. "Mal som výborný večer, boli sme v novej čínskej reštaurácii..." – prvé ukončuje, druhé pozýva k ďalšej konverzácii.
              </p>
            </div>

            <div className="bg-yellow-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
                3. Profesionalita = peniaze
              </h4>

              <p className="mb-3">
                Vodič zo Slovenska pracujúci pre Bolt to vyjadruje jasne: "Človek, ktorý robí pre ľudí, si musí uvedomiť, že jeho správanie závisí od toho, či dostane tringelt, dobré hodnotenie a či bude mať aj naďalej zákazníkov".
              </p>

              <p className="mb-0">
                <strong>Taxikár:</strong> Tvoja plata závisí od hodnotení. Nebuď ten typ, čo tlačí politiku, náboženstvo alebo sa sťažuje 15 minút na život. Skúsení vodiči stavajú na tom, že vedia rýchlo prečítať pasažiera a prispôsobiť sa.
              </p>
            </div>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-red-600" />
                4. Bezpečnosť na prvom mieste
              </h4>

              <p className="mb-0">
                <strong>Obaja:</strong> Profesionálny vodič musí nastaviť bezpečnosť ako prioritu – dodržiavanie rýchlostných limitov, defenzívna jazda, žiadne telefonáty počas vedenia. Zákazník nemá právo požadovať nezákonné manévry ani pri "urgentnej situácii".
              </p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                5. Transparentnosť a férová hra
              </h4>

              <p className="mb-0">
                Cena by mala byť jasná vopred. Pri taxametrových jazdách informuj o alternatívnych trasách a ich dopadoch – "Diaľnica je rýchlejšia, ale je tam mýto 3 €, súhlasíte?"
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Červené vlajky: Kedy to ide do pekla
            </h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Neakceptovateľné správanie ZÁKAZNÍKA</h3>

            <div className="bg-red-100 border-l-4 border-red-600 p-6 mb-3">
              <h4 className="text-lg font-bold mb-3">Tvrdá hranica (vodič má právo ukončiť jazdu):</h4>

              <p className="mb-3">Podľa slovenského zákona o cestnej doprave môže vodič odmietnuť prepravu alebo ju ukončiť, ak:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Zákazník je agresívny alebo ozbrojený, alebo jeho správanie vzbudzuje obavy o zdravie vodiča či bezpečnosť prepravy</li>
                <li>Vzhľadom na stav cestujúceho hrozí znečistenie vozidla alebo obťažovanie vodiča počas jazdy</li>
                <li>Zákazník napriek upozorneniu fajčí, konzumuje jedlo a nápoje alebo manipuluje s vecami, ktoré môžu obmedziť výhľad vodiča</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg my-4">
              <h4 className="text-lg font-bold mb-3">Reálne problémy z praxe:</h4>

              <p className="mb-3">
                Opití zákazníci, najmä v piatok a sobotu medzi polnocou a 4:00 ráno, sú najčastejším zdrojom konfliktov. Austrálska štúdia ukázala, že viac ako polovica taxikárov identifikovala krčmy a nočné kluby ako hlavný zdroj agresívnych pasažierov, s konzumáciou alkoholu ako hlavným faktorom.
              </p>

              <p className="mb-0 font-semibold">
                <strong>Čo robiť pri napätej situácii:</strong><br />
                Vodič: Zostať v pohode, vyhni sa hádke, ak je to nutné, zastav na bezpečnom mieste a požiadaj zákazníka o opustenie vozidla. V krajnom prípade volaj políciu.
              </p>
            </div>

            <h3 className="text-lg font-bold mt-4 mb-2">Neakceptovateľné správanie VODIČA</h3>

            <div className="bg-red-100 border-l-4 border-red-600 p-6 mb-3">
              <h4 className="text-lg font-bold mb-3">Okamžité dôvody na sťažnosť:</h4>

              <ul className="list-disc pl-6 space-y-2">
                <li>Neustále telefonáty počas jazdy, ignorovanie požiadaviek na tichšie prostredie</li>
                <li>Nebezpečná jazda – prekračovanie rýchlosti, náhle brzdenie, agresívne akcelerácie</li>
                <li>Úmyselne dlhšia trasa na nafúknutie ceny</li>
                <li>Vnucovanie názorov na politiku, osobné problémy, obťažujúce komentáre</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h4 className="text-lg font-bold mb-3">Varovné signály podľa expertov:</h4>

              <p className="mb-0">
                Bezpečnostná štúdia pre taxikárov upozorňuje: 80% útokov prichádza zo sedadla priamo za vodičom. Profesionálny vodič si všíma rizikové správanie a udržiava vizuálny kontakt cez spätné zrkadlo – ak tvoj vodič nevidí dozadu alebo sa nechová opatrne, je to problém.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Slovenský právny rámec: Čo musíš vedieť</h2>

            <h3 className="text-lg font-bold mt-4 mb-2">Práva a povinnosti na Slovensku</h3>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-green-800">Vodič má povinnosť:</h4>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Prepraviť cestujúcich po najkratšej trase, ak si zákazník nepýta inú</li>
                  <li>Mať vo vozidle kompletné tarifné podmienky a prepravný poriadok a umožniť zákazníkovi nahliadnuť do nich</li>
                  <li>Vydať na požiadanie potvrdenie o vykonanej preprave obsahujúce dátum, trasu a sumu</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-blue-800">Vodič má právo odmietnuť:</h4>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Prepravu bez jasne stanoveného cieľa</li>
                  <li>Zákazníka s nadmernou batožinou, ktorá sa nezmestí</li>
                  <li>Zvieratá, ktoré vzhľadom na veľkosť, početnosť alebo správanie nie je možné bezpečne prepraviť</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg my-4">
              <h4 className="text-lg font-bold mb-3">Zákazník má právo:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vedieť cenu vopred (od roku 2019 nie je taxameter povinný, ak je cena dohodnutá cez aplikáciu)</li>
                <li>Požadovať jazdu po najkratšej trase, iná trasa len so súhlasom zákazníka</li>
                <li>Bezpečnú prepravu bez obáv o zdravie</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 italic my-4">
              Právny základ: Zákon č. 56/2012 Z.z. o cestnej doprave (vrátane noviel 2019)
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">Ako zvládnuť konflikt</h2>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pre vodičov:</h3>

              <p className="mb-3">
                Aktívne počúvanie a empatia sú kľúčom. Použite frázy ako <strong>"Rozumiem vašej frustrácii"</strong> na uznanie emócií pasažiera. Ak je cestujúci agresívny, zostať profesionálny, pripomenúť pravidlá (napr. "zákaz fajčenia") a vysvetliť, že vás operátor radí toto správanie netolorovať.
              </p>

              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold mb-2">✓ Osvedčený postup:</p>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Zachovaj pokoj a profesionálny tón</li>
                  <li>Uzni emócie zákazníka ("Chápem, že ste nahnevaný")</li>
                  <li>Jasne vymedz pravidlá a hranice</li>
                  <li>Ak situácia eskaluje → bezpečne zastav a požiadaj o opustenie vozidla</li>
                  <li>Zdokumentuj incident a nahláš platforme/operátorovi</li>
                </ol>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pre zákazníkov:</h3>

              <p className="mb-3">
                Ak vodič začne rozhovor na tému, s ktorou nesúhlasíš, použi potlačujúcu frázu: <strong>"Obávam sa, že s vami tam nesúhlasím, tak tú tému radšej nechajme"</strong>. Potom sa sústreď na telefón.
              </p>

              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold mb-2">✓ Ako elegantne ukončiť nechcený rozhovor:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>"Prepáčte, ale musím dokončiť niečo pracovné" + sústreď sa na telefón</li>
                  <li>"Mal som dlhý deň, potrebujem chvíľu ticha, dúfam že rozumiete"</li>
                  <li>Krátke, uzavreté odpovede bez nadväzovania na tému</li>
                  <li>Ak vodič pokračuje napriek signálom → po jazde nízke hodnotenie s komentárom</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver: Základná rovnica</h2>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-xl my-4">
              <div className="space-y-4">
                <p className="text-lg">
                  <strong className="text-primary">Taxikár:</strong> Tvoje správanie = tvoje hodnotenie = tvoj príjem. Skúsení vodiči stavajú na tom, že vedia rýchlo prečítať pasažiera a prispôsobiť sa.
                </p>

                <p className="text-lg">
                  <strong className="text-primary">Zákazník:</strong> Slušnosť nestojí nič, ale získaš s ňou lepší servis. Agresivita ťa nechá stáť na ulici.
                </p>

                <p className="text-lg">
                  <strong className="text-primary">Obaja:</strong> Taxi je viac než len doprava z bodu A do B – je to krátky spoločný priestor dvoch cudzích ľudí. Môže to byť príjemná skúsenosť alebo peklo, záleží na oboch.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg my-4 border-l-4 border-gray-400">
              <p className="text-lg font-semibold mb-2">
                Hranice sú jednoduché: vzájomný rešpekt, bezpečnosť a transparentnosť.
              </p>
              <p className="mb-0 text-gray-700">
                Všetko ostatné sa dá vyriešiť.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Zdroje a fakty</h3>

              <p className="text-sm text-gray-700 mb-3">Tento článok čerpal z:</p>

              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <p className="font-semibold mb-1">Medzinárodné štúdie:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Taxi-Point UK (2024) – štúdia o komunikačných zručnostiach taxikárov</li>
                    <li>Debrett's Taxi Etiquette (2024) – britské štandardy správania</li>
                    <li>Journal of Current Psychology (2023) – systematické preskúmanie agresie pasažierov v doprave</li>
                    <li>Austrálsky inštitút kriminológie (1988) – agresívne správanie v taxislužbách</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">Slovenské zdroje:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Zákon č. 56/2012 Z.z. o cestnej doprave (vrátane noviel 2019)</li>
                    <li>AK JUDr. Martin Bajužík – právna analýza podmienok vodičov</li>
                    <li>Rozhovor s vodičom Bolt Slovensko (2022)</li>
                    <li>TopSpeed.sk – zmeny v legislatíve taxislužieb</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">Praktické príručky:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>UK Taxi Insurer – bezpečnostné a komunikačné protokoly</li>
                    <li>Zoom Taxi – profesionalita a zákaznícky servis</li>
                    <li>001 Taxis – etiketa vodičov a boundary</li>
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
            articleTitle="Často kladené otázky o komunikácii"
          />

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-2xl font-bold mb-3 text-center">Chcete vidieť komplexný sprievodca?</h3>
            <p className="text-center text-gray-700 mb-3">
              Zistite viac o všetkých aspektoch taxislužieb na Slovensku
            </p>
            <div className="flex justify-center">
              <Link href="/komplexny-sprievodca-taxi">
                <Button size="lg">Zobraziť sprievodcu</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
