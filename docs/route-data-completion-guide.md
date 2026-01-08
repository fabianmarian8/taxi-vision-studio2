# Sprievodca dokončením dát pre taxi trasy

**Vytvorené:** 2025-12-01
**Účel:** Kompletná dokumentácia pre dopĺňanie dát do route-content-data.ts

---

## 1. Aktuálny stav

### Štatistika
- **Celkový počet trás:** 870 (435 smerov × 2)
- **Počet "Na overenie" hodnôt:** 1420
- **Odhadovaný počet nedokončených trás:** ~350

### Dokončené trasy (vzorové príklady)
✅ `bratislava-rimavska-sobota` (line 3781)
✅ `bratislava-ruzomberok` (line 3820)
✅ `bratislava-senec` (line 3859)

---

## 2. Čo presne chýba

### 2.1 Prepravné údaje - VLAK

**Aktuálny stav (placeholder):**
```typescript
vlak: {
  cena: 'Na overenie',
  cas: 'Na overenie',
  popis: 'Vlakové spojenie na tejto trase je potrebné overiť na stránkach dopravcu (ZSSK).',
}
```

**Potrebné údaje:**
- ✅ `cena` - rozsah ceny v € (napr. "18-25€", "8-12€")
- ✅ `cas` - reálny čas cesty (napr. "4h 7min", "1h 30min")
- ✅ `frekvencia` - ako často idú vlaky (napr. "Každú hodinu", "5× denne", "S prestupom")
- ✅ `popis` - konkrétny popis (napr. "ZSSK: Priame vlaky IC/EC. Rýchle spojenie.")

**Zdroje údajov:**
- 🔗 https://www.rome2rio.com/sk/ - najrýchlejší prehľad
- 🔗 https://www.zssk.sk/ - oficiálny cestovný poriadok
- 🔗 https://cp.sk/vlak/ - vyhľadanie spojení

---

### 2.2 Prepravné údaje - AUTOBUS

**Aktuálny stav (placeholder):**
```typescript
autobus: {
  cena: 'Na overenie',
  cas: 'Na overenie',
  popis: 'Autobusové spojenie na tejto trase je potrebné overiť na stránkach dopravcu.',
}
```

**Potrebné údaje:**
- ✅ `cena` - rozsah ceny v € alebo "od X€" (napr. "od 19€", "12-18€")
- ✅ `cas` - reálny čas cesty (napr. "4h 20min", "2h 15min")
- ✅ `frekvencia` - ako často idú autobusy (napr. "4× denne", "Každé 2 hodiny")
- ✅ `popis` - konkrétny dopravca a typ spojenia (napr. "FlixBus: Priame spoje z AS Mlynské Nivy. Najrýchlejší spôsob.")

**Zdroje údajov:**
- 🔗 https://www.flixbus.sk/ - FlixBus spoje
- 🔗 https://www.regiojet.sk/ - RegioJet spoje
- 🔗 https://www.rome2rio.com/sk/ - prehľad všetkých dopravcov
- 🔗 https://cp.sk/autobus/ - CP autobusový vyhľadávač

---

### 2.3 Atrakcie a zastavenia - coPoCeste

**Aktuálny stav:**
```typescript
coPoCeste: [],  // PRÁZDNE POLE!
```

**Potrebné údaje:**
Pole 3-5 objektov s atrakciami/miestami po ceste:

```typescript
coPoCeste: [
  {
    nazov: 'Názov atrakcie/miesta',
    popis: 'Stručný popis (1-2 vety) čo je zaujímavé. Môže obsahovať historické fakty, UNESCO status, atď.',
    vzdialenost: 'X km' | '0 km',  // 0 km = v cieľovom meste
    odbocka: 'popis kde to je' | 'V meste',
    typ: 'landmark' | 'coffee',  // landmark = pamiatka, coffee = rekreácia
  },
]
```

**Pravidlá pre typ atrakcie:**
- `landmark` (žltá ikona) - hrady, múzeá, historické pamiatky, kostoly, UNESCO
- `coffee` (oranžová ikona) - aquaparky, kúpele, lyžiarske strediská, oddychové zóny

