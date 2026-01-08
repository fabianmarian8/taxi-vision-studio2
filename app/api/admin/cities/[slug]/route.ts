import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import type { CityData } from '@/data/cities';
import { readFileFromGitHub, writeFileToGitHub, isGitHubConfigured } from '@/lib/github';
import fs from 'fs/promises';
import path from 'path';

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CITIES_FILE_PATH = 'src/data/cities.json';

interface CitiesJsonData {
  lastUpdated: string;
  cities: CityData[];
}

/**
 * Read cities data from either GitHub (production) or local file system (development)
 */
async function readCitiesData(): Promise<CitiesJsonData> {
  if (isGitHubConfigured()) {
    console.log('[API] Reading cities from GitHub');
    const content = await readFileFromGitHub(CITIES_FILE_PATH);
    return JSON.parse(content) as CitiesJsonData;
  } else {
    console.log('[API] Reading cities from local file system');
    const citiesPath = path.join(process.cwd(), CITIES_FILE_PATH);
    const fileContent = await fs.readFile(citiesPath, 'utf-8');
    return JSON.parse(fileContent) as CitiesJsonData;
  }
}

/**
 * Write cities data to either GitHub (production) or local file system (development)
 */
async function writeCitiesData(data: CitiesJsonData, commitMessage: string): Promise<void> {
  const content = JSON.stringify(data, null, 2);

  if (isGitHubConfigured()) {
    console.log('[API] Writing cities to GitHub');
    await writeFileToGitHub(CITIES_FILE_PATH, content, commitMessage);
  } else {
    // V produkcii (Vercel) je file system read-only, takže vyhodíme explicitnú chybu
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error('GitHub konfigurácia chýba. Nastavte GITHUB_TOKEN, GITHUB_OWNER a GITHUB_REPO environment premenné.');
    }
    console.log('[API] Writing cities to local file system (development mode)');
    const citiesPath = path.join(process.cwd(), CITIES_FILE_PATH);
    await fs.writeFile(citiesPath, content, 'utf-8');
  }
}

// GET - načítanie mesta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log('[API] GET /api/admin/cities/[slug] - START');

    const session = await getSession();
    if (!session) {
      console.log('[API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    console.log('[API] Looking for city with slug:', slug);

    // Read cities data from GitHub or local file system
    const data = await readCitiesData();
    const cities = data.cities as CityData[];

    console.log('[API] Total cities available:', cities.length);

    const city = cities.find(c => c.slug === slug);
    console.log('[API] City found:', city ? 'YES' : 'NO');

    if (!city) {
      console.log('[API] City not found - returning 404');
      console.log('[API] First 5 slugs:', cities.slice(0, 5).map(c => c.slug));

      // Return detailed debug info in response
      return NextResponse.json({
        error: 'City not found',
        debug: {
          requestedSlug: slug,
          totalCities: cities.length,
          sampleSlugs: cities.slice(0, 10).map(c => c.slug),
          possibleMatches: cities
            .filter(c => c.slug.includes(slug.substring(0, 5)))
            .map(c => ({ name: c.name, slug: c.slug }))
        }
      }, { status: 404 });
    }

    console.log('[API] Returning city:', city.name);
    return NextResponse.json(city);
  } catch (error) {
    console.error('[API] CRITICAL ERROR:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT - aktualizácia mesta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log('[API] PUT /api/admin/cities/[slug] - START');

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    console.log('[API] Updating city:', slug);

    const updatedCity: CityData = await request.json();

    // Read current cities data
    const data = await readCitiesData();

    // Nájdi a aktualizuj mesto
    const cityIndex = data.cities.findIndex((c: CityData) => c.slug === slug);

    if (cityIndex === -1) {
      console.log('[API] City not found for update:', slug);
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    data.cities[cityIndex] = updatedCity;
    data.lastUpdated = new Date().toISOString();

    // Write updated data to GitHub or local file system
    const commitMessage = `Update city: ${updatedCity.name} (${slug})`;
    await writeCitiesData(data, commitMessage);

    console.log('[API] City updated successfully:', slug);
    return NextResponse.json({ success: true, city: updatedCity });
  } catch (error) {
    console.error('[API] Error updating city:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - vymazanie mesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log('[API] DELETE /api/admin/cities/[slug] - START');

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    console.log('[API] Deleting city:', slug);

    // Read current cities data
    const data = await readCitiesData();

    // Odstráň mesto
    const cityIndex = data.cities.findIndex((c: CityData) => c.slug === slug);

    if (cityIndex === -1) {
      console.log('[API] City not found for deletion:', slug);
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    const cityName = data.cities[cityIndex].name;
    data.cities.splice(cityIndex, 1);
    data.lastUpdated = new Date().toISOString();

    // Write updated data to GitHub or local file system
    const commitMessage = `Delete city: ${cityName} (${slug})`;
    await writeCitiesData(data, commitMessage);

    console.log('[API] City deleted successfully:', slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting city:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
