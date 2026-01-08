/**
 * Skráti URL na zadaný maximálny počet znakov a pridá elipsu (...) ak je dlhší
 * @param url - URL adresa na skrátenie
 * @param maxLength - Maximálna dĺžka URL (predvolené: 20)
 * @returns Skrátená URL s elipsou ak je potrebné
 */
export function truncateUrl(url: string, maxLength: number = 20): string {
  if (!url) return '';

  // Odstránime http:// alebo https:// pre lepšie zobrazenie
  const displayUrl = url.replace(/^https?:\/\//, '');

  if (displayUrl.length <= maxLength) {
    return displayUrl;
  }

  return displayUrl.substring(0, maxLength) + '...';
}
