import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { slovakCities } from '@/data/cities';

export default async function AdminCitiesPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  // Group cities by region
  const citiesByRegion = slovakCities.reduce((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = [];
    }
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, typeof slovakCities>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">← Späť</Button>
            </Link>
            <h1 className="text-2xl font-bold">Správa miest</h1>
          </div>
          <Link href="/admin/cities/new">
            <Button>+ Pridať mesto</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Celkový počet miest: {slovakCities.length}</CardTitle>
            <CardDescription>
              Mestá sú zoskupené podľa regiónov
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-8">
          {Object.entries(citiesByRegion)
            .sort(([a], [b]) => a.localeCompare(b, 'sk'))
            .map(([region, cities]) => (
              <Card key={region}>
                <CardHeader>
                  <CardTitle className="text-xl">{region}</CardTitle>
                  <CardDescription>
                    {cities.length} {cities.length === 1 ? 'mesto' : cities.length < 5 ? 'mestá' : 'miest'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cities
                      .sort((a, b) => a.name.localeCompare(b.name, 'sk'))
                      .map((city) => (
                        <Link
                          key={city.slug}
                          href={`/admin/cities/${city.slug}`}
                          className="block"
                        >
                          <Card className="cursor-pointer">
                            <CardHeader>
                              <CardTitle className="text-base">{city.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {city.taxiServices.length} {city.taxiServices.length === 1 ? 'taxislužba' : 'taxislužieb'}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
