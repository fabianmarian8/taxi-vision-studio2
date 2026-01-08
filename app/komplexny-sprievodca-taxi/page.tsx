/** Migrované z: src/vite-pages/KomplexnySprievodcaPage.tsx */

import { Metadata } from "next";
import { Header } from "@/components/Header";
import { GeometricLines } from "@/components/GeometricLines";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, MapPin, CreditCard, Star, Shield, Smartphone , ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleFAQ } from "@/components/ArticleFAQ";
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { ArticleAuthor } from '@/components/ArticleAuthor';

export const metadata: Metadata = {
  title: 'Komplexný sprievodca taxislužbami na Slovensku | TaxiNearMe.sk',
  description: 'Všetko, čo potrebujete vedieť o taxi na Slovensku. Od výberu služby až po vaše práva ako zákazníka.',
  keywords: ['taxi sprievodca', 'taxislužby slovensko', 'ako si vybrať taxi', 'práva zákazníkov', 'taxi aplikácie', 'objednať taxi'],
  openGraph: {
    title: 'Komplexný sprievodca taxislužbami na Slovensku',
    description: 'Všetko, čo potrebujete vedieť o taxi na Slovensku. Od výberu služby až po vaše práva ako zákazníka.',
    url: 'https://www.taxinearme.sk/komplexny-sprievodca-taxi',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.sk/blog-images/sprievodca.jpg',
      width: 1200,
      height: 630,
      alt: 'Komplexný sprievodca taxislužbami'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Komplexný sprievodca taxislužbami na Slovensku',
    description: 'Všetko, čo potrebujete vedieť o taxi na Slovensku. Od výberu služby až po vaše práva ako zákazníka.',
    images: ['https://www.taxinearme.sk/blog-images/sprievodca.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.sk/komplexny-sprievodca-taxi',
    languages: {
      'sk': 'https://www.taxinearme.sk/komplexny-sprievodca-taxi',
      'x-default': 'https://www.taxinearme.sk/komplexny-sprievodca-taxi',
    },
  }
};

export default function KomplexnySprievodcaPage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Komplexný sprievodca taxislužbami na Slovensku"
        description="Všetko, čo potrebujete vedieť o taxi na Slovensku. Od výberu služby až po vaše práva ako zákazníka."
        url="https://www.taxinearme.sk/komplexny-sprievodca-taxi"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Komplexný sprievodca taxi' }
        ]} />

        {/* Hero Section */}
        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <BookOpen className="h-2.5 w-2.5 inline mr-1" />
              Sprievodca
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. január 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Komplexný sprievodca taxislužbami na Slovensku
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Všetko, čo potrebujete vedieť o taxi na Slovensku
          </p>

          <ShareButton
            title="Komplexný sprievodca taxislužbami na Slovensku"
          />
        </div>
      </section>
      </div>

      {/* Article Content with WHITE BACKGROUND */}
      <section className="py-6 md:py-8 px-3 md:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-lg font-semibold text-gray-900">
                Tento sprievodca vám poskytne komplexný prehľad o taxislužbách na Slovensku – od výberu správnej služby, cez ceny, až po vaše práva ako zákazníka.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <MapPin className="h-8 w-8 inline mr-2 text-primary" />
              1. Ako vybrať správnu taxislužbu
            </h2>

            <p className="text-sm leading-relaxed">
              Na Slovensku pôsobí viac ako <strong>1 200 taxislužieb</strong> vo <strong>viac ako 150 mestách</strong>. Výber správnej služby môže byť náročný, preto sme pripravili praktický návod.
            </p>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Kľúčové kritériá pri výbere</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">1. Overené hodnotenia</h4>
                  <p>Vyhľadajte taxislužby s pozitívnymi recenziami od skutočných zákazníkov. Pozor na falošné hodnotenia!</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2. Transparentné ceny</h4>
                  <p>Seriózna taxislužba má jasne uvedené cenníky. Nástupná sadzba, cena za kilometer a čakacia sadzba by mali byť viditeľné.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3. Dostupnosť</h4>
                  <p>Overené telefónne čísla, rýchla odozva, možnosť objednania cez aplikáciu.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4. Vozový park</h4>
                  <p>Moderné, čisté vozidlá s klimatizáciou. Niektoré služby ponúkajú aj prémiové vozidlá alebo elektromobily.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">5. Platobné možnosti</h4>
                  <p>Okrem hotovosti aj platba kartou, faktúra pre firmy.</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <CreditCard className="h-8 w-8 inline mr-2 text-primary" />
              2. Ceny taxislužieb na Slovensku
            </h2>

            <p>
              Ceny taxi sa na Slovensku líšia podľa mesta a konkrétnej služby. Pripravili sme pre vás <strong>komplexný cenový prieskum</strong>, ktorý porovnáva ceny v 30 slovenských mestách.
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Priemerné ceny taxi</h3>
              <ul className="space-y-2">
                <li><strong>Nástupná sadzba:</strong> 2,00 € - 3,50 €</li>
                <li><strong>Cena za kilometer:</strong> 0,80 € - 1,20 €</li>
                <li><strong>Čakacia sadzba:</strong> 0,20 € - 0,40 € / minúta</li>
                <li><strong>5km jazda:</strong> 6,00 € - 9,50 €</li>
              </ul>
            </div>

            <p>
              <Link href="/prieskum-cien-taxisluzieb-slovensko-2025" className="text-primary hover:underline font-semibold">
                → Pozrite si detailný cenový prieskum s interaktívnou mapou a kalkulačkou
              </Link>
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Smartphone className="h-8 w-8 inline mr-2 text-primary" />
              3. Ako objednať taxi
            </h2>

            <div className="space-y-6 my-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Telefonicky</h3>
                <p>Najrýchlejší spôsob. Zavolajte na dispečing, uveďte adresu vyzdvihnutia a cieľ. Dispečer vám potvrdí čas príchodu.</p>
                <p className="mt-2 font-semibold">Tip: Uložte si čísla overených taxislužieb vo vašom meste.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Cez aplikáciu</h3>
                <p>Moderné taxislužby ponúkajú vlastné aplikácie. Výhody: vidíte cenu vopred, sledujete príchod vozidla, platíte kartou.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Na stanovišti</h3>
                <p>V centrách miest nájdete taxi stanovištia. Výhodné, ak ste na mieste a potrebujete odvoz okamžite.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Cez našu stránku</h3>
                <p>Na TaxiNearMe.sk nájdete overené taxislužby vo vašom meste s telefónnymi číslami a cenníkmi.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              4. Vaše práva ako zákazníka
            </h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Máte právo na:</h3>

              <ul className="space-y-3">
                <li><strong>✓ Bezpečnú prepravu</strong> - Vodič musí dodržiavať dopravné predpisy</li>
                <li><strong>✓ Čisté vozidlo</strong> - Auto by malo byť v dobrom technickom stave</li>
                <li><strong>✓ Transparentnú cenu</strong> - Taxameter musí byť viditeľný a funkčný</li>
                <li><strong>✓ Faktúru</strong> - Na požiadanie musí vodič vystaviť faktúru</li>
                <li><strong>✓ Slušné správanie</strong> - Vodič by mal byť profesionálny a zdvorilý</li>
              </ul>
            </div>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Vodič môže odmietnuť jazdu, ak:</h3>

              <ul className="space-y-3">
                <li>• Ste agresívny alebo pod vplyvom alkoholu/drog</li>
                <li>• Neviete presný cieľ cesty</li>
                <li>• Máte nebezpečné predmety</li>
                <li>• Odmietate zaplatiť zálohu (pri dlhých trasách)</li>
              </ul>

              <p className="mt-4 font-semibold">
                <Link href="/alkohol-nocny-zivot" className="text-primary hover:underline">
                  → Prečítajte si viac o pravidlách prepravy opitých pasažierov
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Star className="h-8 w-8 inline mr-2 text-primary" />
              5. Ako hodnotiť taxislužbu
            </h2>

            <p>
              Hodnotenia sú dôležité pre ostatných zákazníkov, ale aj pre vodičov. <strong>Férové hodnotenie</strong> pomáha zlepšovať kvalitu služieb.
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Kedy dať nízke hodnotenie?</h3>
              <ul className="space-y-2">
                <li>• Agresívna jazda, porušovanie predpisov</li>
                <li>• Hrubé správanie, neúcta</li>
                <li>• Špinavé vozidlo, nepríjemný zápach</li>
                <li>• Úmyselné predlžovanie trasy</li>
                <li>• Odmietnutie vystaviť faktúru</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Kedy dať vysoké hodnotenie?</h3>
              <ul className="space-y-2">
                <li>• Bezpečná, plynulá jazda</li>
                <li>• Profesionálne správanie</li>
                <li>• Čisté vozidlo</li>
                <li>• Príchod na čas</li>
                <li>• Pomoc so zavazadlami</li>
              </ul>
            </div>

            <p className="font-semibold text-lg">
              <Link href="/hodnotenie-vodicov" className="text-primary hover:underline">
                → Prečítajte si, prečo 4★ nie je dobré hodnotenie a ako hodnotiť férovo
              </Link>
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Špecializované služby</h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Letiskové transfery</h3>
                <p>Mnohé taxislužby ponúkajú špeciálne ceny na letisko. Výhodné pri rezervácii vopred.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Firemné prepravy</h3>
                <p>Faktúry pre firmy, mesačné zúčtovanie, prémiové vozidlá.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Detské autosedačky</h3>
                <p>Niektoré služby poskytujú autosedačky na požiadanie. Vždy si overte dostupnosť vopred.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Bezbariérové vozidlá</h3>
                <p>Pre osoby s obmedzenou mobilitou. Dostupnosť závisí od mesta.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Elektromobily</h3>
                <p>Ekologická alternatíva. Dostupné v Bratislave, Košiciach a ďalších väčších mestách.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Zahraničné prepravy</h3>
                <p>Niektoré taxislužby ponúkajú medzinárodné prepravy (napr. do Viedne, Budapešti).</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">7. Bezpečnostné tipy</h2>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pre zákazníkov</h3>

              <ul className="space-y-3">
                <li><strong>✓ Overujte identitu vodiča</strong> - Skontrolujte poznávaciu značku a meno vodiča</li>
                <li><strong>✓ Sledujte trasu</strong> - Používajte GPS na telefóne</li>
                <li><strong>✓ Zdieľajte polohu</strong> - Pošlite live location priateľom/rodine</li>
                <li><strong>✓ Sedite vzadu</strong> - Bezpečnejšia pozícia</li>
                <li><strong>✓ Dôverujte inštinktu</strong> - Ak sa cítite nepríjemne, požiadajte o zastavenie</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pre vodičov</h3>

              <ul className="space-y-3">
                <li><strong>✓ Nadviažte očný kontakt</strong> - Identifikujte pasažiera</li>
                <li><strong>✓ Informujte dispečing</strong> - O cieli a zmene trasy</li>
                <li><strong>✓ Používajte kamery</strong> - Dashcam a interiérová kamera</li>
                <li><strong>✓ Dôverujte inštinktu</strong> - Máte právo odmietnuť rizikového pasažiera</li>
              </ul>

              <p className="mt-4 font-semibold">
                <Link href="/alkohol-nocny-zivot" className="text-primary hover:underline">
                  → Prečítajte si komplexný bezpečnostný návod pre vodičov
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">8. Taxislužby podľa miest</h2>

            <p>
              Na Slovensku pôsobí viac ako 1 200 taxislužieb. Pripravili sme pre vás detailné prehľady pre každé mesto s overenými kontaktmi a cenníkmi.
            </p>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 my-4">
              <h3 className="text-2xl font-bold mb-3 text-center">Najväčšie mestá</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/taxi/bratislava" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Bratislava</h4>
                  <p className="text-sm text-gray-600">14 taxislužieb</p>
                  <p className="text-sm text-primary mt-2">Zobraziť →</p>
                </Link>

                <Link href="/taxi/kosice" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Košice</h4>
                  <p className="text-sm text-gray-600">14 taxislužieb</p>
                  <p className="text-sm text-primary mt-2">Zobraziť →</p>
                </Link>

                <Link href="/taxi/presov" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Prešov</h4>
                  <p className="text-sm text-gray-600">15 taxislužieb</p>
                  <p className="text-sm text-primary mt-2">Zobraziť →</p>
                </Link>

                <Link href="/taxi/zilina" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Žilina</h4>
                  <p className="text-sm text-gray-600">15 taxislužieb</p>
                  <p className="text-sm text-primary mt-2">Zobraziť →</p>
                </Link>

                <Link href="/taxi/nitra" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Nitra</h4>
                  <p className="text-sm text-gray-600">13 taxislužieb</p>
                  <p className="text-sm text-primary mt-2">Zobraziť →</p>
                </Link>

                <Link href="/taxi/banska-bystrica" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Banská Bystrica</h4>
                  <p className="text-sm text-gray-600">15 taxislužieb</p>
                  <p className="text-sm text-primary mt-2">Zobraziť →</p>
                </Link>
              </div>

              <div className="text-center mt-6">
                <Link href="/">
                  <Button variant="outline">
                    Zobraziť všetky mestá (150+)
                  </Button>
                </Link>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">9. Často kladené otázky</h2>

            <div className="space-y-6 my-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Koľko stojí taxi na Slovensku?</h3>
                <p>Priemerná 5km jazda stojí 6-9,50 €. Ceny sa líšia podľa mesta a konkrétnej služby. <Link href="/prieskum-cien-taxisluzieb-slovensko-2025" className="text-primary hover:underline">Pozrite si detailný cenový prieskum</Link>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Ako objednám taxi?</h3>
                <p>Telefonicky, cez aplikáciu, na stanovišti, alebo cez našu stránku TaxiNearMe.sk.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Môžem platiť kartou?</h3>
                <p>Väčšina moderných taxislužieb akceptuje platby kartou. Vždy si overte vopred.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Môže vodič odmietnuť jazdu?</h3>
                <p>Áno, ak ste agresívny, pod vplyvom, neviete cieľ, alebo máte nebezpečné predmety. <Link href="/alkohol-nocny-zivot" className="text-primary hover:underline">Viac info tu</Link>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Ako hodnotiť taxislužbu?</h3>
                <p>Férovo - hodnoťte len to, čo vodič ovplyvnil. <Link href="/hodnotenie-vodicov" className="text-primary hover:underline">Prečítajte si návod</Link>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Sú na Slovensku elektromobily taxi?</h3>
                <p>Áno, v Bratislave, Košiciach a ďalších väčších mestách. Dostupnosť rastie.</p>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            <h2 className="text-3xl font-bold mt-12 mb-3">Záver</h2>

            <p className="text-lg">
              Taxislužby na Slovensku prechádzajú modernizáciou. Stále viac služieb ponúka aplikácie, bezhotovostné platby a ekologické vozidlá. <strong>Informovaný zákazník</strong> je spokojný zákazník - preto sme vytvorili tento komplexný sprievodca.
            </p>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl  p-8 my-6 text-center">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Súvisiace články</h3>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Link href="/prieskum-cien-taxisluzieb-slovensko-2025">
                  <Button variant="outline" className="w-full">
                    Cenový prieskum
                  </Button>
                </Link>
                <Link href="/hodnotenie-vodicov">
                  <Button variant="outline" className="w-full">
                    Ako hodnotiť vodičov
                  </Button>
                </Link>
                <Link href="/alkohol-nocny-zivot">
                  <Button variant="outline" className="w-full">
                    Bezpečnosť v noci
                  </Button>
                </Link>
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
            articleSlug="komplexny-sprievodca-taxi"
            articleTitle="Často kladené otázky o taxislužbách"
          />

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl  text-center">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              <MapPin className="h-6 w-6 inline mr-2" />
              Nájdite taxi vo vašom meste
            </h3>
            <p className="text-gray-700 mb-3">
              Viac ako 1 200 overených taxislužieb vo viac ako 150 slovenských mestách.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Vyhľadať taxi
                <ArrowLeft className="h-2.5 w-2.5 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
