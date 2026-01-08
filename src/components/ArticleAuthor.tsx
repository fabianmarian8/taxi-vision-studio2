/**
 * ArticleAuthor - E-E-A-T komponenta pro zobrazení autora článku
 *
 * Podle Google Indexing 2025 dokumentů:
 * "Jasné author signály jsou důležité pro prokázání zkušenosti a důvěry"
 */

import Image from 'next/image';
import Link from 'next/link';

interface ArticleAuthorProps {
  variant?: 'inline' | 'card';
  showBio?: boolean;
}

// Údaje o autorovi - Petr
const author = {
  name: 'Peter',
  role: 'Redaktor TaxiNearMe',
  image: '/images/author-peter.webp',
  bio: 'Peter je redaktor TaxiNearMe.cz se zaměřením na taxislužby a dopravní legislativu v České republice. Věnuje se analýze trhu a přináší ověřené informace pro řidiče i cestující.',
  shortBio: 'Redaktor TaxiNearMe',
};

export function ArticleAuthor({ variant = 'inline', showBio = false }: ArticleAuthorProps) {
  if (variant === 'card') {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <Link href="/o-nas" className="flex-shrink-0">
            <Image
              src={author.image}
              alt={author.name}
              width={64}
              height={64}
              className="rounded-full object-cover ring-2 ring-white shadow-md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href="/o-nas" className="hover:underline">
              <h4 className="font-bold text-gray-900">{author.name}</h4>
            </Link>
            <p className="text-sm text-gray-600">{author.role}</p>
            {showBio && (
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline varianta - kompaktní pro záhlaví článku
  return (
    <div className="flex items-center gap-3">
      <Link href="/o-nas" className="flex-shrink-0">
        <Image
          src={author.image}
          alt={author.name}
          width={40}
          height={40}
          className="rounded-full object-cover ring-2 ring-white shadow-sm"
        />
      </Link>
      <div>
        <Link href="/o-nas" className="hover:underline">
          <span className="font-semibold text-gray-900 text-sm">{author.name}</span>
        </Link>
        <p className="text-xs text-gray-500">{author.shortBio}</p>
      </div>
    </div>
  );
}

// Export údajů pro použití ve schematu
export const authorData = author;
