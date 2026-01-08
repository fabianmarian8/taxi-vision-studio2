/**
 * Content Variations Generator
 *
 * Tento modul generuje unikátny obsah pre každú taxislužbu,
 * aby sa predišlo duplikátom v Google indexácii.
 *
 * Používa deterministický hash na výber variácie textu,
 * takže rovnaká služba vždy dostane rovnaký text.
 */

/**
 * Jednoduchý hash funkcia pre string
 * Používa sa na deterministický výber variantu textu
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
 * Vyberie variant z poľa na základe hash hodnoty
 */
export function selectVariant<T>(variants: T[], seed: string): T {
  const hash = simpleHash(seed);
  const index = hash % variants.length;
  return variants[index];
}

/**
 * Úvodný odstavec o taxislužbe - 15 variácií
 */
export const introVariants = [
  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je taxislužba poskytujúca prepravu osôb v ${cityName} a v celom ${regionName}. Služba zabezpečuje dopravu obyvateľov, návštevníkov i turistov do rôznych lokalít v meste aj mimo neho. Môžete sa spoľahnúť na prepravu na letisko, vlakové stanice či k lekárovi.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} pôsobí priamo v ${cityName} a poskytuje služby prepravy pre miestnych obyvateľov aj návštevníkov regiónu ${regionName}. Spoločnosť zabezpečuje dopravu v rámci mestských častí, do priľahlých obcí a k dopravným uzlom.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} patrí medzi lokálne taxislužby v ${cityName}, ktoré sa zameriavajú na kvalitné a rýchle zabezpečenie prepravy v rámci ${regionName}. Služba je vhodná pre denné aj nočné hodiny, pracovné cesty i súkromné výlety.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `V ${cityName} môžete využiť služby ${serviceName}, ktorá poskytuje taxi dopravu po meste aj do vzdialenejších lokalít regiónu ${regionName}. Taxislužba sa orientuje na potreby rôznych skupín cestujúcich – od študentov až po seniorov.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je jednou z možností taxi dopravy v ${cityName}. Poskytovateľ deklaruje pokrytie mesta ${cityName} a jeho okolia v rámci ${regionName}, vrátane prepravy na kľúčové dopravné body ako letisko či železničná stanica.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxi služba ${serviceName} funguje v ${cityName} a ponúka prepravu osôb v mestských aj prímestských oblastiach regiónu ${regionName}. Služby sú dostupné pre bežné jazdy po meste, transfery na letisko i dlhšie trasy.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} poskytuje taxislužby obyvateľom a návštevníkom ${cityName} v ${regionName}. Zameranie spoločnosti zahŕňa prepravu v rámci mesta, dochádzanie za prácou, nákupmi či zdravotnou starostlivosťou.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Ak hľadáte taxi v ${cityName}, ${serviceName} je jednou z dostupných možností. Služba pokrýva lokalitu ${regionName} a zabezpečuje prepravu na rôzne destinácie – od bežných jázd po meste až po transfery na väčšie vzdialenosti.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je taxislužba sídliaca v ${cityName}, ktorá ponúka dopravu v rámci celého ${regionName}. Služba môže byť vhodná pre tých, ktorí potrebujú rýchlu a spoľahlivú prepravu v meste aj na okolí.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `V ponuke taxislužieb v ${cityName} nájdete aj ${serviceName}. Táto služba sa zameriava na dopravu osôb po meste, do okolitých obcí a k dopravným uzlom v rámci ${regionName}.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} patrí k poskytovateľom taxi dopravy v ${cityName}. Služba deklaruje dostupnosť v rámci mesta aj v širšom okolí regiónu ${regionName}, vrátane prepravy na dôležité ciele ako nemocnice, úrady či nákupné centrá.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} v ${cityName} ponúka prepravu pre rôzne príležitosti – od bežných ciest po meste cez nákupy až po návštevy u lekára. Služba pokrýva celý ${regionName} a priľahlé oblasti.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} funguje ako lokálna taxislužba v ${cityName} s pôsobnosťou v celom ${regionName}. Poskytuje prepravu jednotlivcov i skupín na kratšie aj dlhšie vzdialenosti.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Pre obyvateľov a návštevníkov ${cityName} je k dispozícii taxislužba ${serviceName}, ktorá poskytuje dopravu v rámci mesta a regiónu ${regionName}. Služba môže byť využitá na pracovné cesty, nákupy alebo voľnočasové aktivity.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} je taxi služba pôsobiaca v ${cityName} a v celom ${regionName}. Spoločnosť deklaruje flexibilitu pri preprave – či už ide o krátke mestské trasy alebo jazdy na väčšie vzdialenosti.`,
];

/**
 * Disclaimer odstavec - 10 variácií
 */
export const disclaimerVariants = [
  (serviceName: string, cityName: string) =>
    `Informácie o ${serviceName} pochádzajú z verejne dostupných zdrojov a od samotného poskytovateľa. Táto stránka je nezávislá databáza taxislužieb a nie je prevádzkovateľom taxi dopravy. Nemôžeme garantovať dostupnosť, kvalitu služieb ani presnosť všetkých údajov. Odporúčame dôležité informácie overiť priamo u poskytovateľa.`,

  (serviceName: string, cityName: string) =>
    `Údaje o taxislužbe ${serviceName} v ${cityName} sú získané z verejných zdrojov. Stránka slúži len ako informačný zdroj a nie je súčasťou prevádzky taxi služieb. Presnosť údajov, ceny a dostupnosť odporúčame vždy preveriť telefonicky alebo cez web poskytovateľa.`,

  (serviceName: string, cityName: string) =>
    `Tieto informácie o ${serviceName} majú len informatívny charakter. Nejde o oficiálnu prezentáciu poskytovateľa. Aktuálne ceny, dostupnosť a podmienky služieb je potrebné overiť priamo u taxislužby ${serviceName}.`,

  (serviceName: string, cityName: string) =>
    `Stránka funguje ako katalóg taxislužieb v ${cityName} a nie je zodpovedná za kvalitu služieb ${serviceName}. Všetky uvedené údaje sú orientačné a môžu sa meniť. Pred objednaním taxi odporúčame kontaktovať poskytovateľa priamo.`,

  (serviceName: string, cityName: string) =>
    `Prezentované údaje o ${serviceName} vychádzajú z verejných informácií. Táto databáza taxislužieb nie je prevádzkovateľom dopravy a neprevádzkuje rezervačný systém. Záruku za aktuálnosť a správnosť informácií môže poskytnúť len samotná taxislužba.`,

  (serviceName: string, cityName: string) =>
    `${serviceName} je uvedená na základe verejne dostupných informácií. Stránka slúži ako prehľad taxislužieb a nenesie zodpovednosť za kvalitu poskytovaných služieb. Ceny, hodiny prevádzky a dostupnosť je potrebné vždy overiť u poskytovateľa.`,

  (serviceName: string, cityName: string) =>
    `Informácie o taxislužbe ${serviceName} v ${cityName} sú zverejnené na informatívne účely. Nejde o partnerskú spoluprácu. Stránka nezaručuje presnosť všetkých údajov – pred objednaním kontaktujte poskytovateľa priamo.`,

  (serviceName: string, cityName: string) =>
    `Táto databáza taxislužieb zahŕňa ${serviceName} na základe verejne dostupných údajov. Stránka nie je oficiálnym zdrojom informácií poskytovateľa. Aktuálne podmienky, ceny a dostupnosť si vždy overte priamo u taxislužby.`,

  (serviceName: string, cityName: string) =>
    `${serviceName} je zaradená do databázy ako jedna z možností taxi dopravy v ${cityName}. Stránka nie je prevádzkovateľom služby a nemôže garantovať kvalitu ani dostupnosť. Všetky údaje odporúčame overiť u poskytovateľa.`,

  (serviceName: string, cityName: string) =>
    `Uvedené informácie o ${serviceName} majú informatívny charakter a vychádzajú z verejných zdrojov. Stránka nefunguje ako sprostredkovateľ taxi služieb. Pre aktuálne údaje kontaktujte poskytovateľa priamo.`,
];

/**
 * Výhody taxislužby - 12 variácií
 */
export const benefitsVariants = [
  (serviceName: string, cityName: string, regionName: string) =>
    `Pri výbere ${serviceName} môžete zvážiť nasledujúce aspekty: lokálna znalosť ${cityName}, pokrytie celého ${regionName}, možnosť prepravy na letisko či vlakové stanice. Odporúčame overiť si aktuálne ceny a dostupnosť priamo u poskytovateľa.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} môže byť vhodnou voľbou v ${cityName} z týchto dôvodov: dlhoročná prax v regióne ${regionName}, znalosti miestnych komunikácií, dostupnosť počas dňa i v noci. Detaily o cenách a službách si overte pri objednávke.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Výhody, ktoré môže ${serviceName} ponúkať v ${cityName}: široké pokrytie ${regionName}, rýchle pristavenie vozidla, dôraz na bezpečnosť cestujúcich. Konkrétne podmienky a sadzby si vyžiadajte telefonicky.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} v ${cityName} môže mať tieto prednosti: flexibilné hodiny prevádzky, pokrytie miest v ${regionName}, možnosť objednania vopred. Odporúčame si overiť aktuálne informácie priamo u dispečingu.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Pri zvažovaní ${serviceName} v ${cityName} môžu byť dôležité tieto body: lokálna dostupnosť v ${regionName}, skúsenosti vodičov s navigáciou v meste, možnosť úhrady kartou. Detaily si vždy potvrďte pri rezervácii.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} môže ponúkať výhody ako: rýchla reakcia na objednávky v ${cityName}, znalosti dopravnej situácie v ${regionName}, možnosť objednania cez telefón alebo aplikáciu. Konkrétne podmienky overte u poskytovateľa.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Dôvody na výber ${serviceName} v ${cityName}: pokrytie mesta aj okolia v ${regionName}, možnosť prepravy batožiny, dostupnosť počas sviatkov. Ceny a dostupnosť si vždy overte pri objednávaní.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} môže byť vhodná voľba vďaka: skúsenostiam s jazdou v ${cityName}, pokrytiu celého ${regionName}, možnosti objednania pre väčšiu skupinu. Aktuálne informácie o službách získate priamo u poskytovateľa.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Pri výbere taxislužby v ${cityName} môže ${serviceName} ponúkať: lokálnu znalosť dopravných uzlov, pokrytie ${regionName}, možnosť platby v hotovosti i kartou. Podmienky si overte telefonicky.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Taxislužba ${serviceName} v ${cityName} môže mať tieto výhody: rýchle pristavenie v rámci ${regionName}, skúsenosti s prepravou na letisko, dostupnosť v nočných hodinách. Detaily overte pri objednávke.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `${serviceName} môže byť zaujímavou voľbou v ${cityName} vďaka: pokrytiu mesta aj okolitých obcí v ${regionName}, možnosti telefonickej objednávky, skúsenostiam s lokálnou dopravou. Aktuálne ceny si vždy overte u dispečingu.`,

  (serviceName: string, cityName: string, regionName: string) =>
    `Pri zvažovaní ${serviceName} v ${cityName} môžete očakávať: znalosti miestnych trás v ${regionName}, dostupnosť pre rôzne typy jázd, možnosť konzultácie ceny vopred. Všetky údaje overte priamo u poskytovateľa.`,
];

