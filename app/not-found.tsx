/**
 * 404 Not Found Page - Next.js App Router
 *
 * Migrované z src/pages/NotFound.tsx
 * Zmeny:
 * - Odstránený useLocation z react-router-dom
 * - Použitý Link z next/link namiesto <a>
 * - Zachovaný pôvodný vizuál a štýlovanie
 */

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Stránka nenájdená | Taxi NearMe',
  description: 'Stránka, ktorú hľadáte, neexistuje. Vráťte sa na hlavnú stránku a nájdite taxi vo vašom meste.',
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
        <p className="mb-4 text-xl text-gray-600">Ups! Stránka nebola nájdená</p>
        <Link href="/" className="text-blue-500 underline hover:text-blue-700">
          Späť na hlavnú stránku
        </Link>
      </div>
    </div>
  );
}
