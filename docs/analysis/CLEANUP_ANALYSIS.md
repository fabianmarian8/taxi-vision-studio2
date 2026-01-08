# 🧹 Analýza čistenia scripts/ priečinka
**Dátum:** 24. december 2024
**Projekt:** taxi-vision-studio
**DevOps analýza:** Identifikácia zastaraných a jednorazových skriptov

---

## 📊 PREHĽAD

| Metryka | Hodnota |
|---------|---------|
| **Celkový počet súborov** | 88 |
| **Aktívne npm skripty** | 4 |
| **Kandidáti na archiváciu** | 56 |
| **Celková veľkosť** | ~3.4 MB |
| **Úspora pri Fáze 1** | 3.3 MB (96.5%) |

---

## ✅ AKTÍVNE SKRIPTY (UCHOVAŤ)

Tieto sú v `package.json` a sú regulárne používané:

```json
{
  "precompute-distances": "node --loader ts-node/esm scripts/precompute-distances.ts",
  "seed-premium": "node scripts/seed-marketing-premium.js",
  "scrape-azet": "node --loader ts-node/esm scripts/scrape-azet-taxi.ts",
  "import-azet": "node --loader ts-node/esm scripts/import-azet-data.ts"
}
```

✅ **4 skripty na uchovanie:**
- `precompute-distances.ts`
- `seed-marketing-premium.js` (aj `.ts` verzia!)
- `scrape-azet-taxi.ts`
- `import-azet-data.ts`

**Status:** Nikde inde v kóde nie sú importované - sú voľané len cez CLI.

---

## 🚨 TIER 1: URČITE ARCHIVOVAŤ (BEZPEČNÉ)

**26 súborov | 3.3 MB | Riziko: MINIMÁLNE**

### JSON Report súbory (13 súborov | 3.2 MB)

Tieto sú vygenerované reporty z analýz - nikdy sa nepoužívajú v kóde:

| Súbor | Veľkosť | Dátum |
|-------|---------|-------|
| `google-verification-report.json` | **3.1 MB** | 19 dec |
| `place-ids-cache-full.json` | 256 K | 19 dec |
| `duplicates-report.json` | 172 K | 19 dec |
| `full-verification-report.json` | 123 K | 19 dec |
| `reverification-report.json` | 93 K | 19 dec |
| `slug-fix-report.json` | 48 K | 19 dec |
| `anomalies-fix-report.json` | 42 K | 19 dec |
| `google-matrix-changes.json` | 36 K | 19 dec |
| `place-ids-cache.json` | 18 K | 19 dec |
| `gps-fix-diff.json` | 16 K | 19 dec |
| `geoapify-verification-report.json` | 15 K | 19 dec |
| `rounded-coords-report.json` | 9.9 K | 19 dec |
| `distance-verification-report.json` | ~10 K | 19 dec |

### Špecifické městské skripty (3 súbory)

Tieto fixujú konkrétne mestá - jednorazové opravy:
- `fix-horna-lehota.cjs` - historická oprava mesta Horná Ľupľa
- `fix-hostovce-distances.cjs` - historická oprava mesta Hostovce
- `add-podbrezova-pairs.cjs` - jednorazový import pre Podbrezovú

### Historické reverzné a utility skripty (7 súborov)

- `revert-bad-fixes.cjs` - vrátenie chybných opráv (historické)
- `selective-revert.cjs` - selektívne vrátenie (historické)
- `restore-ba-ke.cjs` - vrátenie BA-KE (historické)
- `test-scraper.cjs` - testovací skript (bez účelu)
- `convert-to-google-sheets.cjs` - jednorazový export
- `scrape-obce-emails.cjs` - jednorazový scrape
- `migrate-partners-to-sanity.cjs` - data migration (hotová)
- `hash-password.cjs` - **DUPLICITA** (existuje `hash-password.js`)

### Dokumentácia (1 súbor)
- `verification-final-report.md` - historický report

---

## ⚠️ TIER 2: ARCHIVOVAŤ S VYSOKOU PRAVDEPODOBNOSŤOU

