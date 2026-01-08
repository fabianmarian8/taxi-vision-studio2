# Taxi Vision Studio

Slovensky taxi agregator - prehladavac taxisluzieb po celom Slovensku.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (optional)
- **Deployment**: Vercel

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
taxi-vision-studio/
├── app/                    # Next.js App Router pages
│   ├── taxi/[...slug]/     # Catch-all taxi route (cities, services)
│   ├── admin/              # Admin panel
│   ├── partner/            # Partner management
│   └── api/                # API routes
├── src/
│   ├── components/         # React components
│   ├── data/               # Static data (cities.json, etc.)
│   ├── lib/                # Utilities and helpers
│   └── utils/              # Helper functions
└── scripts/                # Build and maintenance scripts
```

## Environment Variables

```bash
# Required for Google Places features
GOOGLE_PLACES_API_KEY=your_key

# Optional - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Admin panel
ADMIN_PASSWORD=your_secure_password
```

## Deployment

Project is deployed on Vercel with automatic deployments from `main` branch.

## Scripts

```bash
# Precompute city distances
npm run precompute-distances

# Seed premium data
npm run seed-premium

# Scrape taxi data from Azet
npm run scrape-azet
```
