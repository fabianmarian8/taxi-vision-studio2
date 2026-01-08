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
  title: 'Koncese na taxislužbu 2025 - Kompletní návod | TaxiNearMe.cz',
  description: 'Jak získat koncesi na taxislužbu v Česku. Podmínky, poplatky, postup krok za krokem, potřebné dokumenty.',
  keywords: ['koncese taxislužba', 'koncese taxi', 'taxislužba česko', 'licence taxi', 'průkaz řidiče taxislužby', 'jak získat koncesi', 'taxislužba 2025', 'bolt uber koncese'],
  openGraph: {
    title: 'Jak získat koncesi na taxislužbu v roce 2025 (Česko)',
    description: 'Kompletní návod jak získat koncesi na taxislužbu v Česku v roce 2025. Podmínky, poplatky, postup krok za krokem.',
    url: 'https://www.taxinearme.cz/koncesia-taxisluzba-2025',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog/koncesia-taxisluzba-2025.jpg',
      width: 1200,
      height: 630,
      alt: 'Koncese na taxislužbu 2025'
    }],
    publishedTime: '2025-12-05',
    modifiedTime: '2025-12-05'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Jak získat koncesi na taxislužbu v roce 2025 (Česko)',
    description: 'Kompletní návod jak získat koncesi na taxislužbu v Česku v roce 2025.',
    images: ['https://www.taxinearme.cz/blog/koncesia-taxisluzba-2025.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/koncesia-taxisluzba-2025',
    languages: {
      'cs': 'https://www.taxinearme.cz/koncesia-taxisluzba-2025',
      'x-default': 'https://www.taxinearme.cz/koncesia-taxisluzba-2025',
    },
  }
};

export default function KoncesiaTaxisluzbaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Jak získat koncesi na taxislužbu v roce 2025 (Česko)"
        description="Kompletní návod jak získat koncesi na taxislužbu v Česku v roce 2025. Podmínky, poplatky, postup krok za krokem."
        url="https://www.taxinearme.cz/koncesia-taxisluzba-2025"
        publishedTime="2025-12-05"
        modifiedTime="2025-12-05"
        imageUrl="https://www.taxinearme.cz/blog/koncesia-taxisluzba-2025.jpg"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Koncese na taxislužbu 2025' }
        ]} />

        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <Scale className="h-2.5 w-2.5 inline mr-1" />
              Legislativa
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              5. prosinec 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Jak získat koncesi na taxislužbu v roce 2025 (Česko)
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Kompletní návod jak získat koncesi na taxislužbu v Česku. Podmínky, poplatky, postup krok za krokem, potřebné dokumenty.
          </p>

          <ShareButton
            title="Jak získat koncesi na taxislužbu v roce 2025 (Česko)"
          />
        </div>
      </section>
      </div>

      {/* Hero image */}
      <div className="container mx-auto max-w-4xl px-3 md:px-6 -mt-4">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/blog/koncesia-taxisluzba-2025.jpg"
            alt="Koncese na taxislužbu - ilustrační obrázek"
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
                Na provozování taxislužby nestačí jen živnostenský list. Potřebná je <strong>koncese na taxislužbu</strong> podle zákona o silniční dopravě. Tento článek vás provede celým procesem získání koncese v roce 2025.
              </p>
            </div>

            {/* 1. Právní rámec */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" />
              1. Právní rámec taxislužby v roce 2025
            </h2>

            <p>Podnikání v taxislužbě v Česku upravuje zejména:</p>

            <ul className="space-y-2 my-4">
              <li><strong>Zákon č. 111/1994 Sb. o silniční dopravě</strong>, část týkající se taxislužby</li>
              <li>Související prováděcí předpisy a <strong>zákon o správních poplatcích</strong></li>
              <li>Obecně závazné vyhlášky jednotlivých měst a obcí (tarif, označení vozidel, stanoviště, místní pravidla)</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
              <p className="font-semibold text-gray-900">
                <AlertTriangle className="h-5 w-5 inline mr-2 text-yellow-600" />
                Taxislužbou je přeprava osob vozidly s obsaditelností nejvýše 9 osob včetně řidiče, vykonávaná za úplatu jako podnikání. Pokud takovou přepravu děláte soustavně za peníze, <strong>ze zákona jste taxislužba</strong>, i když používáte aplikaci typu Bolt či Uber.
              </p>
            </div>

            {/* 2. Kdo musí mít koncesi */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <User className="h-7 w-7 text-primary" />
              2. Kdo musí mít koncesi na taxislužbu
            </h2>

            <p>Koncesi musí mít každý podnikatel (fyzická osoba – živnostník nebo právnická osoba), který:</p>

            <ul className="space-y-2 my-4">
              <li>Za úplatu přepravuje osoby vozidlem s max. 9 místy včetně řidiče v rámci podnikání</li>
              <li>Nabízí tyto služby veřejnosti – na ulici, přes telefon, web nebo digitální platformu (Bolt, Uber apod.)</li>
            </ul>

            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <p className="font-semibold mb-3">Digitální platformy jen zprostředkovávají objednávku, ale samotná přeprava je právně taxislužba. Řidič musí mít:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> <strong>Koncesi</strong> (nebo jezdit pro někoho, kdo ji má)</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> <strong>Průkaz řidiče vozidla taxislužby</strong></li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> <strong>Vozidlo zařazené jako vozidlo taxislužby</strong> s osvědčením</li>
              </ul>
            </div>

            {/* 3. Kdo koncesi vydává */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              3. Kdo koncesi vydává a na jak dlouho
            </h2>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-bold text-lg">Dopravní úřad</p>
                <p className="text-sm text-gray-600">příslušný podle sídla</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-bold text-lg">10 let</p>
                <p className="text-sm text-gray-600">platnost koncese</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="font-bold text-lg">Nepřenosná</p>
                <p className="text-sm text-gray-600">ani při prodeji</p>
              </div>
            </div>

            {/* 4. Základní podmínky */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CheckCircle className="h-7 w-7 text-primary" />
              4. Základní podmínky pro udělení koncese
            </h2>

            <p>Podle zákona o silniční dopravě lze koncesi udělit jen žadateli, který splňuje současně všechny tyto podmínky:</p>

            <div className="space-y-4 my-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">1. Pobyt / sídlo v EU</h4>
                <ul className="text-sm space-y-1">
                  <li>• Fyzická osoba: trvalý pobyt nebo místo podnikání na území ČR nebo jiného členského státu EU</li>
                  <li>• Právnická osoba: sídlo na území ČR nebo jiného členského státu</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">2. Způsobilost k právním úkonům</h4>
                <p className="text-sm">Typicky splněno po dovršení 18 let, bez zbavení či omezení způsobilosti soudem.</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">3. Bezúhonnost</h4>
                <p className="text-sm">Za bezúhonného se nepovažuje osoba, která byla pravomocně odsouzena za úmyslné trestné činy nebo má uložen zákaz činnosti. Prokazuje se <strong>výpisem z rejstříku trestů</strong> ne starším než 3 měsíce.</p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2">4. Vozidlo taxislužby</h4>
                <p className="text-sm">Žadatel musí mít alespoň jedno vlastní, pronajaté, leasingové nebo zapůjčené vozidlo, které splňuje podmínky vozidla taxislužby.</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-lg mb-2 text-red-700">5. Vozidlo musí být evidováno v ČR</h4>
                <p className="text-sm">Taxislužbu lze provozovat pouze vozidly, která jsou <strong>evidována v České republice</strong>.</p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
              <p className="font-semibold text-green-800">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                <strong>Dobrá zpráva:</strong> Požadavky na finanční spolehlivost a odbornou způsobilost se na taxislužbu nevztahují (na rozdíl od nákladní a linkové osobní dopravy).
              </p>
            </div>

            {/* 5. Průkaz řidiče */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              5. Průkaz řidiče taxislužby
            </h2>

            <p>Taxislužbu může vykonávat pouze řidič, který má <strong>průkaz řidiče vozidla taxislužby</strong>.</p>

            <p className="mt-4">Průkaz řidiče může získat osoba, která:</p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Řidičské oprávnění</p>
                  <p className="text-sm text-gray-600">Skupina B pro osobní vozidla</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Plná způsobilost</p>
                  <p className="text-sm text-gray-600">K právním úkonům</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Zdravotní způsobilost</p>
                  <p className="text-sm text-gray-600">Lékařský posudek (max. 3 měsíce starý)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Psychická způsobilost</p>
                  <p className="text-sm text-gray-600">Psychologické vyšetření</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg md:col-span-2">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Bezúhonnost</p>
                  <p className="text-sm text-gray-600">Výpis z rejstříku trestů</p>
                </div>
              </div>
            </div>

            {/* 6. Poplatky */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-primary" />
              6. Poplatky v roce 2025
            </h2>

            <div className="bg-gray-900 text-white p-6 rounded-lg my-6">
              <h3 className="text-xl font-bold mb-4">Přehled správních poplatků</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Udělení koncese na taxislužbu</span>
                  <span className="font-bold text-xl">1 000 Kč</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Změny v koncesi (doplňování vozidel)</span>
                  <span className="font-bold text-xl">500 Kč</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>Průkaz řidiče taxislužby</span>
                  <span className="font-bold text-xl">500 Kč</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-yellow-400">Zkoušky (Praha)</span>
                  <span className="font-bold text-xl text-yellow-400">2 000 Kč</span>
                </div>
              </div>
            </div>

            {/* 7. Postup krok za krokem */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              7. Postup krok za krokem
            </h2>

            <div className="space-y-6 my-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-bold text-lg">Zvolte si formu podnikání</h4>
                  <p className="text-gray-600">Živnostník (FO) nebo společnost s ručením omezeným (s. r. o.). Samotná živnost bez koncese nestačí.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-bold text-lg">Připravte si vozidlo</h4>
                  <p className="text-gray-600">Kategorie max. 9 sedadel, platná STK/EK, povinné ručení, musí být registrováno v ČR. Města mohou mít další lokální požadavky (barva, střešní světlo, stáří).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-bold text-lg">Vypracujte přepravní řád</h4>
                  <p className="text-gray-600">Podmínky uzavírání smlouvy, práva a povinnosti, způsob placení, tarifní podmínky, reklamace. Přepravní řád musíte zveřejnit.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-bold text-lg">Vyplňte žádost o udělení koncese</h4>
                  <p className="text-gray-600">Použijte aktuální formulář z webu vašeho dopravního úřadu.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <h4 className="font-bold text-lg">Přiložte povinné přílohy</h4>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• Výpis z obchodního / živnostenského rejstříku (max. 3 měsíce)</li>
                    <li>• Výpis z rejstříku trestů</li>
                    <li>• Doklady k vozidlům (osvědčení o registraci, smlouva o pronájmu/leasingu, povinné ručení)</li>
                    <li>• Přepravní řád dopravce</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">6</div>
                <div>
                  <h4 className="font-bold text-lg">Zaplaťte správní poplatek</h4>
                  <p className="text-gray-600">1 000 Kč za udělení koncese. Poplatek se platí kolkem nebo bezhotovostně podle dopravního úřadu.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">7</div>
                <div>
                  <h4 className="font-bold text-lg">Řízení na dopravním úřadě</h4>
                  <p className="text-gray-600">Standardní lhůta 30 dní, u složitějších případů 60 dní. Úřad vydá rozhodnutí o udělení koncese a koncesní listinu.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">8</div>
                <div>
                  <h4 className="font-bold text-lg">Osvědčení vozidla a označení</h4>
                  <p className="text-gray-600">Požádejte o osvědčení vozidla taxislužby. Vozidlo označte podle zákona (obchodní jméno, střešní světlo TAXI, tarifní sazby, taxametr).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">9</div>
                <div>
                  <h4 className="font-bold text-lg">Průkaz řidiče taxislužby</h4>
                  <p className="text-gray-600">Podání žádosti na dopravním úřadě + řidičský průkaz, výpis z rejstříku trestů, lékařský a psychologický posudek, fotografie. Poplatek cca 500 Kč.</p>
                </div>
              </div>
            </div>

            {/* 8. Co se mění v 2025 */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-primary" />
              8. Co se mění pro taxislužby v roce 2025
            </h2>

            <div className="space-y-4 my-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <h4 className="font-bold text-red-800">Vozidla musí být české evidence</h4>
                <p className="text-sm text-red-700">Jezdit se slovenským či polským číslem v české taxislužbě není legální.</p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                <h4 className="font-bold text-orange-800">Silnější tlak na kontrolu digitálních platforem</h4>
                <p className="text-sm text-orange-700">Stát důsledněji vyžaduje, aby řidiči přes aplikace jezdili pouze s koncesí, průkazem řidiče a řádně označeným vozidlem.</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h4 className="font-bold text-yellow-800">Výrazné pokuty</h4>
                <p className="text-sm text-yellow-700">Při porušování pravidel hrozí pokuty od několika tisíc do statisíců Kč a odebrání koncese.</p>
              </div>
            </div>

            {/* 9. Checklist */}
            <h2 className="text-2xl font-bold mt-12 mb-4 flex items-center gap-2">
              <CheckCircle className="h-7 w-7 text-primary" />
              9. Stručný checklist – co musíte mít
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg my-6">
              <h3 className="font-bold text-lg mb-4">Abyste legálně jezdili taxi v roce 2025:</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Forma podnikání</strong> – živnost nebo s. r. o. (IČO)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Koncese na taxislužbu</strong> – udělená dopravním úřadem na 10 let</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Vozidlo taxislužby</strong> – evidované v ČR, zapsané v koncesi, s osvědčením</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Přepravní řád</strong> – vypracovaný a zveřejněný</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Průkaz řidiče taxislužby</strong> pro každého řidiče</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Správní poplatky zaplacené</strong> (1 000 Kč koncese, 500 Kč průkaz)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" />
                  <span><strong>Bezúhonnost, zdravotní a psychická způsobilost</strong></span>
                </label>
              </div>
            </div>

            <div className="bg-red-100 border border-red-300 p-6 rounded-lg my-6">
              <p className="font-bold text-red-800 text-lg">
                <AlertTriangle className="h-6 w-6 inline mr-2" />
                Pokud některý z těchto bodů nemáte, z právního hlediska <strong>nejedete legálně taxi</strong>, i kdybyste měli živnost a jezdili jen "pro aplikaci" nebo "pro známé".
              </p>
            </div>

            {/* Zdroje */}
            <h2 className="text-2xl font-bold mt-12 mb-4">Zdroje a odkazy</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.zakonyprolidi.cz/cs/1994-111" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zákon č. 111/1994 Sb. o silniční dopravě</a></li>
              <li><a href="https://www.mdcr.cz/Dokumenty/Silnicni-doprava/Taxisluzba" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ministerstvo dopravy ČR – Taxislužba</a></li>
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
        articleTitle="Koncese na taxislužbu 2025"
      />

      {/* Back button */}
      <section className="py-8 px-3 md:px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět na hlavní stránku
          </Link>
        </div>
      </section>

    </div>
  );
}
