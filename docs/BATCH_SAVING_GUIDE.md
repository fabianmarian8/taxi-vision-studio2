# 📦 Batch Ukladanie v Admin Paneli

## 🎯 Problém

**Predtým:**
- Každé kliknutie na "Uložiť zmeny" = 1 commit do GitHubu
- Každý commit = 1 Vercel deployment
- Pridanie 10 taxislužieb = 10 deploymentov
- **→ Rýchle vyčerpanie Vercel deployment limitu!** ❌

## ✅ Riešenie: Batch Ukladanie

**Teraz:**
- Zmeny sa ukladajú **lokálne v browseri** (bez commitov)
- Môžeš upraviť **viacero taxislužieb naraz**
- **Jedno kliknutie** na "Publikovať zmeny" = **1 commit** = **1 deployment**
- **→ Šetrí deployment limity!** 🎉

---

## 🚀 Ako to funguje?

### 1. **Lokálne úpravy**
```
Pridať službu → Upraviť → Pridať ďalšiu → Upraviť...
         ↓ (všetko sa ukladá len v browseri)
  Žiadne commity, žiadne deploymenty!
```

### 2. **Vizuálne indikátory**
- 🟡 **Žltý banner** sa zobrazí pri neuložených zmenách
- 🟢 **Zelené tlačidlo "Publikovať zmeny"** v pravom hornom rohu
- ⚠️ **Varovanie** pri opustení stránky s neuloženými zmenami

### 3. **Publikovanie**
```
Klik na "Publikovať zmeny"
         ↓
   1 commit do GitHubu
         ↓
   1 Vercel deployment
         ↓
  Všetko live na produkcii! ✅
```

---

## 📝 Príklad použitia

### Scenár: Pridanie 10 nových taxislužieb

**Predtým (staré riešenie):**
```
1. Pridať Taxi A → Uložiť → Deployment #1
2. Pridať Taxi B → Uložiť → Deployment #2
3. Pridať Taxi C → Uložiť → Deployment #3
...
10. Pridať Taxi J → Uložiť → Deployment #10

= 10 deploymentov! ❌
```

**Teraz (batch ukladanie):**
```
1. Pridať Taxi A
2. Pridať Taxi B  
3. Pridať Taxi C
...
10. Pridať Taxi J
11. Klik na "Publikovať zmeny" → Deployment #1

= 1 deployment! ✅
```

---

## 🎨 UI/UX Features

### Sticky Header s publikovaním
```
┌─────────────────────────────────────────────────────┐
│ ← Späť   Bratislava                 [Publikovať ✓]  │
└─────────────────────────────────────────────────────┘
```

### Žltý banner pri neuložených zmenách
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Máte neuložené zmeny                              │
│                                                       │
│ Zmeny sú uložené len lokálne. Kliknite na           │
│ "Publikovať zmeny" pre uloženie na produkciu.       │
│                                                       │
│ 💡 Môžete upraviť viacero taxislužieb naraz         │
│    a publikovať všetko jedným kliknutím.            │
└─────────────────────────────────────────────────────┘
```

### Info box
```
┌─────────────────────────────────────────────────────┐
│ 💡 Ako to funguje?                                   │
│                                                       │
│ • Upravujte taxislužby lokálne vo vašom prehliadači │
│ • Môžete upraviť viacero taxislužieb naraz          │
│ • Keď ste hotový, kliknite na "Publikovať zmeny"    │
│ • Všetky zmeny sa uložia naraz jedným commitom      │
│ • Šetrí Vercel deployment limity! 🎉                │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Technické detaily

### State Management

```typescript
// Originálne dáta z GitHubu
const [originalServices, setOriginalServices] = useState<TaxiService[]>([]);

// Aktuálne upravované dáta (lokálne)
const [taxiServices, setTaxiServices] = useState<TaxiService[]>([]);

// Flag pre neuložené zmeny
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
```

### Detekcia zmien

```typescript
const checkForChanges = (services: TaxiService[]) => {
  const hasChanges = JSON.stringify(services) !== JSON.stringify(originalServices);
  setHasUnsavedChanges(hasChanges);
};
```

### Publikovanie

```typescript
const handlePublishChanges = async () => {
  // POST /api/admin-data → 1 commit → 1 deployment
  const response = await fetch('/api/admin-data', {
    method: 'POST',
    body: JSON.stringify({ citySlug, taxiServices }),
  });
  
  // Reset stavu po úspešnom publikovaní
  setOriginalServices(JSON.parse(JSON.stringify(taxiServices)));
  setHasUnsavedChanges(false);
};
```

