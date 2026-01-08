/**
 * České skloňování názvů obcí a měst
 *
 * Podporované pády:
 * - locative (lokál): "V Praze" (kde?)
 * - genitive (genitiv): "z Prahy", "do Prahy" (odkud? kam?)
 *
 * Přístup:
 * 1. Manuální výjimky pro nejdůležitější/nepravidelná města
 * 2. Pravidlové generování pro běžné vzory
 * 3. Fallback na generické fráze ("Ve městě X")
 */

interface DeclensionForms {
  locative: string;      // V [locative] - kde?
  genitive: string;      // z [genitive] - odkud?
  accusative?: string;   // do [accusative] - kam? (často = genitive)
}

// ============================================================================
// MANUÁLNÍ VÝJIMKY - města s nepravidelným skloňováním nebo vysokou návštěvností
// ============================================================================

const manualDeclensions: Record<string, DeclensionForms> = {
  // === KRAJSKÁ MĚSTA ===
  'praha': { locative: 'Praze', genitive: 'Prahy' },
  'brno': { locative: 'Brně', genitive: 'Brna' },
  'ostrava': { locative: 'Ostravě', genitive: 'Ostravy' },
  'plzen': { locative: 'Plzni', genitive: 'Plzně' },
  'liberec': { locative: 'Liberci', genitive: 'Liberce' },
  'olomouc': { locative: 'Olomouci', genitive: 'Olomouce' },
  'ceske-budejovice': { locative: 'Českých Budějovicích', genitive: 'Českých Budějovic' },
  'hradec-kralove': { locative: 'Hradci Králové', genitive: 'Hradce Králové' },
  'usti-nad-labem': { locative: 'Ústí nad Labem', genitive: 'Ústí nad Labem' },
  'pardubice': { locative: 'Pardubicích', genitive: 'Pardubic' },
  'zlin': { locative: 'Zlíně', genitive: 'Zlína' },
  'jihlava': { locative: 'Jihlavě', genitive: 'Jihlavy' },
  'karlovy-vary': { locative: 'Karlových Varech', genitive: 'Karlových Varů' },

  // === OKRESNÍ MĚSTA A VĚTŠÍ OBCE ===
  'kladno': { locative: 'Kladně', genitive: 'Kladna' },
  'most': { locative: 'Mostě', genitive: 'Mostu' },
  'opava': { locative: 'Opavě', genitive: 'Opavy' },
  'frydek-mistek': { locative: 'Frýdku-Místku', genitive: 'Frýdku-Místku' },
  'karvina': { locative: 'Karviné', genitive: 'Karviné' },
  'havirov': { locative: 'Havířově', genitive: 'Havířova' },
  'teplice': { locative: 'Teplicích', genitive: 'Teplic' },
  'decin': { locative: 'Děčíně', genitive: 'Děčína' },
  'chomutov': { locative: 'Chomutově', genitive: 'Chomutova' },
  'prerov': { locative: 'Přerově', genitive: 'Přerova' },
  'prostejov': { locative: 'Prostějově', genitive: 'Prostějova' },
  'jablonec-nad-nisou': { locative: 'Jablonci nad Nisou', genitive: 'Jablonce nad Nisou' },
  'mlada-boleslav': { locative: 'Mladé Boleslavi', genitive: 'Mladé Boleslavi' },
  'trebic': { locative: 'Třebíči', genitive: 'Třebíče' },
  'znojmo': { locative: 'Znojmě', genitive: 'Znojma' },
  'pribram': { locative: 'Příbrami', genitive: 'Příbrami' },
  'cheb': { locative: 'Chebu', genitive: 'Chebu' },
  'kolín': { locative: 'Kolíně', genitive: 'Kolína' },
  'trutnov': { locative: 'Trutnově', genitive: 'Trutnova' },
  'kromeriz': { locative: 'Kroměříži', genitive: 'Kroměříže' },
  'vsetin': { locative: 'Vsetíně', genitive: 'Vsetína' },
  'pisek': { locative: 'Písku', genitive: 'Písku' },
  'tabor': { locative: 'Táboře', genitive: 'Tábora' },
  'hodonin': { locative: 'Hodoníně', genitive: 'Hodonína' },
  'vyskov': { locative: 'Vyškově', genitive: 'Vyškova' },
  'blansko': { locative: 'Blansku', genitive: 'Blanska' },
  'sumperk': { locative: 'Šumperku', genitive: 'Šumperka' },
  'jesenik': { locative: 'Jeseníku', genitive: 'Jeseníku' },
  'novy-jicin': { locative: 'Novém Jičíně', genitive: 'Nového Jičína' },
  'bruntal': { locative: 'Bruntále', genitive: 'Bruntálu' },
  'litomerice': { locative: 'Litoměřicích', genitive: 'Litoměřic' },
  'louny': { locative: 'Lounech', genitive: 'Loun' },
  'ceska-lipa': { locative: 'České Lípě', genitive: 'České Lípy' },
  'nachod': { locative: 'Náchodě', genitive: 'Náchoda' },
  'rychnov-nad-kneznou': { locative: 'Rychnově nad Kněžnou', genitive: 'Rychnova nad Kněžnou' },
  'chrudim': { locative: 'Chrudimi', genitive: 'Chrudimi' },
  'svitavy': { locative: 'Svitavách', genitive: 'Svitav' },
  'havlickuv-brod': { locative: 'Havlíčkově Brodě', genitive: 'Havlíčkova Brodu' },
  'pelhrimov': { locative: 'Pelhřimově', genitive: 'Pelhřimova' },
  'jindrichuv-hradec': { locative: 'Jindřichově Hradci', genitive: 'Jindřichova Hradce' },
  'strakonice': { locative: 'Strakonicích', genitive: 'Strakonic' },
  'prachatice': { locative: 'Prachaticích', genitive: 'Prachatic' },
  'cesky-krumlov': { locative: 'Českém Krumlově', genitive: 'Českého Krumlova' },
  'klatovy': { locative: 'Klatovech', genitive: 'Klatov' },
  'domazlice': { locative: 'Domažlicích', genitive: 'Domažlic' },
  'tachov': { locative: 'Tachově', genitive: 'Tachova' },
  'rokycany': { locative: 'Rokycanech', genitive: 'Rokycan' },
  'sokolov': { locative: 'Sokolově', genitive: 'Sokolova' },
  'beroun': { locative: 'Berouně', genitive: 'Berouna' },
  'rakovnik': { locative: 'Rakovníku', genitive: 'Rakovníka' },
  'benesov': { locative: 'Benešově', genitive: 'Benešova' },
  'kutna-hora': { locative: 'Kutné Hoře', genitive: 'Kutné Hory' },
  'nymburk': { locative: 'Nymburce', genitive: 'Nymburka' },
  'melnik': { locative: 'Mělníku', genitive: 'Mělníka' },
};

