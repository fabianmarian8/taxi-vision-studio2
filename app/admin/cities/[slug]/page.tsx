'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CityData, TaxiService } from '@/data/cities';

export default function AdminCityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [city, setCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Načítaj mesto z API
    fetch(`/api/admin/cities/${slug}`)
      .then(res => {
        if (res.status === 401) {
          // Unauthorized - redirect to login
          router.push('/admin/login');
          return;
        }
        if (!res.ok) {
          console.error('API Error:', res.status, res.statusText);
          return res.json().then(err => {
            console.error('Error details:', err);
            throw new Error(err.error || 'Failed to fetch city');
          });
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          // Check if it's an error response with debug info
          if (data.error) {
            console.error('❌ City not found');
            if (data.debug) {
              console.error('🔍 Debug info:', data.debug);
              console.table(data.debug.sampleSlugs);
            }
            setCity(null);
          } else {
            console.log('✅ City data loaded:', data);
            setCity(data);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Failed to load city:', err);
        setLoading(false);
      });
  }, [slug, router]);

  const handleSave = async () => {
    if (!city) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/cities/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(city),
      });

      if (response.ok) {
        alert('Mesto bolo uložené!');
      } else {
        alert('Chyba pri ukladaní');
      }
    } catch (err) {
      console.error(err);
      alert('Chyba pri ukladaní');
    } finally {
      setSaving(false);
    }
  };

  const addTaxiService = () => {
    if (!city) return;
    setCity({
      ...city,
      taxiServices: [...city.taxiServices, { name: '', phone: '', website: '', isPremium: false, isPartner: false }],
    });
  };

  const removeTaxiService = (index: number) => {
    if (!city) return;
    setCity({
      ...city,
      taxiServices: city.taxiServices.filter((_, i) => i !== index),
    });
  };

  const updateTaxiService = (index: number, field: keyof TaxiService, value: string | boolean) => {
    if (!city) return;
    setCity(prevCity => {
      if (!prevCity) return prevCity;
      const updated = [...prevCity.taxiServices];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prevCity, taxiServices: updated };
    });
  };

  const togglePremium = (index: number, checked: boolean) => {
    if (!city) return;
    setCity(prevCity => {
      if (!prevCity) return prevCity;
      const updated = [...prevCity.taxiServices];
      updated[index] = {
        ...updated[index],
        isPremium: checked,
        isPartner: checked ? false : updated[index].isPartner
      };
      return { ...prevCity, taxiServices: updated };
    });
  };

  const togglePartner = (index: number, checked: boolean) => {
    if (!city) return;
    setCity(prevCity => {
      if (!prevCity) return prevCity;
      const updated = [...prevCity.taxiServices];
      updated[index] = {
        ...updated[index],
        isPartner: checked,
        isPremium: checked ? false : updated[index].isPremium
      };
      return { ...prevCity, taxiServices: updated };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Načítavam...</p>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Mesto nenájdené</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/cities">
              <Button>← Späť na zoznam</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/cities">
              <Button variant="outline">← Späť</Button>
            </Link>
            <h1 className="text-2xl font-bold">{city.name}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Ukladám...' : 'Uložiť zmeny'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Základné info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Základné informácie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Názov mesta</Label>
              <Input
                id="name"
                value={city.name}
                onChange={(e) => setCity({ ...city, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="region">Región</Label>
              <Input
                id="region"
                value={city.region}
                onChange={(e) => setCity({ ...city, region: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={city.slug}
                onChange={(e) => setCity({ ...city, slug: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                value={city.description}
                onChange={(e) => setCity({ ...city, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta popis (SEO)</Label>
              <Textarea
                id="metaDescription"
                value={city.metaDescription}
                onChange={(e) => setCity({ ...city, metaDescription: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Taxislužby */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Taxislužby</CardTitle>
                <CardDescription>
                  Spravuj taxislužby v tomto meste
                </CardDescription>
              </div>
              <Button onClick={addTaxiService} variant="outline">
                + Pridať taxislužbu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {city.taxiServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žiadne taxislužby</p>
            ) : (
              <div className="space-y-4">
                {city.taxiServices.map((service, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold">Taxislužba #{index + 1}</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTaxiService(index)}
                          >
                            Odstrániť
                          </Button>
                        </div>

                        <div>
                          <Label>Názov</Label>
                          <Input
                            value={service.name}
                            onChange={(e) => updateTaxiService(index, 'name', e.target.value)}
                            placeholder="Napr. Taxi Plus"
                          />
                        </div>

                        <div>
                          <Label>Telefón</Label>
                          <Input
                            value={service.phone || ''}
                            onChange={(e) => updateTaxiService(index, 'phone', e.target.value)}
                            placeholder="+421901234567"
                          />
                        </div>

                        <div>
                          <Label>Web stránka</Label>
                          <Input
                            value={service.website || ''}
                            onChange={(e) => updateTaxiService(index, 'website', e.target.value)}
                            placeholder="https://www.example.com"
                          />
                        </div>

                        {/* PREMIUM checkbox - yellow/gold */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id={`premium-${index}`}
                            checked={service.isPremium || false}
                            onCheckedChange={(checked) => togglePremium(index, checked === true)}
                          />
                          <Label
                            htmlFor={`premium-${index}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-yellow-400 text-black rounded text-xs font-bold">PREMIUM</span>
                              Zlaté zvýraznenie s TOP pozíciou (3,99€/mes)
                            </span>
                          </Label>
                        </div>

                        {/* PARTNER checkbox - purple */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id={`partner-${index}`}
                            checked={service.isPartner || false}
                            onCheckedChange={(checked) => togglePartner(index, checked === true)}
                          />
                          <Label
                            htmlFor={`partner-${index}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-bold">PARTNER</span>
                              Fialové zvýraznenie s overením (8,99€/mes)
                            </span>
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save button at bottom */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? 'Ukladám...' : 'Uložiť všetky zmeny'}
          </Button>
        </div>
      </main>
    </div>
  );
}
