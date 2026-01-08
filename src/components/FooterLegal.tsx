'use client';

import Link from 'next/link';
import { reopenCookieSettings } from './cookie-banner/cookieManager';

export const FooterLegal = () => {
  return (
    <footer className="border-t border-foreground/30 py-12 px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-foreground font-bold">
            © 2025 Taxi NearMe. Všetky práva vyhradené.
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <Link
              href="/ochrana-sukromia"
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors"
              title="Ochrana súkromia a GDPR"
            >
              Ochrana súkromia
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors"
              title="Informácie o cookies"
            >
              Cookies
            </Link>
            <Link
              href="/podmienky-pouzivania"
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors"
              title="Podmienky používania služby"
            >
              Podmienky používania
            </Link>
            <Link
              href="/obchodne-podmienky"
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors"
              title="Obchodné podmienky pre PREMIUM a PARTNER služby"
            >
              Obchodné podmienky
            </Link>
            <Link
              href="/o-nas"
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors"
              title="O nás - náš tím a príbeh"
            >
              O nás
            </Link>
            <Link
              href="/kontakt"
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors"
              title="Kontaktný formulár"
            >
              Kontakt
            </Link>
            <button
              onClick={reopenCookieSettings}
              className="text-sm text-foreground font-bold hover:text-foreground/70 transition-colors cursor-pointer"
            >
              Nastavenia cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
