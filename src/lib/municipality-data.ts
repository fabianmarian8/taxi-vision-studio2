/**
 * Municipality data loader
 * Loads pre-computed data from municipality-data.json
 * Uses fs.readFileSync to avoid webpack bundling issues with large JSON files
 */

import * as fs from 'fs';
import * as path from 'path';

interface MunicipalityData {
  name: string;
  slug: string;
  district: string;
  region: string;
  postalCode: string | number;
  population?: number;
  area?: number;
}

interface MunicipalityDataFile {
  lastUpdated: string;
  source: string;
  count: number;
  municipalities: Record<string, MunicipalityData>;
}

// Load JSON at runtime to avoid webpack bundling large files
function loadMunicipalityData(): MunicipalityDataFile {
  try {
    const filePath = path.join(process.cwd(), 'src/data/municipality-data.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as MunicipalityDataFile;
  } catch {
    // Return empty data if file doesn't exist
    return {
      lastUpdated: '',
      source: '',
      count: 0,
      municipalities: {},
    };
  }
}

// Cache the data to avoid re-reading on every call
let municipalityData: MunicipalityDataFile | null = null;

function getMunicipalityData(): MunicipalityDataFile {
  if (!municipalityData) {
    municipalityData = loadMunicipalityData();
  }
  return municipalityData;
}

// Helper function to generate slug from text
const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export interface MunicipalityStats {
  postalCode?: string;
  population?: number;
  area?: number;
}

/**
 * Get municipality statistics by slug or name/district
 */
export function getMunicipalityStats(
  slug?: string,
  name?: string,
  district?: string
): MunicipalityStats {
  const data = getMunicipalityData();
  const municipalities = data.municipalities;

  // Try slug first
  if (slug && municipalities[slug]) {
    const munData = municipalities[slug];
    return {
      postalCode: munData.postalCode && munData.postalCode !== 0 && munData.postalCode !== '0'
        ? String(munData.postalCode)
        : undefined,
      population: munData.population,
      area: munData.area,
    };
  }

  // Try name-district slug
  if (name && district) {
    const districtSlug = toSlug(`${name}-${district}`);
    if (municipalities[districtSlug]) {
      const munData = municipalities[districtSlug];
      return {
        postalCode: munData.postalCode && munData.postalCode !== 0 && munData.postalCode !== '0'
          ? String(munData.postalCode)
          : undefined,
        population: munData.population,
        area: munData.area,
      };
    }
  }

  // Try just name slug
  if (name) {
    const nameSlug = toSlug(name);
    if (municipalities[nameSlug]) {
      const munData = municipalities[nameSlug];
      return {
        postalCode: munData.postalCode && munData.postalCode !== 0 && munData.postalCode !== '0'
          ? String(munData.postalCode)
          : undefined,
        population: munData.population,
        area: munData.area,
      };
    }
  }

  return {};
}
