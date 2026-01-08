/**
 * Next.js Configuration
 *
 * Migrácia z vite.config.ts a vercel.json
 *
 * Obsahuje:
 * - Security headers (z vercel.json)
 * - Image optimization
 * - TypeScript path aliases (automaticky z tsconfig.json)
 * - Experimental features pre budúce rozšírenia (Stripe, VIP)
 */

import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // TypeScript a ESLint sa spustia počas buildu bez výnimiek

  // Image optimization
  images: {
    // Povolené domény pre Next.js Image komponent
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Všetky HTTPS domény (pre externé obrázky)
      },
    ],
    // Image formats
    formats: ['image/avif', 'image/webp'],
  },

  // Security Headers (migrované z vercel.json lines 9-38)
  async headers() {
    // V development mode vypni CSP, aby Next.js fungoval správne
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        // Aplikuj headers na všetky routes
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          ...(!isDev ? [{
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clarity.ms https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.clarity.ms https://www.google-analytics.com https://nominatim.openstreetmap.org https://*.supabase.co; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';",
          }] : []),
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=(), payment=()',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // optimizeCss vypnute - na Verceli sposobuje pomale TTFB a nefunguje spolahlivo
    optimizeCss: false,
    // Optimalizácia importov pre menší bundle size
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts', '@radix-ui/react-icons'],
    
    // Server Actions - pripravené pre Stripe platby
    serverActions: {
      allowedOrigins: ['localhost:3000', 'taxinearme.sk', 'www.taxinearme.sk'],
      bodySizeLimit: '2mb',
    },
  },
};

export default bundleAnalyzer(nextConfig);
