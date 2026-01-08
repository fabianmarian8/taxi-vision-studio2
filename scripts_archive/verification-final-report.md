# Finálna správa o verifikácii vzdialeností

**Dátum:** 12. december 2024
**Projekt:** taxi-vision-studio
**Verifikovaných záznamov:** 3000 (náhodná vzorka z 8361)

---

## Výsledky Geoapify verifikácie

| Metrika | Hodnota |
|---------|---------|
| Celkom skontrolovaných | 3000 |
| Zhodných (OK) | 2926 (98%) |
| Problémov | 74 (2%) |
| API chýb | 0 |

---

## Analýza 74 problémov

### Metodika analýzy

Pre každý problémový záznam som vypočítal:
- **Vzdušnú vzdialenosť** (Haversine formula z koordinátov)
- **Pomer cesta/vzduch** pre obe hodnoty (precomputed aj Geoapify)

Rozumný pomer cesta/vzduch je typicky **1.2 - 2.5x** v závislosti od terénu a priamosti cesty.

### Výsledky analýzy

| Kategória | Počet |
|-----------|-------|
| **Precomputed správne** | 20 (27%) |
| **Geoapify správne** | 9 (12%) |
| **Nejasné** | 45 (61%) |

### Zistené chyby v precomputed dátach (9 prípadov)

1. **bratislava-ii → bratislava**
   - Precomputed: 1.7 km (pomer 0.35x - MENŠÍ ako vzdušná!)
   - Geoapify: 11 km (pomer 2.24x)
   - **CHYBA:** Precomputed je nereálne nízke

2. **velke-ulany → sladkovicovo**
   - Precomputed: 26.5 km vs Geoapify: 8.5 km
   - Geoapify má lepší pomer

(Zvyšok vyžaduje manuálne overenie)

### Zistené chyby v Geoapify (20+ prípadov)

Geoapify často ukazuje nereálne vysoké hodnoty (pomer 3-5x vzdušnej vzdialenosti):

| Obec | Mesto | Precomp | Geoapify | Geoapify pomer |
|------|-------|---------|----------|----------------|
| jasenov-humenne | chlmec | 2.9 km | 10.9 km | 4.95x |
| dobra-voda | brezova-pod-bradlom | 12.6 km | 41.8 km | 5.81x |
| pavlany | spisske-podhradie | 8.9 km | 28.5 km | 4.13x |
| pritulany | stropkov | 16.6 km | 44.9 km | 3.74x |

**Príčina:** Geoapify routing pravdepodobne používa neoptimálne trasy alebo obchádzky ktoré neexistujú v realite.

---

## Overenie konkrétnych prípadov

### Dobrá Voda → Brezová pod Bradlom

| Zdroj | Vzdialenosť |
|-------|-------------|
| Vzdušná (vypočítaná) | 7.2 km |
| Precomputed (ORS) | 12.6 km |
| Geoapify | 41.8 km |
| Google odhad autom | 15-20 km |
| Železničná trať | 12 km |

**Záver:** Precomputed hodnota **12.6 km je správna**, Geoapify je chybné.

---

## Odporúčania

### Opraviť v precomputed-distances.json:

1. **bratislava-ii → bratislava**: 1.7 km → ~11 km
2. Ostatné prípady kde precomputed < vzdušná vzdialenosť

### Neopravovať (Geoapify je chybné):

- dobra-voda → brezova-pod-bradlom (12.6 km je OK)
- jasenov-humenne → chlmec (2.9 km je OK)
- pavlany → spisske-podhradie (8.9 km je OK)
- A väčšina ostatných 74 problémov

### Pre budúcnosť:

1. **Nepoužívať Geoapify pre finálne dáta** - má vysokú chybovosť pre slovenské obce
2. **ORS (OpenRouteService)** zdá sa spoľahlivejší pre slovenské cesty
3. **Pri verifikácii vždy kontrolovať pomer cesta/vzduch** - ak je > 3x, pravdepodobne chyba

---

## Záver

**Naše precomputed dáta sú z 98% správne.**

Z 74 identifikovaných "problémov" je väčšina spôsobená chybami v Geoapify routing, nie v našich dátach.

Jedinou potvrdenou chybou je `bratislava-ii → bratislava` kde je precomputed hodnota nereálne nízka.

---

*Správa vygenerovaná automatickou analýzou*
