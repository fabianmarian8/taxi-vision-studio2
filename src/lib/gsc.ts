import { google, searchconsole_v1 } from 'googleapis';
import { SEO_CONSTANTS } from './seo-constants';

// Initialize Google Search Console client
const SITE_URL = `${SEO_CONSTANTS.siteUrl}/`;

/**
 * Get authenticated Search Console client
 */
function getSearchConsoleClient(): searchconsole_v1.Searchconsole {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  return google.searchconsole({ version: 'v1', auth });
}

export interface GSCPageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCQueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Fetch search analytics data by page
 */
export async function fetchPageAnalytics(
  startDate: string,
  endDate: string,
  rowLimit: number = 100
): Promise<GSCPageData[]> {
  const searchconsole = getSearchConsoleClient();

  const response = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit,
      dataState: 'final',
    },
  });

  if (!response.data.rows) {
    return [];
  }

  return response.data.rows.map((row) => ({
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

/**
 * Fetch search analytics data by query (keywords)
 */
export async function fetchQueryAnalytics(
  startDate: string,
  endDate: string,
  rowLimit: number = 100
): Promise<GSCQueryData[]> {
  const searchconsole = getSearchConsoleClient();

  const response = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit,
      dataState: 'final',
    },
  });

  if (!response.data.rows) {
    return [];
  }

  return response.data.rows.map((row) => ({
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

/**
 * Fetch combined page + query data for detailed analysis
 */
export async function fetchPageQueryAnalytics(
  startDate: string,
  endDate: string,
  rowLimit: number = 500
): Promise<{ page: string; query: string; clicks: number; impressions: number; ctr: number; position: number }[]> {
  const searchconsole = getSearchConsoleClient();

  const response = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page', 'query'],
      rowLimit,
      dataState: 'final',
    },
  });

  if (!response.data.rows) {
    return [];
  }

  return response.data.rows.map((row) => ({
    page: row.keys?.[0] || '',
    query: row.keys?.[1] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

/**
 * Fetch daily trends for the date range
 */
export async function fetchDailyTrends(
  startDate: string,
  endDate: string
): Promise<{ date: string; clicks: number; impressions: number; ctr: number; position: number }[]> {
  const searchconsole = getSearchConsoleClient();

  const response = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date'],
      dataState: 'final',
    },
  });

  if (!response.data.rows) {
    return [];
  }

  return response.data.rows
    .map((row) => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Extract city slug from page URL
 */
export function extractCitySlugFromUrl(url: string): string | null {
  // Match /taxi/[city] pattern
  const match = url.match(/\/taxi\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Extract city name from query
 */
export function extractCityFromQuery(query: string): string | null {
  // Common Czech city names
  const cities = [
    'praha', 'brno', 'ostrava', 'plzen', 'liberec', 'olomouc',
    'ceske-budejovice', 'hradec-kralove', 'usti-nad-labem', 'pardubice',
    'zlin', 'havirov', 'kladno', 'most', 'opava', 'frydek-mistek',
    'karvina', 'jihlava', 'teplice', 'decin', 'chomutov', 'karlovy-vary',
    'jablonec-nad-nisou', 'mlada-boleslav', 'prostejov', 'prerov',
    'ceska-lipa', 'trebic', 'trinec', 'tabor', 'znojmo', 'pribram',
  ];

  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const city of cities) {
    const normalizedCity = city.replace(/-/g, ' ');
    if (normalizedQuery.includes(normalizedCity) || normalizedQuery.includes(city)) {
      return city;
    }
  }

  return null;
}

/**
 * Get date string for N days ago
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
