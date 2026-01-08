/** Migrováno z: src/vite-pages/KomplexnyPrůvodcePage.tsx */

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
  title: 'Komplexní průvodce taxislužbami v Česku | TaxiNearMe.cz',
  description: 'Vše, co potřebujete vědět o taxi v Česku. Od výběru služby až po vaše práva jako zákazníka.',
  keywords: ['taxi průvodce', 'taxislužby česko', 'jak si vybrat taxi', 'práva zákazníků', 'taxi aplikace', 'objednat taxi'],
  openGraph: {
    title: 'Komplexní průvodce taxislužbami v Česku',
    description: 'Vše, co potřebujete vědět o taxi v Česku. Od výběru služby až po vaše práva jako zákazníka.',
    url: 'https://www.taxinearme.cz/komplexny-průvodce-taxi',
    type: 'article',
    images: [{
      url: 'https://www.taxinearme.cz/blog-images/průvodce.jpg',
      width: 1200,
      height: 630,
      alt: 'Komplexní průvodce taxislužbami'
    }],
    publishedTime: '2025-01-15',
    modifiedTime: '2025-01-15'
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Komplexní průvodce taxislužbami v Česku',
    description: 'Vše, co potřebujete vědět o taxi v Česku. Od výběru služby až po vaše práva jako zákazníka.',
    images: ['https://www.taxinearme.cz/blog-images/průvodce.jpg']
  },
  alternates: {
    canonical: 'https://www.taxinearme.cz/komplexny-průvodce-taxi',
    languages: {
      'cs': 'https://www.taxinearme.cz/komplexny-průvodce-taxi',
      'x-default': 'https://www.taxinearme.cz/komplexny-průvodce-taxi',
    },
  }
};

