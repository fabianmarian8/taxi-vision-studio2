/**
 * SEOBreadcrumbs - Server Component
 *
 * Zmena z Client Component na Server Component pre lepšiu indexáciu.
 * Schema.org BreadcrumbList sa teraz renderuje priamo v HTML,
 * čo zaručuje, že Googlebot uvidí structured data pri prvom crawle.
 *
 * Podľa Google Indexing 2025 dokumentov:
 * "SSR/SSG je najlepšie pre SEO - Googlebot dostane plne renderovanú HTML"
 */

import Link from 'next/link';
import Script from 'next/script';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { SEO_CONSTANTS } from '@/lib/seo-constants';

// Premenované z BreadcrumbItem na BreadcrumbItemData aby nekolidovalo s importom
export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItemData[];
}

export const SEOBreadcrumbs = ({ items }: SEOBreadcrumbsProps) => {
  const baseUrl = SEO_CONSTANTS.siteUrl;

  // Vytvorenie BreadcrumbList Schema.org Structured Data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Domov",
        "item": baseUrl
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        ...(item.href && { "item": `${baseUrl}${item.href}` })
      }))
    ]
  };

  // Generovanie unikátneho ID pre script tag
  const scriptId = `breadcrumb-schema-${items.map(i => i.label).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '')}`;

  return (
    <>
      {/* Schema.org BreadcrumbList - renderované na serveri */}
      <Script
        id={scriptId}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 md:px-8 pt-2 md:pt-3">
        <Breadcrumb>
          <BreadcrumbList className="text-xs md:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1 hover:text-foreground/70 transition-colors font-bold" title="Domovská stránka Taxi NearMe">
                  <Home className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Domov</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="hover:text-foreground/70 transition-colors font-bold" title={item.label}>
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="font-bold text-foreground">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
};
