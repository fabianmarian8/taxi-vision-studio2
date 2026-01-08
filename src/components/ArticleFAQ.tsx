'use client';

import { useEffect, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { articleFAQs, type FAQItem } from "@/data/articleFAQs";

interface ArticleFAQProps {
  articleSlug: string;
  articleTitle: string;
}

export const ArticleFAQ = ({ articleSlug, articleTitle }: ArticleFAQProps) => {
  // Get article-specific FAQs
  const faqItems: FAQItem[] = useMemo(() => articleFAQs[articleSlug] || [], [articleSlug]);

  // Pridanie FAQ Schema.org Structured Data
  useEffect(() => {
    // Guard pre SSR - document nie je dostupný na serveri
    if (typeof document === 'undefined') return;

    // Only add schema if we have FAQ items
    if (faqItems.length === 0) {
      return;
    }
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    // Pridanie FAQ schema do <head>
    let faqScriptElement = document.querySelector('script[data-article-faq-schema="true"]');
    if (!faqScriptElement) {
      faqScriptElement = document.createElement('script');
      faqScriptElement.setAttribute('type', 'application/ld+json');
      faqScriptElement.setAttribute('data-article-faq-schema', 'true');
      document.head.appendChild(faqScriptElement);
    }
    faqScriptElement.textContent = JSON.stringify(faqSchema);

    // Cleanup
    return () => {
      const element = document.querySelector('script[data-article-faq-schema="true"]');
      if (element) {
        element.remove();
      }
    };
  }, [faqItems]);

  // Don't render if no FAQs available
  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 relative bg-background">
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-6 text-foreground">
            Často Kladené Otázky
          </h2>
          <p className="text-base md:text-lg text-foreground/80">
            Odpovede na najčastejšie otázky k téme
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
              {articleTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
