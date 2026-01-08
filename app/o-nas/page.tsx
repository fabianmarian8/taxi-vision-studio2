import { Metadata } from "next";
import { Header } from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Target, ArrowRight } from "lucide-react";
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const metadata: Metadata = {
  title: 'O nás | TaxiNearMe.cz',
  description: 'Jsme tým, který pomáhá lidem najít spolehlivé taxi v Česku. Náš příběh, mise a hodnoty.',
  openGraph: {
    title: 'O nás | TaxiNearMe.cz',
    description: 'Jsme tým, který pomáhá lidem najít spolehlivé taxi v Česku.',
    url: `${SEO_CONSTANTS.siteUrl}/o-nas`,
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    siteName: SEO_CONSTANTS.siteName,
    images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'O nás | TaxiNearMe.cz',
    description: 'Jsme tým, který pomáhá lidem najít spolehlivé taxi v Česku.',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/o-nas`,
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Typografická elegancia */}
      <section className="pt-16 pb-20 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Logo s typografickým trikom - bodka nad "i" je lokalizačný pin */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight">
              Tax
              <span className="relative inline-block">
                i
                {/* Lokalizačný pin namiesto bodky nad i */}
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-500"
                  style={{ fontSize: '0.35em' }}
                >
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 fill-yellow-500" />
                </span>
              </span>
              NearMe
              <span className="text-gray-400 text-3xl md:text-4xl">.cz</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Pomáháme lidem najít spolehlivé taxi<br className="hidden md:block" /> kdekoliv v Česku.
          </p>
        </div>
      </section>

      {/* Náš příběh */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Náš příběh
          </h2>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Myšlenka na TaxiNearMe.cz vznikla z úplně běžné situace. Byl jsem v cizím městě, potřeboval jsem taxi a netušil jsem, komu zavolat. Google mi ukázal desítky výsledků, ale žádný jasný přehled. Proklikával jsem se stránkami, hledal telefonní čísla, porovnával nabídky... zbytečně komplikované.
            </p>

            <p>
              Tehdy mě napadla jednoduchá otázka: "Proč neexistuje jedno místo, kde najdu všechny taxislužby v Česku?"
            </p>

            <p>
              TaxiNearMe.cz je odpovědí na tuto otázku. Není to další aplikace na objednávání, ale přehledný katalog. Bez registrace, bez stahování, bez zbytečností. Jen seznam taxislužeb s telefonními čísly, seřazený podle měst.
            </p>

            <p>
              Někdy je nejlepší řešení to nejjednodušší: potřebuješ taxi, najdeš číslo, zavoláš.
            </p>
          </div>
        </div>
      </section>

      {/* Hodnoty */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Čemu věříme
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Jednoduchost</h3>
              <p className="text-gray-600">
                Žádné zbytečné kroky. Najdeš město, najdeš taxi, zavoláš. Hotovo.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Důvěryhodnost</h3>
              <p className="text-gray-600">
                Ověřené údaje, reálné taxislužby. Pravidelně aktualizované kontakty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Lokálnost</h3>
              <p className="text-gray-600">
                Podporujeme místní taxislužby. Každé město má své taxi, my je spojujeme s lidmi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tým */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Náš tým
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image
                  src="/images/author-marian.webp"
                  alt="Marián - Zakladatel TaxiNearMe"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-gray-900">Marián</h3>
                <p className="text-yellow-600 font-medium mb-3">Zakladatel TaxiNearMe</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Marián stojí za myšlenkou TaxiNearMe. Vytvořil platformu, která pomáhá lidem najít spolehlivé taxi kdekoliv v Česku.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image
                  src="/images/author-peter.webp"
                  alt="Petr - Redaktor TaxiNearMe"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-gray-900">Petr</h3>
                <p className="text-yellow-600 font-medium mb-3">Redaktor TaxiNearMe</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Petr se věnuje analýze taxislužeb v Česku a přináší ověřené informace o dopravní legislativě, cenách a trendech v odvětví.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Čísla */}
      <section className="py-16 px-4 md:px-8 bg-gray-900 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">140+</div>
              <p className="text-gray-400 text-sm">měst</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">1000+</div>
              <p className="text-gray-400 text-sm">taxislužeb</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">6300+</div>
              <p className="text-gray-400 text-sm">českých obcí</p>
            </div>
          </div>
        </div>
      </section>

      {/* Zdroje údajů */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Odkud čerpáme údaje
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700">
              Všechny údaje na TaxiNearMe.cz jsou z ověřených zdrojů:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Český statistický úřad</strong> – údaje o obcích, obyvatelích, PSČ</li>
              <li><strong>Google Maps API</strong> – GPS souřadnice, vzdálenosti, časy cest</li>
              <li><strong>Veřejné registry</strong> – koncese taxislužeb, kontaktní údaje</li>
              <li><strong>Ověřené webové stránky</strong> taxislužeb a dopravců</li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Pokud najdete nesprávný údaj, <Link href="/kontakt" className="text-yellow-600 hover:underline">dejte nám vědět</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 bg-yellow-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Jste taxislužba?
          </h2>
          <p className="text-gray-600 mb-6">
            Přidejte se k nám a získejte více zákazníků. Partner program je tu pro vás.
          </p>
          <Link
            href="/pre-taxiky"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Zjistit více
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025 TaxiNearMe.cz. Všechna práva vyhrazena.
            </div>
            <div className="flex gap-6">
              <Link href="/ochrana-sukromia" className="text-sm text-gray-600 hover:text-gray-900">
                Ochrana soukromí
              </Link>
              <Link href="/podmienky-pouzivania" className="text-sm text-gray-600 hover:text-gray-900">
                Podmínky
              </Link>
              <Link href="/kontakt" className="text-sm text-gray-600 hover:text-gray-900">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
