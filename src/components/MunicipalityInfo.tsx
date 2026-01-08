/**
 * MunicipalityInfo - Zobrazuje jedinečné údaje o obci
 *
 * Umístěno ve spodní části stránky obce pro SEO účely
 * Data ze sčítání 2021 + PSČ z ČSÚ
 */

import { MapPin, Users, Ruler, Mail, Building2 } from 'lucide-react';

interface MunicipalityInfoProps {
  name: string;
  district: string;
  region: string;
  slug?: string;
  latitude?: number;
  longitude?: number;
  // Optional pre-fetched data (passed from server component)
  postalCode?: string;
  population?: number;
  area?: number;
}

// Regional characteristics for unique descriptions - Czech regions
const regionCharacteristics: Record<string, string[]> = {
  'Hlavní město Praha': ['v hlavním městě České republiky', 'v centru dění', 'v dynamicky se rozvíjejícím regionu'],
  'Středočeský kraj': ['v blízkosti Prahy', 'v srdci Čech', 'v historickém regionu'],
  'Jihočeský kraj': ['v malebném jižním Česku', 'v oblasti bohaté na vodní plochy', 'v turisticky atraktivním regionu'],
  'Plzeňský kraj': ['na západě Čech', 'v oblasti s pivovarnickou tradicí', 'v průmyslovém regionu'],
  'Karlovarský kraj': ['v lázeňském regionu', 'na západním okraji republiky', 'v oblasti s bohatou lázeňskou tradicí'],
  'Ústecký kraj': ['na severu Čech', 'v průmyslovém regionu', 'v oblasti s pestrou historií'],
  'Liberecký kraj': ['v podhůří Jizerských hor', 'na severu Čech', 'v turisticky atraktivním regionu'],
  'Královéhradecký kraj': ['ve východních Čechách', 'v oblasti s bohatou historií', 'v malebném regionu'],
  'Pardubický kraj': ['ve východních Čechách', 'v oblasti známé koňským sportem', 'v historickém regionu'],
  'Kraj Vysočina': ['na Českomoravské vrchovině', 'v srdci republiky', 'v malebném prostředí'],
  'Jihomoravský kraj': ['na jižní Moravě', 'v oblasti vinařství', 'v dynamickém regionu'],
  'Olomoucký kraj': ['na střední Moravě', 'v historickém regionu', 'v oblasti s bohatou tradicí'],
  'Moravskoslezský kraj': ['na východě republiky', 'v průmyslovém regionu', 'v oblasti s hornickou tradicí'],
  'Zlínský kraj': ['na východní Moravě', 'v regionu s bohatou tradicí', 'v malebné oblasti'],
};

// Generate unique description based on municipality data
function generateUniqueDescription(
  name: string,
  district: string,
  region: string,
  population?: number,
  area?: number
): string {
  // Deterministic seed from name
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Get regional characteristic
  const characteristics = regionCharacteristics[region] || ['v malebném prostředí českého venkova'];
  const characteristicIndex = seed % characteristics.length;
  const characteristic = characteristics[characteristicIndex];

  // Build description with real data
  let description = '';

  if (population && area) {
    const density = Math.round(population / area);
    const templates = [
      `${name} je obec v okrese ${district}, ${region}. Nachází se ${characteristic}. Obec má ${population.toLocaleString('cs-CZ')} obyvatel a rozlohu ${area.toFixed(2)} km² (hustota ${density} obyv./km²).`,
      `Obec ${name} se nachází ${characteristic} v okrese ${district}. S ${population.toLocaleString('cs-CZ')} obyvateli na ploše ${area.toFixed(2)} km² patří mezi typické české obce.`,
      `${name} je česká obec patřící do okresu ${district} v ${region.replace(' kraj', 'ém kraji')}. Žije tu ${population.toLocaleString('cs-CZ')} obyvatel na území s rozlohou ${area.toFixed(2)} km².`,
    ];
    description = templates[seed % templates.length];
  } else if (population) {
    const templates = [
      `${name} je obec v okrese ${district}, ${region}. Nachází se ${characteristic}. Obec má ${population.toLocaleString('cs-CZ')} obyvatel.`,
      `Obec ${name} se nachází ${characteristic} v okrese ${district}. S ${population.toLocaleString('cs-CZ')} obyvateli nabízí klidné venkovské prostředí.`,
    ];
    description = templates[seed % templates.length];
  } else {
    const templates = [
      `${name} je obec v okrese ${district}, ${region}. Nachází se ${characteristic}. Obec nabízí svým obyvatelům klidné venkovské prostředí s dobrou dostupností do okolních měst.`,
      `Obec ${name} se nachází ${characteristic} v okrese ${district}. Tato česká obec v ${region.replace(' kraj', 'ém kraji')} je ideálním místem pro ty, kteří hledají klid venkova.`,
    ];
    description = templates[seed % templates.length];
  }

  return description;
}

export function MunicipalityInfo({
  name,
  district,
  region,
  slug,
  latitude,
  longitude,
  postalCode,
  population,
  area,
}: MunicipalityInfoProps) {
  // Generate unique description
  const description = generateUniqueDescription(name, district, region, population, area);

  return (
    <section className="py-8 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          O obci {name}
        </h2>

        {/* Popis */}
        <p className="text-foreground/70 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Údaje v grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Okres */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-foreground/60 mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium">Okres</span>
            </div>
            <p className="font-bold text-foreground">{district}</p>
          </div>

          {/* Kraj */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-foreground/60 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">Kraj</span>
            </div>
            <p className="font-bold text-foreground">{region}</p>
          </div>

          {/* PSČ */}
          {postalCode && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-foreground/60 mb-1">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-medium">PSČ</span>
              </div>
              <p className="font-bold text-foreground">{postalCode}</p>
            </div>
          )}

          {/* Počet obyvatelů */}
          {population && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-foreground/60 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Obyvatelé (2021)</span>
              </div>
              <p className="font-bold text-foreground">{population.toLocaleString('cs-CZ')}</p>
            </div>
          )}

          {/* Rozloha */}
          {area && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-foreground/60 mb-1">
                <Ruler className="h-4 w-4" />
                <span className="text-xs font-medium">Rozloha</span>
              </div>
              <p className="font-bold text-foreground">{area.toFixed(2)} km²</p>
            </div>
          )}

          {/* GPS souřadnice */}
          {latitude && longitude && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-foreground/60 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-medium">GPS</span>
              </div>
              <p className="font-bold text-foreground text-sm">
                {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
              </p>
            </div>
          )}
        </div>

        {/* Zdroj dat */}
        <p className="mt-4 text-xs text-foreground/40 text-right">
          Zdroj: Sčítání obyvatel 2021, Český statistický úřad
        </p>
      </div>
    </section>
  );
}