**Zdroje údajov:**
- 🔗 https://www.kamnavylet.sk/ - výlety a atrakcie
- 🔗 https://www.hauzi.sk/ - miesta a atrakcie
- 🔗 Google Maps - vyhľadanie "turistické atrakcie [mesto]"
- 🔗 Wikipedia - historické fakty o meste

**Dôležité:**
- Atrakcie musia byť **REÁLNE** (nie fake údaje!)
- Min. 3, max. 5 položiek
- Ak mesto má UNESCO pamiatku, určite ju zahrnúť
- Prvé 1-2 položky môžu byť po ceste (vzdialenost "45 km", odbocka "7 km odbočka")
- Posledné 2-3 položky sú v cieľovom meste (vzdialenost "0 km", odbocka "V meste")

---

### 2.4 Praktické tipy - tips

**Aktuálny stav:**
Väčšina trás má generické tipy:
```typescript
tips: [
  { nadpis: 'Rezervácia', text: 'Odporúčame si taxi objednať aspoň 24 hodín vopred...' },
  { nadpis: 'Batožina', text: 'Ak cestujete s väčším množstvom batožiny...' },
  { nadpis: 'Zastávky', text: 'Potrebujete sa cestou zastaviť?...' },
  { nadpis: 'Platba', text: 'Akceptujeme hotovosť aj platobné karty...' },
]
```

**Čo vylepšiť (VOLITEĽNÉ):**
- Pridať tip špecifický pre danú trasu/mesto
- Napr. pre horské mestá: tip o zimných podmienkach
- Napr. pre turistické mestá: tip o parkovaní/doprave v centre
- Napr. pre hraničné mestá: tip o dokladoch

**Poznámka:** Tipy sú OK ponechať generické, nie sú priorita.

---

## 3. Workflow pre jednu trasu

### Krok 1: Otvorenie trasy
```bash
# Nájsť trasu v súbore
grep -n "slug: 'bratislava-MESTO'" /src/data/route-content-data.ts
```

### Krok 2: Vyhľadanie prepravných údajov

**A) Rome2Rio (najrýchlejšie)**
```
URL formát: https://www.rome2rio.com/sk/s/Bratislava/[MESTO]
Príklad: https://www.rome2rio.com/sk/s/Bratislava/Spišská-Nová-Ves

Poskytuje:
- Čas cesty vlaku
- Cena vlaku (€)
- Čas cesty autobusu
- Cena autobusu (€)
- Frekvencia spojení
```

**B) ZSSK (detailnejšie pre vlaky)**
```
URL: https://www.zssk.sk/ → Vyhľadávač spojení
Poskytuje:
- Presný čas odchodov
- Typy vlakov (IC, EC, Os)
- Prestupy
```

**C) FlixBus (pre autobusy)**
```
URL: https://www.flixbus.sk/
Poskytuje:
- Priame spoje
- Ceny od X€
- Počet spojení denne
```

### Krok 3: Vyhľadanie atrakcií

**Stratégia:**
1. Google: "turistické atrakcie [MESTO]"
2. kamnavylet.sk: vyhľadať mesto
3. Wikipedia: "[MESTO]" - historické fakty
4. Google Maps: "things to do in [MESTO]"

**Zozbierať:**
- 3-5 atrakcií (pamiatky, múzeá, príroda, rekreácia)
- Pre každú: názov, krátky popis (1-2 vety), vzdialenosť, typ

### Krok 4: Vyplnenie dát do TypeScript objektu

