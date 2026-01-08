# Taxi Scraper API - Deployment Summary

## ✅ Úspešne nasadené

**Dátum**: 11. november 2025  
**Production URL**: https://taxi-vision-studio.vercel.app  
**Scraper Tool URL**: https://taxi-vision-studio.vercel.app/scraper

## 🎯 Čo bolo implementované

### 1. Backend API (Serverless Function)
**Súbor**: `api/taxi-scraper.js`

**Funkčnosť**:
- Automatické vyhľadávanie taxislužieb cez Google Search
- Web scraping s použitím Cheerio
- Extrakcia kontaktných údajov (názov, web, telefón)
- Validácia slovenských telefónnych čísel
- Health check pre overenie funkčných webstránok
- Filtrovanie duplicitných výsledkov
- Paralelné spracovanie (po 3 URL naraz)
- CORS podpora pre API calls

**API Endpoint**: `/api/taxi-scraper`  
**Metóda**: POST  
**Timeout**: 30 sekúnd

**Request Body**:
```json
{
  "city": "Bratislava",
  "limit": 10
}
```

**Response**:
```json
{
  "success": true,
  "city": "Bratislava",
  "count": 10,
  "results": [
    {
      "name": "Taxi XYZ",
      "url": "https://taxixyz.sk",
      "phone": "+421901234567"
    }
  ]
}
```

### 2. Frontend Komponent
**Súbor**: `src/components/TaxiScraperTool.tsx`

**Funkcie**:
- ✅ Výber slovenského mesta (dropdown)
- ✅ Nastavenie počtu výsledkov (1-20)
- ✅ Vyhľadávanie s progress indikátorom
- ✅ Zobrazenie výsledkov v tabuľke
- ✅ Export do CSV súboru
- ✅ Klikateľné telefónne čísla a webové stránky
- ✅ Toast notifikácie (úspech/chyba)
- ✅ Responzívny dizajn
- ✅ Loading states

**Route**: `/scraper`

### 3. Vercel Konfigurácia
**Súbor**: `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/taxi-scraper.js": {
      "maxDuration": 30
    }
  }
}
```

### 4. Dependencies
Pridané do `package.json`:
- `axios` (^1.7.9) - HTTP klient pre web scraping
- `cheerio` (^1.0.0) - HTML parsing a manipulácia

## 🚀 Deployment Info

**Platforma**: Vercel  
**Framework**: Vite + React + TypeScript  
**Team**: marian-fabians-projects  
**Project ID**: prj_YJQRBTYlK4WrH7x6YjywmTIX3aGH

**Production Domains**:
- https://taxi-vision-studio.vercel.app (primárna)
- https://taxi-vision-studio-marian-fabians-projects.vercel.app
- https://taxi-vision-studio-fabianmarian8-marian-fabians-projects.vercel.app

## 📊 Technické špecifikácie

### API Performance
- **Timeout**: 30 sekúnd max
- **Batch Size**: 3 URL paralelne
- **Rate Limiting**: Žiadne (zatiaľ)
- **Max Results**: 20 per request

### Supported Cities
- Bratislava
- Košice
- Prešov
- Žilina
- Banská Bystrica
- Nitra
- Trnava
- Martin
- Trenčín
- Poprad
- Prievidza
- Zvolen

### Phone Number Format
- Automatická normalizácia na `+421` formát
- Podporované formáty vstupu:
  - `0901234567`
  - `00421901234567`
  - `+421 901 234 567`
  - `0901 234 567`

## 🔧 Ako používať

### 1. Web rozhranie
1. Prejdi na https://taxi-vision-studio.vercel.app/scraper
2. Vyber mesto z dropdownu
3. (Voliteľné) Nastav počet výsledkov
4. Klikni "Vyhľadať"
5. Počkaj na výsledky (10-30 sekúnd)
6. Exportuj do CSV ak potrebuješ

### 2. API priamo
```bash
curl -X POST https://taxi-vision-studio.vercel.app/api/taxi-scraper \
  -H "Content-Type: application/json" \
  -d '{"city":"Bratislava","limit":10}'
```

## 📝 Git Commits

1. **48b3689**: "Add taxi scraper API and frontend tool with Vercel configuration"
   - Vytvorené API endpoint
   - Vytvorený frontend komponent
   - Pridaná Vercel konfigurácia

2. **d06af92**: "Update gitignore for Vercel deployment"
   - Aktualizovaný .gitignore pre Vercel súbory

## 🎨 UI Features

- **Moderný dizajn**: Používa shadcn/ui komponenty
- **3D efekty**: Konzistentné s hlavným dizajnom stránky
- **Responzívne**: Funguje na mobile, tablet, desktop
- **Accessibility**: ARIA labels, keyboard navigation
- **Dark mode ready**: Podporuje theme switching

## ⚠️ Limitations

1. **Google Rate Limiting**: Pri veľkom počte requestov môže Google zablokovať IP
2. **Scraping reliability**: Niektoré stránky môžu blokovať boty
3. **Phone extraction**: Funguje len ak je telefón viditeľný v HTML
4. **Vercel timeout**: Max 30 sekúnd na serverless function

## 🔮 Budúce vylepšenia

- [ ] Caching výsledkov (Redis/Vercel KV)
- [ ] Rate limiting protection
- [ ] User-agent rotation
- [ ] Proxy support pre scraping
- [ ] Email extrakcia
- [ ] Hodnotenie/recenzie taxislužieb
- [ ] Mapa s lokáciami
- [ ] API key authentication
- [ ] Analytics & tracking

## 📞 Support

Ak máš otázky alebo problémy:
1. Check Vercel deployment logs: https://vercel.com/marian-fabians-projects/taxi-vision-studio
2. GitHub Issues: https://github.com/fabianmarian8/taxi-vision-studio/issues
3. Email: fabianmarian8@gmail.com

## ✅ Checklist dokončenia

- [x] API implementované
- [x] Frontend komponent vytvorený
- [x] Vercel konfigurácia
- [x] Dependencies nainštalované
- [x] Git commit & push
- [x] Vercel deployment
- [x] Production testing
- [x] Dokumentácia

---

**Status**: ✅ LIVE & FUNCTIONAL  
**Last Updated**: 11.11.2025 12:30 CET
