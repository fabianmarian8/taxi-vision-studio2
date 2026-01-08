import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminServicesPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">← Zpět</Button>
            </Link>
            <h1 className="text-2xl font-bold">Správa taxislužeb</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Taxislužby</CardTitle>
            <CardDescription>
              Taxislužby jsou součástí měst. Pro správu taxislužeb jděte do sekce "Města" a vyberte konkrétní město.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/cities">
              <Button>Přejít na města</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