```typescript
'bratislava-MESTO': {
  slug: 'bratislava-MESTO',
  intro: '...', // už vyplnené
  vlak: {
    cena: '18-25€',           // Z Rome2Rio/ZSSK
    cas: '4h 7min',           // Z Rome2Rio/ZSSK
    frekvencia: 'Každú hodinu', // Z Rome2Rio/ZSSK
    popis: 'ZSSK: Priame vlaky IC/EC. Pohodlné sedadlá, občerstvenie na palube.',
  },
  autobus: {
    cena: 'od 19€',          // Z FlixBus/RegioJet
    cas: '4h 20min',         // Z FlixBus/RegioJet
    frekvencia: '4× denne',  // Z FlixBus/RegioJet
    popis: 'FlixBus: Priame spoje z AS Mlynské Nivy. WiFi a USB nabíjanie.',
  },
  taxiVyhody: [...], // už vyplnené
  coPoCeste: [
    {
      nazov: 'Hrad XY',
      popis: 'Gotický hrad z 13. storočia. Jedna z najkrajších zrúcanín na Slovensku.',
      vzdialenost: '45 km',
      odbocka: '7 km odbočka vpravo',
      typ: 'landmark',
    },
    {
      nazov: 'Aquapark MESTO',
      popis: 'Moderný aquapark s 8 bazénmi a tobogánmi. Otvorené celoročne.',
      vzdialenost: '0 km',
      odbocka: 'V meste',
      typ: 'coffee',
    },
    // ... ďalšie 1-3 atrakcie
  ],
  tips: [...], // OK ponechať generické
}
```

---

## 4. Príklady hotových trás

### Vzor 1: bratislava-rimavska-sobota

**Kontext:** Okresné mesto v Gemeri, historické múzeum

```typescript
'bratislava-rimavska-sobota': {
  slug: 'bratislava-rimavska-sobota',
  intro: 'Rimavská Sobota je bránou do Gemera s 5. najstarším múzeom na Slovensku (1882)...',
  vlak: {
    cena: '13-24€',
    cas: '8h 17min',
    frekvencia: 'S prestupom',
    popis: 'ZSSK: Prestup cez Zvolen osobná stanica a Jesenské. Dlhá cesta.',
  },
  autobus: {
    cena: 'od 19€',
    cas: '4h 20min',
    frekvencia: '4× denne',
    popis: 'FlixBus: Priame spoje z AS Mlynské Nivy. Najrýchlejší spôsob.',
  },
  coPoCeste: [
    {
      nazov: 'Gemersko-malohontské múzeum',
      popis: '5. najstaršie múzeum na Slovensku (1882). Egyptská múmia ženy zo sarkofágom (1087-664 pred Kr.).',
      vzdialenost: '0 km',
      odbocka: 'V meste',
      typ: 'landmark',
    },
    {
      nazov: 'Zámok Radvány',
      popis: 'Renesančný kaštieľ s anglickým parkom. Dnes sídlo Gemersko-malohontského múzea.',
      vzdialenost: '0 km',
      odbocka: 'V meste',
      typ: 'landmark',
    },
    {
      nazov: 'Kúpele Sliač',
      popis: 'Najstaršie kúpele na Slovensku (1244). Liečba srdcových a cievnych ochorení.',
      vzdialenost: '78 km',
      odbocka: 'Cestou cez Zvolen',
      typ: 'coffee',
    },
    {
      nazov: 'Kostol reformovanej cirkvi',
      popis: 'Najväčší reformovaný kostol na Slovensku. Postavený v rokoch 1902-1907 v historizujúcom štýle.',
      vzdialenost: '0 km',
      odbocka: 'V meste',
      typ: 'landmark',
    },
  ],
  tips: [...] // generické
}
```

**Kľúčové vlastnosti:**
- Historický kontext (5. najstaršie múzeum, egyptská múmia)
- Mix landmark (múzeum, zámok, kostol) + coffee (kúpele)
- Reálne údaje z FlixBus a ZSSK

---

### Vzor 2: bratislava-ruzomberok

**Kontext:** Mesto pod Tatrami, blízko Vlkolínca (UNESCO)

