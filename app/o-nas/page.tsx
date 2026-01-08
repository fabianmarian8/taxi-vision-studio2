import { Metadata } from "next";
import { Header } from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Target, ArrowRight } from "lucide-react";
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const metadata: Metadata = {
  title: 'O nás | TaxiNearMe.cz',
  description: 'Sme tím, ktorý pomáha ľuďom nájsť spoľahlivé taxi v Česku. Náš príbeh, misia a hodnoty.',
  openGraph: {
    title: 'O nás | TaxiNearMe.cz',
    description: 'Sme tím, ktorý pomáha ľuďom nájsť spoľahlivé taxi v Česku.',
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
    description: 'Sme tím, ktorý pomáha ľuďom nájsť spoľahlivé taxi v Česku.',
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
              <span className="text-gray-400 text-3xl md:text-4xl">.sk</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Pomáhame ľuďom nájsť spoľahlivé taxi<br className="hidden md:block" /> kdekoľvek na Slovensku.
          </p>
        </div>
      </section>

      {/* Náš príbeh */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Náš príbeh
          </h2>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Myšlienka na TaxiNearMe.sk vznikla z úplne bežnej situácie. Bol som v cudzom meste, potreboval som taxi a netušil som, komu zavolať. Google mi ukázal desiatky výsledkov, ale žiadny jasný prehľad. Preklikával som sa stránkami, hľadal telefónne čísla, porovnával ponuky… zbytočne komplikované.
            </p>

            <p>
              Vtedy mi napadla jednoduchá otázka: „Prečo neexistuje jedno miesto, kde nájdem všetky taxislužby na Slovensku?"
            </p>

            <p>
              TaxiNearMe.sk je odpoveďou na túto otázku. Nie je to ďalšia aplikácia na objednávanie, ale prehľadný katalóg. Bez registrácie, bez sťahovania, bez zbytočností. Len zoznam taxislužieb s telefónnymi číslami, zoradený podľa miest.
            </p>

            <p>
              Niekedy je najlepšie riešenie to najjednoduchšie: potrebuješ taxi, nájdeš číslo, zavoláš.
            </p>
          </div>
        </div>
      </section>

      {/* Hodnoty */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Čomu veríme
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Jednoduchosť</h3>
              <p className="text-gray-600">
                Žiadne zbytočné kroky. Nájdeš mesto, nájdeš taxi, zavoláš. Hotovo.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Dôveryhodnosť</h3>
              <p className="text-gray-600">
                Overené údaje, reálne taxislužby. Pravidelne aktualizované kontakty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Lokálnosť</h3>
              <p className="text-gray-600">
                Podporujeme miestne taxislužby. Každé mesto má svoje taxi, my ich spájame s ľuďmi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tím */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Náš tím
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image
                  src="/images/author-marian.webp"
                  alt="Marián - Zakladateľ TaxiNearMe"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-gray-900">Marián</h3>
                <p className="text-yellow-600 font-medium mb-3">Zakladateľ TaxiNearMe</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Marián stojí za myšlienkou TaxiNearMe. Vytvoril platformu, ktorá pomáha ľuďom nájsť spoľahlivé taxi kdekoľvek na Slovensku.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image
                  src="/images/author-peter.webp"
                  alt="Peter - Redaktor TaxiNearMe"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-gray-900">Peter</h3>
                <p className="text-yellow-600 font-medium mb-3">Redaktor TaxiNearMe</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Peter sa venuje analýze taxislužieb na Slovensku a prináša overené informácie o dopravnej legislatíve, cenách a trendoch v odvetví.
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
              <p className="text-gray-400 text-sm">miest</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">1000+</div>
              <p className="text-gray-400 text-sm">taxislužieb</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">2900+</div>
              <p className="text-gray-400 text-sm">slovenských obcí</p>
            </div>
          </div>
        </div>
      </section>

      {/* Zdroje údajov */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Odkiaľ čerpáme údaje
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700">
              Všetky údaje na TaxiNearMe.sk sú z overených zdrojov:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Štatistický úrad SR</strong> – údaje o obciach, obyvateľoch, PSČ (Sčítanie 2021)</li>
              <li><strong>Google Maps API</strong> – GPS súradnice, vzdialenosti, časy ciest</li>
              <li><strong>Verejné registre</strong> – koncesie taxislužieb, kontaktné údaje</li>
              <li><strong>Overené webové stránky</strong> taxislužieb a dopravcov</li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Ak nájdete nesprávny údaj, <Link href="/kontakt" className="text-yellow-600 hover:underline">dajte nám vedieť</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 bg-yellow-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ste taxislužba?
          </h2>
          <p className="text-gray-600 mb-6">
            Pridajte sa k nám a získajte viac zákazníkov. Partner program je tu pre vás.
          </p>
          <Link
            href="/pre-taxiky"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Zistiť viac
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025 TaxiNearMe.sk. Všetky práva vyhradené.
            </div>
            <div className="flex gap-6">
              <Link href="/ochrana-sukromia" className="text-sm text-gray-600 hover:text-gray-900">
                Ochrana súkromia
              </Link>
              <Link href="/podmienky-pouzivania" className="text-sm text-gray-600 hover:text-gray-900">
                Podmienky
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
