/**
 * České PSČ (Poštovní Směrovací Číslo) databáze
 *
 * Mapování PSČ na názvy měst/obcí pro vyhledávání
 * PSČ formát: 5 číslic bez mezery (např. "11000" nebo "110 00")
 * Zdroj: Česká pošta PSČ registr
 */

// Hlavní města a jejich PSČ rozsahy
// Formát: PSČ prefix -> { name, slug }
export interface PostalCodeEntry {
  name: string;
  slug: string;
  district?: string;
}

// PSČ databáze - české města a obce
export const postalCodeDatabase: Record<string, PostalCodeEntry> = {
  // Praha (1xxxx)
  "11000": { name: "Praha", slug: "praha", district: "Praha 1" },
  "11001": { name: "Praha", slug: "praha", district: "Praha 1" },
  "11800": { name: "Praha", slug: "praha", district: "Praha 1" },
  "12000": { name: "Praha", slug: "praha", district: "Praha 2" },
  "12800": { name: "Praha", slug: "praha", district: "Praha 2" },
  "13000": { name: "Praha", slug: "praha", district: "Praha 3" },
  "14000": { name: "Praha", slug: "praha", district: "Praha 4" },
  "14700": { name: "Praha", slug: "praha", district: "Praha 4" },
  "15000": { name: "Praha", slug: "praha", district: "Praha 5" },
  "15200": { name: "Praha", slug: "praha", district: "Praha 5" },
  "16000": { name: "Praha", slug: "praha", district: "Praha 6" },
  "16200": { name: "Praha", slug: "praha", district: "Praha 6" },
  "17000": { name: "Praha", slug: "praha", district: "Praha 7" },
  "18000": { name: "Praha", slug: "praha", district: "Praha 8" },
  "18100": { name: "Praha", slug: "praha", district: "Praha 8" },
  "19000": { name: "Praha", slug: "praha", district: "Praha 9" },
  "19600": { name: "Praha", slug: "praha", district: "Praha 9" },
  "10000": { name: "Praha", slug: "praha", district: "Praha 10" },
  "10100": { name: "Praha", slug: "praha", district: "Praha 10" },
  "10200": { name: "Praha", slug: "praha", district: "Praha 10" },
  "14300": { name: "Praha", slug: "praha", district: "Praha 12" },
  "15500": { name: "Praha", slug: "praha", district: "Praha 13" },

  // Brno (6xxxx)
  "60200": { name: "Brno", slug: "brno", district: "Brno-střed" },
  "60100": { name: "Brno", slug: "brno", district: "Brno-střed" },
  "60300": { name: "Brno", slug: "brno", district: "Brno-střed" },
  "61200": { name: "Brno", slug: "brno", district: "Brno-Královo Pole" },
  "61300": { name: "Brno", slug: "brno", district: "Brno-sever" },
  "61400": { name: "Brno", slug: "brno", district: "Brno-sever" },
  "61500": { name: "Brno", slug: "brno", district: "Brno-Židenice" },
  "61600": { name: "Brno", slug: "brno", district: "Brno-Žabovřesky" },
  "61700": { name: "Brno", slug: "brno", district: "Brno-Komín" },
  "61800": { name: "Brno", slug: "brno", district: "Brno-Černovice" },
  "61900": { name: "Brno", slug: "brno", district: "Brno-jih" },
  "62500": { name: "Brno", slug: "brno", district: "Brno-Bohunice" },
  "62700": { name: "Brno", slug: "brno", district: "Brno-Slatina" },
  "63500": { name: "Brno", slug: "brno", district: "Brno-Bystrc" },
  "64100": { name: "Brno", slug: "brno", district: "Brno-Žebětín" },

  // Ostrava (7xxxx)
  "70200": { name: "Ostrava", slug: "ostrava", district: "Moravská Ostrava" },
  "70030": { name: "Ostrava", slug: "ostrava", district: "Ostrava-centrum" },
  "70300": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Vítkovice" },
  "70800": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Poruba" },
  "70900": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Mariánské Hory" },
  "71100": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Hrušov" },
  "71200": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Muglinov" },
  "71300": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Heřmanice" },
  "71900": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Kunčice" },
  "72000": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Hrabová" },
  "72100": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Nová Bělá" },
  "72400": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Stará Bělá" },
  "72500": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Polanka" },
  "72528": { name: "Ostrava", slug: "ostrava", district: "Ostrava-Krásné Pole" },

  // Plzeň (3xxxx)
  "30100": { name: "Plzeň", slug: "plzen", district: "Plzeň 1" },
  "30200": { name: "Plzeň", slug: "plzen", district: "Plzeň 2" },
  "30300": { name: "Plzeň", slug: "plzen", district: "Plzeň 3" },
  "30600": { name: "Plzeň", slug: "plzen", district: "Plzeň-Bolevec" },
  "31200": { name: "Plzeň", slug: "plzen", district: "Plzeň-Doubravka" },
  "31800": { name: "Plzeň", slug: "plzen", district: "Plzeň-Slovany" },
  "32600": { name: "Plzeň", slug: "plzen", district: "Plzeň-Černice" },

  // Liberec (4xxxx)
  "46001": { name: "Liberec", slug: "liberec" },
  "46005": { name: "Liberec", slug: "liberec" },
  "46006": { name: "Liberec", slug: "liberec" },
  "46007": { name: "Liberec", slug: "liberec" },
  "46010": { name: "Liberec", slug: "liberec" },
  "46014": { name: "Liberec", slug: "liberec" },
  "46015": { name: "Liberec", slug: "liberec" },

  // Olomouc (7xxxx)
  "77900": { name: "Olomouc", slug: "olomouc" },
  "77200": { name: "Olomouc", slug: "olomouc" },
  "77111": { name: "Olomouc", slug: "olomouc" },
  "77100": { name: "Olomouc", slug: "olomouc" },

  // České Budějovice (3xxxx)
  "37001": { name: "České Budějovice", slug: "ceske-budejovice" },
  "37004": { name: "České Budějovice", slug: "ceske-budejovice" },
  "37005": { name: "České Budějovice", slug: "ceske-budejovice" },
  "37006": { name: "České Budějovice", slug: "ceske-budejovice" },
  "37007": { name: "České Budějovice", slug: "ceske-budejovice" },
  "37008": { name: "České Budějovice", slug: "ceske-budejovice" },
  "37010": { name: "České Budějovice", slug: "ceske-budejovice" },

  // Hradec Králové (5xxxx)
  "50002": { name: "Hradec Králové", slug: "hradec-kralove" },
  "50003": { name: "Hradec Králové", slug: "hradec-kralove" },
  "50004": { name: "Hradec Králové", slug: "hradec-kralove" },
  "50006": { name: "Hradec Králové", slug: "hradec-kralove" },
  "50008": { name: "Hradec Králové", slug: "hradec-kralove" },
  "50009": { name: "Hradec Králové", slug: "hradec-kralove" },
  "50011": { name: "Hradec Králové", slug: "hradec-kralove" },

  // Ústí nad Labem (4xxxx)
  "40001": { name: "Ústí nad Labem", slug: "usti-nad-labem" },
  "40003": { name: "Ústí nad Labem", slug: "usti-nad-labem" },
  "40007": { name: "Ústí nad Labem", slug: "usti-nad-labem" },
  "40010": { name: "Ústí nad Labem", slug: "usti-nad-labem" },
  "40011": { name: "Ústí nad Labem", slug: "usti-nad-labem" },

  // Pardubice (5xxxx)
  "53002": { name: "Pardubice", slug: "pardubice" },
  "53003": { name: "Pardubice", slug: "pardubice" },
  "53006": { name: "Pardubice", slug: "pardubice" },
  "53009": { name: "Pardubice", slug: "pardubice" },
  "53012": { name: "Pardubice", slug: "pardubice" },

  // Zlín (7xxxx)
  "76001": { name: "Zlín", slug: "zlin" },
  "76005": { name: "Zlín", slug: "zlin" },
  "76010": { name: "Zlín", slug: "zlin" },

  // Havířov (7xxxx)
  "73601": { name: "Havířov", slug: "havirov" },
  "73602": { name: "Havířov", slug: "havirov" },
  "73603": { name: "Havířov", slug: "havirov" },

  // Kladno (2xxxx)
  "27201": { name: "Kladno", slug: "kladno" },
  "27202": { name: "Kladno", slug: "kladno" },
  "27203": { name: "Kladno", slug: "kladno" },
  "27204": { name: "Kladno", slug: "kladno" },

  // Most (4xxxx)
  "43401": { name: "Most", slug: "most" },
  "43411": { name: "Most", slug: "most" },

  // Opava (7xxxx)
  "74601": { name: "Opava", slug: "opava" },
  "74705": { name: "Opava", slug: "opava" },

  // Frýdek-Místek (7xxxx)
  "73801": { name: "Frýdek-Místek", slug: "frydek-mistek" },
  "73802": { name: "Frýdek-Místek", slug: "frydek-mistek" },

  // Karviná (7xxxx)
  "73301": { name: "Karviná", slug: "karvina" },
  "73506": { name: "Karviná", slug: "karvina" },

  // Jihlava (5xxxx)
  "58601": { name: "Jihlava", slug: "jihlava" },
  "58602": { name: "Jihlava", slug: "jihlava" },

  // Teplice (4xxxx)
  "41501": { name: "Teplice", slug: "teplice" },
  "41502": { name: "Teplice", slug: "teplice" },

  // Děčín (4xxxx)
  "40502": { name: "Děčín", slug: "decin" },
  "40501": { name: "Děčín", slug: "decin" },

  // Chomutov (4xxxx)
  "43001": { name: "Chomutov", slug: "chomutov" },
  "43003": { name: "Chomutov", slug: "chomutov" },

  // Karlovy Vary (3xxxx)
  "36001": { name: "Karlovy Vary", slug: "karlovy-vary" },
  "36004": { name: "Karlovy Vary", slug: "karlovy-vary" },
  "36005": { name: "Karlovy Vary", slug: "karlovy-vary" },
  "36006": { name: "Karlovy Vary", slug: "karlovy-vary" },

  // Jablonec nad Nisou (4xxxx)
  "46601": { name: "Jablonec nad Nisou", slug: "jablonec-nad-nisou" },
  "46602": { name: "Jablonec nad Nisou", slug: "jablonec-nad-nisou" },

  // Mladá Boleslav (2xxxx)
  "29301": { name: "Mladá Boleslav", slug: "mlada-boleslav" },
  "29302": { name: "Mladá Boleslav", slug: "mlada-boleslav" },

  // Prostějov (7xxxx)
  "79601": { name: "Prostějov", slug: "prostejov" },
  "79604": { name: "Prostějov", slug: "prostejov" },

  // Přerov (7xxxx)
  "75002": { name: "Přerov", slug: "prerov" },
  "75101": { name: "Přerov", slug: "prerov" },

  // Česká Lípa (4xxxx)
  "47001": { name: "Česká Lípa", slug: "ceska-lipa" },
  "47006": { name: "Česká Lípa", slug: "ceska-lipa" },

  // Třebíč (6xxxx)
  "67401": { name: "Třebíč", slug: "trebic" },
  "67402": { name: "Třebíč", slug: "trebic" },

  // Třinec (7xxxx)
  "73961": { name: "Třinec", slug: "trinec" },

  // Tábor (3xxxx)
  "39001": { name: "Tábor", slug: "tabor" },
  "39002": { name: "Tábor", slug: "tabor" },

  // Znojmo (6xxxx)
  "66902": { name: "Znojmo", slug: "znojmo" },
  "66901": { name: "Znojmo", slug: "znojmo" },

  // Příbram (2xxxx)
  "26101": { name: "Příbram", slug: "pribram" },
  "26102": { name: "Příbram", slug: "pribram" },

  // Cheb (3xxxx)
  "35002": { name: "Cheb", slug: "cheb" },
  "35001": { name: "Cheb", slug: "cheb" },

  // Kolín (2xxxx)
  "28002": { name: "Kolín", slug: "kolin" },
  "28001": { name: "Kolín", slug: "kolin" },

  // Trutnov (5xxxx)
  "54101": { name: "Trutnov", slug: "trutnov" },
  "54102": { name: "Trutnov", slug: "trutnov" },

  // Kroměříž (7xxxx)
  "76701": { name: "Kroměříž", slug: "kromeriz" },
  "76702": { name: "Kroměříž", slug: "kromeriz" },

  // Písek (3xxxx)
  "39701": { name: "Písek", slug: "pisek" },
  "39703": { name: "Písek", slug: "pisek" },

  // Litoměřice (4xxxx)
  "41201": { name: "Litoměřice", slug: "litomerice" },
  "41202": { name: "Litoměřice", slug: "litomerice" },

  // Nový Jičín (7xxxx)
  "74101": { name: "Nový Jičín", slug: "novy-jicin" },
  "74111": { name: "Nový Jičín", slug: "novy-jicin" },

  // Vsetín (7xxxx)
  "75501": { name: "Vsetín", slug: "vsetin" },

  // Šumperk (7xxxx)
  "78701": { name: "Šumperk", slug: "sumperk" },
  "78731": { name: "Šumperk", slug: "sumperk" },

  // Uherské Hradiště (6xxxx)
  "68601": { name: "Uherské Hradiště", slug: "uherske-hradiste" },
  "68606": { name: "Uherské Hradiště", slug: "uherske-hradiste" },

  // Břeclav (6xxxx)
  "69002": { name: "Břeclav", slug: "breclav" },
  "69017": { name: "Břeclav", slug: "breclav" },

  // Hodonín (6xxxx)
  "69501": { name: "Hodonín", slug: "hodonin" },
  "69503": { name: "Hodonín", slug: "hodonin" },

  // Český Těšín (7xxxx)
  "73701": { name: "Český Těšín", slug: "cesky-tesin" },

  // Kopřivnice (7xxxx)
  "74221": { name: "Kopřivnice", slug: "koprivnice" },
  "74201": { name: "Kopřivnice", slug: "koprivnice" },

  // Bohumín (7xxxx)
  "73581": { name: "Bohumín", slug: "bohumin" },
  "73501": { name: "Bohumín", slug: "bohumin" },

  // Orlová (7xxxx)
  "73511": { name: "Orlová", slug: "orlova" },
  "73514": { name: "Orlová", slug: "orlova" },

  // Krnov (7xxxx)
  "79401": { name: "Krnov", slug: "krnov" },
  "79501": { name: "Krnov", slug: "krnov" },

  // Litvínov (4xxxx)
  "43601": { name: "Litvínov", slug: "litvinov" },
  "43642": { name: "Litvínov", slug: "litvinov" },

  // Chrudim (5xxxx)
  "53701": { name: "Chrudim", slug: "chrudim" },
  "53702": { name: "Chrudim", slug: "chrudim" },

  // Sokolov (3xxxx)
  "35601": { name: "Sokolov", slug: "sokolov" },
  "35604": { name: "Sokolov", slug: "sokolov" },

  // Strakonice (3xxxx)
  "38601": { name: "Strakonice", slug: "strakonice" },

  // Jindřichův Hradec (3xxxx)
  "37701": { name: "Jindřichův Hradec", slug: "jindrichuv-hradec" },

  // Náchod (5xxxx)
  "54701": { name: "Náchod", slug: "nachod" },

  // Svitavy (5xxxx)
  "56802": { name: "Svitavy", slug: "svitavy" },
  "56801": { name: "Svitavy", slug: "svitavy" },

  // Benešov (2xxxx)
  "25601": { name: "Benešov", slug: "benesov" },

  // Louny (4xxxx)
  "44001": { name: "Louny", slug: "louny" },

  // Žatec (4xxxx)
  "43801": { name: "Žatec", slug: "zatec" },

  // Beroun (2xxxx)
  "26601": { name: "Beroun", slug: "beroun" },
  "26701": { name: "Beroun", slug: "beroun" },

  // Mělník (2xxxx)
  "27601": { name: "Mělník", slug: "melnik" },

  // Jičín (5xxxx)
  "50601": { name: "Jičín", slug: "jicin" },

  // Kutná Hora (2xxxx)
  "28401": { name: "Kutná Hora", slug: "kutna-hora" },

  // Rokycany (3xxxx)
  "33701": { name: "Rokycany", slug: "rokycany" },

  // Rakovník (2xxxx)
  "26901": { name: "Rakovník", slug: "rakovnik" },

  // Prachatice (3xxxx)
  "38301": { name: "Prachatice", slug: "prachatice" },

  // Domažlice (3xxxx)
  "34401": { name: "Domažlice", slug: "domazlice" },

  // Klatovy (3xxxx)
  "33901": { name: "Klatovy", slug: "klatovy" },

  // Tachov (3xxxx)
  "34701": { name: "Tachov", slug: "tachov" },

  // Pelhřimov (3xxxx)
  "39301": { name: "Pelhřimov", slug: "pelhrimov" },

  // Havlíčkův Brod (5xxxx)
  "58001": { name: "Havlíčkův Brod", slug: "havlickuv-brod" },

  // Žďár nad Sázavou (5xxxx)
  "59101": { name: "Žďár nad Sázavou", slug: "zdar-nad-sazavou" },

  // Rychnov nad Kněžnou (5xxxx)
  "51601": { name: "Rychnov nad Kněžnou", slug: "rychnov-nad-kneznou" },

  // Ústí nad Orlicí (5xxxx)
  "56201": { name: "Ústí nad Orlicí", slug: "usti-nad-orlici" },

  // Semily (5xxxx)
  "51301": { name: "Semily", slug: "semily" },

  // Jeseník (7xxxx)
  "79001": { name: "Jeseník", slug: "jesenik" },

  // Bruntál (7xxxx)
  "79201": { name: "Bruntál", slug: "bruntal" },

  // Vyškov (6xxxx)
  "68201": { name: "Vyškov", slug: "vyskov" },

  // Blansko (6xxxx)
  "67801": { name: "Blansko", slug: "blansko" },

  // Žamberk (5xxxx)
  "56401": { name: "Žamberk", slug: "zamberk" },
};