```typescript
'bratislava-ruzomberok': {
  slug: 'bratislava-ruzomberok',
  intro: 'Ružomberok je malebné mesto v Liptove, ideálne východisko do Nízkych Tatier...',
  vlak: {
    cena: '8-12€',
    cas: '3h 18min',
    frekvencia: 'Každú hodinu',
    popis: 'ZSSK: Priame vlaky IC. Pohodlná cesta s výhľadmi na Tatry.',
  },
  autobus: {
    cena: 'od 8€',
    cas: '3h 0min',
    frekvencia: '8× denne',
    popis: 'FlixBus a RegioJet: Pravidelné spoje z AS Mlynské Nivy.',
  },
  coPoCeste: [
    {
      nazov: 'Vlkolínec (UNESCO)',
      popis: 'Kompletne zachovalá ľudová architektúra. UNESCO svetové dedičstvo od 1993.',
      vzdialenost: '13 km',
      odbocka: 'Vlkolínec, obec Ružomberok',
      typ: 'landmark',
    },
    {
      nazov: 'Malino Brdo',
      popis: 'Najväčšie lyžiarske stredisko v Ružomberku. V lete bike park a bob dráha.',
      vzdialenost: '8 km',
      odbocka: 'Smer Podsuchá',
      typ: 'coffee',
    },
    {
      nazov: 'Liptovské múzeum',
      popis: 'História Liptova od praveku po súčasnosť. Expozícia o Andrejovi Hlinkovi.',
      vzdialenost: '0 km',
      odbocka: 'V meste',
      typ: 'landmark',
    },
    {
      nazov: 'Likavský hrad',
      popis: 'Zrúcanina hradu z 13. storočia na skalnom vrchu. Nádherný výhľad na Liptov.',
      vzdialenost: '5 km',
      odbocka: 'Obec Likavka',
      typ: 'landmark',
    },
  ],
  tips: [...] // generické
}
```

**Kľúčové vlastnosti:**
- UNESCO dedičstvo Vlkolínec - priorita!
- Mix zimné/letné aktivity (Malino Brdo)
- Lokálne historické pamiatky

---

### Vzor 3: bratislava-senec

**Kontext:** Blízke mesto, Slnečné jazerá

```typescript
'bratislava-senec': {
  slug: 'bratislava-senec',
  intro: 'Senec je známy najmä Slnečnými jazerami - ideálne miesto na relax...',
  vlak: {
    cena: '1.70-4€',
    cas: '22-35min',
    frekvencia: 'Každých 30-60 minút',
    popis: 'ZSSK: Pravidelné osobné vlaky z Bratislavy hl. st. aj Bratislavy Petržalka.',
  },
  autobus: {
    cena: 'od 2€',
    cas: '25-40min',
    frekvencia: 'Každých 15-30 minút',
    popis: 'IDS BK: Linky 101, 106 z AS Mlynské Nivy. Slovak Lines taktiež ponúka spoje.',
  },
  coPoCeste: [
    {
      nazov: 'Slnečné jazerá - Senec',
      popis: 'Obľúbené kúpalisko s pieskovými plážami. Aquapark, vodné športy, reštaurácie.',
      vzdialenost: '2 km',
      odbocka: 'Severozápadne od centra Senca',
      typ: 'coffee',
    },
    {
      nazov: 'Aquapark Senec',
      popis: 'Moderný aquapark priamo pri Slnečných jazerách. 7 bazénov, 10 tobogánov, wellness.',
      vzdialenost: '2 km',
      odbocka: 'Pri Slnečných jazerách',
      typ: 'coffee',
    },
    {
      nazov: 'Turecký dom',
      popis: 'Historická budova z tureckých vojen. Múzeum s expozíciou o tureckej okupácii.',
      vzdialenost: '0 km',
      odbocka: 'V centre Senca',
      typ: 'landmark',
    },
  ],
  tips: [...] // generické
}
```

**Kľúčové vlastnosti:**
- Krátka trasa = lacné a časté spojenia
- Dôraz na rekreáciu (jazerá, aquapark)
- Menej historických pamiatok, viac oddych

---

## 5. Chýbajúce odkazy a integrácie

### 5.1 Google Maps integrácie

**Kde chýba:**
- ❌ Priame odkazy na Google Maps navigáciu pre konkrétnu trasu
- ❌ Embedded Google Maps s vyznačenou trasou
- ❌ Odkazy na konkrétne atrakcie v Google Maps

**Návrh implementácie:**
```typescript
// Pridať do RouteContentData interface
interface CoPoCesteItem {
  nazov: string;
  popis: string;
  vzdialenost: string;
  odbocka: string;
  typ: 'landmark' | 'coffee';
  googleMapsUrl?: string;  // NOVÉ POLE
  googleMapsPlaceId?: string; // NOVÉ POLE pre presné miesto
}
```

**Príklad:**
```typescript
{
  nazov: 'Vlkolínec (UNESCO)',
  popis: '...',
  vzdialenost: '13 km',
  odbocka: 'Vlkolínec, obec Ružomberok',
  typ: 'landmark',
  googleMapsUrl: 'https://goo.gl/maps/XYZ123',
  googleMapsPlaceId: 'ChIJ...',
}
```

