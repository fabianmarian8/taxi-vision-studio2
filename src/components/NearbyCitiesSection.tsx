import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { type CityData } from '@/data/cities';

interface NearbyCitiesSectionProps {
  nearbyCities: Array<{ city: CityData; distance: number }>;
  currentCityName: string;
}

export function NearbyCitiesSection({ nearbyCities, currentCityName }: NearbyCitiesSectionProps) {
  if (nearbyCities.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-foreground/5">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 text-center">
          Taxi v okolitých mestách
        </h2>
        <p className="text-foreground/70 text-center mb-8">
          Hľadáte taxi v okolí mesta {currentCityName}? Pozrite si taxislužby v blízkych mestách.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyCities.map(({ city, distance }) => (
            <Link key={city.slug} href={`/taxi/${city.slug}`}>
              <Card className="p-4 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary-yellow flex-shrink-0" />
                      <h3 className="font-bold text-foreground">{city.name}</h3>
                    </div>
                    <p className="text-sm text-foreground/60 mb-2">
                      {city.taxiServices.length} taxisluži{city.taxiServices.length === 1 ? 'ba' : city.taxiServices.length < 5 ? 'by' : 'eb'}
                    </p>
                    <p className="text-xs text-foreground/50">
                      ~{distance} km od {currentCityName}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-foreground/30 flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
