'use client';

import { MapPin, Plane, CreditCard, Clock } from 'lucide-react';
import type { PricelistItem } from '@/data/cities';

interface TaxiPricelistProps {
  pricelist: PricelistItem[];
  pricePerKm?: string;
  paymentMethods?: string[];
  serviceName: string;
}

export function TaxiPricelist({ pricelist, pricePerKm, paymentMethods, serviceName }: TaxiPricelistProps) {
  if (!pricelist || pricelist.length === 0) return null;

  // Rozdelenie na lokálne a diaľkové trasy
  const localRoutes = pricelist.filter(item => !item.distance || item.distance <= 30);
  const longRoutes = pricelist.filter(item => item.distance && item.distance > 30);
  const airportRoutes = pricelist.filter(item => item.destination.toLowerCase().includes('letisko'));

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Cenník {serviceName}
        </h3>
        {pricePerKm && (
          <p className="text-amber-100 text-sm mt-1">
            Základná sadzba: <span className="font-bold text-white">{pricePerKm}</span>
          </p>
        )}
      </div>

      {/* Letiskové transfery - zvýraznené */}
      {airportRoutes.length > 0 && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
            <Plane className="h-4 w-4" />
            Letiskové transfery
          </h4>
          <div className="grid gap-2">
            {airportRoutes.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{item.destination}</span>
                  {item.note && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {item.note}
                    </span>
                  )}
                </div>
                <span className="font-bold text-blue-600 text-lg">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lokálne trasy */}
      {localRoutes.filter(r => !r.destination.toLowerCase().includes('letisko')).length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" />
            Lokálne trasy
          </h4>
          <div className="space-y-2">
            {localRoutes
              .filter(r => !r.destination.toLowerCase().includes('letisko'))
              .map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{item.destination}</span>
                  {item.distance && (
                    <span className="text-xs text-gray-400">{item.distance} km</span>
                  )}
                </div>
                <span className="font-bold text-amber-600">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diaľkové trasy - tabuľka */}
      {longRoutes.filter(r => !r.destination.toLowerCase().includes('letisko')).length > 0 && (
        <div className="p-4">
          <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4" />
            Medzimestské trasy
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 font-medium text-gray-600">Destinácia</th>
                  <th className="text-center p-2 font-medium text-gray-600">Vzdialenosť</th>
                  <th className="text-right p-2 font-medium text-gray-600">Cena</th>
                </tr>
              </thead>
              <tbody>
                {longRoutes
                  .filter(r => !r.destination.toLowerCase().includes('letisko'))
                  .sort((a, b) => (a.distance || 0) - (b.distance || 0))
                  .map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-amber-50/50">
                    <td className="p-2">
                      <span className="font-medium text-gray-900">{item.destination}</span>
                      {item.note && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          {item.note}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center text-gray-500">
                      {item.distance ? `${item.distance} km` : '-'}
                    </td>
                    <td className="p-2 text-right font-bold text-amber-600">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spôsoby platby */}
      {paymentMethods && paymentMethods.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Platba:</span>{' '}
            {paymentMethods.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
}
