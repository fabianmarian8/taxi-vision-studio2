/**
 * Priority Municipalities for Sitemap
 *
 * Smart sitemap strategie - do sitemapy jdou jen obce s prokázanou poptávkou:
 * 1. Obce s GSC impressions > 0
 * 2. Turisticky významné obce (manuální seznam)
 *
 * Zbytek obcí zůstává indexovatelný, ale není v sitemapě.
 * Google je najde přes interní linky pokud uzná, že si to zaslouží.
 */

// Obce s prokázanou poptávkou z GSC (impressions > 0)
export const municipalitiesWithImpressions = new Set([
  // Krajská města a velká města
  'praha',
  'brno',
  'ostrava',
  'plzen',
  'liberec',
  'olomouc',
  'ceske-budejovice',
  'hradec-kralove',
  'usti-nad-labem',
  'pardubice',
  'zlin',
  'havirov',
  'kladno',
  'most',
  'opava',
  'frydek-mistek',
  'karvina',
  'jihlava',
  'teplice',
  'decin',
  'chomutov',
  'karlovy-vary',
  'jablonec-nad-nisou',
  'mlada-boleslav',
  'prostejov',
  'prerov',
  'ceska-lipa',
  'trebic',
  'trinec',
  'tabor',
  'znojmo',
  'kolin',
  'pribram',
  'cheb',
  'pisek',
  'trutnov',
  'orlova',
  'kromeriz',
  'vsetin',
  'koprivnice',
  'litomerice',
  'vyskov',
  'valasske-mezirici',
  'hodonin',
  'chrudim',
  'uherske-hradiste',
  'sumperk',
  'bruntal',
  'rakovnik',
  'sokolov',
  'louny',
]);

// Turisticky významné obce - ručně vybrané (lyžařská střediska, lázně, atrakce)
export const touristMunicipalities = new Set([
  // Krkonoše
  'spindleruv-mlyn',
  'harrachov',
  'pec-pod-snezkou',
  'rokytnice-nad-jizerou',
  'vrchlabi',
  'janske-lazne',
  'mala-upa',
  'cerny-dul',
  // Šumava
  'zelezna-ruda',
  'lipno-nad-vltavou',
  'modrava',
  'kvilda',
  'horska-kvilda',
  'prasily',
  // Beskydy
  'bily-kriz',
  'pustevny',
  'radhostska-pustevna',
  'horni-becva',
  'dolni-becva',
  'velke-karlovice',
  // Jeseníky
  'jesenik',
  'kouty-nad-desnou',
  'loucky',
  'ramzova',
  'cervena-voda',
  // Krušné hory
  'klasterec-nad-ohri',
  'jachymov',
  'bozi-dar',
  'loucna-pod-klnovcem',
  // Orlické hory
  'destne-v-orlickych-horach',
  'sedlonov',
  'ricky-v-orlickych-horach',
  // Jizerské hory
  'bedrichov',
  'josefuv-dul',
  // Moravskoslezské Beskydy
  'ostravice',
  'mala-moravka',
  // Lázně
  'karlovy-vary',
  'marianske-lazne',
  'frantiskovy-lazne',
  'podebrady',
  'lazne-belohrad',
  'jesenik',
  'trebon',
  'lazne-bohdanec',
  'lazne-kynzvart',
  'teplice-nad-becvou',
  'luhacovice',
  'velke-losiny',
  // Hrady a zámky
  'cesky-krumlov',
  'telc',
  'lednice',
  'hluboka-nad-vltavou',
  'kutna-hora',
  'litomysl',
  'kromeriz',
  'bouzov',
  'karlstejn',
  'konopiste',
  // Vinařské oblasti
  'mikulov',
  'valtice',
  'znojmo',
  'velke-bilovice',
  'pavlov',
  // Historická města
  'olomouc',
  'tabor',
  'jindrichuv-hradec',
  'slavonice',
  'prachatice',
  // Aquaparky a rekreace
  'aquapalace-prague',
  'centrum-babylon-liberec',
]);

/**
 * Check if municipality should be in sitemap
 */
export function isPriorityMunicipality(slug: string): boolean {
  return municipalitiesWithImpressions.has(slug) || touristMunicipalities.has(slug);
}

/**
 * Get total count of priority municipalities
 */
export function getPriorityMunicipalitiesCount(): number {
  const combined = new Set([...municipalitiesWithImpressions, ...touristMunicipalities]);
  return combined.size;
}
