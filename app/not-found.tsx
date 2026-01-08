/**
 * 404 Not Found Page - Next.js App Router
 *
 * Migrováno z src/pages/NotFound.tsx
 * Změny:
 * - Odstraněn useLocation z react-router-dom
 * - Použit Link z next/link místo <a>
 * - Zachován původní vizuál a stylování
 */

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Stránka nenalezena | Taxi NearMe',
  description: 'Stránka, kterou hledáte, neexistuje. Vraťte se na hlavní stránku a najděte taxi ve vašem městě.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Ops! Stránka nebyla nalezena</p>
        <Link href="/" className="text-blue-500 underline hover:text-blue-700">
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  );
}