/**
 * Normalizuje PSČ - odstraní mezery a zkontroluje formát
 * @param input Vstupní řetězec (např. "110 00" nebo "11000")
 * @returns Normalizované PSČ bez mezer nebo null pokud není platné
 */
export function normalizePostalCode(input: string): string | null {
  // Odstraň mezery a všechny non-digit znaky
  const cleaned = input.replace(/\D/g, '');

  // PSČ musí mít přesně 5 číslic
  if (cleaned.length !== 5) {
    return null;
  }

  return cleaned;
}

/**
 * Zkontroluje, zda je vstup platné české PSČ
 */
export function isValidPostalCode(input: string): boolean {
  const normalized = normalizePostalCode(input);
  return normalized !== null;
}

/**
 * Vyhledá město/obec podle PSČ
 * @param postalCode PSČ (může být s nebo bez mezery)
 * @returns Informace o městě/obci nebo null
 */
export function findByPostalCode(postalCode: string): PostalCodeEntry | null {
  const normalized = normalizePostalCode(postalCode);

  if (!normalized) {
    return null;
  }

  // Přesná shoda
  if (postalCodeDatabase[normalized]) {
    return postalCodeDatabase[normalized];
  }

  // Zkus najít shodu podle prvních 3 číslic (hlavní město regionu)
  const prefix3 = normalized.substring(0, 3);
  for (const [psc, entry] of Object.entries(postalCodeDatabase)) {
    if (psc.startsWith(prefix3)) {
      return entry;
    }
  }

  return null;
}

/**
 * Zjistí, zda vstup vypadá jako PSČ
 * (obsahuje převážně číslice a má správnou délku)
 */
export function looksLikePostalCode(input: string): boolean {
  const cleaned = input.replace(/\s/g, '');
  // PSČ je 5 číslic, případně 3 číslice + 2 číslice s mezerou
  return /^\d{5}$/.test(cleaned) || /^\d{3}\s?\d{2}$/.test(input);
}
