/**
 * Content Variations Generator
 *
 * Tento modul generuje unikátní obsah pro každou taxislužbu,
 * aby se předešlo duplikátům v Google indexaci.
 *
 * Používá deterministický hash pro výběr varianty textu,
 * takže stejná služba vždy dostane stejný text.
 */

/**
 * Jednoduchá hash funkce pro string
 * Používá se pro deterministický výběr varianty textu
 */
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Vybere variantu z pole na základě hash hodnoty
 */
export function selectVariant<T>(variants: T[], seed: string): T {
  const hash = simpleHash(seed);
  const index = hash % variants.length;
  return variants[index];
}

/**
 * Úvodní odstavec o taxislužbě - 15 variací
 */
export const introVariants = [
  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je taxislužba poskytující přepravu osob v ${cityName} a v celém ${regionName}. Služba zajišťuje dopravu obyvatel, návštěvníků i turistů do různých lokalit ve městě i mimo něj. Můžete se spolehnout na přepravu na letiště, vlakové stanice či k lékaři.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} působí přímo v ${cityName} a poskytuje služby přepravy pro místní obyvatele i návštěvníky regionu ${regionName}. Společnost zajišťuje dopravu v rámci městských částí, do přilehlých obcí a k dopravním uzlům.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} patří mezi lokální taxislužby v ${cityName}, které se zaměřují na kvalitní a rychlé zajištění přepravy v rámci ${regionName}. Služba je vhodná pro denní i noční hodiny, pracovní cesty i soukromé výlety.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `V ${cityName} můžete využít služby ${serviceName}, která poskytuje taxi dopravu po městě i do vzdálenějších lokalit regionu ${regionName}. Taxislužba se orientuje na potřeby různých skupin cestujících – od studentů až po seniory.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je jednou z možností taxi dopravy v ${cityName}. Poskytovatel deklaruje pokrytí města ${cityName} a jeho okolí v rámci ${regionName}, včetně přepravy na klíčové dopravní body jako letiště či železniční stanice.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxi služba ${serviceName} funguje v ${cityName} a nabízí přepravu osob v městských i příměstských oblastech regionu ${regionName}. Služby jsou dostupné pro běžné jízdy po městě, transfery na letiště i delší trasy.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} poskytuje taxislužby obyvatelům a návštěvníkům ${cityName} v ${regionName}. Zaměření společnosti zahrnuje přepravu v rámci města, dojíždění za prací, nákupy či zdravotní péči.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Pokud hledáte taxi v ${cityName}, ${serviceName} je jednou z dostupných možností. Služba pokrývá lokalitu ${regionName} a zajišťuje přepravu na různé destinace – od běžných jízd po městě až po transfery na větší vzdálenosti.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je taxislužba sídlící v ${cityName}, která nabízí dopravu v rámci celého ${regionName}. Služba může být vhodná pro ty, kteří potřebují rychlou a spolehlivou přepravu ve městě i v okolí.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `V nabídce taxislužeb v ${cityName} najdete i ${serviceName}. Tato služba se zaměřuje na dopravu osob po městě, do okolních obcí a k dopravním uzlům v rámci ${regionName}.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} patří k poskytovatelům taxi dopravy v ${cityName}. Služba deklaruje dostupnost v rámci města i v širším okolí regionu ${regionName}, včetně přepravy na důležité cíle jako nemocnice, úřady či obchodní centra.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} v ${cityName} nabízí přepravu pro různé příležitosti – od běžných cest po městě přes nákupy až po návštěvy u lékaře. Služba pokrývá celý ${regionName} a přilehlé oblasti.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} funguje jako lokální taxislužba v ${cityName} s působností v celém ${regionName}. Poskytuje přepravu jednotlivců i skupin na kratší i delší vzdálenosti.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Pro obyvatele a návštěvníky ${cityName} je k dispozici taxislužba ${serviceName}, která poskytuje dopravu v rámci města a regionu ${regionName}. Služba může být využita na pracovní cesty, nákupy nebo volnočasové aktivity.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je taxi služba působící v ${cityName} a v celém ${regionName}. Společnost deklaruje flexibilitu při přepravě – ať už jde o krátké městské trasy nebo jízdy na větší vzdálenosti.`,
];

/**
 * Disclaimer odstavec - 10 variací
 */
export const disclaimerVariants = [
  (serviceName: string, cityName: string) =>
    `Informace o ${serviceName} pocházejí z veřejně dostupných zdrojů a od samotného poskytovatele. Tato stránka je nezávislá databáze taxislužeb a není provozovatelem taxi dopravy. Nemůžeme garantovat dostupnost, kvalitu služeb ani přesnost všech údajů. Doporučujeme důležité informace ověřit přímo u poskytovatele.`,

  (serviceName: string, cityName: string) =>
    `Údaje o taxislužbě ${serviceName} v ${cityName} jsou získané z veřejných zdrojů. Stránka slouží pouze jako informační zdroj a není součástí provozu taxi služeb. Přesnost údajů, ceny a dostupnost doporučujeme vždy prověřit telefonicky nebo přes web poskytovatele.`,

  (serviceName: string, cityName: string) =>
    `Tyto informace o ${serviceName} mají pouze informativní charakter. Nejde o oficiální prezentaci poskytovatele. Aktuální ceny, dostupnost a podmínky služeb je třeba ověřit přímo u taxislužby ${serviceName}.`,

  (serviceName: string, cityName: string) =>
    `Stránka funguje jako katalog taxislužeb v ${cityName} a není zodpovědná za kvalitu služeb ${serviceName}. Všechny uvedené údaje jsou orientační a mohou se měnit. Před objednáním taxi doporučujeme kontaktovat poskytovatele přímo.`,

  (serviceName: string, cityName: string) =>
    `Prezentované údaje o ${serviceName} vycházejí z veřejných informací. Tato databáze taxislužeb není provozovatelem dopravy a neprovozuje rezervační systém. Záruku za aktuálnost a správnost informací může poskytnout pouze samotná taxislužba.`,

  (serviceName: string, cityName: string) =>
    `${serviceName} je uvedena na základě veřejně dostupných informací. Stránka slouží jako přehled taxislužeb a nenese zodpovědnost za kvalitu poskytovaných služeb. Ceny, hodiny provozu a dostupnost je třeba vždy ověřit u poskytovatele.`,

  (serviceName: string, cityName: string) =>
    `Informace o taxislužbě ${serviceName} v ${cityName} jsou zveřejněny pro informativní účely. Nejde o partnerskou spolupráci. Stránka nezaručuje přesnost všech údajů – před objednáním kontaktujte poskytovatele přímo.`,

  (serviceName: string, cityName: string) =>
    `Tato databáze taxislužeb zahrnuje ${serviceName} na základě veřejně dostupných údajů. Stránka není oficiálním zdrojem informací poskytovatele. Aktuální podmínky, ceny a dostupnost si vždy ověřte přímo u taxislužby.`,

  (serviceName: string, cityName: string) =>
    `${serviceName} je zařazena do databáze jako jedna z možností taxi dopravy v ${cityName}. Stránka není provozovatelem služby a nemůže garantovat kvalitu ani dostupnost. Všechny údaje doporučujeme ověřit u poskytovatele.`,

  (serviceName: string, cityName: string) =>
    `Uvedené informace o ${serviceName} mají informativní charakter a vycházejí z veřejných zdrojů. Stránka nefunguje jako zprostředkovatel taxi služeb. Pro aktuální údaje kontaktujte poskytovatele přímo.`,
];

/**
 * Výhody taxislužby - 12 variací
 */
export const benefitsVariants = [
  (serviceName: string, cityName: string, regionName: string) =>
    `Při výběru ${serviceName} můžete zvážit následující aspekty: lokální znalost ${cityName}, pokrytí celého ${regionName}, možnost přepravy na letiště či vlakové stanice. Doporučujeme ověřit si aktuální ceny a dostupnost přímo u poskytovatele.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} může být vhodnou volbou v ${cityName} z těchto důvodů: dlouholetá praxe v regionu ${regionName}, znalosti místních komunikací, dostupnost během dne i v noci. Detaily o cenách a službách si ověřte při objednávce.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Výhody, které může ${serviceName} nabízet v ${cityName}: široké pokrytí ${regionName}, rychlé přistavení vozidla, důraz na bezpečnost cestujících. Konkrétní podmínky a sazby si vyžádejte telefonicky.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} v ${cityName} může mít tyto přednosti: flexibilní hodiny provozu, pokrytí míst v ${regionName}, možnost objednání předem. Doporučujeme si ověřit aktuální informace přímo u dispečinku.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Při zvažování ${serviceName} v ${cityName} mohou být důležité tyto body: lokální dostupnost v ${regionName}, zkušenosti řidičů s navigací ve městě, možnost úhrady kartou. Detaily si vždy potvrďte při rezervaci.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} může nabízet výhody jako: rychlá reakce na objednávky v ${cityName}, znalosti dopravní situace v ${regionName}, možnost objednání přes telefon nebo aplikaci. Konkrétní podmínky ověřte u poskytovatele.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Důvody pro výběr ${serviceName} v ${cityName}: pokrytí města i okolí v ${regionName}, možnost přepravy zavazadel, dostupnost během svátků. Ceny a dostupnost si vždy ověřte při objednávání.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} může být vhodná volba díky: zkušenostem s jízdou v ${cityName}, pokrytí celého ${regionName}, možnosti objednání pro větší skupinu. Aktuální informace o službách získáte přímo u poskytovatele.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Při výběru taxislužby v ${cityName} může ${serviceName} nabízet: lokální znalost dopravních uzlů, pokrytí ${regionName}, možnost platby v hotovosti i kartou. Podmínky si ověřte telefonicky.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} v ${cityName} může mít tyto výhody: rychlé přistavení v rámci ${regionName}, zkušenosti s přepravou na letiště, dostupnost v nočních hodinách. Detaily ověřte při objednávce.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} může být zajímavou volbou v ${cityName} díky: pokrytí města i okolních obcí v ${regionName}, možnosti telefonické objednávky, zkušenostem s lokální dopravou. Aktuální ceny si vždy ověřte u dispečinku.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Při zvažování ${serviceName} v ${cityName} můžete očekávat: znalosti místních tras v ${regionName}, dostupnost pro různé typy jízd, možnost konzultace ceny předem. Všechny údaje ověřte přímo u poskytovatele.`,
];

/**
 * Objednávací odstavec - 10 variací
 */
export const orderingVariants = [
  (serviceName: string, phone: string, cityName: string) =>
    `Taxislužbu ${serviceName} v ${cityName} můžete kontaktovat na telefonním čísle ${phone}. Při objednávce si ověřte dostupnost, cenu jízdy, případné příplatky a odhadovaný čas příjezdu vozidla.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Pro objednání taxi od ${serviceName} v ${cityName} zavolejte na ${phone}. Doporučujeme si při hovoru ověřit aktuální ceny, dostupnost vozidel a případné příplatky za zavazadla nebo noční provoz.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Službu ${serviceName} můžete objednat telefonicky na čísle ${phone}. Před jízdou se informujte o ceně, dostupnosti a odhadovaném čase přistavení vozidla v ${cityName}.`,

  (serviceName: string, phone: string, cityName: string) =>
    `V ${cityName} můžete ${serviceName} zavolat na ${phone}. Při objednávce si vyžádejte orientační cenu, dostupnost v daném čase a informace o případných příplatcích.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Kontaktní číslo na ${serviceName} v ${cityName} je ${phone}. Při telefonátu doporučujeme ověřit si aktuální dostupnost, cenovou nabídku a čas, za který vozidlo dorazí.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Pro objednání jízdy od ${serviceName} v ${cityName} zavolejte na ${phone}. Ujistěte se, že si ověříte cenu, dostupnost a možné příplatky před potvrzením objednávky.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Taxi ${serviceName} v ${cityName} si můžete objednat na telefonním čísle ${phone}. Při hovoru se zeptejte na aktuální ceny, dostupnost a orientační čas příjezdu.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Službu ${serviceName} v ${cityName} objednáte na ${phone}. Doporučujeme si při rezervaci prověřit cenu jízdy, dostupnost vozidel a případné příplatky.`,

  (serviceName: string, phone: string, cityName: string) =>
    `V ${cityName} můžete kontaktovat ${serviceName} na čísle ${phone}. Při objednávce se informujte o cenách, dostupnosti a odhadovaném čase přistavení vozidla.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Pro taxi ${serviceName} v ${cityName} zavolejte na ${phone}. Před jízdou si ověřte aktuální cenu, dostupnost a všechny relevantní podmínky přepravy.`,
];

/**
 * Závěrečný odstavec - 8 variací
 */
export const conclusionVariants = [
  (cityName: string) =>
    `Cílem této stránky je poskytnout přehled taxislužeb v ${cityName} na jednom místě. Konečný výběr závisí na vás – doporučujeme porovnat více možností a ověřit podmínky přímo u poskytovatele.`,

  (cityName: string) =>
    `Tato databáze vám má usnadnit hledání taxi v ${cityName}. Výběr správné služby závisí na vašich potřebách – vždy si ověřte aktuální podmínky a ceny před objednáním.`,

  (cityName: string) =>
    `Stránka shromažďuje základní informace o taxislužbách v ${cityName}. Rozhodnutí o výběru služby je na vás – před objednáním porovnejte možnosti a prověřte podmínky.`,

  (cityName: string) =>
    `Tento přehled má za cíl usnadnit orientaci v nabídce taxi v ${cityName}. Před konečným rozhodnutím doporučujeme ověřit si podmínky a ceny u jednotlivých poskytovatelů.`,

  (cityName: string) =>
    `Databáze poskytuje kontaktní informace na taxislužby v ${cityName}. Výběr služby je na vašem uvážení – doporučujeme si před objednávkou ověřit všechny důležité údaje.`,

  (cityName: string) =>
    `Stránka slouží jako pomocník při hledání taxi v ${cityName}. Konečné rozhodnutí závisí na vašich potřebách a preferencích – vždy si ověřte aktuální podmínky.`,

  (cityName: string) =>
    `Tento seznam taxislužeb v ${cityName} má informativní charakter. Před objednáním doporučujeme porovnat možnosti a ověřit si podmínky přímo u poskytovatelů.`,

  (cityName: string) =>
    `Přehled taxislužeb v ${cityName} vám může pomoci při výběru. Doporučujeme se před objednávkou informovat o aktuálních cenách a podmínkách u konkrétního poskytovatele.`,
];

/**
 * Generuje unikátní SEO text pro taxislužbu
 */
export interface ServiceContentOptions {
  serviceName: string;
  cityName: string;
  regionName: string;
  phone?: string;
}

export function generateUniqueServiceContent(options: ServiceContentOptions) {
  const { serviceName, cityName, regionName, phone } = options;
  const seed = `${serviceName}-${cityName}`;

  // Vyber varianty na základě hashe názvu služby a města
  const intro = selectVariant(introVariants, seed);
  const disclaimer = selectVariant(disclaimerVariants, seed);
  const benefits = selectVariant(benefitsVariants, seed);
  const conclusion = selectVariant(conclusionVariants, seed);
  const ordering = phone ? selectVariant(orderingVariants, `${seed}-order`) : null;

  return {
    intro: intro(serviceName, cityName, regionName),
    disclaimer: disclaimer(serviceName, cityName),
    benefits: benefits(serviceName, cityName, regionName),
    ordering: ordering && phone ? ordering(serviceName, phone, cityName) : null,
    conclusion: conclusion(cityName),
  };
}

/**
 * Generuje unikátní meta description pro taxislužbu
 */
const currentYear = new Date().getFullYear();

export const metaDescriptionVariants = [
  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} v ${cityName} (${currentYear}). ${phone ? `Telefon: ${phone}.` : ''} Rychlá přeprava po městě i okolí.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Taxi ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Kontakt: ${phone}.` : ''} Lokální taxislužba s pokrytím celého města.`,

  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} - taxislužba v ${cityName} (${currentYear}). ${phone ? `Tel.: ${phone}.` : ''} Přeprava osob po městě a regionu.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Objednejte taxi ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Zavolejte ${phone}.` : ''} Rychlá a spolehlivá doprava.`,

  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} v ${cityName} (${currentYear}) - taxi služby. ${phone ? `Telefonní číslo: ${phone}.` : ''} Přeprava ve městě i okolí.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Taxi ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Volejte ${phone}.` : ''} Přeprava pro obyvatele a návštěvníky.`,

  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} - taxi v ${cityName} (${currentYear}). ${phone ? `Kontaktní číslo: ${phone}.` : ''} Služby přepravy osob.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Kontaktujte ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Tel: ${phone}.` : ''} Taxi služby s lokální znalostí.`,
];

export function generateUniqueMetaDescription(serviceName: string, cityName: string, phone: string = ''): string {
  const variant = selectVariant(metaDescriptionVariants, `${serviceName}-${cityName}`);
  return variant(serviceName, cityName, phone);
}
