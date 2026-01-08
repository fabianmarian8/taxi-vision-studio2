import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { GeometricLines } from '@/components/GeometricLines';
import {
  Crown,
  Star,
  Eye,
  Award,
  Search,
  CheckCircle2,
  ArrowRight,
  Users,
  MapPin,
  BarChart3,
  Zap,
  Globe,
  Smartphone,
  ShieldCheck,
  Rocket,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SEO_CONSTANTS } from '@/lib/seo-constants';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pro taxislužby - PREMIUM a PARTNER program | Taxi NearMe',
  description:
    'Zvyšte viditelnost vaší taxislužby na největším českém portálu. PREMIUM zvýraznění a PARTNER program pro profesionální taxislužby.',
  keywords: [
    'taxi reklama',
    'propagace taxislužby',
    'taxi marketing',
    'taxislužba online',
    'taxi portál česko',
  ],
  openGraph: {
    title: 'Pro taxislužby - PREMIUM a PARTNER program | Taxi NearMe',
    description: 'Zvyšte viditelnost vaší taxislužby na největším českém portálu.',
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: `${SEO_CONSTANTS.siteUrl}/pre-taxiky`,
    siteName: SEO_CONSTANTS.siteName,
    images: [
      {
        url: SEO_CONSTANTS.defaultImage,
        width: SEO_CONSTANTS.defaultImageWidth,
        height: SEO_CONSTANTS.defaultImageHeight,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SEO_CONSTANTS.twitterSite,
    title: 'Pro taxislužby - PREMIUM a PARTNER program | Taxi NearMe',
    description: 'Zvyšte viditelnost vaší taxislužby na největším českém portálu.',
    images: [SEO_CONSTANTS.defaultImage],
  },
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/pre-taxiky`,
  },
};

function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4 md:px-8 relative bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-400 font-medium text-center md:text-left">
            © 2025 Taxi NearMe. Všechna práva vyhrazena.
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="/ochrana-sukromia"
              className="text-sm text-slate-400 hover:text-yellow-400 transition-colors"
            >
              Ochrana soukromí
            </Link>
            <Link
              href="/podmienky-pouzivania"
              className="text-sm text-slate-400 hover:text-yellow-400 transition-colors"
            >
              Podmínky používání
            </Link>
            <Link
              href="/obchodne-podmienky"
              className="text-sm text-slate-400 hover:text-yellow-400 transition-colors"
            >
              Obchodní podmínky
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-yellow-400 transition-colors"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PreTaxikyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-purple-500/30">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-12 md:pt-32 md:pb-20 px-4 md:px-8 relative overflow-hidden">
        <GeometricLines variant="hero" count={12} />
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-yellow-400/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white mb-6 md:mb-8 leading-tight tracking-tight">
              Získejte více jízd s
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 drop-shadow-sm">
                TaxiNearMe
              </span>
            </h1>

            <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
              Největší český portál taxislužeb. Přestaňte čekat na dispečinku a buďte tam, kde
              vás zákazníci aktivně hledají – <strong>přímo v jejich mobilu</strong>.
            </p>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Měst a obcí', value: '2 897+', icon: MapPin, color: 'text-purple-400' },
                { label: 'Taxislužeb', value: '1 000+', icon: Rocket, color: 'text-yellow-400' },
                {
                  label: 'Zobrazení/mes',
                  value: '100k+',
                  icon: Eye,
                  color: 'text-blue-400',
                },
                {
                  label: 'Spokojených partnerů',
                  value: '100%',
                  icon: ShieldCheck,
                  color: 'text-green-400',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color} mb-1.5 md:mb-2`} />
                  <div className="text-xl md:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium text-center">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-slate-950 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-black text-white mb-4 md:mb-6">Proč TaxiNearMe?</h2>
            <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto">
              Nejsme jen další seznam. Jsme technologická platforma, která rozumí potřebám moderní
              taxislužby.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Large Feature */}
            <Card className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-500/20 overflow-hidden relative group">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
              <CardContent className="p-6 md:p-8 h-full flex flex-col justify-end relative z-10">
                <div className="absolute top-6 right-6 md:top-8 md:right-8 w-16 h-16 md:w-24 md:h-24 bg-purple-500/30 rounded-full blur-2xl md:blur-3xl group-hover:bg-purple-500/40 transition-all" />
                <Search className="h-8 w-8 md:h-12 md:w-12 text-purple-400 mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Dominantní SEO</h3>
                <p className="text-slate-300 text-sm md:text-lg leading-relaxed">
                  Když někdo hledá "taxi [vaše město]", najde nás. A přes nás najde vás. Investujeme
                  tisíce hodin do optimalizace, abyste vy nemuseli.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-900/50 border-white/10 hover:border-yellow-400/30 transition-colors">
              <CardContent className="p-5 md:p-6">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 md:mb-2">Cílená klientela</h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Lidé u nás nehledají pizzu ani počasí. Hledají odvoz. Konverzní poměr je
                  maximální.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-900/50 border-white/10 hover:border-blue-400/30 transition-colors">
              <CardContent className="p-5 md:p-6">
                <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-blue-400 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 md:mb-2">Mobile First</h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  92% našich návštěvníků přichází z mobilu. Váš profil je optimalizovaný pro
                  rychlé vytočení čísla.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-slate-900/50 border-white/10 hover:border-green-400/30 transition-colors">
              <CardContent className="p-5 md:p-6">
                <Zap className="h-6 w-6 md:h-8 md:w-8 text-green-400 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 md:mb-2">Okamžitá aktivace</h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Žádné smlouvy poštou. Aktivace profilu probíhá online a změny vidíte do 24
                  hodin.
                </p>
              </CardContent>
            </Card>

            {/* Wide Feature */}
            <Card className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 border-white/10 flex flex-col md:flex-row items-center overflow-hidden">
              <CardContent className="p-6 md:p-8 flex-1">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-yellow-400 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Budování důvěry</h3>
                <p className="text-slate-400 text-sm md:text-base">
                  Profil na TaxiNearMe s odznakem "Ověřená taxislužba" zvyšuje vaši kredibilitu v
                  očích zákazníků.
                </p>
              </CardContent>
              <div className="h-full w-full md:w-1/3 bg-white/5 flex items-center justify-center p-6 md:p-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">4.9/5</div>
                  <div className="flex gap-1 justify-center text-yellow-400 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20 px-4 md:px-8 border-y border-white/5 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Jak to funguje?</h2>
            <p className="text-sm md:text-base text-slate-400">Tři jednoduché kroky k novým zákazníkům</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0" />

            {[
              {
                step: '01',
                title: 'Vyberte si balíček',
                desc: 'Zvolte si úroveň viditelnosti, která vám vyhovuje.',
              },
              {
                step: '02',
                title: 'Vyplňte údaje',
                desc: 'Pošleme vám krátký formulář pro vaše údaje a fotky.',
              },
              {
                step: '03',
                title: 'Vydělávejte',
                desc: 'Váš profil spustíme do 24h a zákazníci vás začnou volat.',
              },
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center group">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-slate-950 border-4 border-slate-900 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:border-yellow-400 transition-colors duration-300">
                  <span className="text-xl md:text-3xl font-black text-slate-700 group-hover:text-yellow-400 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-slate-400 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 md:py-24 px-4 md:px-8 relative" id="pricing">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[800px] md:h-[500px] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-black text-white mb-3 md:mb-4">
              Investice, která se vrátí
            </h2>
            <p className="text-sm md:text-lg text-slate-400">
              Stačí <strong>jediná jízda měsíčně</strong> navíc a máte to zaplacené.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* PREMIUM Package */}
            <Card className="bg-slate-900/40 border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm order-2 md:order-1">
              <CardHeader className="pb-6 md:pb-8 border-b border-white/5 p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">PREMIUM</CardTitle>
                    <p className="text-slate-400 text-xs md:text-sm">Pro začínající taxislužby</p>
                  </div>
                  <Crown className="h-6 w-6 md:h-8 md:w-8 text-slate-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-white">3,99€</span>
                  <span className="text-slate-500 text-sm md:text-base font-medium">/ měsíc</span>
                </div>
                <div className="text-xs md:text-sm text-slate-500 line-through mt-1">Běžně 5,99€</div>
              </CardHeader>
              <CardContent className="pt-6 md:pt-8 p-6 md:p-8">
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[
                    'Přednostní zobrazení v seznamu',
                    'Zlaté zvýraznění profilu',
                    'Badge "Ověřená taxislužba"',
                    'Větší tlačítko na volání',
                    'Zobrazení loga',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm md:text-base">
                      <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://buy.stripe.com/8x26oH7CK8SU5G94NX7Re00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-3 md:py-4 rounded-xl transition-all text-sm md:text-base"
                >
                  Vybrat PREMIUM
                </a>
              </CardContent>
            </Card>

            {/* PARTNER Package */}
            <Card className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-400/50 shadow-2xl shadow-yellow-400/10 transform md:-translate-y-4 order-1 md:order-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 text-[10px] md:text-xs font-black px-4 py-1 rounded-b-lg tracking-widest uppercase whitespace-nowrap">
                Nejprodávanější
              </div>
              <CardHeader className="pb-6 md:pb-8 border-b border-white/10 p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-yellow-400 mb-1 md:mb-2">PARTNER</CardTitle>
                    <p className="text-slate-300 text-xs md:text-sm">Kompletní digitální prezentace</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-white">8,99€</span>
                  <span className="text-slate-500 text-sm md:text-base font-medium">/ měsíc</span>
                </div>
                <div className="text-xs md:text-sm text-slate-500 line-through mt-1">Běžně 12,99€</div>
              </CardHeader>
              <CardContent className="pt-6 md:pt-8 p-6 md:p-8">
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[
                    'Všechny výhody PREMIUM',
                    'Vlastní personalizovaná stránka',
                    'Fotogalerie vozidel',
                    'Rozšířený popis služeb a ceník',
                    'Partner portál - obsah si můžete upravovat okamžitě i sami',
                    'Import Google recenzí',
                    'Prioritní podpora 24/7',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-white text-sm md:text-base">
                      <CheckCircle2 className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 md:space-y-4">
                  <a
                    href="https://buy.stripe.com/7sYeVd0ai9WYc4x94d7Re01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-6 py-3 md:py-4 rounded-xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 hover:scale-[1.02] text-sm md:text-base"
                  >
                    Stát se PARTNEREM
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <div className="text-center">
                    <Link
                      href="/taxi/zvolen/fast-taxi-zvolen"
                      className="text-xs md:text-sm text-slate-400 hover:text-white underline underline-offset-4 decoration-slate-700 hover:decoration-white transition-all"
                    >
                      Prohlédnout ukázku partnera
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-slate-900/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Časté dotazy</h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
            <AccordionItem value="item-1" className="border border-white/10 rounded-lg px-4 md:px-6 bg-white/5">
              <AccordionTrigger className="text-white text-sm md:text-base hover:no-underline hover:text-yellow-400">
                Jak probíhá platba?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 text-sm md:text-base">
                Platba probíhá bezpečně přes platební bránu Stripe. Předplatné se automaticky obnovuje každý měsíc, ale můžete ho kdykoliv zrušit jedním kliknutím.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-white/10 rounded-lg px-4 md:px-6 bg-white/5">
              <AccordionTrigger className="text-white text-sm md:text-base hover:no-underline hover:text-yellow-400">
                Mám závazek?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 text-sm md:text-base">
                Ne, závazek nemáme, ale platby jsou opakované (měsíční předplatné). Službu můžete kdykoliv zrušit, ale zrušením platby ztrácíte všechny výhody (zvýraznění, vlastní stránka) a váš profil se vrátí do základního režimu.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-white/10 rounded-lg px-4 md:px-6 bg-white/5">
              <AccordionTrigger className="text-white text-sm md:text-base hover:no-underline hover:text-yellow-400">
                Co potřebuji k vytvoření profilu?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 text-sm md:text-base">
                Po zaplacení vás budeme kontaktovat. Budeme potřebovat vaše logo, fotky aut (pokud máte Partner balík), telefonní číslo a základní info o službách. Vše nastavíme za vás.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border border-white/10 rounded-lg px-4 md:px-6 bg-white/5">
              <AccordionTrigger className="text-white text-sm md:text-base hover:no-underline hover:text-yellow-400">
                Garantujete mi zákazníky?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 text-sm md:text-base">
                Garantujeme vám zvýšenou viditelnost na nejnavštěvovanějším taxi portálu. Počet reálných jízd závisí na poptávce ve vašem městě a vaší dostupnosti, ale naši partneři hlásí návratnost investice už po prvních dnech.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-slate-950" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <HelpCircle className="h-10 w-10 md:h-12 md:w-12 text-slate-500 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6">
            Máte další dotazy?
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8 max-w-xl mx-auto">
            Jsme tu pro vás. Napište nám a rádi vám vysvětlíme, jak můžeme pomoci vaší taxislužbě růst.
          </p>
          <a
            href="mailto:info@taxinearme.cz"
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl transition-all text-sm md:text-base"
          >
            <Globe className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
            info@taxinearme.cz
          </a>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