/**
 * Objednávací odstavec - 10 variácií
 */
export const orderingVariants = [
  (serviceName: string, phone: string, cityName: string) =>
    `Taxislužbu ${serviceName} v ${cityName} môžete kontaktovať na telefónnom čísle ${phone}. Pri objednávke si overte dostupnosť, cenu jazdy, prípadné príplatky a odhadovaný čas príchodu vozidla.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Pre objednanie taxi od ${serviceName} v ${cityName} zavolajte na ${phone}. Odporúčame si pri hovore overiť aktuálne ceny, dostupnosť vozidiel a prípadné príplatky za batožinu alebo nočnú prevádzku.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Službu ${serviceName} môžete objednať telefonicky na čísle ${phone}. Pred jazdou sa informujte o cene, dostupnosti a odhadovanom čase pristavenia vozidla v ${cityName}.`,

  (serviceName: string, phone: string, cityName: string) =>
    `V ${cityName} môžete ${serviceName} zavolať na ${phone}. Pri objednávke si vypýtajte orientačnú cenu, dostupnosť v danom čase a informácie o prípadných priplatkoch.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Kontaktné číslo na ${serviceName} v ${cityName} je ${phone}. Pri telefonáte odporúčame overiť si aktuálnu dostupnosť, cenovú ponuku a čas, za ktorý vozidlo dorazí.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Pre objednanie jazdy od ${serviceName} v ${cityName} zavolajte na ${phone}. Uistite sa, že si overíte cenu, dostupnosť a možné príplatky pred potvrdením objednávky.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Taxi ${serviceName} v ${cityName} si môžete objednať na telefónnom čísle ${phone}. Pri hovore sa opýtajte na aktuálne ceny, dostupnosť a orientačný čas príchodu.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Službu ${serviceName} v ${cityName} objednáte na ${phone}. Odporúčame si pri rezervácii preveriť cenu jazdy, dostupnosť vozidiel a prípadné príplatky.`,

  (serviceName: string, phone: string, cityName: string) =>
    `V ${cityName} môžete kontaktovať ${serviceName} na čísle ${phone}. Pri objednávke sa informujte o cenách, dostupnosti a odhadovanom čase pristavenia vozidla.`,

  (serviceName: string, phone: string, cityName: string) =>
    `Pre taxi ${serviceName} v ${cityName} zavolajte na ${phone}. Pred jazdou si overte aktuálnu cenu, dostupnosť a všetky relevantné podmienky prepravy.`,
];

