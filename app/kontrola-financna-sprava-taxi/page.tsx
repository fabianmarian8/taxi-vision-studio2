import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Calendar, FileText, CheckCircle, AlertTriangle, Shield, User, CreditCard, ArrowLeft, Scale, Building2, Car, Receipt, BadgeCheck, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Čo kontroluje finančná správa pri taxi - eKasa, doklady, pokuty | TaxiNearMe.sk',
  description: 'Kompletný prehľad kontrol taxislužieb finančnou správou v roku 2025. eKasa, doklady vodiča, označenie vozidla, sankcie až 30 000€ pri opakovanom porušení.',
  keywords: ['kontrola taxi', 'finančná správa taxi', 'ekasa taxi', 'pokuty taxi', 'kontrola taxislužby', 'akcia taxi 2025', 'daňová kontrola taxi'],
  openGraph: {
    title: 'Čo môže kontrolovať finančná správa, keď zastaví taxi',
    description: 'Kompletný prehľad kontrol taxislužieb finančnou správou v roku 2025. eKasa, doklady, sankcie.',
    url: 'https://www.taxinearme.sk/kontrola-financna-sprava-taxi',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog/kontrola-financna-sprava-taxi.jpg',
      width: 1200,
      height: 630,
      alt: 'Kontrola finančnej správy - taxi'
    }],
    publishedTime: '2025-12-05',
    modifiedTime: '2025-12-05'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Čo môže kontrolovať finančná správa, keď zastaví taxi',
    description: 'Kompletný prehľad kontrol taxislužieb finančnou správou v roku 2025.',
    images: ['https://www.taxinearme.sk/blog/kontrola-financna-sprava-taxi.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/kontrola-financna-sprava-taxi',
    languages: {
      'sk': 'https://www.taxinearme.sk/kontrola-financna-sprava-taxi',
      'x-default': 'https://www.taxinearme.sk/kontrola-financna-sprava-taxi',
    },
  }
};

