# Sanity CMS - Partner Self-Service

Systém pre partnerov taxislužieb na editáciu ich stránok s workflow schvaľovania.

## Setup (Prvé spustenie)

### 1. Vytvor Sanity projekt

```bash
npx sanity login    # Prihlás sa cez Google/GitHub
npx sanity init     # Vytvor nový projekt
```

Alebo manuálne na [sanity.io/manage](https://www.sanity.io/manage)

### 2. Nastav environment variables

V `.env.local` vyplň:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=tvoj-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=tvoj-write-token
SANITY_WEBHOOK_SECRET=nejaky-secret-string
```

**Kde získaš hodnoty:**
- `PROJECT_ID` - sanity.io/manage → tvoj projekt → Project ID
- `API_TOKEN` - sanity.io/manage → API → Tokens → Add API token (Editor permissions)
- `WEBHOOK_SECRET` - vygeneruj si náhodný string

### 3. Spusti Sanity Studio lokálne

```bash
cd sanity
npm install
npm run dev
```

Studio beží na `http://localhost:3333`

### 4. Migruj existujúcich partnerov

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_API_TOKEN=xxx node scripts/migrate-partners-to-sanity.cjs
```

### 5. Nastav webhook (pre notifikácie)

V Sanity Dashboard:
1. Choď do API → Webhooks
2. Pridaj nový webhook:
   - URL: `https://tvoja-domena.sk/api/sanity-webhook`
   - Secret: rovnaký ako `SANITY_WEBHOOK_SECRET`
   - Trigger on: Create, Update, Delete
   - Filter: `_type == "partnerTaxiService"`

---

## Workflow pre partnerov

### Partner (edituje)

1. Prihlási sa do Sanity Studio
2. Nájde svoju taxislužbu
3. Upraví polia (fotky, popis, služby...)
4. Zmení status na **"⏳ Čaká na schválenie"**
5. Uloží

### Admin (schvaľuje)

1. Dostane notifikáciu (email/Slack)
2. Otvorí Sanity Studio → "Čakajú na schválenie"
3. Skontroluje zmeny
4. Zmení status na **"✅ Schválené"** alebo **"❌ Zamietnuté"**
5. Pri zamietnutí pridá poznámku prečo

### Automaticky

- Po schválení sa zmeny publikujú na web (revalidácia cez webhook)
- Partner vidí svoje dáta až po schválení

---

## Štruktúra

```
sanity/
├── schemaTypes/
│   ├── index.ts
│   └── partnerTaxiService.ts   # Schéma pre partnera
├── sanity.config.ts             # Konfigurácia Studia
├── sanity.cli.ts                # CLI konfigurácia
└── README.md                    # Tento súbor

src/lib/
└── sanity.ts                    # Next.js client + queries

app/api/
└── sanity-webhook/
    └── route.ts                 # Webhook handler
```

---

## Príkazy

```bash
# Lokálny vývoj Sanity Studio
cd sanity && npm run dev

# Deploy Sanity Studio (na sanity.studio)
cd sanity && npm run deploy

# GROQ query testing
# Otvor http://localhost:3333/vision
```

---

## Roles & Permissions

Na [sanity.io/manage](https://www.sanity.io/manage) → Members:

| Role | Čo môže |
|------|---------|
| **Administrator** | Všetko (ty) |
| **Editor** | Editovať dokumenty, nahrávať médiá |
| **Viewer** | Len čítať (nepočíta sa do limitu) |

Pre partnerov daj **Editor** role.

---

## Limity Free Tier

- **20 používateľov** (partneri + admini)
- 10,000 dokumentov
- 500k API requests/mesiac
- 20GB bandwidth
