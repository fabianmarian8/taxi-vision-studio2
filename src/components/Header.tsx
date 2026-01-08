'use client';

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ContactFormModal } from "./ContactFormModal";
import { useState } from "react";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  partnerSlug?: string;
  isOwner?: boolean;
}

export const Header = ({ partnerSlug, isOwner = false }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu on navigation

    if (pathname === '/') {
      // If we're on homepage, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to homepage then scroll
      router.push('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f5a623] border-b border-foreground/30">
      <div className="container mx-auto px-4 md:px-8 py-1.5 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/" className="home-button" title="Domovská stránka Taxi NearMe">
              <span>D</span>
              <span>o</span>
              <span>m</span>
              <span>o</span>
              <span>v</span>
            </Link>
            <div className="flex flex-col -space-y-1">
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a
              href="#cities"
              onClick={handleNavClick('cities')}
              className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors cursor-pointer"
              title="Přejít na seznam měst"
            >
              Města
            </a>
            <a
              href="#how-it-works"
              onClick={handleNavClick('how-it-works')}
              className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors cursor-pointer"
              title="Jak funguje Taxi NearMe"
            >
              Jak to funguje
            </a>
            <Link
              href="/o-nas"
              className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors"
              title="O nás"
            >
              O nás
            </Link>
            <Link
              href="/kontakt"
              className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors"
              title="Kontaktujte nás"
            >
              Kontakt
            </Link>
          </nav>

          {/* Pravá strana: +pridať a hamburger vedľa seba */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="home-button"
            >
              <span>+</span>
              <span>p</span>
              <span>ř</span>
              <span>i</span>
              <span>d</span>
              <span>a</span>
              <span>t</span>
            </button>

            <UserMenu partnerSlug={partnerSlug} isOwner={isOwner} />

            {/* Mobile: hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground hover:text-foreground/70 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-foreground/30 bg-background/98 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <a
              href="#cities"
              onClick={handleNavClick('cities')}
              className="min-h-[44px] flex items-center px-4 text-base font-bold hover:bg-foreground/5 rounded-lg transition-colors cursor-pointer"
              title="Přejít na seznam měst"
            >
              Města
            </a>
            <a
              href="#how-it-works"
              onClick={handleNavClick('how-it-works')}
              className="min-h-[44px] flex items-center px-4 text-base font-bold hover:bg-foreground/5 rounded-lg transition-colors cursor-pointer"
              title="Jak funguje Taxi NearMe"
            >
              Jak to funguje
            </a>
            <Link
              href="/o-nas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-4 text-base font-bold hover:bg-foreground/5 rounded-lg transition-colors"
              title="O nás"
            >
              O nás
            </Link>
            <Link
              href="/kontakt"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-4 text-base font-bold hover:bg-foreground/5 rounded-lg transition-colors"
              title="Kontaktujte nás"
            >
              Kontakt
            </Link>
          </nav>
        </div>
      )}

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </header>
  );
};