#!/bin/bash

# 🧹 SCRIPTS CLEANUP PLAN - taxi-vision-studio
# Dátum: 24. december 2024
# DevOps: Si expert na čistenie - čakám na potvrdenie pred vykonaním!

set -e

PROJECT_DIR="/Users/marianfabian/Projects/taxi-vision-studio"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
ARCHIVE_NAME="scripts_archive_$(date +%Y%m%d_%H%M%S)"
ARCHIVE_DIR="$PROJECT_DIR/.archive/$ARCHIVE_NAME"

echo "════════════════════════════════════════════════════════"
echo "🧹 TIER 1 ARCHIVAČNÝ PLÁN (BEZPEČNÉ)"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Metriky:"
echo "  • Súborov na archiváciu: 26"
echo "  • Úspora miesta: ~3.3 MB"
echo "  • Riziko: MINIMÁLNE"
echo "  • Aktívne skripty: 4 (ostávajú bez zmeny)"
echo ""
echo "📦 Archívny priečinok: $ARCHIVE_DIR"
echo ""

# Zoznam súborov na archiváciu
echo "📋 SÚBORY NA ARCHIVÁCIU:"
echo ""
echo "=== JSON REPORTY (13 súborov) ==="
TIER1_JSON=(
  "google-verification-report.json"
  "place-ids-cache-full.json"
  "duplicates-report.json"
  "full-verification-report.json"
  "reverification-report.json"
  "slug-fix-report.json"
  "anomalies-fix-report.json"
  "google-matrix-changes.json"
  "place-ids-cache.json"
  "gps-fix-diff.json"
  "geoapify-verification-report.json"
  "rounded-coords-report.json"
  "distance-verification-report.json"
)

for file in "${TIER1_JSON[@]}"; do
  if [ -f "$SCRIPTS_DIR/$file" ]; then
    size=$(ls -lh "$SCRIPTS_DIR/$file" | awk '{print $5}')
    echo "  ✓ $file ($size)"
  fi
done

echo ""
echo "=== MESTSKÉ SKRIPTY (3 súbory) ==="
TIER1_CITY=(
  "fix-horna-lehota.cjs"
  "fix-hostovce-distances.cjs"
  "add-podbrezova-pairs.cjs"
)

for file in "${TIER1_CITY[@]}"; do
  if [ -f "$SCRIPTS_DIR/$file" ]; then
    echo "  ✓ $file"
  fi
done

echo ""
echo "=== HISTORICKÉ SKRIPTY (10 súborov) ==="
TIER1_HIST=(
  "revert-bad-fixes.cjs"
  "selective-revert.cjs"
  "restore-ba-ke.cjs"
  "test-scraper.cjs"
  "convert-to-google-sheets.cjs"
  "scrape-obce-emails.cjs"
  "migrate-partners-to-sanity.cjs"
  "hash-password.cjs"
  "verification-final-report.md"
  "distance-fixes.json"
)

for file in "${TIER1_HIST[@]}"; do
  if [ -f "$SCRIPTS_DIR/$file" ]; then
    echo "  ✓ $file"
  fi
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ AKTÍVNE SKRIPTY (OSTÁVAJÚ):"
echo "════════════════════════════════════════════════════════"
echo ""
echo "V package.json definované npm scripts (nebude dotnuté):"
echo "  ✅ precompute-distances.ts"
echo "  ✅ seed-marketing-premium.js"
echo "  ✅ scrape-azet-taxi.ts"
echo "  ✅ import-azet-data.ts"
echo ""

echo "════════════════════════════════════════════════════════"
echo "🚀 POKYN:"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Chceš vykonať archiváciu Tier 1 skriptov?"
echo ""
echo "MOŽNOSTI:"
echo "  1. DRY-RUN   : Zisti koľko sa archivuje bez zmeny"
echo "  2. ARCHIVOVAŤ: Vytvor archív a presuň súbory"
echo "  3. ZMAZAŤ    : Úplne odstrániť archív (OPATRNE!)"
echo "  4. ZRUŠIŤ    : Nerobiť nič"
echo ""

read -p "Vyberte (1-4): " choice

case $choice in
  1)
    echo ""
    echo "🔍 DRY-RUN: Počítam súbory a veľkosť..."

    total_size=0
    file_count=0

    for file in "${TIER1_JSON[@]}" "${TIER1_CITY[@]}" "${TIER1_HIST[@]}"; do
      if [ -f "$SCRIPTS_DIR/$file" ]; then
        size=$(stat -f%z "$SCRIPTS_DIR/$file" 2>/dev/null || stat -c%s "$SCRIPTS_DIR/$file" 2>/dev/null)
        total_size=$((total_size + size))
        file_count=$((file_count + 1))
      fi
    done

    total_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)

    echo ""
    echo "📊 ŠTATISTIKA DRY-RUN:"
    echo "  • Súborov: $file_count"
    echo "  • Spolu: ${total_mb} MB"
    echo "  • Archívny priečinok: $ARCHIVE_DIR"
    echo ""
    echo "✅ Sú pripravené na archiváciu!"
    ;;

  2)
    echo ""
    echo "📦 Vytváram archív..."

    mkdir -p "$ARCHIVE_DIR"

    for file in "${TIER1_JSON[@]}" "${TIER1_CITY[@]}" "${TIER1_HIST[@]}"; do
      if [ -f "$SCRIPTS_DIR/$file" ]; then
        echo "  → Presúvam: $file"
        mv "$SCRIPTS_DIR/$file" "$ARCHIVE_DIR/" || true
      fi
    done

    archive_size=$(du -sh "$ARCHIVE_DIR" | cut -f1)
    archive_files=$(find "$ARCHIVE_DIR" -type f | wc -l)

    echo ""
    echo "✅ ARCHIVOVANIE HOTOVÉ!"
    echo "  • Súborov: $archive_files"
    echo "  • Veľkosť: $archive_size"
    echo "  • Umiestnenie: $ARCHIVE_DIR"
    echo ""
    echo "📦 Kompresia archívu..."
    tar czf "${ARCHIVE_DIR}.tar.gz" -C "$(dirname "$ARCHIVE_DIR")" "$(basename "$ARCHIVE_DIR")"

    compressed_size=$(ls -lh "${ARCHIVE_DIR}.tar.gz" | awk '{print $5}')
    echo "  ✅ Komprimovaný archív: ${ARCHIVE_DIR}.tar.gz ($compressed_size)"
    echo ""
    echo "💡 Ďalšie kroky:"
    echo "  1. Skontroluj git status (všetky budú untracked)"
    echo "  2. Spusti: npm run build (overenie že všetko funguje)"
    echo "  3. Ak je OK, môžeš vymazať: $ARCHIVE_DIR"
    ;;

  3)
    echo ""
    read -p "⚠️  Si si ISTÝ? Archív bude NAVŽDY vymazaný! (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
      if [ -d "$ARCHIVE_DIR" ]; then
        echo "🗑️  Mazem: $ARCHIVE_DIR"
        rm -rf "$ARCHIVE_DIR"
        rm -f "${ARCHIVE_DIR}.tar.gz"
        echo "✅ Vymazané!"
      else
        echo "❌ Archív neexistuje: $ARCHIVE_DIR"
      fi
    else
      echo "❌ Zmazanie zrušené!"
    fi
    ;;

  4)
    echo "❌ Operácia zrušená!"
    exit 0
    ;;

  *)
    echo "❌ Neplatná voľba!"
    exit 1
    ;;
esac

echo ""
echo "════════════════════════════════════════════════════════"
echo "✨ Hotovo!"
echo "════════════════════════════════════════════════════════"