---

### 5.2 Oficiálne web stránky dopravcov

**Kde chýba:**
- ❌ Priame linky na ZSSK vyhľadávač pre konkrétnu trasu
- ❌ Priame linky na FlixBus/RegioJet pre konkrétnu trasu
- ❌ Deeplinky na mobilné aplikácie

**Návrh implementácie:**
```typescript
vlak: {
  cena: '8-12€',
  cas: '3h 18min',
  frekvencia: 'Každú hodinu',
  popis: 'ZSSK: Priame vlaky IC...',
  // NOVÉ POLIA:
  zssk Url: 'https://www.zssk.sk/...',  // priamy link na vyhľadávanie
  cp Url: 'https://cp.sk/vlak/...',     // CP cestovný poriadok
},
autobus: {
  cena: 'od 8€',
  cas: '3h 0min',
  frekvencia: '8× denne',
  popis: 'FlixBus a RegioJet...',
  // NOVÉ POLIA:
  flixbusUrl: 'https://www.flixbus.sk/...',
  regiojetUrl: 'https://www.regiojet.sk/...',
}
```

---

### 5.3 Externé zdroje pre atrakcie

**Kde chýba:**
- ❌ Odkazy na oficiálne web stránky atrakcií
- ❌ Odkazy na kamnavylet.sk/hauzi.sk recenzie
- ❌ Otváracie hodiny a vstupné

**Návrh implementácie:**
```typescript
{
  nazov: 'Gemersko-malohontské múzeum',
  popis: '5. najstaršie múzeum na Slovensku...',
  vzdialenost: '0 km',
  odbocka: 'V meste',
  typ: 'landmark',
  // NOVÉ POLIA:
  officialUrl: 'https://www.gmm-rs.sk/',
  otvHodiny: 'Ut-Ne 9:00-17:00',
  vstupne: '4€ dospelí, 2€ deti',
  kamnavyletUrl: 'https://www.kamnavylet.sk/...',
}
```

---

### 5.4 Booking/rezervačné systémy

**Kde chýba:**
- ❌ Integrácia s booking.com pre hotely v cieľovom meste
- ❌ Odkazy na rezerváciu stravy/reštaurácií
- ❌ Predpredaj vstupeniek na atrakcie

**Poznámka:** Toto je nízka priorita, môže byť pridané neskôr.

---

## 6. Presnejšie údaje k vlakom/autobusom

### 6.1 Čo momentálne chýba

**Vlaky:**
- ❌ Typ vlaku (IC, EC, Os, R)
- ❌ Číslo vlaku
- ❌ Presný čas odchodu/príchodu (teraz len trvanie)
- ❌ Konkrétne stanice (hl. st. vs Petržalka, atď)
- ❌ Vybavenie (wifi, zásuvky, reštaurácia)

**Autobusy:**
- ❌ Konkrétny dopravca (teraz len "FlixBus" všeobecne)
- ❌ Číslo linky
- ❌ Stanica odchodu/príchodu
- ❌ Vybavenie (wifi, USB, WC)
- ❌ Kvalita (luxusný vs štandard)

---

### 6.2 Rozšírený dátový model (NÁVRH)

```typescript
interface TransportOption {
  // EXISTUJÚCE:
  cena: string;
  cas: string;
  frekvencia?: string;
  popis: string;

  // NOVÉ (voliteľné):
  dopravca?: string;        // "ZSSK", "FlixBus", "RegioJet"
  typSpoja?: string;        // "IC 504", "Eurocity", "Expressbus"
  stanicaOdchod?: string;   // "Bratislava hl. st."
  stanciaPrichod?: string;  // "Spišská Nová Ves"
  casOdchod?: string;       // "08:15"
  casPrichod?: string;      // "12:22"
  vybavenie?: string[];     // ["WiFi", "Zásuvky", "WC", "Reštaurácia"]
  rezUrl?: string;          // Link na rezerváciu

  // SEO a rich snippets:
  schemaOrgType?: 'Train' | 'Bus' | 'BusTrip' | 'TrainTrip';
}
```