// ============================================================================
// PRAVIDLA PRO AUTOMATICKÉ GENEROVÁNÍ
// ============================================================================

/**
 * Generuje skloňování podle pravidel (fallback pokud není v manuálních výjimkách)
 */
function generateDeclensionByRules(name: string): DeclensionForms | null {
  const normalized = name.toLowerCase();

  // BEZPEČNOSTNÍ KONTROLA: Víceslovné názvy jsou příliš komplexní pro automatická pravidla
  // Příklady: "České Budějovice", "Karlovy Vary", "Hradec Králové"
  // Pro tyto použijeme fallback "Ve městě X"
  if (name.includes(' ')) {
    return null;
  }

  // Vzor: -ce (plurál) → lokál: -cích, genitiv: -c
  // Příklady: Pardubice → Pardubicích/Pardubic
  if (normalized.endsWith('ce')) {
    const stem = name.slice(0, -2);
    return {
      locative: `${stem}cích`,
      genitive: `${stem}c`,
    };
  }

  // Vzor: -ice (plurál) → lokál: -icích, genitiv: -ic
  // Příklady: Teplice → Teplicích/Teplic
  if (normalized.endsWith('ice')) {
    const stem = name.slice(0, -3);
    return {
      locative: `${stem}icích`,
      genitive: `${stem}ic`,
    };
  }

  // Vzor: -ov (mužský rod) → lokál: -ově, genitiv: -ova
  // Příklady: Havířov → Havířově/Havířova
  if (normalized.endsWith('ov')) {
    return {
      locative: `${name}ě`,
      genitive: `${name}a`,
    };
  }

  // Vzor: -ín (mužský rod) → lokál: -íně, genitiv: -ína
  // Příklady: Zlín → Zlíně/Zlína
  if (normalized.endsWith('ín')) {
    return {
      locative: `${name}ě`,
      genitive: `${name}a`,
    };
  }

  // Vzor: -ec → lokál: -ci, genitiv: -ce
  // Příklady: Liberec → Liberci/Liberce
  if (normalized.endsWith('ec')) {
    const stem = name.slice(0, -2);
    return {
      locative: `${stem}ci`,
      genitive: `${stem}ce`,
    };
  }

  // Vzor: -a (ženský rod) → lokál: -ě/-i, genitiv: -y/-e
  // Příklady: Ostrava → Ostravě/Ostravy
  if (normalized.endsWith('a')) {
    const stem = name.slice(0, -1);
    // Měkké souhlásky
    const softConsonants = ['c', 'č', 'ď', 'j', 'ň', 'ř', 'š', 'ť', 'ž'];
    const endsWithSoft = softConsonants.some(c => stem.toLowerCase().endsWith(c));

    if (endsWithSoft) {
      return {
        locative: `${stem}i`,
        genitive: `${stem}e`,
      };
    }

    return {
      locative: `${stem}ě`,
      genitive: `${stem}y`,
    };
  }

  // Vzor: -o (střední rod) → lokál: -ě/-u, genitiv: -a
  // Příklady: Brno → Brně/Brna
  if (normalized.endsWith('o')) {
    const stem = name.slice(0, -1);
    return {
      locative: `${stem}ě`,
      genitive: `${stem}a`,
    };
  }

  // Vzor: -y (plurál) → lokál: -ech, genitiv: -
  // Příklady: Klatovy → Klatovech/Klatov
  if (normalized.endsWith('y')) {
    const stem = name.slice(0, -1);
    return {
      locative: `${stem}ech`,
      genitive: `${stem}`,
    };
  }

  // Bez pravidla - vrátíme null
  return null;
}

