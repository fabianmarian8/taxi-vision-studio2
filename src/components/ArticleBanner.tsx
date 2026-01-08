'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Newspaper } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { articles } from "@/data/articles";

// Helper funkcia na formátovanie dátumu - použije sa iba na klientovi
// Pre SSR vrátime formátovaný string priamo z dátumu
const formatDate = (dateString: string): string => {
  // Parsovanie YYYY-MM-DD formátu manuálne pre konzistentnosť SSR/CSR
  const [year, month, day] = dateString.split('-').map(Number);
  const months = [
    'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
    'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'
  ];
  return `${day}. ${months[month - 1]} ${year}`;
};

export const ArticleBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToNext = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.article-card')?.clientWidth || 0;
      const gap = 16; // gap-4 = 16px
      const scrollAmount = cardWidth + gap;

      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      // Update index
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }
  }, [articles.length]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      scrollToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isHovered, scrollToNext]);

  const scrollToPrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.article-card')?.clientWidth || 0;
      const gap = 16;
      const scrollAmount = cardWidth + gap;

      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });

      // Update index
      setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
    }
  };

  return (
    <div
      className="rounded-lg md:rounded-xl p-2 md:p-3 relative overflow-hidden bg-white border border-black/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative road markings */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>

      {/* Taxi light effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 md:mb-3 relative z-10">
        <div className="flex items-center gap-1 md:gap-2">
          <Newspaper className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
          <h2 className="text-sm md:text-base font-bold text-foreground">
            Aktuálne z blogu
          </h2>
        </div>

        {/* Navigation arrows (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToPrev}
            className="h-6 w-6 rounded-full"
            aria-label="Predchádzajúci článok"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToNext}
            className="h-6 w-6 rounded-full"
            aria-label="Ďalší článok"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Articles container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 md:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar relative z-10"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {articles.map((article) => {
          const Icon = article.icon;

          return (
            <Link
              key={article.id}
              href={article.slug}
              className="article-card flex-shrink-0 w-[168px] md:w-[192px] snap-start"
              title={article.title}
            >
              <div className="bg-gray-100 border border-foreground/10 hover:border-primary rounded-lg overflow-hidden h-full transition-colors duration-300 group flex flex-col">
                {/* Article Image */}
                {article.image && (
                  <div className="w-full h-24 md:h-28 overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 168px, 192px"
                    />
                  </div>
                )}

                <div className="p-2 md:p-3 flex flex-col flex-grow">
                  {/* Icon & Category */}
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="p-1 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 px-1.5 py-0.5 bg-primary/10 rounded-full">
                      {article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs md:text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[11px] md:text-xs text-foreground/70 mb-2 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-[11px] md:text-xs font-semibold text-amber-800 group-hover:gap-2 transition-all">
                    Čítať viac
                    <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  </div>

                  {/* Date */}
                  <div className="mt-auto pt-2 border-t border-foreground/10">
                    <p className="text-[10px] md:text-xs text-foreground/70">
                      {formatDate(article.date)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dots indicator (mobile) - min 24x24px touch target */}
      <div className="flex md:hidden items-center justify-center gap-0 mt-2">
        {articles.map((article, index) => (
          <button
            key={index}
            aria-label={`Prejsť na článok ${index + 1}: ${article.title}`}
            onClick={() => {
              if (scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const cardWidth = container.querySelector('.article-card')?.clientWidth || 0;
                const gap = 16;
                container.scrollTo({
                  left: index * (cardWidth + gap),
                  behavior: 'smooth'
                });
                setCurrentIndex(index);
              }
            }}
            className="min-w-[24px] min-h-[24px] flex items-center justify-center"
          >
            <span className={`block rounded-full transition-all ${
              index === currentIndex
                ? 'w-3 h-1.5 bg-primary'
                : 'w-1.5 h-1.5 bg-foreground/20'
            }`} />
          </button>
        ))}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