**Príklad vyplnenia:**
```typescript
vlak: {
  // Základné (povinné):
  cena: '8-12€',
  cas: '3h 18min',
  frekvencia: 'Každú hodinu',
  popis: 'ZSSK: Priame vlaky IC. Pohodlná cesta s výhľadmi na Tatry.',

  // Rozšírené (voliteľné):
  dopravca: 'ZSSK',
  typSpoja: 'IC 504 Liptov',
  stanicaOdchod: 'Bratislava hlavná stanica',
  staniciaPrichod: 'Ružomberok',
  casOdchod: '08:15',
  casPrichod: '11:33',
  vybavenie: ['WiFi', 'Zásuvky', 'Reštaurácia', 'Klimatizácia'],
  zssk Url: 'https://www.zssk.sk/spojenie/?from=Bratislava&to=Ružomberok',
  schemaOrgType: 'TrainTrip',
}
```

---

### 6.3 Ako získať presné údaje

**ZSSK vlaky:**
1. Ísť na https://www.zssk.sk/
2. Zadať trasu Bratislava → cieľové mesto
3. Vybrať reprezentatívny spoj (napr. ráno 8:00)
4. Zaznamenať:
   - Číslo vlaku (IC 504)
   - Presný čas (08:15 - 11:33)
   - Dĺžka (3h 18min)
   - Prestupy (ak sú)
   - Cena (všetky tarify)

**FlixBus/RegioJet:**
1. Ísť na https://www.flixbus.sk/ alebo https://www.regiojet.sk/
2. Zadať trasu a dátum (napr. najbližší piatok)
3. Vybrať reprezentatívny spoj
4. Zaznamenať:
   - Dopravca
   - Čas odchodu/príchodu
   - Cena (od X€)
   - Počet prestupov
   - Vybavenie (wifi, USB, WC, atď)

**Tip:** Použiť rome2rio.com pre rýchly prehľad, potom overiť detaily na oficiálnych stránkach.

---

## 7. Pravidlá a best practices

### 7.1 STRIKTNÉ PRAVIDLÁ (MUST)

1. **Žiadne fake údaje**
   - Všetky ceny, časy, atrakcie musia byť REÁLNE
   - Radšej nechať "Na overenie" ako vymyslieť
   - Platí od 2024-11-30 podľa CLAUDE.md

2. **Žiadne hardkódované názvy miest v texte**
   ```typescript
   // ZLE:
   popis: 'FlixBus: Priame spoje z Bratislavy do Košíc.'

   // DOBRE (použiť dynamicky):
   popis: 'FlixBus: Priame spoje z AS Mlynské Nivy.'
   ```

3. **Konzistentné formátovanie**
   - Cena: "8-12€" alebo "od 8€" (medzera pred €)
   - Čas: "3h 18min" (h a min bez medzier)
   - Frekvencia: "Každú hodinu" / "5× denne" (× nie x)

### 7.2 Odporúčania (SHOULD)

1. **Priorita UNESCO**
   - Ak mesto/región má UNESCO pamiatku, MUSÍ byť v coPoCeste
   - Dať ju ako prvú alebo druhú položku

2. **Balance landmark vs coffee**
   - Ideálne: 60% landmark, 40% coffee
   - Min. 1 coffee položka (rekreácia/oddych)

3. **Historický kontext**
   - Pridať zaujímavý historický fakt ak je dostupný
   - Napr. "najstaršie múzeum", "gotický z 13. storočia"

4. **Aktuálne informácie**
   - Ceny vlaku/autobusu overiť z roku 2024/2025
   - Otváracie hodiny/sezónnosť atrakcií

### 7.3 Tip pre efektivitu

**Pre jednu trasu (10-15 min práce):**
1. Rome2Rio: 2 min (cena, čas vlak+bus)
2. Google: 3 min (atrakcie)
3. Wikipedia: 2 min (historické fakty)
4. Vyplnenie: 3 min (kód)
5. Kontrola: 1 min

**Batch processing:**
- Spracovať 5-10 trás naraz pre rovnaký región
- Reuse atrakcií z okolia (napr. Vlkolínec pre všetky Liptovské mestá)

---

