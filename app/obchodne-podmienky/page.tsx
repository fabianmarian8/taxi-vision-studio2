import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FooterLegal } from "@/components/FooterLegal";
import { SEO_CONSTANTS } from '@/lib/seo-constants';

export const metadata: Metadata = {
  title: 'Obchodné podmienky – PREMIUM a PARTNER služby – TaxiNearMe.cz',
  description: 'Všeobecné obchodné podmienky pre platené služby PREMIUM a PARTNER na portáli TaxiNearMe.cz. Mesačné predplatné pre taxislužby.',
  openGraph: {
    title: 'Obchodné podmienky – PREMIUM a PARTNER služby – TaxiNearMe.cz',
    description: 'Všeobecné obchodné podmienky pre platené služby PREMIUM a PARTNER na portáli TaxiNearMe.cz.',
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: `${SEO_CONSTANTS.siteUrl}/obchodne-podmienky`,
    siteName: SEO_CONSTANTS.siteName,
    images: [{ url: SEO_CONSTANTS.defaultImage, width: SEO_CONSTANTS.defaultImageWidth, height: SEO_CONSTANTS.defaultImageHeight }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Obchodné podmienky – PREMIUM a PARTNER služby – TaxiNearMe.cz',
    description: 'Všeobecné obchodné podmienky pre platené služby PREMIUM a PARTNER na portáli TaxiNearMe.cz.',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/obchodne-podmienky`,
  },
};

const ObchodnePodmienky = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto max-w-4xl px-8 py-24">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na hlavnú stránku
          </Button>
        </Link>

        <h1 className="text-4xl md:text-5xl font-black mb-8 text-foreground">
          Obchodné podmienky pre služby PREMIUM a PARTNER
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-lg text-foreground/90 leading-relaxed">
            Dátum účinnosti: 26. 11. 2025
          </p>

          {/* 1. Základné ustanovenia */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              1. Základné ustanovenia
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Tieto Všeobecné obchodné podmienky (ďalej len "VOP") upravujú práva a povinnosti
              zmluvných strán pri poskytovaní platených služieb PREMIUM a PARTNER na webovom
              portáli TaxiNearMe.cz.
            </p>
            <div className="bg-card p-6 rounded-lg border-2 border-foreground/10">
              <p className="text-foreground/80 leading-relaxed">
                <strong>Poskytovateľ:</strong>
                <br />
                Marián Fabián
                <br />
                IČO: 47 340 860
                <br />
                DIČ: 1086305902
                <br />
                Miesto podnikania: Gorkého 769/8, 962 31 Sliač, Slovenská republika
                <br />
                E-mail:{" "}
                <a href="mailto:info@taxinearme.cz" className="underline">
                  info@taxinearme.cz
                </a>
                <br />
                Zapísaný v živnostenskom registri: Okresný úrad Banská Bystrica
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Objednávateľ:</strong> Fyzická osoba - podnikateľ alebo právnická osoba (taxislužba),
              ktorá si objedná službu PREMIUM alebo PARTNER.
            </p>
          </section>

          {/* 2. Predmet zmluvy */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              2. Predmet zmluvy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Predmetom zmluvy je poskytovanie digitálnych služieb zvýhodneného zobrazenia
              taxislužby na portáli TaxiNearMe.cz. Poskytovateľ ponúka nasledujúce služby:
            </p>

            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 mt-4">
              <h3 className="text-xl font-bold text-purple-900 mb-3">PREMIUM - 3,99 EUR / mesiac</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Pozícia na vrchu zoznamu pred nezvýraznenými taxislužbami</li>
                <li>Zlaté zvýraznenie karty taxislužby</li>
                <li>Badge "OVERENÉ" pre zvýšenú dôveryhodnosť</li>
                <li>Väčšie zobrazenie telefónneho čísla</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300 mt-4">
              <h3 className="text-xl font-bold text-yellow-800 mb-3">PARTNER - 8,99 EUR / mesiac</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Všetky výhody PREMIUM</li>
                <li>Fialové zvýraznenie (vyššie ako PREMIUM)</li>
                <li>Vlastná personalizovaná stránka taxislužby</li>
                <li>Možnosť pridania galérie a cenníka</li>
                <li>Zobrazenie recenzií z Google Business Profile</li>
                <li>Krátky popis v zozname taxislužieb</li>
              </ul>
            </div>
          </section>

          {/* 3. Uzavretie zmluvy */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              3. Uzavretie zmluvy a spôsob objednávky
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Zmluva sa uzatvára:
            </p>
            <ol className="list-decimal pl-8 space-y-2 text-foreground/80">
              <li>Odoslaním objednávky prostredníctvom tlačidla "Mám záujem" na stránke</li>
              <li>Dokončením platby cez platobnú bránu Stripe</li>
              <li>Potvrdením aktivácie služby zo strany Poskytovateľa</li>
            </ol>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Objednávateľ berie na vedomie, že objednávkou a zaplatením súhlasí s týmito VOP.
            </p>
          </section>

          {/* 4. Ceny a platobné podmienky */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              4. Ceny a platobné podmienky
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Poskytovateľ nie je platcom DPH. Uvedené ceny sú konečné.
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li><strong>PREMIUM:</strong> 3,99 EUR / mesiac</li>
              <li><strong>PARTNER:</strong> 8,99 EUR / mesiac</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Platba sa realizuje prostredníctvom platobnej brány <strong>Stripe</strong>, ktorá
              zabezpečuje bezpečné spracovanie platobných kariet.
            </p>
          </section>

          {/* 5. Automatické obnovovanie */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              5. Automatické obnovovanie predplatného
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6">
              <p className="text-foreground font-semibold mb-2">
                Dôležité upozornenie:
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Predplatné sa <strong>automaticky obnovuje</strong> na konci každého mesačného obdobia.
                Platba sa automaticky stiahne z platobnej karty, ktorú ste použili pri prvej platbe.
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Objednávateľ môže kedykoľvek zrušiť automatické obnovovanie v nastaveniach svojho
              účtu v Stripe alebo kontaktovaním poskytovateľa na{" "}
              <a href="mailto:info@taxinearme.cz" className="underline">info@taxinearme.cz</a>.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Zrušenie je potrebné vykonať <strong>najneskôr 24 hodín pred koncom aktuálneho
              fakturačného obdobia</strong>. Po zrušení bude služba aktívna do konca zaplateného obdobia.
            </p>
          </section>

          {/* 6. Aktivácia služby */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              6. Aktivácia služby a dodacie lehoty
            </h2>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li><strong>PREMIUM:</strong> Aktivácia do 24 hodín od prijatia platby</li>
              <li><strong>PARTNER:</strong> Aktivácia do 48 hodín od prijatia platby a dodania
                potrebných podkladov (logo, popis, fotografie a pod.)</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              V prípade, že objednávateľ nedodá potrebné podklady pre službu PARTNER,
              poskytovateľ nie je v omeškaní s plnením zmluvy.
            </p>
          </section>

          {/* 7. Právo na odstúpenie */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              7. Právo na odstúpenie od zmluvy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Vzhľadom na charakter služieb (digitálne služby poskytované B2B klientom - podnikateľom):
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li>
                Ak je objednávateľ <strong>podnikateľ</strong> (taxislužba s IČO), právo na odstúpenie
                od zmluvy do 14 dní <strong>sa neuplatňuje</strong> podľa zákona č. 102/2014 Z. z.
              </li>
              <li>
                Ak by bol objednávateľ spotrebiteľom, odoslaním objednávky a zaplatením vyjadruje
                <strong> výslovný súhlas</strong> so začatím poskytovania služby pred uplynutím lehoty
                na odstúpenie a berie na vedomie, že tým stráca právo na odstúpenie od zmluvy podľa
                § 7 ods. 6 písm. l) zákona č. 102/2014 Z. z.
              </li>
            </ul>
          </section>

          {/* 8. Zrušenie predplatného */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              8. Zrušenie predplatného
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Objednávateľ môže kedykoľvek zrušiť predplatné:
            </p>
            <ol className="list-decimal pl-8 space-y-2 text-foreground/80">
              <li>Priamo v Stripe customer portáli (ak bol vytvorený účet)</li>
              <li>E-mailom na <a href="mailto:info@taxinearme.cz" className="underline">info@taxinearme.cz</a></li>
            </ol>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Po zrušení:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li>Služba zostáva aktívna do konca zaplateného obdobia</li>
              <li>Už zaplatené poplatky sa nevracajú</li>
              <li>Po skončení obdobia sa taxislužba vráti do štandardného zobrazenia</li>
            </ul>
          </section>

          {/* 9. Reklamácie */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              9. Reklamačný poriadok
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              V prípade problémov so službou (nefunkčnosť, technické chyby) môže objednávateľ
              uplatniť reklamáciu:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li>E-mailom na <a href="mailto:info@taxinearme.cz" className="underline">info@taxinearme.cz</a></li>
              <li>Reklamácia bude vybavená do 30 dní od jej doručenia</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Poskytovateľ sa zaväzuje odstrániť vady služby v čo najkratšom čase. V prípade
              nemožnosti odstránenia vady má objednávateľ nárok na primeranú zľavu alebo
              vrátenie pomernej časti predplatného za obdobie, kedy služba nefungovala.
            </p>
          </section>

          {/* 10. Zodpovednosť */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              10. Zodpovednosť a obmedzenia
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Poskytovateľ nezaručuje:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li>Konkrétny počet kliknutí, hovorov alebo zákazníkov</li>
              <li>Zvýšenie obratu alebo zisku taxislužby</li>
              <li>Nepretržitú dostupnosť webu (môže dochádzať k plánovaným údržbám)</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Poskytovateľ nezodpovedá za škody vzniknuté:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-foreground/80">
              <li>V dôsledku nesprávnych údajov poskytnutých objednávateľom</li>
              <li>Výpadkami služieb tretích strán (hosting, platobná brána)</li>
              <li>Vyššia moc (prírodné katastrofy, hacknutie a pod.)</li>
            </ul>
          </section>

          {/* 11. Ochrana osobných údajov */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              11. Ochrana osobných údajov
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Osobné údaje sú spracovávané v súlade s Nariadením GDPR a zákonom č. 18/2018 Z. z.
              Podrobnosti sú uvedené v{" "}
              <Link href="/ochrana-sukromia" className="underline">
                Ochrane súkromia
              </Link>.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Platobné údaje sú spracovávané priamo spoločnosťou <strong>Stripe</strong> a poskytovateľ
              nemá prístup k údajom o platobných kartách.
            </p>
          </section>

          {/* 12. Zmeny VOP */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              12. Zmeny obchodných podmienok
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Poskytovateľ si vyhradzuje právo zmeniť tieto VOP. O zmene bude objednávateľ
              informovaný e-mailom najmenej 14 dní pred účinnosťou zmeny.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Ak objednávateľ nesúhlasí so zmenami, môže predplatné zrušiť pred nadobudnutím
              účinnosti nových VOP.
            </p>
          </section>

          {/* 13. Riešenie sporov */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              13. Rozhodné právo a riešenie sporov
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Tieto VOP sa riadia právnym poriadkom Slovenskej republiky.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Orgán dozoru:</strong>
              <br />
              Slovenská obchodná inšpekcia (SOI)
              <br />
              Inšpektorát SOI pre Banskobystrický kraj
              <br />
              Dolná 46, 974 00 Banská Bystrica
              <br />
              E-mail: <a href="mailto:bb@soi.sk" className="underline">bb@soi.sk</a>
              <br />
              Web: <a href="https://www.soi.sk" target="_blank" rel="noopener noreferrer" className="underline">www.soi.sk</a>
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Prípadné spory budú prednostne riešené zmierlivou cestou. Ak sa nedosiahne dohoda,
              spor bude riešený príslušnými súdmi Slovenskej republiky.
            </p>
          </section>

          {/* 14. Záverečné ustanovenia */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">
              14. Záverečné ustanovenia
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Tieto VOP nadobúdajú účinnosť dňom 26. 11. 2025.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Ak sa niektoré ustanovenie týchto VOP stane neplatným, ostatné ustanovenia
              zostávajú v platnosti.
            </p>
          </section>

          <div className="mt-12 p-6 bg-card rounded-lg border-2 border-foreground/10">
            <p className="text-foreground/80 leading-relaxed">
              <strong>Kontakt pre otázky k obchodným podmienkam:</strong>
              <br />
              E-mail: <a href="mailto:info@taxinearme.cz" className="underline">info@taxinearme.cz</a>
            </p>
          </div>
        </div>

        <Link href="/">
          <Button className="mt-12" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na hlavnú stránku
          </Button>
        </Link>
      </div>

      <FooterLegal />
    </div>
  );
};

export default ObchodnePodmienky;