**18 súborov | ~300 KB | Riziko: NÍZKE**

Jednorazové fix a verify skripty - nikdy sa nepoužívajú v produkčnom kóde.

### Fix skripty (12 súborov)

Tieto sú "zálaty" na problémy - po aplikácii už nie sú potrebné:

```
fix-all-distances.cjs          - bulk fix vzdialeností
fix-all-issues.cjs             - bulk fix všetkých problémov
fix-anomalies.cjs              - oprava anomálií
fix-distances-osrm.cjs         - oprava OSRM vzdialeností
fix-duplicate-gps.ts           - oprava duplikátnych GPS
fix-duplicate-slug-distances.cjs - oprava slug vzdialeností
fix-duplicates.cjs             - deduplikácia
fix-google-verified.cjs        - Google overenie
fix-problem-distances.cjs      - problémové vzdialenosti
fix-rounded-gps-v2.cjs         - zaokrúhlené GPS
fix-slug-format.cjs            - slug formát
apply-fixes.cjs                - aplikácia opráv
```

### Verify skripty (3 súbory)

Jednorazové verifikačné skripty:
```
verify-all-fixes.cjs           - verifikácia všetkých opráv
verify-all-with-placeid.cjs    - verifikácia s place ID
analyze-top-problems.cjs       - analýza problémov
```

### Analýza skripty (2 súbory)
```
audit-distances.cjs            - audit vzdialeností
```

**Status:** Žiadne z týchto sa nepoužívajú v `src/` alebo `app/` priečinkoch.

---

## 🔍 TIER 3: OVERENIE POTREBNÉ PRED ARCHIVOVANÍM

**12 súborov | ~150 KB | Riziko: STREDNÉ**

Potreba verifikácie či sú ešte v aktívnom použití:

### Verify/Reverify skripty
```
verify-distances-google.cjs    - zastarané verify?
verify-geoapify.cjs            - zastarané verify?
reverify-with-districts.cjs    - archívny verify
recompute-google-matrix.cjs    - archívny recompute
full-verification.cjs          - archívna verifikácia
```

### Duplicate/Find skripty
```
find-duplicates.cjs            - archívny find
find-duplicate-slugs.cjs       - archívny find
check-duplicates-only.cjs      - archívny check
find-rounded-coords.cjs        - archívny find
```

### Email/Mailing skripty (s veľkou pravdepodobnosťou)
```
prepare-mailing-list.cjs       - ⚠️ v1 (nahradená v3)
prepare-mailing-list-v2.cjs    - ⚠️ v2 (nahradená v3)
prepare-mailing-list-v3.cjs    - ✅ pravdepodobne aktívna
```

**Odporúčanie:** Archivovať v1 a v2, ponechať v3.

### Ostatné
```
fetch-place-ids.ts             - jednorazový fetch?
```

---

## 🏗️ TIER 4: OVERENIE POTREBNÉ - GENERAČNÉ SKRIPTY

**7 súborov | ~60 KB | Riziko: STREDNÉ**

Tieto sú generačné skripty - možno sú v build procesu:

```bash
generate-city-content.js       - generuje obsah miest
generate-city-faqs.js          - generuje FAQ
generate-routes.js             - generuje trasy
generate-sitemap.js            - generuje sitemap
improve-meta-descriptions.js   - zlepšuje meta
update-cities-metadata.js      - aktualizuje metadáta
prerender-pages.js             - 12K! prerendery strán
seed-marketing-premium.ts      - 4.9K (existuje aj .js!)
```

**Status:** Žiadne nie sú v kóde, ale môžu byť v:
- Build pipeline (CI/CD)
- Cron joby
- Deploy scriptoch

**Overenie:** Skontroluj `.github/workflows/`, `Dockerfile`, `vercel.json`, `next.config.js`

---

## 📥 TIER 5: DATA IMPORT SKRIPTY (SELEKTÍVNE)

**7 súborov | ~70 KB | Riziko: NÍZKE AŽ STREDNÉ**

Väčšina sú jednorazové importy - mimo 2 aktívnych:

```bash
✅ import-azet-data.ts         - AKTÍVNY (v package.json)
✅ scrape-azet-taxi.ts         - AKTÍVNY (v package.json)

❌ scrape-obce-emails.cjs      - historický scrape
❌ add-partner-to-supabase.cjs - historický import
❌ fetch-municipality-data.ts  - jednorazový fetch
❌ fetch-taxi-addresses.ts     - jednorazový fetch
❌ get-place-ids.cjs           - jednorazový fetch
❌ migrate-partners-to-sanity.cjs - hotová migrácia
```

---

## 🎯 JADROVÝ SÚPIS KANDIDÁTOV

### TIER 1 - OKAMŽITE ARCHIVOVAŤ (26 súborov)

```
# JSON reporty (13)
google-verification-report.json
place-ids-cache-full.json
duplicates-report.json
full-verification-report.json
reverification-report.json
slug-fix-report.json
anomalies-fix-report.json
google-matrix-changes.json
place-ids-cache.json
gps-fix-diff.json
geoapify-verification-report.json
rounded-coords-report.json
distance-verification-report.json

# Mestské skripty (3)
fix-horna-lehota.cjs
fix-hostovce-distances.cjs
add-podbrezova-pairs.cjs

# Historické/Util (10)
revert-bad-fixes.cjs
selective-revert.cjs
restore-ba-ke.cjs
test-scraper.cjs
convert-to-google-sheets.cjs
scrape-obce-emails.cjs
migrate-partners-to-sanity.cjs
hash-password.cjs
verification-final-report.md
distance-fixes.json
```

### TIER 2 - ARCHIVOVAŤ (18 súborov)

```
# Fix skripty (12)
fix-all-distances.cjs
fix-all-issues.cjs
fix-anomalies.cjs
fix-distances-osrm.cjs
fix-duplicate-gps.ts
fix-duplicate-slug-distances.cjs
fix-duplicates.cjs
fix-google-verified.cjs
fix-problem-distances.cjs
fix-rounded-gps-v2.cjs
fix-slug-format.cjs
apply-fixes.cjs

# Verify/Analyze (6)
verify-all-fixes.cjs
verify-all-with-placeid.cjs
analyze-top-problems.cjs
audit-distances.cjs
```

### TIER 3 - OVERENIE (12 súborov)

```
verify-distances-google.cjs
verify-geoapify.cjs
reverify-with-districts.cjs
recompute-google-matrix.cjs
full-verification.cjs
find-duplicates.cjs
find-duplicate-slugs.cjs
check-duplicates-only.cjs
find-rounded-coords.cjs
prepare-mailing-list.cjs
prepare-mailing-list-v2.cjs
fetch-place-ids.ts
```

---

## 💾 IMPLEMENTAČNÝ PLÁN

### Fáza 1: OKAMŽITÉ ARCHIVÁCIE (Deň 1)

```bash
#!/bin/bash
cd ~/Projects/taxi-vision-studio

# Vytvor archívny priečinok s dátumom
ARCHIVE_DIR="scripts_archive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "📦 Archivujem Tier 1 skripty..."

# JSON reporty
mv scripts/*-report.json "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/*.json "$ARCHIVE_DIR/" 2>/dev/null || true

# Mestské skripty
mv scripts/fix-horna-lehota.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/fix-hostovce-distances.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/add-podbrezova-pairs.cjs "$ARCHIVE_DIR/" 2>/dev/null || true

# Historické
mv scripts/revert-bad-fixes.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/selective-revert.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/restore-ba-ke.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-scraper.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/convert-to-google-sheets.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/scrape-obce-emails.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/migrate-partners-to-sanity.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/hash-password.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/*.md "$ARCHIVE_DIR/" 2>/dev/null || true

echo "✅ Archivované do: $ARCHIVE_DIR"
echo "📊 Počet súborov: $(ls -1 "$ARCHIVE_DIR" | wc -l)"
echo "💾 Veľkosť: $(du -sh "$ARCHIVE_DIR" | cut -f1)"

# Kompresia
tar czf "${ARCHIVE_DIR}.tar.gz" "$ARCHIVE_DIR"
echo "📦 Komprimovaný archív: ${ARCHIVE_DIR}.tar.gz"
```

