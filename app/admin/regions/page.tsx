import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUniqueRegions, getCitiesByRegion } from '@/data/cities';

export default async function AdminRegionsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const regions = getUniqueRegions();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">← Späť</Button>
            </Link>
            <h1 className="text-2xl font-bold">Správa regiónov</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Celkový počet regiónov: {regions.length}</CardTitle>
            <CardDescription>
              Regióny Slovenska
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => {
            const cities = getCitiesByRegion(region);
            return (
              <Card key={region}>
                <CardHeader>
                  <CardTitle className="text-lg">{region}</CardTitle>
                  <CardDescription>
                    {cities.length} {cities.length === 1 ? 'mesto' : cities.length < 5 ? 'mestá' : 'miest'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/cities">
                    <Button variant="outline" className="w-full">
                      Zobraziť mestá
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
