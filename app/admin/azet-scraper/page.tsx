'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface AzetService {
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  description: string | null;
  azet_url: string;
  azet_id: string;
  selected?: boolean;
}

interface City {
  name: string;
  slug: string;
  taxiServices: { name: string; phone: string }[];
}

export default function AzetScraperPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<AzetService[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load cities on mount
  useEffect(() => {
    fetch('/api/admin/cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities) {
          setCities(data.cities);
        }
      })
      .catch(err => console.error('Failed to load cities:', err));
  }, []);

  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle scrape
  const handleScrape = async () => {
    if (!selectedCity) {
      setError('Vyberte město');
      return;
    }

    const city = cities.find(c => c.slug === selectedCity);
    if (!city) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setResults([]);

    try {
      const existingPhones = city.taxiServices.map(s => s.phone);

      const response = await fetch('/api/admin/azet-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: city.name,
          existingPhones
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scraping failed');
      }

      // Mark all as selected by default
      const servicesWithSelection = data.services.map((s: AzetService) => ({
        ...s,
        selected: true
      }));

      setResults(servicesWithSelection);

      if (servicesWithSelection.length === 0) {
        setSuccess('Nenašly se žádné nové taxislužby na Azet.sk');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při scrapování');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle service selection
  const toggleService = (index: number) => {
    setResults(prev => prev.map((s, i) =>
      i === index ? { ...s, selected: !s.selected } : s
    ));
  };

  // Select/deselect all
  const toggleAll = (selected: boolean) => {
    setResults(prev => prev.map(s => ({ ...s, selected })));
  };

  // Import selected services
  const handleImport = async () => {
    const selectedServices = results.filter(s => s.selected);
    if (selectedServices.length === 0) {
      setError('Vyberte alespoň jednu taxislužbu na import');
      return;
    }

    const city = cities.find(c => c.slug === selectedCity);
    if (!city) return;

    setIsSaving(true);
    setError(null);

    try {
      // Get current city data
      const cityResponse = await fetch(`/api/admin/cities/${selectedCity}`);
      const cityData = await cityResponse.json();

      if (!cityResponse.ok) {
        throw new Error('Failed to fetch city data');
      }

      // Add new services
      const newServices = selectedServices.map(s => ({
        name: s.name,
        phone: s.phone || '',
        website: s.website || null,
        isPremium: false,
        isPromotional: false
      }));

      const updatedTaxiServices = [...cityData.taxiServices, ...newServices];

      // Save updated city
      const saveResponse = await fetch(`/api/admin/cities/${selectedCity}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cityData,
          taxiServices: updatedTaxiServices
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save city data');
      }

      setSuccess(`Úspěšně importováno ${selectedServices.length} taxislužeb do města ${city.name}`);
      setResults([]);

      // Refresh cities
      const refreshResponse = await fetch('/api/admin/cities');
      const refreshData = await refreshResponse.json();
      if (refreshData.cities) {
        setCities(refreshData.cities);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = results.filter(s => s.selected).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                &larr; Zpět
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Azet.sk Scraper</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle>Vyhledat taxislužby na Azet.sk</CardTitle>
              <CardDescription>
                Vyberte město a spusťte vyhledávání nových taxislužeb v katalogu Azet.sk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vyhledat město</Label>
                  <Input
                    placeholder="Zadejte název města..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vybrané město</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">-- Vyberte město --</option>
                    {filteredCities.map(city => (
                      <option key={city.slug} value={city.slug}>
                        {city.name} ({city.taxiServices.length} taxislužeb)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleScrape}
                disabled={isLoading || !selectedCity}
                className="w-full md:w-auto"
              >
                {isLoading ? 'Vyhledávám...' : 'Spustit vyhledávání'}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-md">
                  {success}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Nalezené taxislužby ({results.length})</CardTitle>
                    <CardDescription>
                      Vyberte taxislužby, které chcete importovat. Vybráno: {selectedCount}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
                      Vybrat všechny
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
                      Zrušit výběr
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((service, index) => (
                    <div
                      key={service.azet_id}
                      className={`p-4 border rounded-lg ${service.selected ? 'border-primary bg-primary/5' : 'border-muted'}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={service.selected}
                          onCheckedChange={() => toggleService(index)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            {service.phone && (
                              <div>Tel: {service.phone}</div>
                            )}
                            {service.website && (
                              <div>
                                Web: <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{service.website}</a>
                              </div>
                            )}
                            {service.address && (
                              <div>Adresa: {service.address}, {service.postalCode} {service.city}</div>
                            )}
                            {service.description && (
                              <div className="text-xs italic">{service.description}</div>
                            )}
                          </div>
                          <a
                            href={service.azet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                          >
                            Zobrazit na Azet.sk &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={handleImport}
                    disabled={isSaving || selectedCount === 0}
                  >
                    {isSaving ? 'Ukládám...' : `Importovat vybrané (${selectedCount})`}
                  </Button>
                  <Button variant="outline" onClick={() => setResults([])}>
                    Zrušit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Jak to funguje</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Vyberte město ze seznamu nebo ho vyhledejte podle názvu</p>
              <p>2. Klikněte na "Spustit vyhledávání" - systém vyhledá taxislužby na Azet.sk</p>
              <p>3. Automaticky se odfiltrují taxislužby, které už máte v databázi (podle telefonního čísla)</p>
              <p>4. Vyberte taxislužby, které chcete přidat a klikněte na "Importovat"</p>
              <p className="text-yellow-600">
                Poznámka: Některé záznamy na Azet.sk mohou obsahovat nesprávná telefonní čísla.
                Zkontrolujte údaje před importem.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