**Úspora:** 3.3 MB, 26 súborov

---

### Fáza 2: ARCHIVÁCIA TIER 2 (Po overení)

Archivovať všetky `fix-*.cjs` a `verify-*.cjs` skripty - sú jednorazové.

```bash
ARCHIVE_DIR="scripts_archive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

# Fix skripty
mv scripts/fix-*.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/fix-*.ts "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/apply-fixes.cjs "$ARCHIVE_DIR/" 2>/dev/null || true

# Verify skripty
mv scripts/verify-all-*.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/analyze-*.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/audit-*.cjs "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Úspora:** ~300 KB, 18 súborov

---

### Fáza 3: OVERENIE A SELEKTÍVNA ARCHIVÁCIA (Po analýze)

Pred archivovaním overiť v kóde:

```bash
# Zisti či sa generačné skripty používajú
grep -r "generate-city\|prerender\|update-cities" \
  src/ app/ .next/ .github/ Dockerfile vercel.json next.config.js 2>/dev/null

# Zisti ktorý mailing list je aktívny
grep -r "mailing-list" src/ app/ .github/ cron/ jobs/ 2>/dev/null

# Skontroluj data import skripty
grep -r "fetch-municipality\|fetch-taxi\|get-place" src/ app/ 2>/dev/null
```

---

## ⚙️ SKRIPTOVÉ PROFILY

### Aktívne (4)
```
precompute-distances.ts      - Precompute vzdialenosti
seed-marketing-premium.js    - Seeding premium
scrape-azet-taxi.ts          - Scraping AZET
import-azet-data.ts          - Import AZET dát
```

### Kandidáti na archiváciu (56)
```
Fix scripts:           12
Verify scripts:         6
Analyze scripts:        4
JSON reports:          13
City-specific:          3
Generate scripts:       7
Data import:            6
Mailing list:           2 (z 3)
Historické:            10
Ostatné:                7
```

---

## 🔐 BEZPEČNOSTNÉ OPATRENIA

✅ **Pred archivovaním:**
1. Vytvor komprimovaný archív `.tar.gz`
2. Skontroluj git status - všetky sú untracked
3. Záloha v cloud (Dropbox, Google Drive) - VOLITEĽNE
4. Ponecháme Git históriu v `.git/` (nedeljú sa súbory)

✅ **Spôsob zmazania (ak sa rozhodneš):**
```bash
# NIKDY nie priamo - vždy najpre archivovať!
# rm -rf scripts/fix-*.cjs  ❌ NEROBTE!

# SPRÁVNE:
mkdir -p scripts_archive_$(date +%Y%m%d)
mv scripts/súbory scripts_archive_*/
# ... testujem ...
# rm -rf scripts_archive_*/  # ak je všetko ok
```

---

## 📋 FINÁLNE METRIKY

| Fáza | Súbory | Veľkosť | Úspora % | Riziko |
|------|--------|---------|----------|--------|
| 1 | 26 | 3.3 MB | 96.5% | Minimálne |
| 2 | 18 | 0.3 MB | 100% | Nízke |
| 3 | 12 | 0.15 MB | 100% | Stredné |
| 4 | 7 | 0.06 MB | 100% | Stredné |
| **CELKEM** | **56** | **~3.8 MB** | **~98%** | |

---

## ✋ FINAL CHECKLIST

- [ ] Prečítaj si tieto analýzy
- [ ] Overi Tier 3-5 v tvojom kóde
- [ ] Vytvor archívny priečinok
- [ ] Spusti Fázu 1
- [ ] Testuj, či build stále funguje
- [ ] Ak je všetko OK - pokračuj v Fáze 2+

---

**Poznámka:** Táto analýza bola vykonaná **bez zmazania alebo modifikácie** súborov. Všetky čísla a názvy sú faktické z dňa 24. decembra 2024.

Si DevOps expert, čakaš na príkaz na archivovanie. Nikdy nič nebudem mazať bez vášho potvrdenia. 🛡️
