# TaxiNearMe.sk - Design System

**Vytvorené:** 2025-12-01
**Posledná aktualizácia:** 2025-12-01

---

## 1. Základné princípy

### 1.1 Responzívny dizajn (Mobile-First)
- Všetky komponenty začínajú mobilným dizajnom
- Breakpointy: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Grid systém sa mení z 1-stĺpcového na viac-stĺpcový

### 1.2 Above-The-Fold pravidlá
- **Hlavný nadpis (H1)** - viditeľný okamžite
- **Cena/hodnota** - dominantná, zelená farba
- **CTA tlačidlo** - nad ohybom, kontrastné
- **Kľúčové info** - vzdialenosť, čas, cena v jednom pohľade

### 1.3 Vizuálna kontinuita
- Rovnaký `max-width` naprieč sekciami
- Konzistentná farebná paleta
- Jednotné font-weight pre hierarchiu

---

## 2. Layout pravidlá

### 2.1 Container šírky
```
PRAVIDLO: Všetky sekcie používajú rovnakú max-width

| Sekcia          | Max-width | Poznámka                    |
|-----------------|-----------|------------------------------|
| Hero            | max-w-6xl | Primárny obsah               |
| Content sekcie  | max-w-6xl | Pod hero                     |
| Footer          | max-w-6xl | Konzistentné                 |

NIKDY nepoužívať max-w-4xl ak zvyšok stránky má max-w-6xl!
```

### 2.2 Padding/Spacing
```css
/* Mobile */
px-3 sm:px-4 md:px-8    /* Horizontálny padding */
py-6 sm:py-8 md:py-12   /* Vertikálny padding sekcií */

/* Desktop */
gap-4 sm:gap-6          /* Grid/flex gaps */
```

---

## 3. Farebná paleta

### 3.1 Primárne farby
```
| Účel              | Farba              | Tailwind class           |
|-------------------|--------------------|-----------------------------|
| Brand/Hlavná      | Žltá               | primary-yellow              |
| Akcia/CTA         | Zelená             | green-600                   |
| Text primárny     | Čierna             | foreground                  |
| Text sekundárny   | Šedá               | foreground/60, foreground/70|
| Pozadie light     | Biela              | white                       |
| Pozadie alt       | Svetlošedá         | foreground/5                |
```

### 3.2 Sémantické farby (doprava)
```
| Dopravný prostriedok | Background      | Text/Ikona     | Poznámka        |
|----------------------|-----------------|----------------|-----------------|
| Taxi                 | primary-yellow/5| primary-yellow | Hlavná značka   |
| Vlak (ZSSK)          | blue-100        | blue-600       | ZSSK branding   |
| Autobus              | green-100       | green-600      | Eco/zelená      |
```

### 3.3 Sémantické farby (atrakcie)
```
| Typ atrakcie     | Background         | Text/Ikona      | Príklad            |
|------------------|--------------------|-----------------|--------------------|
| Landmark/pamiatka| primary-yellow/20  | primary-yellow  | Hrad, múzeum       |
| Coffee/rekreácia | amber-100          | amber-600       | Aquapark, kúpele   |
```

### 3.4 Backgrounds pre sekcie
```
| Sekcia           | Background                                      |
|------------------|------------------------------------------------|
| Hero             | bg-gradient-to-br from-primary-yellow/10 via-white to-primary-yellow/5 |
| Content alt      | bg-primary-yellow/5                            |
| Content neutral  | bg-foreground/5                                |
| Tips/info box    | bg-primary-yellow/10                           |

ZAKÁZANÉ: bg-blue-50, bg-orange-100 pre nesémanticé účely
```

---

## 4. Typografia

### 4.1 Font weights
```
| Použitie           | Weight      | Class        |
|--------------------|-------------|--------------|
| H1 nadpis          | 900         | font-black   |
| H2 nadpis sekcie   | 700         | font-bold    |
| H3/H4 podnadpisy   | 700         | font-bold    |
| Body text          | 400         | (default)    |
| Cena/číslo         | 600-700     | font-semibold/font-bold |
```

### 4.2 Veľkosti písma (responzívne)
```
| Element    | Mobile          | Desktop              |
|------------|-----------------|----------------------|
| H1         | text-2xl        | md:text-3xl lg:text-4xl |
| H2         | text-lg sm:text-xl | md:text-2xl       |
| Body       | text-sm         | sm:text-base         |
| Small      | text-xs         | sm:text-sm           |
```

---

## 5. Komponenty

### 5.1 Karty (Card)
```jsx
<Card className="p-4 sm:p-5">
  {/* Štandardný padding */}
</Card>

<Card className="p-4 sm:p-5 border-2 border-primary-yellow bg-primary-yellow/5">
  {/* Zvýraznená karta (napr. Taxi) */}
</Card>
```

### 5.2 CTA tlačidlá
```jsx
{/* Primárne CTA - zelené */}
<a className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg">
  <Phone className="h-6 w-6" />
  Zavolať taxi
</a>

{/* Sekundárne CTA - žlté */}
<Link className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary-yellow text-foreground font-bold rounded-xl hover:bg-primary-yellow/90 transition-all">
  <Car className="h-5 w-5" />
  Zobraziť taxi služby
</Link>
```

