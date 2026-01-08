import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as https from 'https';

interface AzetService {
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  description: string | null;
  azet_url: string;
  azet_id: string;
}

// Azet.sk reklamné/sprostredkovateľské čísla - IGNOROVAŤ
const AZET_BLACKLISTED_PHONES = [
  '516588045',  // Azet call centrum
  '421516588045',
  '+421516588045',
];

// Kontrola či je číslo mobilné (09xx prefix)
function isMobilePhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  // Slovenské mobilné čísla: 09xx xxx xxx alebo +421 9xx xxx xxx
  if (cleaned.startsWith('09') && cleaned.length === 10) return true;
  if (cleaned.startsWith('4219') && cleaned.length === 12) return true;
  if (cleaned.startsWith('9') && cleaned.length === 9) return true;
  return false;
}

// Kontrola či je číslo na blackliste
function isBlacklistedPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return AZET_BLACKLISTED_PHONES.some(bp => {
    const bpCleaned = bp.replace(/[^0-9]/g, '');
    return cleaned.includes(bpCleaned) || bpCleaned.includes(cleaned);
  });
}

// Simple fetch using native https
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'sk,en-US;q=0.9,en;q=0.8'
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }

      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Extract company links from search results
function extractCompanyLinks(html: string): { name: string; url: string; id: string }[] {
  const results: { name: string; url: string; id: string }[] = [];
  const regex = /href="(https:\/\/www\.azet\.sk\/firma\/(\d+)\/[^"]+\/)"[^>]*>([^<]+)<\/a>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const id = match[2];
    const name = match[3].trim();

    if (!results.some(r => r.id === id) && name && name.length > 1) {
      results.push({ name, url, id });
    }
  }

  return results;
}

// Extract details from company detail page
function extractCompanyDetails(html: string, url: string): AzetService | null {
  const idMatch = url.match(/\/firma\/(\d+)\//);
  const azet_id = idMatch ? idMatch[1] : '';

  const nameMatch = html.match(/itemprop="name"[^>]*>([^<]+)</);
  const name = nameMatch ? nameMatch[1].trim() : '';

  if (!name) return null;

  // Nájdi VŠETKY telefónne čísla na stránke
  const allPhones: string[] = [];

  // 1. Čísla z href="tel:..."
  const telMatches = html.matchAll(/href="tel:([^"]+)"/g);
  for (const match of telMatches) {
    allPhones.push(match[1]);
  }

  // 2. Čísla v texte (slovenský formát)
  const textMatches = html.matchAll(/(\+421|0)\s*\d{3}\s*\d{3}\s*\d{3}/g);
  for (const match of textMatches) {
    allPhones.push(match[0].replace(/\s/g, ''));
  }

  // Odstráň blacklistované čísla
  const validPhones = allPhones.filter(p => !isBlacklistedPhone(p));

  // Uprednostni mobilné čísla
  const mobilePhones = validPhones.filter(p => isMobilePhone(p));
  const landlinePhones = validPhones.filter(p => !isMobilePhone(p));

  // Vyber najlepšie číslo: mobilné > pevná linka > null
  let phone: string | null = null;
  if (mobilePhones.length > 0) {
    phone = mobilePhones[0];
  } else if (landlinePhones.length > 0) {
    phone = landlinePhones[0];
  }

  const streetMatch = html.match(/itemprop="streetAddress">([^<]+)</);
  const postalMatch = html.match(/itemprop="postalCode">([^<]+)</);
  const localityMatch = html.match(/itemprop="addressLocality">([^<]+)</);

  const address = streetMatch ? streetMatch[1].trim() : null;
  const postalCode = postalMatch ? postalMatch[1].trim() : null;
  const city = localityMatch ? localityMatch[1].trim() : null;

  const descMatch = html.match(/itemprop="description"[^>]*>([^<]+)</);
  const description = descMatch ? descMatch[1].trim() : null;

  // Nájdi webovú stránku firmy
  let website: string | null = null;

  // Hľadaj mainLink - hlavný odkaz na web firmy na Azet.sk
  // Formát: <a class="mainLink" rel="nofollow" href="http://www.radio-taxi.sk?utm_source=...">
  const mainLinkMatch = html.match(/class="mainLink"[^>]*href="(https?:\/\/[^"?]+)/);
  if (mainLinkMatch) {
    // Odstráň UTM parametre a získaj čistú URL
    let cleanUrl = mainLinkMatch[1];
    // Uprav na https ak je http
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace('http://', 'https://');
    }
    website = cleanUrl;
  }

  // Záloha: hľadaj itemprop="url"
  if (!website) {
    const urlMatch = html.match(/itemprop="url"[^>]*href="(https?:\/\/[^"?]+)/);
    if (urlMatch && !urlMatch[1].includes('azet.sk') && !urlMatch[1].includes('aimg.sk')) {
      website = urlMatch[1];
    }
  }

  return { name, phone, website, address, city, postalCode, description, azet_url: url, azet_id };
}

// Normalize phone for comparison
function normalizePhone(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '').slice(-9);
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cityName, existingPhones = [] } = await request.json();

    if (!cityName) {
      return NextResponse.json({ error: 'City name is required' }, { status: 400 });
    }

    const results: AzetService[] = [];
    const seenIds = new Set<string>();
    const searchQuery = encodeURIComponent('taxi');
    const cityQuery = encodeURIComponent(cityName);

    // Search up to 2 pages
    for (let page = 1; page <= 2; page++) {
      const pageParam = page > 1 ? `&p=${page}` : '';
      const url = `https://www.azet.sk/katalog/vyhladavanie/firmy/?q=${searchQuery}&k=${cityQuery}${pageParam}`;

      try {
        const html = await fetchUrl(url);
        const companies = extractCompanyLinks(html);

        // Filter out already seen
        const newCompanies = companies.filter(c => {
          if (seenIds.has(c.id)) return false;
          seenIds.add(c.id);
          return true;
        });

        if (newCompanies.length === 0) break;

        // Get details for each company
        for (const company of newCompanies) {
          try {
            await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
            const detailHtml = await fetchUrl(company.url);
            const details = extractCompanyDetails(detailHtml, company.url);

            if (details && details.name.toLowerCase().includes('taxi')) {
              // Check if phone already exists
              const normalizedPhone = normalizePhone(details.phone);
              const existingNormalized = existingPhones.map((p: string) => normalizePhone(p));

              if (!normalizedPhone || !existingNormalized.includes(normalizedPhone)) {
                // Format phone number
                if (details.phone) {
                  const cleaned = details.phone.replace(/[^0-9]/g, '');
                  if (cleaned.length === 9) {
                    details.phone = `+421${cleaned}`;
                  } else if (cleaned.startsWith('421')) {
                    details.phone = `+${cleaned}`;
                  } else if (cleaned.startsWith('0')) {
                    details.phone = `+421${cleaned.slice(1)}`;
                  }
                }
                results.push(details);
              }
            }
          } catch {
            // Skip failed requests
          }
        }
      } catch {
        break;
      }
    }

    // Filter duplicates by phone within results
    const uniqueResults: AzetService[] = [];
    const seenPhones = new Set<string>();

    for (const service of results) {
      const normalized = normalizePhone(service.phone);
      if (!normalized || !seenPhones.has(normalized)) {
        if (normalized) seenPhones.add(normalized);
        uniqueResults.push(service);
      }
    }

    return NextResponse.json({
      success: true,
      services: uniqueResults,
      count: uniqueResults.length
    });

  } catch (error) {
    console.error('Azet scraper error:', error);
    return NextResponse.json({ error: 'Scraper failed' }, { status: 500 });
  }
}