/**
 * Záverečný odstavec - 8 variácií
 */
export const conclusionVariants = [
  (cityName: string) =>
    `Cieľom tejto stránky je poskytnúť prehľad taxislužieb v ${cityName} na jednom mieste. Konečný výber závisí na vás – odporúčame porovnať viac možností a overiť podmienky priamo u poskytovateľa.`,

  (cityName: string) =>
    `Táto databáza vám má uľahčiť hľadanie taxi v ${cityName}. Výber správnej služby závisí od vašich potrieb – vždy si overte aktuálne podmienky a ceny pred objednaním.`,

  (cityName: string) =>
    `Stránka zhromažďuje základné informácie o taxislužbách v ${cityName}. Rozhodnutie o výbere služby je na vás – pred objednaním porovnajte možnosti a preverte podmienky.`,

  (cityName: string) =>
    `Tento prehľad má za cieľ uľahčiť orientáciu v ponuke taxi v ${cityName}. Pred konečným rozhodnutím odporúčame overiť si podmienky a ceny u jednotlivých poskytovateľov.`,

  (cityName: string) =>
    `Databáza poskytuje kontaktné informácie na taxislužby v ${cityName}. Výber služby je na vašom uvážení – odporúčame si pred objednávkou overiť všetky dôležité údaje.`,

  (cityName: string) =>
    `Stránka slúži ako pomocník pri hľadaní taxi v ${cityName}. Konečné rozhodnutie závisí od vašich potrieb a preferencií – vždy si overte aktuálne podmienky.`,

  (cityName: string) =>
    `Tento zoznam taxislužieb v ${cityName} má informatívny charakter. Pred objednaním odporúčame porovnať možnosti a overiť si podmienky priamo u poskytovateľov.`,

  (cityName: string) =>
    `Prehľad taxislužieb v ${cityName} vám môže pomôcť pri výbere. Odporúčame sa pred objednávkou informovať o aktuálnych cenách a podmienkach u konkrétneho poskytovateľa.`,
];

