'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TaxiService {
  name: string;
  phone?: string | null;
}

interface ExpandableTaxiListProps {
  taxis: TaxiService[];
  cityName: string;
  citySlug: string;
}

export function ExpandableTaxiList({ taxis, cityName, citySlug }: ExpandableTaxiListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (taxis.length === 0) return null;

  const firstTaxi = taxis[0];
  const remainingTaxis = taxis.slice(1);

  return (
    <div className="mb-6">
      {/* Prvá taxi služba - vždy viditeľná */}
      <Card className="p-4 hover:shadow-md transition-shadow border-2 border-primary-yellow/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-bold text-foreground">{firstTaxi.name}</h4>
            {firstTaxi.phone && (
              <p className="text-sm text-foreground/70">{firstTaxi.phone}</p>
            )}
          </div>
          <div className="flex gap-2">
            {firstTaxi.phone && (
              <a
                href={`tel:${firstTaxi.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                Zavolať
              </a>
            )}
            <Link
              href={`/taxi/${citySlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-yellow text-foreground font-semibold rounded-lg hover:bg-primary-yellow/90 transition-colors text-sm"
            >
              Detail
            </Link>
          </div>
        </div>
      </Card>

      {/* Rozbaľovacie tlačidlo a ostatné taxi služby */}
      {remainingTaxis.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-foreground/70 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
            {isExpanded
              ? 'Skryť ďalšie taxi služby'
              : `Zobraziť ďalších ${remainingTaxis.length} taxi služieb`
            }
          </button>

          {/* Rozbalený zoznam */}
          <div
            className={`grid gap-2 overflow-hidden transition-all duration-300 ${
              isExpanded ? 'mt-3 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {remainingTaxis.map((taxi, index) => (
              <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm">{taxi.name}</h4>
                    {taxi.phone && (
                      <p className="text-xs text-foreground/70">{taxi.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {taxi.phone && (
                      <a
                        href={`tel:${taxi.phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-xs"
                      >
                        <Phone className="h-3 w-3" />
                        Zavolať
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Link na všetky taxi služby */}
      <Link
        href={`/taxi/${citySlug}`}
        className="inline-block mt-3 text-sm text-primary-yellow font-semibold hover:underline"
      >
        Zobraziť všetky taxi služby v {cityName} →
      </Link>
    </div>
  );
}