## 8. Kontrolný checklist

Pred označením trasy ako "hotová" skontrolujte:

### Preprava
- [ ] Vlak: cena v € (nie "Na overenie")
- [ ] Vlak: čas vo formáte "Xh Ymin"
- [ ] Vlak: frekvencia (Každú hodinu / X× denne / S prestupom)
- [ ] Vlak: popis obsahuje dopravcu (ZSSK)
- [ ] Autobus: cena v € (nie "Na overenie")
- [ ] Autobus: čas vo formáte "Xh Ymin"
- [ ] Autobus: frekvencia
- [ ] Autobus: popis obsahuje dopravcu (FlixBus/RegioJet/IDS)

### Atrakcie
- [ ] coPoCeste: min. 3 položky, max. 5
- [ ] Každá atrakcia má: nazov, popis, vzdialenost, odbocka, typ
- [ ] Typ je 'landmark' alebo 'coffee' (nie niečo iné)
- [ ] Popis je konkrétny (nie generický)
- [ ] Ak mesto má UNESCO → je v zozname
- [ ] Žiadne fake atrakcie

### Formát
- [ ] Všetky medzery pred € symbolo m
- [ ] Čas: "3h 18min" (nie "3 h 18 min")
- [ ] Frekvencia: "5× denne" (× nie x)
- [ ] TypeScript syntax je správna (čiarky, zátvorky)

---

## 9. Nástroje a pomocné príkazy

### Bash príkazy

**Nájsť všetky trasy s "Na overenie":**
```bash
grep -n "'Na overenie'" /src/data/route-content-data.ts | wc -l
```

**Nájsť konkrétnu trasu:**
```bash
grep -n "slug: 'bratislava-MESTO'" /src/data/route-content-data.ts
```

**Nájsť trasy s prázdnym coPoCeste:**
```bash
grep -B2 "coPoCeste: \[\]" /src/data/route-content-data.ts
```

**Nájsť ďalšiu nedokončenú bratislavskú trasu:**
```bash
grep -A10 "slug: 'bratislava-" /src/data/route-content-data.ts | grep -B10 "'Na overenie'" | head -15
```

### Web nástroje

**Rome2Rio URL generátor:**
```
https://www.rome2rio.com/sk/s/[ODKIAL]/[DOKIAL]

Príklady:
https://www.rome2rio.com/sk/s/Bratislava/Košice
https://www.rome2rio.com/sk/s/Bratislava/Spišská-Nová-Ves
```

**Google Maps query:**
```
turistické atrakcie [mesto]
pamiatky [mesto]
múzeá [mesto]
[mesto] things to do
[mesto] attractions
```

---

## 10. Priority pre agenta

### Vysoká priorita (MUSÍ byť hotové)
1. ✅ Vlak: cena, čas, frekvencia, popis
2. ✅ Autobus: cena, čas, frekvencia, popis
3. ✅ coPoCeste: min. 3 reálne atrakcie

### Stredná priorita (MALO BY byť)
4. ⚠️ coPoCeste: 4-5 atrakcií namiesto 3
5. ⚠️ Tips: špecifický tip pre danú trasu
6. ⚠️ Intro: vylepšiť text (ak je generický)

### Nízka priorita (MÔŽE byť pridané neskôr)
7. ⏸️ Google Maps linky pre atrakcie
8. ⏸️ Oficiálne web stránky atrakcií
9. ⏸️ Vybavenie v dopravných prostriedkoch

---

## 11. Časový odhad

**Pre jedného agenta:**
- 1 trasa = 10-15 min
- 10 trás = 2-3 hodiny
- 100 trás = 20-30 hodín
- **350 trás = 60-90 hodín práce**

**Odporúčanie:**
- Rozdeliť medzi viacerých agentov
- Alebo spracovať v dávkach po 10-20 trás denne
- Prioritu dať trasám z veľkých miest (Košice, Žilina, Prešov, atď)

---

## 12. Kontakt a otázky

Pri nejasnostiach:
1. Pozrieť vzorové trasy (sekcia 4)
2. Skontrolovať design-system.md pre pravidlá dizajnu
3. Opýtať sa používateľa na Discord/Slack

**Happy coding!** 🚕✨