/**
 * Generuje unikátny SEO text pre taxislužbu
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

  // Vyber varianty na základe hashu názvu služby a mesta
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
 * Generuje unikátnu meta description pre taxislužbu
 */
const currentYear = new Date().getFullYear();

export const metaDescriptionVariants = [
  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} v ${cityName} (${currentYear}). ${phone ? `Telefón: ${phone}.` : ''} Rýchla preprava po meste aj okolí.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Taxi ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Kontakt: ${phone}.` : ''} Lokálna taxislužba s pokrytím celého mesta.`,

  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} - taxislužba v ${cityName} (${currentYear}). ${phone ? `Tel.: ${phone}.` : ''} Preprava osôb po meste a regióne.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Objednajte taxi ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Zavolajte ${phone}.` : ''} Rýchla a spoľahlivá doprava.`,

  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} v ${cityName} (${currentYear}) - taxi služby. ${phone ? `Telefónne číslo: ${phone}.` : ''} Preprava v meste aj okolí.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Taxi ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Volajte ${phone}.` : ''} Preprava pre obyvateľov a návštevníkov.`,

  (serviceName: string, cityName: string, phone: string) =>
    `${serviceName} - taxi v ${cityName} (${currentYear}). ${phone ? `Kontaktné číslo: ${phone}.` : ''} Služby prepravy osôb.`,

  (serviceName: string, cityName: string, phone: string) =>
    `Kontaktujte ${serviceName} v ${cityName} (${currentYear}). ${phone ? `Tel: ${phone}.` : ''} Taxi služby s lokálnou znalosťou.`,
];

export function generateUniqueMetaDescription(serviceName: string, cityName: string, phone: string = ''): string {
  const variant = selectVariant(metaDescriptionVariants, `${serviceName}-${cityName}`);
  return variant(serviceName, cityName, phone);
}