// ============================================================================
// HLAVNÍ EXPORTOVANÉ FUNKCE
// ============================================================================

/**
 * Získej skloňování pro danou obec/město
 * @param slug URL slug obce
 * @param name Název obce (pro fallback generování)
 * @returns Skloňovací tvary nebo null
 */
export function getDeclension(slug: string, name: string): DeclensionForms | null {
  // 1. Zkus manuální výjimky
  if (manualDeclensions[slug]) {
    return manualDeclensions[slug];
  }

  // 2. Zkus pravidlové generování
  return generateDeclensionByRules(name);
}

/**
 * Získej lokál obce pro "V [lokál]"
 * @param slug URL slug
 * @param name Název obce
 * @returns "V Praze" nebo "Ve městě Praha" (fallback)
 */
export function getLocativePhrase(slug: string, name: string): string {
  const declension = getDeclension(slug, name);
  if (declension?.locative) {
    // Kontrola zda začíná na V-, F-, W- (předložka "Ve")
    const firstChar = declension.locative.charAt(0).toLowerCase();
    const prefix = (firstChar === 'v' || firstChar === 'f' || firstChar === 'w') ? 'Ve' : 'V';
    return `${prefix} ${declension.locative}`;
  }
  return `Ve městě ${name}`;
}

/**
 * Získej genitiv obce pro "z [genitiv]"
 * @param slug URL slug
 * @param name Název obce
 * @returns "z Prahy" nebo "z města Praha" (fallback)
 */
export function getGenitivePhrase(slug: string, name: string): string {
  const declension = getDeclension(slug, name);
  if (declension?.genitive) {
    // Kontrola zda začíná na S-, Z-, Š-, Ž- (předložka "ze")
    const firstChar = declension.genitive.charAt(0).toLowerCase();
    const prefix = ['s', 'z', 'š', 'ž'].includes(firstChar) ? 'ze' : 'z';
    return `${prefix} ${declension.genitive}`;
  }
  return `z ${name}`;
}

/**
 * Získej akuzativ obce pro "do [akuzativ]"
 * @param slug URL slug
 * @param name Název obce
 * @returns "do Prahy" nebo "do města Praha" (fallback)
 */
export function getAccusativePhrase(slug: string, name: string): string {
  const declension = getDeclension(slug, name);
  // Akuzativ je většinou stejný jako genitiv
  const form = declension?.accusative || declension?.genitive;
  if (form) {
    return `do ${form}`;
  }
  return `do ${name}`;
}

/**
 * Generuj meta description pro obec bez taxislužeb
 * @param municipality Údaje o obci
 * @param nearestCities Nejbližší města s taxi
 * @returns Optimalizovaný meta description
 */
export function generateMetaDescription(
  municipality: { slug: string; name: string },
  nearestCities: Array<{ city: { slug: string; name: string }; roadDistance: number; duration: number }>
): string {
  if (nearestCities.length === 0) {
    return `${getLocativePhrase(municipality.slug, municipality.name)} není evidována taxislužba. Najděte nejbližší dostupné taxislužby.`;
  }

  const nearest = nearestCities[0];
  const priceMin = Math.ceil(40 + nearest.roadDistance * 28);
  const priceMax = Math.ceil(60 + nearest.roadDistance * 40);
  const distanceFormatted = nearest.roadDistance.toString().replace('.', ',');

  // První dvě města pro meta description
  const cityPhrases = nearestCities.slice(0, 2).map(c =>
    getGenitivePhrase(c.city.slug, c.city.name)
  );

  const citiesText = cityPhrases.length > 1
    ? `${cityPhrases[0]} nebo ${cityPhrases[1]}`
    : cityPhrases[0];

  return `${getLocativePhrase(municipality.slug, municipality.name)} není evidována taxislužba. Zavolejte nejbližší taxislužby ${citiesText}. Vzdálenost ~${distanceFormatted} km, dojezd ~${nearest.duration} min, cena ${priceMin}–${priceMax} Kč.`;
}

/**
 * Generuj intro text pro stránku obce bez taxislužeb
 * @param municipality Údaje o obci
 * @returns Intro text se správným skloňováním
 */
export function generateIntroText(municipality: { slug: string; name: string }): string {
  const locative = getLocativePhrase(municipality.slug, municipality.name);
  const accusative = getAccusativePhrase(municipality.slug, municipality.name);

  return `${locative} není evidována taxislužba. Tyto nejbližší jezdí ${accusative}:`;
}

export { manualDeclensions };
