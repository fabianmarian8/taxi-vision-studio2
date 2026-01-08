interface City {
  name: string;
  prices: {
    nastupne: number;
    cenaZaKm: number;
    odhad5km: number;
  };
}

interface PriceChartsProps {
  cities: City[];
}

export const PriceCharts = ({ cities }: PriceChartsProps) => {
  // Sort cities for better visualization
  const sortedByNastupne = [...cities].sort((a, b) => b.prices.nastupne - a.prices.nastupne);
  const sortedByKm = [...cities].sort((a, b) => b.prices.cenaZaKm - a.prices.cenaZaKm);

  const BarChart = ({ 
    data, 
    valueKey, 
    title, 
    unit 
  }: { 
    data: City[]; 
    valueKey: keyof City['prices']; 
    title: string; 
    unit: string;
  }) => {
    const maxValue = Math.max(...data.map(city => city.prices[valueKey]));

    return (
      <div className="bg-card rounded-xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-6">{title}</h3>
        <div className="space-y-4">
          {data.map((city, index) => {
            const value = city.prices[valueKey];
            const percentage = (value / maxValue) * 100;
            const isHighest = index === 0;

            return (
              <div key={city.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{city.name}</span>
                  <span className="font-bold text-foreground">
                    {value.toFixed(2)} {unit}
                  </span>
                </div>
                <div className="relative h-8 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighest ? 'bg-primary' : 'bg-primary/60'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-end pr-3">
                      {percentage > 20 && (
                        <span className="text-xs font-bold text-white">
                          {value.toFixed(2)} {unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BarChart
        data={sortedByNastupne}
        valueKey="nastupne"
        title="Porovnanie nástupných sadzieb"
        unit="€"
      />
      <BarChart
        data={sortedByKm}
        valueKey="cenaZaKm"
        title="Porovnanie ceny za kilometer"
        unit="€/km"
      />
    </div>
  );
};