export default function KontrolaFinancnaSpravaTaxiPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Čo môže kontrolovať finančná správa, keď zastaví taxi"
        description="Kompletný prehľad kontrol taxislužieb finančnou správou v roku 2025. eKasa, doklady vodiča, označenie vozidla, sankcie."
        url="https://www.taxinearme.sk/kontrola-financna-sprava-taxi"
        publishedTime="2025-12-05"
        modifiedTime="2025-12-05"
        imageUrl="https://www.taxinearme.sk/blog/kontrola-financna-sprava-taxi.jpg"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Kontrola finančnej správy - taxi' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold">
              <Shield className="h-2.5 w-2.5 inline mr-1" />
              Kontroly
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              5. december 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Čo môže kontrolovať finančná správa, keď zastaví taxi
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Kompletný prehľad kontrol taxislužieb v roku 2025. eKasa, doklady, vozidlo, sankcie až 30 000€.
          </p>

          <ShareButton
            title="Čo môže kontrolovať finančná správa, keď zastaví taxi"
          />
        </div>
      </section>
      </div>

      {/* Hero image */}
      <div className="container mx-auto max-w-4xl px-3 md:px-6 -mt-4">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/blog/kontrola-financna-sprava-taxi.jpg"
            alt="Kontrola finančnej správy - ilustračný obrázok"
            width={1200}
            height={630}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>

      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            {/* Úvod */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                <AlertTriangle className="h-5 w-5 inline mr-2 text-red-600" />
                Kontroly taxislužieb zo strany finančnej správy sú v roku 2025 výrazne zintenzívnené. Podľa oficiálnych údajov až <strong>86 % kontrolovaných taxikárov porušilo zákonné povinnosti</strong> a pokuty dosiahli stovky tisíc eur.
              </p>
            </div>

            {/* 1. Kto vykonáva kontrolu */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Shield className="h-7 w-7 text-red-600" />
              1. Kto vykonáva kontrolu a akým spôsobom
            </h2>

            <h3 className="text-lg font-bold mt-6 mb-3">Subjekty vykonávajúce kontrolu</h3>

            <p>V teréne sa na kontrolách taxislužieb podieľajú:</p>
            <ul className="space-y-2 my-4">
              <li>Príslušníci <strong>finančnej správy</strong> (daňové a colné orgány)</li>
              <li>Často v spolupráci s <strong>Policajným zborom</strong></li>
            </ul>

            <p>Polícia rieši dopravné otázky (vedenie vozidla, technický stav), finančná správa sa sústreďuje na:</p>
            <ul className="space-y-2 my-4">
              <li>Plnenie daňových povinností</li>
              <li>Dodržiavanie povinností pri <strong>evidencii tržieb v systéme eKasa</strong></li>
              <li>Vybrané povinnosti podľa <a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2012/56/20220521" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">zákona č. 56/2012 Z. z. o cestnej doprave</a></li>
            </ul>

            <h3 className="text-lg font-bold mt-6 mb-3">Spôsoby vykonania kontroly</h3>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Mystery shopping</h4>
                <p className="text-sm">Kontrolóri nastúpia ako bežní zákazníci, absolvujú jazdu a zaplatia. Sledujú, či je tržba zaevidovaná v eKase a či je vydaný doklad. Po skončení sa preukážu služobnými preukazmi.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Otvorená cestná kontrola</h4>
                <p className="text-sm">Vodič je zastavený na stanovišti alebo počas jazdy (často spolu s políciou). Kontrolóri sa preukážu, vyžiadajú doklady a preveria eKasu aj oprávnenia.</p>
              </div>
            </div>

            {/* 2. eKasa */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Receipt className="h-7 w-7 text-red-600" />
              2. Hlavný predmet kontroly: eKasa a evidencia tržieb
            </h2>

            <p>Najdôležitejšou oblasťou kontroly taxislužieb je <strong>evidovanie tržieb v systéme eKasa</strong> podľa <a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2008/289/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">zákona č. 289/2008 Z. z.</a></p>

            <div className="bg-red-100 border border-red-300 p-4 rounded-lg my-6">
              <p className="font-bold text-red-800">
                <XCircle className="h-5 w-5 inline mr-2" />
                Najčastejším porušením je <strong>neevidovanie prijatej tržby</strong>!
              </p>
            </div>

            <h3 className="text-lg font-bold mt-6 mb-3">Čo kontrolór preverí pri eKase</h3>

            <div className="space-y-3 my-6">
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Existencia a registrácia pokladnice</p>
                  <p className="text-sm text-gray-600">Či je vo vozidle ORP alebo VRP, či je riadne zaregistrovaná</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Funkčnosť a pripojenie</p>
                  <p className="text-sm text-gray-600">Či je zariadenie zapnuté a schopné odosielať dáta na servery FS</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Zaevidovanie konkrétnej tržby</p>
                  <p className="text-sm text-gray-600">Či je tržba za jazdu zaevidovaná, či bol vydaný doklad</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Postup pri poruche</p>
                  <p className="text-sm text-gray-600">Či podnikateľ správne používa paragóny a následne ich zaeviduje</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Súlad hotovosti s evidenciou</p>
                  <p className="text-sm text-gray-600">Porovnanie hotovosti s dennou uzávierkou a evidenciou tržieb</p>
                </div>
              </div>
            </div>

            {/* 3. Doklady vodiča */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <User className="h-7 w-7 text-red-600" />
              3. Doklady vodiča taxislužby
            </h2>

            <p>Vodič musí na požiadanie predložiť:</p>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                <p className="font-bold">Občiansky preukaz</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <Car className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                <p className="font-bold">Vodičský preukaz</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <BadgeCheck className="h-8 w-8 mx-auto mb-2 text-yellow-700" />
                <p className="font-bold">Preukaz vodiča taxislužby</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Podrobnosti o preukaze vodiča: <a href="https://www.jiscd.sk/odborne-sposobilosti/sluzby-v-oblasti-taxi/preukaz-vodica-vozidla-taxisluzby/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">JISCD.sk</a>
            </p>

            {/* 4. Doklady k vozidlu */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Car className="h-7 w-7 text-red-600" />
              4. Povinnosti a doklady k vozidlu taxislužby
            </h2>

            <div className="space-y-4 my-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">Osvedčenie o evidencii vozidla</h4>
                <p className="text-sm">Overenie údajov o vozidle (EČV, VIN, kategória vozidla)</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">Oprávnenie používať vozidlo ako taxi</h4>
                <p className="text-sm">Zápis alebo povolenie, prípadne zmluva (leasing, nájom)</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">Označenie vozidla</h4>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• Obchodné meno prevádzkovateľa</li>
                  <li>• Strešné označenie „TAXI"</li>
                  <li>• Viditeľne umiestnený cenník</li>
                  <li>• Dostupný prepravný poriadok</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">Taxameter</h4>
                <p className="text-sm">Ak sa používa - či sú tarify v súlade s cenníkom a či je overený</p>
              </div>
            </div>

            {/* 5. Podnikateľské doklady */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <FileText className="h-7 w-7 text-red-600" />
              5. Podnikateľské a daňové doklady
            </h2>

            <p>Kontrolóri môžu vyžiadať:</p>

            <ul className="space-y-2 my-4">
              <li><strong>Oprávnenie na podnikanie</strong> - živnostenské oprávnenie / koncesia na taxislužbu</li>
              <li><strong>Daňová registrácia</strong> - DIČ, IČ DPH (ak je platiteľom)</li>
              <li><strong>Evidencie jázd a tržieb</strong> - kniha jázd, prehľad tržieb</li>
              <li><strong>Pri zamestnancoch</strong> - pracovnú zmluvu alebo inú zmluvu s prevádzkovateľom</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
              <p className="text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2 text-yellow-600" />
                Finančná správa upozorňuje, že časť taxikárov vykazuje minimálne alebo nulové príjmy, hoci pri kontrolách je zjavné, že taxislužbu aktívne vykonávajú.
              </p>
            </div>

            {/* 6. Sankcie */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Scale className="h-7 w-7 text-red-600" />
              6. Sankcie a rast pokút pri opakovaných porušeniach
            </h2>

            <h3 className="text-lg font-bold mt-6 mb-3">Základné rozpätie pokút</h3>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-6">
              <h4 className="text-xl font-bold mb-4">Prehľad pokút za porušenie eKasa</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Typické rozpätie pri neevidovaní tržby</span>
                  <span className="font-bold text-xl">500 - 30 000 €</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Najnižšia pokuta v akcii "Taxi" 2025</span>
                  <span className="font-bold text-xl">150 €</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Najvyššia pokuta v akcii "Taxi" 2025</span>
                  <span className="font-bold text-xl">3 000 €</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-yellow-400">Celkový objem pokút (jan-okt 2025)</span>
                  <span className="font-bold text-xl text-yellow-400">84 950 €</span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-6 mb-3">Opakované porušenia - čo hrozí?</h3>

            <div className="bg-red-50 border border-red-200 p-6 rounded-lg my-6">
              <h4 className="font-bold text-lg mb-3 text-red-800">Pri opakovanom porušení:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Vyššia pokuta</strong> - bližšie k hornej hranici, teoreticky až 30 000 €</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Zákaz predaja alebo poskytovania služby</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Návrh na zrušenie živnosti</strong> pri systematickom porušovaní</span>
                </li>
              </ul>
            </div>

            <p>
              Od 1. 1. 2024 bola novelizovaná úprava sankcií - tzv. „druhá šanca". Pri prvom porušení môže byť miernejší režim, ale pri opakovaných porušeniach sa sankcionovanie <strong>sprísňuje</strong>.
            </p>

            {/* 7. Nesúčinnosť */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-red-600" />
              7. Nesúčinnosť pri kontrole
            </h2>

            <p>Sankcie nehrozia len za samotné porušenie, ale aj za:</p>

            <ul className="space-y-2 my-4">
              <li>• Nepredloženie požadovaných dokladov</li>
              <li>• Marenie výkonu kontroly</li>
              <li>• Odmietnutie súčinnosti</li>
            </ul>

            <p>
              <a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2009/563/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Daňový poriadok</a> umožňuje uložiť samostatné pokuty za nesplnenie povinnosti nepeňažnej povahy.
            </p>

            {/* 8. Checklist */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CheckCircle className="h-7 w-7 text-green-600" />
              8. Praktický checklist - čo mať v poriadku
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg my-6">
              <h3 className="font-bold text-lg mb-4">Pre zníženie rizika sankcií mať pripravené:</h3>

              <h4 className="font-bold mt-4 mb-2">Doklady vodiča</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Občiansky preukaz</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Vodičský preukaz</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Preukaz vodiča vozidla taxislužby</span>
                </label>
              </div>

              <h4 className="font-bold mt-4 mb-2">Doklady k vozidlu</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Osvedčenie o evidencii vozidla</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Oprávnenie používať vozidlo ako taxi</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Označenie TAXI, cenník, prepravný poriadok</span>
                </label>
              </div>

              <h4 className="font-bold mt-4 mb-2">eKasa</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Funkčná pokladnica eKasa klient (ORP/VRP)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Internetové pripojenie</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Vydávať doklad pri každej platbe</span>
                </label>
              </div>

              <h4 className="font-bold mt-4 mb-2">Podnikateľské doklady</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Živnostenské oprávnenie / koncesia</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Evidencie jázd a tržieb</span>
                </label>
              </div>
            </div>

            {/* 9. Zhrnutie */}
            <h2 className="text-2xl font-bold mt-12 mb-4">9. Zhrnutie</h2>

            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <p className="text-lg">
                Finančná správa v roku 2025 otvorene komunikuje, že <strong>taxislužby patria medzi rizikové segmenty</strong> z hľadiska evidencie tržieb. Podiel kontrol, pri ktorých zistila porušenia, je extrémne vysoký.
              </p>
              <p className="mt-4">
                Pre vodičov a prevádzkovateľov to znamená:
              </p>
              <ul className="mt-2 space-y-1">
                <li>• <strong>eKasa a evidencia každej tržby</strong> sú absolútny základ</li>
                <li>• Formálne náležitosti vozidla a vodiča nesmú byť zanedbané</li>
                <li>• Pri opakovaných porušeniach hrozí <strong>zákaz činnosti či zrušenie živnosti</strong></li>
              </ul>
            </div>

            {/* Zdroje */}
            <h2 className="text-2xl font-bold mt-12 mb-4">Zdroje a legislatíva</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.financnasprava.sk/sk/pre-media/novinky/archiv-noviniek/detail-novinky/_taxi-ts/bc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finančná správa SR – 86% taxikárov porušilo zákon (14.10.2025)</a></li>
              <li><a href="https://www.financnasprava.sk/sk/pre-media/novinky/archiv-noviniek/detail-novinky/_akcia-taxi-ts/bc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finančná správa SR – Kontrolná akcia Taxi (14.11.2025)</a></li>
              <li><a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2008/289/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zákon č. 289/2008 Z. z. o používaní elektronickej registračnej pokladnice</a></li>
              <li><a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2009/563/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zákon č. 563/2009 Z. z. o správe daní (daňový poriadok)</a></li>
              <li><a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2012/56/20220521" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zákon č. 56/2012 Z. z. o cestnej doprave</a></li>
              <li><a href="https://www.financnasprava.sk/sk/pre-media/novinky/archiv-noviniek/detail-novinky/_kontrol-akcia-navrat2-ts/bc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finančná správa SR – Kontrolná akcia „Návrat 2"</a></li>
            </ul>

            {/* Autor článku */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">O autorovi</h3>
              <ArticleAuthor variant="card" showBio />
            </div>

          </article>
        </div>
      </section>

      {/* FAQ */}
      <ArticleFAQ
        articleSlug="kontrola-financna-sprava-taxi"
        articleTitle="Kontrola finančnou správou - Taxi"
      />

      {/* Back button */}
      <section className="py-8 px-3 md:px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť na hlavnú stránku
          </Link>
        </div>
      </section>

    </div>
  );
}
