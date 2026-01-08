import { useState } from "react";
import { Button } from "./ui/button";
import { Calculator, MapPin, Navigation } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface City {
  id: string;
  name: string;
  prices: {
    nastupne: number;
    cenaZaKm: number;
    cakanie: number;
  };
}

interface PriceCalculatorProps {
  cities: City[];
}

export const PriceCalculator = ({ cities }: PriceCalculatorProps) => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [waitTime, setWaitTime] = useState<string>("0");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const calculatePrice = () => {
    if (!selectedCity || !distance) {
      return;
    }

    const city = cities.find(c => c.id === selectedCity);
    if (!city) return;

    const distanceNum = parseFloat(distance);
    const waitTimeNum = parseFloat(waitTime) || 0;

    // Validácia - záporné hodnoty nie sú povolené
    if (distanceNum < 0 || waitTimeNum < 0) {
      return;
    }

    const price =
      city.prices.nastupne +
      (city.prices.cenaZaKm * distanceNum) +
      (city.prices.cakanie * waitTimeNum);

    // Zaistíme, že cena nie je záporná
    setCalculatedPrice(Math.max(0, price));
  };

  const resetCalculator = () => {
    setSelectedCity("");
    setDistance("");
    setWaitTime("0");
    setCalculatedPrice(null);
  };

  const selectedCityData = cities.find(c => c.id === selectedCity);

  // Handler pre vzdialenosť - sanitizuje vstup
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Povolíme iba kladné čísla a prázdny string
    if (value === '' || (parseFloat(value) >= 0)) {
      setDistance(value);
    }
  };

  // Handler pre čakanie - sanitizuje vstup
  const handleWaitTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Povolíme iba kladné čísla a prázdny string
    if (value === '' || (parseFloat(value) >= 0)) {
      setWaitTime(value);
    }
  };

  // Kontrola pre prázdne mestá
  if (!cities || cities.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 md:p-8">
        <div className="text-center text-foreground/60">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Kalkulačka nie je momentálne dostupná.</p>
          <p className="text-sm mt-2">Nenašli sa žiadne mestá s cenovými údajmi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8">
      <div className="space-y-6">
        {/* City Selection */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-foreground font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Vyberte mesto
          </Label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder="Vyberte mesto..." />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Distance Input */}
        <div className="space-y-2">
          <Label htmlFor="distance" className="text-foreground font-semibold flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Vzdialenosť (km)
          </Label>
          <Input
            id="distance"
            type="number"
            min="0"
            step="0.1"
            placeholder="Napr. 5.5"
            value={distance}
            onChange={handleDistanceChange}
            className="w-full"
          />
        </div>

        {/* Wait Time Input */}
        <div className="space-y-2">
          <Label htmlFor="waitTime" className="text-foreground font-semibold">
            Čakanie (minúty) - voliteľné
          </Label>
          <Input
            id="waitTime"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={waitTime}
            onChange={handleWaitTimeChange}
            className="w-full"
          />
        </div>

        {/* Price Breakdown */}
        {selectedCityData && (
          <div className="bg-foreground/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-foreground mb-3">Cenník pre {selectedCityData.name}:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-foreground/70">Nástupné:</div>
              <div className="font-semibold text-foreground text-right">
                {selectedCityData.prices.nastupne.toFixed(2)} €
              </div>
              <div className="text-foreground/70">Cena za km:</div>
              <div className="font-semibold text-foreground text-right">
                {selectedCityData.prices.cenaZaKm.toFixed(2)} €/km
              </div>
              <div className="text-foreground/70">Čakanie:</div>
              <div className="font-semibold text-foreground text-right">
                {selectedCityData.prices.cakanie.toFixed(2)} €/min
              </div>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <div className="flex gap-3">
          <Button
            onClick={calculatePrice}
            disabled={!selectedCity || !distance}
            className="flex-1 gap-2"
            size="lg"
          >
            <Calculator className="h-5 w-5" />
            Vypočítať cenu
          </Button>
          <Button
            onClick={resetCalculator}
            variant="outline"
            size="lg"
          >
            Reset
          </Button>
        </div>

        {/* Result */}
        {calculatedPrice !== null && (
          <div className="bg-primary/10 border-2 border-primary rounded-xl p-6 text-center">
            <p className="text-sm text-foreground/70 mb-2">Odhadovaná cena jazdy:</p>
            <p className="text-4xl md:text-5xl font-black text-primary mb-2">
              {calculatedPrice.toFixed(2)} €
            </p>
            <p className="text-xs text-foreground/60">
              {distance} km {waitTime !== "0" && `+ ${waitTime} min čakania`}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-foreground/60 text-center pt-2 border-t border-foreground/10">
          * Uvedená cena je orientačná. Skutočná cena sa môže líšiť v závislosti od konkrétnej taxislužby,
          dennej doby, dňa v týždni a ďalších faktorov. Odporúčame overiť cenu priamo u vybranej služby.
        </div>
      </div>
    </div>
  );
};
