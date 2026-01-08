# 🔧 Environment Variables - Kompletný Setup Guide

## ⚠️ KRITICKÝ PROBLÉM: Chýbajúca konfigurácia

Tvoj scraper padá na runtime, pretože **environment variables nie sú správne nakonfigurované vo Vercel**.

---

## 🎯 Riešenie v 3 krokoch

### Krok 1: Získaj Google Places API kľúč

1. Prejdi na **Google Cloud Console**: https://console.cloud.google.com
2. Vytvor nový projekt (alebo vyber existujúci)
3. **Povoľ Places API**:
   - Navigation menu → APIs & Services → Library
   - Vyhľadaj "**Places API**" → Enable
   - Vyhľadaj "**Places API (New)**" → Enable
4. **Vytvor API kľúč**:
   - APIs & Services → Credentials → Create Credentials → API Key
5. **Nakonfiguruj obmedzenia** (odporúčané):
   ```
   Application restrictions: HTTP referrers
   Website restrictions: 
     - https://taxi-vision-studio.vercel.app/*
     - https://*.vercel.app/*
   
   API restrictions: 
     ✓ Places API
     ✓ Places API (New)
   ```
6. Skopíruj API kľúč (bude vyzerať ako `AIzaSyD...`)

---

### Krok 2: Nastav environment variables vo Vercel

1. Prejdi na: https://vercel.com/marian-fabians-projects/taxi-vision-studio/settings/environment-variables

2. **Pridaj GOOGLE_PLACES_API_KEY**:
   ```
   Name: GOOGLE_PLACES_API_KEY
   Value: tvoj_google_api_key
   Environment: ✓ Production ✓ Preview ✓ Development
   ```
   > ⚠️ **KRITICKÉ**: Musí byť vo **všetkých troch prostrediach**!

3. **Pridaj ostatné premenné** (ak ešte nemáš):
   ```
   Name: GITHUB_TOKEN
   Value: tvoj_github_personal_access_token
   Environment: ✓ Production ✓ Preview ✓ Development
   
   Name: GITHUB_OWNER
   Value: fabianmarian8
   Environment: ✓ Production ✓ Preview ✓ Development
   
   Name: GITHUB_REPO
   Value: taxi-vision-studio
   Environment: ✓ Production ✓ Preview ✓ Development
   
   Name: ADMIN_PASSWORD
   Value: tvoje_silne_heslo
   Environment: ✓ Production ✓ Preview ✓ Development
   ```

---

### Krok 3: Re-deploy projektu

Po pridaní environment variables:

**Option A - Cez Vercel Dashboard:**
1. Prejdi na: https://vercel.com/marian-fabians-projects/taxi-vision-studio
2. Klikni na **Deployments** tab
3. Klikni na najnovší deployment
4. Klikni tri bodky (...) → **Redeploy**

**Option B - Push do GitHubu:**
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

---

## 🔍 Verifikácia

### Test 1: Skontroluj Vercel Logs
```
https://vercel.com/marian-fabians-projects/taxi-vision-studio/logs
```

Hľadaj:
- ✅ `✅ GOOGLE_PLACES_API_KEY je nastavený`
- ❌ `❌ KRITICKÁ CHYBA: GOOGLE_PLACES_API_KEY nie je nastavený!`

### Test 2: Test API endpointu
```bash
curl -X POST https://taxi-vision-studio.vercel.app/api/gbp-scraper \
  -H "Content-Type: application/json" \
  -d '{"city":"Bratislava","limit":5}'
```

**Úspešná odpoveď:**
```json
{
  "success": true,
  "city": "Bratislava",
  "count": 5,
  "results": [...]
}
```

**Chybová odpoveď (chýba API kľúč):**
```json
{
  "error": "Missing GOOGLE_PLACES_API_KEY",
  "instructions": [...]
}
```

---

## 📋 Checklist - Pred testovaním

- [ ] Google Places API je povolené v GCP Console
- [ ] API kľúč je vytvorený
- [ ] API kľúč má správne obmedzenia (HTTP referrers + Places API)
- [ ] `GOOGLE_PLACES_API_KEY` je vo Vercel v **PRODUCTION**
- [ ] `GOOGLE_PLACES_API_KEY` je vo Vercel v **PREVIEW**
- [ ] `GOOGLE_PLACES_API_KEY` je vo Vercel v **DEVELOPMENT**
- [ ] Projekt bol re-deployed po pridaní env vars
- [ ] Vercel logs neobsahujú chybu "GOOGLE_PLACES_API_KEY nie je nastavený"

---

## ❓ FAQ

### Q: Prečo musím nastaviť vo všetkých troch prostrediach?
**A:** Vercel má samostatné environment pre Production (hlavný deployment), Preview (PR a branch deployments) a Development (lokálny development). Ak nastavíš len v Production, Preview a Dev deployments nebudú mať prístup k API kľúču.

### Q: Môžem použiť iný názov premennej?
**A:** Nie! Kód v `api/gbp-scraper.js` očakáva **presne** `GOOGLE_PLACES_API_KEY`. Ak použiješ iný názov (napr. `GOOGLE_API_KEY`), scraper nebude fungovať.

### Q: Koľko stojí Google Places API?
**A:** Google poskytuje **$200 kreditu mesačne ZDARMA**. Pre 12 slovenských miest potrebuješ ~$3.44/mesiac, čo je plne pokryté free tierom.

### Q: Prečo mi scraper stále hlási chybu?
**A:** Najčastejšie príčiny:
1. Zabudol si re-deploy po pridaní env vars
2. Env var je len v jednom prostredí (napr. len Production)
3. Preklep v názve premenné (`GOOGLE_API_KEY` vs `GOOGLE_PLACES_API_KEY`)
4. API kľúč má zlé obmedzenia (referrer restriction blokuje Vercel)
5. Places API nie je povolené v GCP Console

---

## 📞 Ďalšia pomoc

Ak problém pretrváva, skontroluj:
1. **Vercel Logs**: https://vercel.com/marian-fabians-projects/taxi-vision-studio/logs
2. **GCP Console Quotas**: https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas
3. **API Credentials**: https://console.cloud.google.com/apis/credentials

---

**Status po oprave**: 🟢 Scraper by mal fungovať  
**Posledná aktualizácia**: 12.11.2025
