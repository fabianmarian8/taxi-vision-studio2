'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface CityContentProps {
  citySlug: string;
  cityName: string;
}

export const CityContent = ({ citySlug, cityName }: CityContentProps) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Try to load city-specific content
        const response = await fetch(`/content/cities/${citySlug}.md`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        }
      } catch (error) {
        console.error('Error loading city content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [citySlug]);

  // Don't render if no content is available
  if (!content || loading) {
    return null;
  }

  // Parse markdown content into sections
  const sections = content.split('\n## ').filter(Boolean);
  
  return (
    <section className="py-12 md:py-20 lg:py-24 px-4 md:px-8 relative">
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 md:h-16 md:w-16 text-foreground" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-6 text-foreground">
            Informácie o Taxi v Meste {cityName}
          </h2>
          <p className="text-base md:text-xl text-foreground/90 font-bold px-4">
            Všetko, čo potrebujete vedieť o taxislužbách
          </p>
        </div>

        <Card>
          <div>
            <CardContent className="py-6 md:py-8 px-4 md:px-6">
              <div className="prose prose-sm md:prose-base max-w-none">
                {sections.map((section, index) => {
                  const lines = section.split('\n');
                  const title = lines[0].replace(/^## /, '');
                  const body = lines.slice(1).join('\n').trim();
                  
                  return (
                    <div key={index} className="mb-6 md:mb-8 last:mb-0">
                      <h3 className="text-xl md:text-2xl font-black text-foreground mb-3 md:mb-4">
                        {title}
                      </h3>
                      <div className="text-sm md:text-base text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">
                        {body}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
};