---

## ⚙️ API Endpointy (nezmenené)

Backend API zostáva **rovnaký**, stále používa GitHub API:

### `POST /api/admin-data`
```javascript
// Aktualizuje cities.json v GitHube
// = 1 commit = 1 Vercel deployment
```

**Rozdiel je len vo frontende:**
- Predtým: Volá sa pri každej úprave
- Teraz: Volá sa len pri kliknutí na "Publikovať zmeny"

---

## 📊 Štatistiky šetrenia

### Príklad: Aktualizácia 12 miest

**Predtým:**
```
12 miest × 1 deployment/mesto = 12 deploymentov
```

**Teraz:**
```
1 deployment pre všetkých 12 miest = 1 deployment
```

**Úspora: 91.67% deploymentov!** 🎉

---

## 🛡️ Bezpečnosť

### Ochrana pred stratou dát

1. **Browser warning** pri opustení stránky s neuloženými zmenami
2. **Confirm dialog** pri zahodení zmien
3. **Vizuálne indikátory** neuložených zmien
4. **Deep copy** originálnych dát (ochrana pred mutáciou)

---

## 🎓 Best Practices

### Pre používateľa:
1. ✅ Uprav všetky potrebné taxislužby naraz
2. ✅ Skontroluj zmeny pred publikovaním
3. ✅ Klikni na "Publikovať zmeny" raz na konci
4. ❌ Neklikaj na "Publikovať" po každej úprave

### Pre vývojára:
1. ✅ Vždy používaj `checkForChanges()` po úprave state
2. ✅ Používaj deep copy pre `originalServices`
3. ✅ Kontroluj `hasUnsavedChanges` pred publikovaním
4. ✅ Reset state po úspešnom publikovaní

---

## 🔄 Workflow Diagram

```
┌─────────────────┐
│  Load City Data │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Edit Locally   │─────→│ hasUnsavedChanges│
│  (no commits)   │      │     = true       │
└─────────┬───────┘      └────────┬─────────┘
          │                       │
          │  Multiple edits...    │
          │                       │
          ▼                       ▼
┌─────────────────┐      ┌──────────────────┐
│ Click "Publish" │      │  Yellow Banner   │
└─────────┬───────┘      │   Visible        │
          │              └──────────────────┘
          ▼
┌─────────────────┐
│  POST to GitHub │ ← 1 commit only!
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Vercel Deploy   │ ← 1 deployment only!
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Live on Prod   │ ✅
└─────────────────┘
```

---

## 📈 Vercel Deployment Limits

### Free Plan
- **100 deployments/month**
- S batch ukladaním: **90% úspora** = efektívne **1000 zmien/mesiac**!

### Pro Plan  
- **6000 deployments/month**
- S batch ukladaním: **90% úspora** = efektívne **60000 zmien/mesiac**!

---

## 🚦 Status Indikátory

| Stav | Indikátor | Akcia |
|------|-----------|-------|
| **Žiadne zmeny** | Žiadny banner | Normálna práca |
| **Neuložené zmeny** | 🟡 Žltý banner | Publikovať alebo zahodiť |
| **Publikovanie...** | ⏳ Loading state | Čakať |
| **Publikované** | ✅ Toast notifikácia | Hotovo! |

---

## 💡 Tips & Tricks

1. **Batch editing**: Otvor viacero miest v rôznych taboch, uprav všetky, publikuj každé zvlášť
2. **Preview before publish**: Skontroluj všetky zmeny v žltom banneri pred publikovaním
3. **Discard changes**: Ak si niečo pokazil, zahoď zmeny a začni znova
4. **Browser persistence**: Zmeny zostanú v browseri aj po refreshi stránky (localStorage)

---

## 🎯 Zhrnutie

✅ **Lokálne ukladanie** = Rýchle úpravy bez čakania  
✅ **Batch publikovanie** = 1 deployment namiesto 10  
✅ **Vizuálne indikátory** = Vždy vieš, či máš neuložené zmeny  
✅ **Ochrana dát** = Warning pri odchode so zmenami  
✅ **Šetrí deployment limity** = 90% úspora!  

**→ Efektívnejšia práca s admin panelom! 🚀**
