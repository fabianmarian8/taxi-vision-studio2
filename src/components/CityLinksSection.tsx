import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { czechCities } from "@/data/cities";

export const CityLinksSection = () => {
  // Group cities by region
  const citiesByRegion = czechCities.reduce((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = [];
    }
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, typeof czechCities>);

  // Sort cities alphabetically within each region
  Object.keys(citiesByRegion).forEach(region => {
    citiesByRegion[region].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  });

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 relative bg-card/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-foreground">
            Podívejte se na detailní taxi možnosti ve vašem městě
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            Máme informace o taxislužbách ve všech českých městech.
            Klikněte na vaše město pro telefonní čísla, webové stránky a recenze.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(citiesByRegion).map(([region, cities]) => (
            <div key={region} className="bg-card rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {region}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/taxi/${city.slug}`}
                    className="block text-sm text-foreground/80 hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    title={`Taxi ${city.name} - telefonní čísla a informace`}
                  >
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-foreground/60">
            Celkem {czechCities.length} měst v České republice s informacemi o taxislužbách
          </p>
        </div>
      </div>
    </section>
  );
};
