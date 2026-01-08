import { useState } from "react";
import { MapPin, X } from "lucide-react";

interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  prices: {
    nastupne: number;
    cenaZaKm: number;
    odhad5km: number;
  };
  notes: string;
  ranking: {
    celkovo: number;
  };
}

interface CzechMapProps {
  cities: City[];
  selectedCity: string | null;
  onCitySelect: (cityId: string | null) => void;
}

export const CzechMap = ({ cities, selectedCity, onCitySelect }: CzechMapProps) => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Convert lat/lon to SVG coordinates (simplified projection)
  const latLonToSVG = (lat: number, lon: number) => {
    // Czech Republic bounds
    const minLat = 48.5;
    const maxLat = 51.1;
    const minLon = 12.1;
    const maxLon = 18.9;

    // SVG dimensions
    const width = 800;
    const height = 400;

    const x = ((lon - minLon) / (maxLon - minLon)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;

    return { x, y };
  };

  const selectedCityData = cities.find(c => c.id === selectedCity);
  const hoveredCityData = cities.find(c => c.id === hoveredCity);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8">
      <div className="relative">
        {/* SVG Map */}
        <svg
          viewBox="0 0 800 400"
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          {/* Background */}
          <rect width="800" height="400" fill="hsl(var(--muted))" rx="8" />

          {/* Simplified Czech Republic outline */}
          <path
            d="M 100,200 L 150,150 L 250,120 L 350,110 L 450,120 L 550,140 L 650,160 L 700,180 L 720,220 L 700,260 L 650,280 L 550,290 L 450,285 L 350,280 L 250,270 L 150,250 Z"
            fill="hsl(var(--background))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* City markers */}
          {cities.map((city) => {
            const { x, y } = latLonToSVG(city.latitude, city.longitude);
            const isSelected = selectedCity === city.id;
            const isHovered = hoveredCity === city.id;
            const isActive = isSelected || isHovered;

            // Color based on ranking (1=best/green, 10=worst/red)
            const getRankingColor = (ranking: number) => {
              if (ranking <= 3) return '#10b981'; // green
              if (ranking <= 7) return '#f59e0b'; // orange
              return '#ef4444'; // red
            };

            return (
              <g key={city.id}>
                {/* City marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 12 : 8}
                  fill={getRankingColor(city.ranking.celkovo)}
                  stroke="white"
                  strokeWidth={isActive ? 3 : 2}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => onCitySelect(isSelected ? null : city.id)}
                />

                {/* City name label */}
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize={isActive ? "14" : "12"}
                  fontWeight={isActive ? "bold" : "normal"}
                  className="pointer-events-none select-none"
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-foreground/70">Nejlevnější (Top 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-foreground/70">Střední (4-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-foreground/70">Nejdražší (8-10)</span>
          </div>
        </div>

        {/* City details card */}
        {selectedCityData && (
          <div className="mt-6 bg-primary/10 border-2 border-primary rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">{selectedCityData.name}</h3>
              </div>
              <button
                onClick={() => onCitySelect(null)}
                className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-foreground/70" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-foreground/60 mb-1">Nástupné</p>
                <p className="text-xl font-bold text-foreground">
                  {selectedCityData.prices.nastupne.toFixed(2)} €
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-foreground/60 mb-1">Cena za km</p>
                <p className="text-xl font-bold text-foreground">
                  {selectedCityData.prices.cenaZaKm.toFixed(2)} €/km
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-foreground/60 mb-1">5km jízda</p>
                <p className="text-xl font-bold text-foreground">
                  {selectedCityData.prices.odhad5km.toFixed(2)} €
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-foreground/60 mb-1">Žebříček</p>
                <p className="text-xl font-bold text-foreground">
                  #{selectedCityData.ranking.celkovo}
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground/70 leading-relaxed">
              {selectedCityData.notes}
            </p>
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredCityData && !selectedCity && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap z-10 pointer-events-none">
            {hoveredCityData.name}: {hoveredCityData.prices.odhad5km.toFixed(2)} € (5km)
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-foreground/60">
        Klikněte na město pro zobrazení detailních informací
      </div>

      {/* Disclaimer pro ceny */}
      <div className="mt-4 text-center text-xs text-foreground/50">
        * Uvedené ceny jsou orientační a mohou se lišit v závislosti na konkrétní taxislužbě, typu vozidla, času jízdy a aktuální dopravní situaci. Pro přesnou cenu kontaktujte přímo vybranou taxislužbu.
      </div>
    </div>
  );
};