export default function KomplexnyPrůvodcePage() {
  return (
    <div className="min-h-screen bg-white">
      <ArticleSchema
        title="Komplexní průvodce taxislužbami v Česku"
        description="Vše, co potřebujete vědět o taxi v Česku. Od výběru služby až po vaše práva jako zákazníka."
        url="https://www.taxinearme.cz/komplexny-průvodce-taxi"
        publishedTime="2025-01-15"
        modifiedTime="2025-01-15"
      />
      <Header />

      <div className="hero-3d-bg">
        <SEOBreadcrumbs items={[
          { label: 'Komplexní průvodce taxi' }
        ]} />

        {/* Hero Section */}
        <section className="pt-3 md:pt-4 pb-6 md:pb-8 px-3 md:px-6 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />

        <div className="container mx-auto max-w-4xl relative z-10">

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
              <BookOpen className="h-2.5 w-2.5 inline mr-1" />
              Průvodce
            </span>
            <div className="flex items-center gap-1 text-[10px] text-foreground/60">
              <Calendar className="h-2.5 w-2.5" />
              15. ledna 2025
            </div>
            <div className="hidden sm:block text-foreground/30">•</div>
            <ArticleAuthor variant="inline" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-foreground leading-tight">
            Komplexní průvodce taxislužbami v Česku
          </h1>

          <p className="text-xl text-foreground/80 mb-3">
            Vše, co potřebujete vědět o taxi v Česku
          </p>

          <ShareButton
            title="Komplexní průvodce taxislužbami v Česku"
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
                Tento průvodce vám poskytne komplexní přehled o taxislužbách v Česku – od výběru správné služby, přes ceny, až po vaše práva jako zákazníka.
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <MapPin className="h-8 w-8 inline mr-2 text-primary" />
              1. Jak vybrat správnou taxislužbu
            </h2>

            <p className="text-sm leading-relaxed">
              V Česku působí více než <strong>1 200 taxislužeb</strong> ve <strong>více než 150 městech</strong>. Výběr správné služby může být náročný, proto jsme připravili praktického průvodce.
            </p>

            <div className="bg-green-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Klíčová kritéria při výběru</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">1. Ověřená hodnocení</h4>
                  <p>Vyhledejte taxislužby s pozitivními recenzemi od skutečných zákazníků. Pozor na falešná hodnocení!</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2. Transparentní ceny</h4>
                  <p>Seriózní taxislužba má jasně uvedené ceníky. Nástupní sazba, cena za kilometr a čekací sazba by měly být viditelné.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3. Dostupnost</h4>
                  <p>Ověřená telefonní čísla, rychlá odezva, možnost objednání přes aplikaci.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4. Vozový park</h4>
                  <p>Moderní, čistá vozidla s klimatizací. Některé služby nabízejí i prémiová vozidla nebo elektromobily.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">5. Platební možnosti</h4>
                  <p>Kromě hotovosti i platba kartou, faktura pro firmy.</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <CreditCard className="h-8 w-8 inline mr-2 text-primary" />
              2. Ceny taxislužeb v Česku
            </h2>

            <p>
              Ceny taxi se v Česku liší podle města a konkrétní služby. Připravili jsme pro vás <strong>komplexní cenový průzkum</strong>, který porovnává ceny ve 30 českých městech.
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Průměrné ceny taxi</h3>
              <ul className="space-y-2">
                <li><strong>Nástupní sazba:</strong> 2,00 € - 3,50 €</li>
                <li><strong>Cena za kilometer:</strong> 0,80 € - 1,20 €</li>
                <li><strong>Čekací sazba:</strong> 0,20 € - 0,40 € / minuta</li>
                <li><strong>5km jízda:</strong> 6,00 € - 9,50 €</li>
              </ul>
            </div>

            <p>
              <Link href="/prieskum-cien-taxisluzieb-slovensko-2025" className="text-primary hover:underline font-semibold">
                → Podívejte se na detailní cenový průzkum s interaktivní mapou a kalkulačkou
              </Link>
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Smartphone className="h-8 w-8 inline mr-2 text-primary" />
              3. Jak objednat taxi
            </h2>

            <div className="space-y-6 my-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Telefonicky</h3>
                <p>Nejrychlejší způsob. Zavolejte na dispečink, uveďte adresu vyzvednutí a cíl. Dispečer vám potvrdí čas příjezdu.</p>
                <p className="mt-2 font-semibold">Tip: Uložte si čísla ověřených taxislužeb ve vašem městě.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Přes aplikaci</h3>
                <p>Moderní taxislužby nabízejí vlastní aplikace. Výhody: vidíte cenu předem, sledujete příjezd vozidla, platíte kartou.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Na stanovišti</h3>
                <p>V centrech měst najdete taxi stanoviště. Výhodné, pokud jste na místě a potřebujete odvoz okamžitě.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Přes naši stránku</h3>
                <p>Na TaxiNearMe.cz najdete ověřené taxislužby ve vašem městě s telefonními čísly a ceníky.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Shield className="h-8 w-8 inline mr-2 text-primary" />
              4. Vaše práva jako zákazníka
            </h2>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Máte právo na:</h3>

              <ul className="space-y-3">
                <li><strong>✓ Bezpečnou přepravu</strong> - Řidič musí dodržovat dopravní předpisy</li>
                <li><strong>✓ Čisté vozidlo</strong> - Auto by mělo být v dobrém technickém stavu</li>
                <li><strong>✓ Transparentní cenu</strong> - Taxametr musí být viditelný a funkční</li>
                <li><strong>✓ Fakturu</strong> - Na požádání musí řidič vystavit fakturu</li>
                <li><strong>✓ Slušné chování</strong> - Řidič by měl být profesionální a zdvořilý</li>
              </ul>
            </div>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Řidič může odmítnout jízdu, pokud:</h3>

              <ul className="space-y-3">
                <li>• Jste agresivní nebo pod vlivem alkoholu/drog</li>
                <li>• Nevíte přesný cíl cesty</li>
                <li>• Máte nebezpečné předměty</li>
                <li>• Odmítáte zaplatit zálohu (při dlouhých trasách)</li>
              </ul>

              <p className="mt-4 font-semibold">
                <Link href="/alkohol-nocny-zivot" className="text-primary hover:underline">
                  → Přečtěte si více o pravidlech přepravy opilých pasažérů
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">
              <Star className="h-8 w-8 inline mr-2 text-primary" />
              5. Jak hodnotit taxislužbu
            </h2>

            <p>
              Hodnocení jsou důležitá pro ostatní zákazníky, ale i pro řidiče. <strong>Férové hodnocení</strong> pomáhá zlepšovat kvalitu služeb.
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Kdy dát nízké hodnocení?</h3>
              <ul className="space-y-2">
                <li>• Agresivní jízda, porušování předpisů</li>
                <li>• Hrubé chování, neúcta</li>
                <li>• Špinavé vozidlo, nepříjemný zápach</li>
                <li>• Úmyslné prodlužování trasy</li>
                <li>• Odmítnutí vystavit fakturu</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg my-4">
              <h3 className="text-xl font-bold mb-3">Kdy dát vysoké hodnocení?</h3>
              <ul className="space-y-2">
                <li>• Bezpečná, plynulá jízda</li>
                <li>• Profesionální chování</li>
                <li>• Čisté vozidlo</li>
                <li>• Příjezd včas</li>
                <li>• Pomoc se zavazadly</li>
              </ul>
            </div>

            <p className="font-semibold text-lg">
              <Link href="/hodnotenie-vodicov" className="text-primary hover:underline">
                → Přečtěte si, proč 4★ není dobré hodnocení a jak hodnotit férově
              </Link>
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-3">6. Specializované služby</h2>

            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Letištní transfery</h3>
                <p>Mnohé taxislužby nabízejí speciální ceny na letiště. Výhodné při rezervaci předem.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Firemní přepravy</h3>
                <p>Faktury pro firmy, měsíční zúčtování, prémiová vozidla.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Dětské autosedačky</h3>
                <p>Některé služby poskytují autosedačky na požádání. Vždy si ověřte dostupnost předem.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Bezbariérová vozidla</h3>
                <p>Pro osoby s omezenou mobilitou. Dostupnost závisí na městě.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Elektromobily</h3>
                <p>Ekologická alternativa. Dostupné v Praze, Brně a dalších větších městech.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Zahraniční přepravy</h3>
                <p>Některé taxislužby nabízejí mezinárodní přepravy (např. do Vídně, Drážďan).</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">7. Bezpečnostní tipy</h2>

            <div className="bg-red-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pro zákazníky</h3>

              <ul className="space-y-3">
                <li><strong>✓ Ověřujte identitu řidiče</strong> - Zkontrolujte poznávací značku a jméno řidiče</li>
                <li><strong>✓ Sledujte trasu</strong> - Používejte GPS na telefonu</li>
                <li><strong>✓ Sdílejte polohu</strong> - Pošlete live location přátelům/rodině</li>
                <li><strong>✓ Seďte vzadu</strong> - Bezpečnější pozice</li>
                <li><strong>✓ Důvěřujte instinktu</strong> - Pokud se cítíte nepříjemně, požádejte o zastavení</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg my-4">
              <h3 className="text-2xl font-bold mb-3">Pro řidiče</h3>

              <ul className="space-y-3">
                <li><strong>✓ Navažte oční kontakt</strong> - Identifikujte pasažéra</li>
                <li><strong>✓ Informujte dispečink</strong> - O cíli a změně trasy</li>
                <li><strong>✓ Používejte kamery</strong> - Dashcam a interiérová kamera</li>
                <li><strong>✓ Důvěřujte instinktu</strong> - Máte právo odmítnout rizikového pasažéra</li>
              </ul>

              <p className="mt-4 font-semibold">
                <Link href="/alkohol-nocny-zivot" className="text-primary hover:underline">
                  → Přečtěte si komplexní bezpečnostní návod pro řidiče
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">8. Taxislužby podle měst</h2>

            <p>
              V Česku působí více než 1 200 taxislužeb. Připravili jsme pro vás detailní přehledy pro každé město s ověřenými kontakty a ceníky.
            </p>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 my-4">
              <h3 className="text-2xl font-bold mb-3 text-center">Největší města</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/taxi/praha" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Praha</h4>
                  <p className="text-sm text-gray-600">14 taxislužeb</p>
                  <p className="text-sm text-primary mt-2">Zobrazit →</p>
                </Link>

                <Link href="/taxi/brno" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Brno</h4>
                  <p className="text-sm text-gray-600">14 taxislužeb</p>
                  <p className="text-sm text-primary mt-2">Zobrazit →</p>
                </Link>

                <Link href="/taxi/ostrava" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Ostrava</h4>
                  <p className="text-sm text-gray-600">15 taxislužeb</p>
                  <p className="text-sm text-primary mt-2">Zobrazit →</p>
                </Link>

                <Link href="/taxi/plzen" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Plzeň</h4>
                  <p className="text-sm text-gray-600">12 taxislužeb</p>
                  <p className="text-sm text-primary mt-2">Zobrazit →</p>
                </Link>

                <Link href="/taxi/liberec" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Liberec</h4>
                  <p className="text-sm text-gray-600">10 taxislužeb</p>
                  <p className="text-sm text-primary mt-2">Zobrazit →</p>
                </Link>

                <Link href="/taxi/olomouc" className="bg-white p-4 rounded-lg border border-foreground/10">
                  <h4 className="font-bold text-lg mb-2">Olomouc</h4>
                  <p className="text-sm text-gray-600">11 taxislužeb</p>
                  <p className="text-sm text-primary mt-2">Zobrazit →</p>
                </Link>
              </div>

              <div className="text-center mt-6">
                <Link href="/">
                  <Button variant="outline">
                    Zobrazit všechna města (150+)
                  </Button>
                </Link>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-3">9. Často kladené dotazy</h2>

            <div className="space-y-6 my-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Kolik stojí taxi v Česku?</h3>
                <p>Průměrná 5km jízda stojí 6-9,50 €. Ceny se liší podle města a konkrétní služby. <Link href="/prieskum-cien-taxisluzieb-slovensko-2025" className="text-primary hover:underline">Podívejte se na detailní cenový průzkum</Link>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Jak objednám taxi?</h3>
                <p>Telefonicky, přes aplikaci, na stanovišti, nebo přes naši stránku TaxiNearMe.cz.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Můžu platit kartou?</h3>
                <p>Většina moderních taxislužeb akceptuje platby kartou. Vždy si ověřte předem.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Může řidič odmítnout jízdu?</h3>
                <p>Ano, pokud jste agresivní, pod vlivem, nevíte cíl, nebo máte nebezpečné předměty. <Link href="/alkohol-nocny-zivot" className="text-primary hover:underline">Více info zde</Link>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Jak hodnotit taxislužbu?</h3>
                <p>Férově - hodnoťte jen to, co řidič ovlivnil. <Link href="/hodnotenie-vodicov" className="text-primary hover:underline">Přečtěte si návod</Link>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Jsou v Česku elektromobily taxi?</h3>
                <p>Ano, v Praze, Brně a dalších větších městech. Dostupnost roste.</p>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            <h2 className="text-3xl font-bold mt-12 mb-3">Závěr</h2>

            <p className="text-lg">
              Taxislužby v Česku procházejí modernizací. Stále více služeb nabízí aplikace, bezhotovostní platby a ekologická vozidla. <strong>Informovaný zákazník</strong> je spokojný zákazník - proto jsme vytvořili tohoto komplexního průvodce.
            </p>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl  p-8 my-6 text-center">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Související články</h3>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Link href="/prieskum-cien-taxisluzieb-slovensko-2025">
                  <Button variant="outline" className="w-full">
                    Cenový průzkum
                  </Button>
                </Link>
                <Link href="/hodnotenie-vodicov">
                  <Button variant="outline" className="w-full">
                    Jak hodnotit řidiče
                  </Button>
                </Link>
                <Link href="/alkohol-nocny-zivot">
                  <Button variant="outline" className="w-full">
                    Bezpečnost v noci
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
            articleSlug="komplexny-průvodce-taxi"
            articleTitle="Často kladené dotazy o taxislužbách"
          />

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl  text-center">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              <MapPin className="h-6 w-6 inline mr-2" />
              Najděte taxi ve vašem městě
            </h3>
            <p className="text-gray-700 mb-3">
              Více než 1 200 ověřených taxislužeb ve více než 150 českých městech.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Vyhledat taxi
                <ArrowLeft className="h-2.5 w-2.5 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
