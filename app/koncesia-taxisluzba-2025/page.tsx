import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Calendar, FileText, CheckCircle, AlertTriangle, Car, User, CreditCard, ArrowLeft, Scale, Building2, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Koncesia na taxislužbu 2025 - Kompletný návod | TaxiNearMe.sk',
  description: 'Ako získať koncesiu na taxislužbu na Slovensku. Podmienky, poplatky 30€, postup krok za krokom, potrebné dokumenty.',
  keywords: ['koncesia taxislužba', 'koncesia taxi', 'taxislužba slovensko', 'licencia taxi', 'preukaz vodiča taxislužby', 'ako získať koncesiu', 'taxislužba 2025', 'bolt uber koncesia'],
  openGraph: {
    title: 'Ako získať koncesiu na taxislužbu v roku 2025 (Slovensko)',
    description: 'Kompletný návod ako získať koncesiu na taxislužbu na Slovensku v roku 2025. Podmienky, poplatky, postup krok za krokom.',
    url: 'https://www.taxinearme.sk/koncesia-taxisluzba-2025',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog/koncesia-taxisluzba-2025.jpg',
      width: 1200,
      height: 630,
      alt: 'Koncesia na taxislužbu 2025'
    }],
    publishedTime: '2025-12-05',
    modifiedTime: '2025-12-05'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Ako získať koncesiu na taxislužbu v roku 2025 (Slovensko)',
    description: 'Kompletný návod ako získať koncesiu na taxislužbu na Slovensku v roku 2025.',
    images: ['https://www.taxinearme.sk/blog/koncesia-taxisluzba-2025.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/koncesia-taxisluzba-2025',
    languages: {
      'sk': 'https://www.taxinearme.sk/koncesia-taxisluzba-2025',
      'x-default': 'https://www.taxinearme.sk/koncesia-taxisluzba-2025',
    },
  }
};

export default function KoncesiaTaxisluzbaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Ako získať koncesiu na taxislužbu v roku 2025 (Slovensko)"
        description="Kompletný návod ako získať koncesiu na taxislužbu na Slovensku v roku 2025. Podmienky, poplatky, postup krok za krokom."
        url="https://www.taxinearme.sk/koncesia-taxisluzba-2025"
        publishedTime="2025-12-05"
        modifiedTime="2025-12-05"
        imageUrl="https://www.taxinearme.sk/blog/koncesia-taxisluzba-2025.jpg"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Koncesia na taxislužbu 2025' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Scale className="h-2.5 w-2.5 inline mr-1" />
              Legislatíva
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              5. december 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Ako získať koncesiu na taxislužbu v roku 2025 (Slovensko)
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Kompletný návod ako získať koncesiu na taxislužbu na Slovensku. Podmienky, poplatky, postup krok za krokom, potrebné dokumenty.
          </p>

          <ShareButton
            title="Ako získať koncesiu na taxislužbu v roku 2025 (Slovensko)"
          />
        </div>
      </section>
      </div>

      {/* Hero image */}
      <div className="container mx-auto max-w-4xl px-3 md:px-6 -mt-4">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/blog/koncesia-taxisluzba-2025.jpg"
            alt="Koncesia na taxislužbu - ilustračný obrázok"
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

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Na prevádzkovanie taxislužby nestačí len živnostenský list. Potrebná je <strong>koncesia na taxislužbu</strong> podľa § 27 zákona o cestnej doprave. Tento článok vás prevedie celým procesom získania koncesie v roku 2025.
              </p>
            </div>

            {/* 1. Právny rámec */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" />
              1. Právny rámec taxislužby v roku 2025
            </h2>

            <p>Podnikanie v taxislužbe na Slovensku upravuje najmä:</p>

            <ul className="space-y-2 my-4">
              <li><strong>Zákon č. 56/2012 Z. z. o cestnej doprave</strong>, druhá časť – Prevádzkovanie cestnej dopravy a taxislužby (§ 26 až § 30), v znení novely č. 162/2024 Z. z.</li>
              <li>Súvisiace vykonávacie predpisy a <strong>zákon č. 145/1995 Z. z. o správnych poplatkoch</strong></li>
              <li>Všeobecne záväzné nariadenia jednotlivých miest a obcí (tarifa, označenie vozidiel, stanovištia, miestne pravidlá)</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
              <p className="font-semibold text-gray-900">
                <AlertTriangle className="h-5 w-5 inline mr-2 text-yellow-600" />
                Taxislužbou je preprava osôb vozidlami s obsaditeľnosťou najviac 9 osôb vrátane vodiča, vykonávaná za odplatu ako podnikanie. Ak takúto prepravu robíte sústavne za peniaze, <strong>zo zákona ste taxislužba</strong>, aj keď používate aplikáciu typu Bolt či Uber.
              </p>
            </div>

            {/* 2. Kto musí mať koncesiu */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <User className="h-7 w-7 text-primary" />
              2. Kto musí mať koncesiu na taxislužbu
            </h2>

            <p>Koncesiu musí mať každý podnikateľ (fyzická osoba – živnostník alebo právnická osoba), ktorý:</p>

            <ul className="space-y-2 my-4">
              <li>Za odplatu prepravuje osoby vozidlom s max. 9 miestami vrátane vodiča v rámci podnikania</li>
              <li>Ponúka tieto služby verejnosti – na ulici, cez telefón, web alebo digitálnu platformu (Bolt, Uber a pod.)</li>
            </ul>

            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <p className="font-semibold mb-3">Digitálne platformy len sprostredkujú objednávku, ale samotná preprava je právne taxislužba. Vodič musí mať:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> <strong>Koncesiu</strong> (alebo jazdiť pre niekoho, kto ju má)</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> <strong>Preukaz vodiča vozidla taxislužby</strong></li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> <strong>Vozidlo zaradené ako vozidlo taxislužby</strong> s osvedčením</li>
              </ul>
            </div>

            {/* 3. Kto koncesiu vydáva */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              3. Kto koncesiu vydáva a na ako dlho
            </h2>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-bold text-lg">Okresný úrad</p>
                <p className="text-sm text-gray-600">v sídle kraja</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-bold text-lg">10 rokov</p>
                <p className="text-sm text-gray-600">platnosť koncesie</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="font-bold text-lg">Neprenosná</p>
                <p className="text-sm text-gray-600">ani pri predaji</p>
              </div>
            </div>

            {/* 4. Základné podmienky */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CheckCircle className="h-7 w-7 text-primary" />
              4. Základné podmienky na udelenie koncesie (§ 27)
            </h2>

            <p>Podľa § 27 zákona o cestnej doprave možno koncesiu udeliť len žiadateľovi, ktorý spĺňa súčasne všetky tieto podmienky:</p>

            <div className="space-y-4 my-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">1. Pobyt / sídlo v EÚ</h4>
                <ul className="text-sm space-y-1">
                  <li>• Fyzická osoba: trvalý pobyt alebo miesto podnikania na území SR alebo iného členského štátu EÚ</li>
                  <li>• Právnická osoba: sídlo na území SR alebo iného členského štátu</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">2. Spôsobilosť na právne úkony</h4>
                <p className="text-sm">Typicky splnené po dovŕšení 18 rokov, bez pozbavenia či obmedzenia spôsobilosti súdom.</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">3. Bezúhonnosť</h4>
                <p className="text-sm">Za bezúhonného sa nepovažuje osoba, ktorá bola právoplatne odsúdená za úmyselné trestné činy alebo má uložený zákaz činnosti. Preukazuje sa <strong>výpisom z registra trestov</strong> nie starším ako 3 mesiace.</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">4. Vozidlo taxislužby</h4>
                <p className="text-sm">Žiadateľ musí mať aspoň jedno vlastné, prenajaté, lízingové alebo vypožičané vozidlo, ktoré spĺňa podmienky vozidla taxislužby.</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2 text-red-700">5. Od roku 2025 – vozidlo musí byť evidované na Slovensku</h4>
                <p className="text-sm">Od <strong>1. januára 2025</strong> možno taxislužbu prevádzkovať len vozidlami, ktoré sú <strong>evidované v Slovenskej republike</strong>. Táto povinnosť vyplýva z novely zákona č. 56/2012 Z. z. účinnej od 1. 8. 2024.</p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
              <p className="font-semibold text-green-800">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                <strong>Dobrá správa:</strong> Po novele zákona účinnej od 1. 4. 2019 sa požiadavky na finančnú spoľahlivosť a odbornú spôsobilosť nevzťahujú na taxislužbu (na rozdiel od nákladnej a linkovej osobnej dopravy).
              </p>
            </div>

            {/* 5. Preukaz vodiča */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              5. Preukaz vodiča taxislužby
            </h2>

            <p>Taxislužbu môže vykonávať len vodič, ktorý má <strong>preukaz vodiča vozidla taxislužby</strong>.</p>

            <p className="mt-4">Preukaz vodiča môže získať osoba, ktorá:</p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Vodičské oprávnenie</p>
                  <p className="text-sm text-gray-600">Skupina B pre osobné vozidlá</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Plná spôsobilosť</p>
                  <p className="text-sm text-gray-600">Na právne úkony</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Zdravotná spôsobilosť</p>
                  <p className="text-sm text-gray-600">Lekárske potvrdenie (max. 3 mesiace staré)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Psychická spôsobilosť</p>
                  <p className="text-sm text-gray-600">Psychologické vyšetrenie</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg md:col-span-2">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Bezúhonnosť</p>
                  <p className="text-sm text-gray-600">Výpis z registra trestov</p>
                </div>
              </div>
            </div>

            {/* 6. Poplatky */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-primary" />
              6. Poplatky v roku 2025
            </h2>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-6">
              <h3 className="text-xl font-bold mb-4">Prehľad správnych poplatkov</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Udelenie koncesie na taxislužbu</span>
                  <span className="font-bold text-xl">30 €</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Zmeny v koncesii (dopĺňanie vozidiel)</span>
                  <span className="font-bold text-xl">10 €</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Preukaz vodiča taxislužby</span>
                  <span className="font-bold text-xl">50 €</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-yellow-400">Urýchlené rozhodnutie (5 dní)</span>
                  <span className="font-bold text-xl text-yellow-400">3× poplatok</span>
                </div>
              </div>
            </div>

            {/* 7. Postup krok za krokom */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              7. Postup krok za krokom
            </h2>

            <div className="space-y-6 my-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-bold text-lg">Zvoľte si formu podnikania</h4>
                  <p className="text-gray-600">Živnostník (FO) alebo spoločnosť s ručením obmedzeným (s. r. o.). Samotná živnosť bez koncesie už nestačí – po zmenách účinných od 1. 4. 2019 je koncesia povinná.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-bold text-lg">Pripravte si vozidlo</h4>
                  <p className="text-gray-600">Kategória max. 9 sedadiel, platná STK/EK, PZP, od 1.1.2025 musí byť registrované na Slovensku. Mestá môžu mať ďalšie lokálne požiadavky (farba, strešné svietidlo, vek).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-bold text-lg">Vypracujte prepravný poriadok</h4>
                  <p className="text-gray-600">Podmienky uzatvárania zmluvy, práva a povinnosti, spôsob platenia, tarifné podmienky, reklamácie. Prepravný poriadok musíte zverejniť.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-bold text-lg">Vyplňte žiadosť o udelenie koncesie</h4>
                  <p className="text-gray-600">Použite aktuálne tlačivo z webu vášho okresného úradu alebo z portálu slovensko.sk/JISCD.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <h4 className="font-bold text-lg">Priložte povinné prílohy</h4>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• Výpis z obchodného / živnostenského registra (max. 3 mesiace)</li>
                    <li>• Výpis z registra trestov</li>
                    <li>• Doklady k vozidlám (osvedčenie o evidencii, zmluva o prenájme/lízingu, PZP)</li>
                    <li>• Prepravný poriadok dopravcu</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">6</div>
                <div>
                  <h4 className="font-bold text-lg">Zaplaťte správny poplatok</h4>
                  <p className="text-gray-600">30 € za udelenie koncesie. Poplatok sa platí cez eKolok, kolkovou známkou alebo iným spôsobom podľa okresného úradu.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">7</div>
                <div>
                  <h4 className="font-bold text-lg">Konanie na okresnom úrade</h4>
                  <p className="text-gray-600">Štandardná lehota 30 dní, pri zložitejších prípadoch 60 dní. Úrad vydá rozhodnutie o udelení koncesie a koncesnú listinu.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">8</div>
                <div>
                  <h4 className="font-bold text-lg">Osvedčenie vozidla a označenie</h4>
                  <p className="text-gray-600">Požiadajte o osvedčenie vozidla taxislužby. Vozidlo označte podľa zákona (obchodné meno, strešné svietidlo TAXI, tarifné sadzby, taxameter).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">9</div>
                <div>
                  <h4 className="font-bold text-lg">Preukaz vodiča taxislužby</h4>
                  <p className="text-gray-600">Podanie žiadosti na okresnom úrade + vodičský preukaz, výpis z registra trestov, lekársky a psychologický posudok, fotografia. Poplatok cca 50 €.</p>
                </div>
              </div>
            </div>

            {/* 8. Čo sa mení v 2025 */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-primary" />
              8. Čo sa mení pre taxislužby v roku 2025
            </h2>

            <div className="space-y-4 my-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <h4 className="font-bold text-red-800">Vozidlá musia byť slovenskej evidencie</h4>
                <p className="text-sm text-red-700">Jazdiť s českým či poľským číslom v slovenskej taxislužbe už nebude legálne od 1.1.2025.</p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                <h4 className="font-bold text-orange-800">Silnejší tlak na kontrolu digitálnych platforiem</h4>
                <p className="text-sm text-orange-700">Štát dôslednejšie vyžaduje, aby vodiči cez aplikácie jazdili len s koncesiou, preukazom vodiča a riadne označeným vozidlom.</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h4 className="font-bold text-yellow-800">Výrazné pokuty</h4>
                <p className="text-sm text-yellow-700">Pri porušovaní pravidiel hrozia pokuty od 100 do 15 000 €, pri opakovanom porušení až do 50 000 € a odobratie koncesie.</p>
              </div>
            </div>

            {/* 9. Checklist */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CheckCircle className="h-7 w-7 text-primary" />
              9. Stručný checklist – čo musíte mať
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg my-6">
              <h3 className="font-bold text-lg mb-4">Aby ste legálne jazdili taxi v roku 2025:</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Forma podnikania</strong> – živnosť alebo s. r. o. (IČO)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Koncesia na taxislužbu</strong> – udelená okresným úradom na 10 rokov</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Vozidlo taxislužby</strong> – evidované v SR, zapísané v koncesii, s osvedčením</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Prepravný poriadok</strong> – vypracovaný a zverejnený</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Preukaz vodiča taxislužby</strong> pre každého vodiča</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Správne poplatky zaplatené</strong> (30 € koncesia, 50 € preukaz)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Bezúhonnosť, zdravotná a psychická spôsobilosť</strong></span>
                </label>
              </div>
            </div>

            <div className="bg-red-100 border border-red-300 p-6 rounded-lg my-6">
              <p className="font-bold text-red-800 text-lg">
                <AlertTriangle className="h-6 w-6 inline mr-2" />
                Ak niektorý z týchto bodov nemáte, z právneho hľadiska <strong>nejdete legálne taxi</strong>, aj keby ste mali živnosť a jazdili len „pre aplikáciu" alebo „pre známych".
              </p>
            </div>

            {/* Zdroje */}
            <h2 className="text-2xl font-bold mt-12 mb-4">Zdroje a odkazy</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="https://static.slov-lex.sk/static/SK/ZZ/2012/56/20240101.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zákon č. 56/2012 Z. z. o cestnej doprave – Slov-Lex</a></li>
              <li><a href="https://da.mindop.sk/ministerstvo/doprava/cestna-doprava-a-cestna-infrastruktura/cestna-doprava/taxisluzba" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ministerstvo dopravy SR – Taxislužba</a></li>
              <li><a href="https://www.jiscd.sk/odborne-sposobilosti/sluzby-v-oblasti-taxi/koncesia-na-taxisluzbu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">JISCD – Koncesia na taxislužbu</a></li>
              <li><a href="https://www.minv.sk/?subor=327198&vzory-ziadosti-taxi-a-podnikanie-v-cestnej-doprave=" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ministerstvo vnútra SR – Správne poplatky TAXI</a></li>
              <li><a href="https://www.akmv.sk/licencia-na-taxisluzbu-ako-ju-vybavit-postup-a-poplatky/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AKMV – Licencia na taxislužbu – postup a poplatky</a></li>
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
        articleSlug="koncesia-taxisluzba-2025"
        articleTitle="Koncesia na taxislužbu 2025"
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