### 5.3 Info box / Tip
```jsx
<div className="p-3 sm:p-4 bg-primary-yellow/10 rounded-lg">
  <p className="text-xs sm:text-sm text-foreground/80">
    <strong>Tip:</strong> Text...
  </p>
</div>
```

### 5.4 Ikona s pozadím
```jsx
{/* Brand/hlavná */}
<div className="p-2 sm:p-2.5 rounded-full bg-primary-yellow/20">
  <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow" />
</div>

{/* Sémantická - vlak */}
<div className="p-2 sm:p-2.5 rounded-full bg-blue-100">
  <Train className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
</div>

{/* Sémantická - rekreácia */}
<div className="p-2.5 sm:p-3 rounded-lg bg-amber-100">
  <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
</div>
```

---

## 6. Checklist pre nové stránky

### 6.1 Pred implementáciou
- [ ] Určiť `max-width` - použiť rovnakú ako existujúce stránky
- [ ] Naplánovať above-the-fold obsah (H1, cena, CTA)
- [ ] Vybrať farby len z definovanej palety

### 6.2 Počas implementácie
- [ ] Všetky sekcie majú rovnaký `max-width`
- [ ] Hero používa `bg-gradient-to-br from-primary-yellow/10 via-white to-primary-yellow/5`
- [ ] Žiadne hardkódované názvy miest/hodnôt v UI
- [ ] CTA tlačidlá sú `green-600` (primárne) alebo `primary-yellow` (sekundárne)
- [ ] Info boxy sú `bg-primary-yellow/10` (nie `bg-blue-50`)

### 6.3 Po implementácii - kontrola
```bash
# Hľadaj nekonzistentné farby
grep -n "bg-blue-50\|bg-orange\|max-w-4xl" app/nova-stranka/page.tsx

# Hľadaj hardkódované hodnoty
grep -n "v Bratislave\|v Košiciach" app/nova-stranka/page.tsx
```

---

## 7. Anti-patterns (čomu sa vyhnúť)

### 7.1 "Frankensteinova stránka"
```
ZLÝÝ:
| Sekcia     | Max-width | Background   |
|------------|-----------|--------------|
| Hero       | max-w-6xl | gradient     |
| Content 1  | max-w-4xl | bg-blue-50   |  <- NEKONZISTENTNÉ!
| Content 2  | max-w-6xl | bg-orange-50 |  <- CHAOS!

DOBRÝ:
| Sekcia     | Max-width | Background           |
|------------|-----------|----------------------|
| Hero       | max-w-6xl | gradient (yellow)    |
| Content 1  | max-w-6xl | bg-primary-yellow/5  |
| Content 2  | max-w-6xl | bg-foreground/5      |
```

### 7.2 Hardkódované hodnoty
```jsx
// ZLE
{fromTaxis.length > 0 ? `${fromTaxis.length} taxi služieb v Bratislave` : '...'}

// DOBRE
{fromTaxis.length > 0 ? `${fromTaxis.length} taxi služieb v ${route.from.name}` : '...'}
```

### 7.3 Nesémantické farby
```jsx
// ZLE - modrá pre všeobecné info
<div className="bg-blue-100 text-blue-600">
  <Info /> Všeobecný tip
</div>

// DOBRE - brand farba pre info
<div className="bg-primary-yellow/10 text-foreground">
  <Info className="text-primary-yellow" /> Všeobecný tip
</div>

// DOBRE - modrá LEN pre vlak (sémantické)
<div className="bg-blue-100">
  <Train className="text-blue-600" /> Vlakové spojenie
</div>
```

---

## 8. Príklad kompletnej sekcie

```jsx
{/* Konzistentná sekcia podľa design systému */}
<section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-8 bg-primary-yellow/5">
  <div className="container mx-auto max-w-6xl">
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-yellow shrink-0" />
      <span>Nadpis sekcie</span>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card className="p-4 sm:p-5">
        {/* Obsah karty */}
      </Card>
    </div>

    {/* Tip box */}
    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-yellow/10 rounded-lg">
      <p className="text-xs sm:text-sm text-foreground/80">
        <strong>Tip:</strong> Užitočná informácia...
      </p>
    </div>
  </div>
</section>
```

---

## Changelog

| Dátum      | Zmena                                           | Dopad                |
|------------|------------------------------------------------|----------------------|
| 2025-12-01 | Vytvorenie design systému                       | Dokumentácia         |
| 2025-12-01 | Oprava hero gradient blue->yellow               | page.tsx             |
| 2025-12-01 | Zmena coffee ikony blue->amber                  | RouteContentSection  |
| 2025-12-01 | Zmena landmark ikony orange->primary-yellow     | RouteContentSection  |
| 2025-12-01 | **Aplikácia nového dizajnu na všetkých 870 trás** | **page.tsx (-115 LOC)** |
| 2025-12-01 | Odstránený starý hero a samostatná map sekcia   | page.tsx             |
| 2025-12-01 | Oprava duplicitného duration_min v interface    | page.tsx (TS fix)    |
| 2025-12-01 | Aplikácia dizajnu na municipality pages (max-w-6xl) | [...slug]/page.tsx |
| 2025-12-01 | Odstránená duplicitná mapa na municipality pages | [...slug]/page.tsx  |
| 2025-12-01 | Odstránený "Taxi" prefix z H1 obcí (UX fix)     | [...slug]/page.tsx  |
