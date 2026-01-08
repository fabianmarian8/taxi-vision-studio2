# Nastavenie Resend pre emailový formulár

## Čo je Resend?

Resend je profesionálna emailová API služba, ktorú používame pre kontaktný formulár "Niečo tu chýba?" na Taxi NearMe.

**Výhody Resend:**
- ✅ 100 emailov/deň zadarmo (3000/mesiac)
- ✅ Profesionálna doručiteľnosť
- ✅ Jednoduché API
- ✅ Bez potreby verifikácie pre každé nasadenie
- ✅ Podpora vlastných domén

## Kroky pre nastavenie

### 1. Vytvorenie Resend účtu

1. Choď na [resend.com](https://resend.com)
2. Zaregistruj sa (je to zadarmo)
3. Potvrď emailovú adresu

### 2. Získanie API kľúča

1. Po prihlásení choď na [API Keys](https://resend.com/api-keys)
2. Klikni na **"Create API Key"**
3. Pomenuj ho napr. `Taxi NearMe Production`
4. Vyber oprávnenia: **"Sending access"** (default)
5. Klikni **"Create"**
6. **DÔLEŽITÉ:** Skopíruj API kľúč okamžite! Začína `re_...`
7. Ulož ho niekde bezpečne (napr. do password managera)

### 3. Obmedzenia Free Tier (DÔLEŽITÉ!)

**AKTUÁLNY STAV:**
V Free Tier Resend môžeš posielať emaily **iba na vlastnú verifikovanú emailovú adresu** (adresu, s ktorou si vytvoril Resend účet).

**Preto momentálne:**
- Kontaktné formuláre posielajú emaily na `fabianmarian8@gmail.com`
- Toto je dočasné riešenie, kým neverifikujeme doménu

**Ako to funguje:**
1. Resend automaticky verifikuje emailovú adresu, s ktorou si vytvoril účet
2. V našom prípade to je `fabianmarian8@gmail.com`
3. Všetky emaily z formulára prídu na túto adresu
4. V emaili je uvedený `replyTo` s adresou odosielateľa, takže môžeš jednoducho odpovedať

**Ak chceš posielať na info@taxinearme.sk:**
- Musíš verifikovať doménu `taxinearme.sk` (pozri sekciu "Nastavenie vlastnej domény" nižšie)
- Po verifikácii domény môžeš posielať na ľubovoľné adresy na tejto doméne

### 4. Konfigurácia vo Vercel

1. Choď do Vercel Dashboard
2. Vyber projekt `taxi-vision-studio`
3. Choď do **Settings → Environment Variables**
4. Pridaj novú premennú:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_...` (tvoj API kľúč z kroku 2)
   - **Environments:** Zaškrtni všetky:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Klikni **"Save"**

### 5. Opätovné nasadenie (Redeploy)

Po pridaní environment variable je potrebné projekt znova nasadiť:

1. Choď do **Deployments**
2. Klikni na posledný deployment
3. Klikni na tri bodky (⋯) → **"Redeploy"**
4. Potvrď akciou **"Redeploy"**

### 6. Testovanie

1. Choď na [taxinearme.sk](https://taxinearme.sk)
2. Klikni na tlačidlo **"Niečo tu chýba?"**
3. Vyplň formulár:
   - Zadaj svoje meno
   - Zadaj svoj email (tento bude v `replyTo`, aby si mohol odpovedať)
   - Zadaj mesto a názov taxislužby
   - Napíš správu
4. Odošli
5. **Skontroluj email:**
   - **Momentálne:** Email príde na `fabianmarian8@gmail.com`
   - **Po verifikácii domény:** Email príde na `info@taxinearme.sk`
6. Overenie funkčnosti:
   - V emaili by mali byť všetky údaje z formulára
   - `replyTo` hlavička obsahuje email odosielateľa
   - Môžeš kliknúť "Reply" a odpovedať priamo odosielateľovi

## Pokročilé nastavenie (voliteľné)

### Nastavenie vlastnej domény (POVINNÉ pre info@taxinearme.sk)

**DÔLEŽITÉ:** Aby si mohol posielať emaily na `info@taxinearme.sk`, musíš najprv verifikovať doménu `taxinearme.sk` v Resend.

**Kroky:**

1. **Pridaj doménu v Resend:**
   - Choď na [Resend Domains](https://resend.com/domains)
   - Klikni **"Add Domain"**
   - Zadaj `taxinearme.sk`
   - Klikni **"Add"**

2. **Získaj DNS záznamy:**
   - Resend ti poskytne 3 typy DNS záznamov:
     - **SPF** (TXT záznam) - overuje, že máš právo posielať emaily
     - **DKIM** (TXT záznam) - kryptografický podpis emailov
     - **DMARC** (TXT záznam) - politika autentifikácie

3. **Pridaj DNS záznamy:**
   - Choď do DNS nastavení svojej domény (napr. Namecheap, GoDaddy, Cloudflare)
   - Pridaj všetky 3 záznamy presne tak, ako ich Resend poskytol
   - **Príklad pre Cloudflare:**
     ```
     Type: TXT
     Name: @ (alebo taxinearme.sk)
     Value: v=spf1 include:resend.com ~all
     ```

4. **Počkaj na verifikáciu:**
   - DNS zmeny môžu trvať 15 minút až 48 hodín
   - Zvyčajne to trvá 15-30 minút
   - Resend automaticky kontroluje verifikáciu
   - Dostaneš email potvrdenie

5. **Aktualizuj API route:**
   ```typescript
   // V app/api/contact/route.ts zmeň:
   from: 'Taxi NearMe <onboarding@resend.dev>',
   // NA:
   from: 'Taxi NearMe <noreply@taxinearme.sk>',
   ```

6. **Nastav CONTACT_EMAIL vo Vercel:**
   - Choď do Vercel Dashboard → Settings → Environment Variables
   - Pridaj:
     - **Key:** `CONTACT_EMAIL`
     - **Value:** `info@taxinearme.sk`
     - **Environments:** Production, Preview, Development
   - Redeploy projekt

**Po verifikácii domény:**
- ✅ Môžeš posielať na `info@taxinearme.sk` a ľubovoľné iné adresy
- ✅ Emaily budú chodiť z `noreply@taxinearme.sk`
- ✅ Lepšia doručiteľnosť (menšia šanca skončiť v spame)
- ✅ Profesionálnejší vzhľad
- ✅ Možnosť sledovať reputáciu domény

### Monitorovanie emailov

Všetky odoslané emaily môžeš sledovať na:
[https://resend.com/emails](https://resend.com/emails)

Tu uvidíš:
- ✅ Všetky odoslané emaily
- ✅ Stav doručenia (delivered, bounced, etc.)
- ✅ Otvorenia (ak je tracking zapnutý)
- ✅ Kliknutia na linky
- ✅ Logy a error messages

## Debugging

### Email sa neodoslal

1. **Skontroluj Vercel logs:**
   - Choď do Vercel Dashboard → Functions
   - Klikni na `/api/contact`
   - Pozri logy

2. **Skontroluj API kľúč:**
   - Uisti sa, že `RESEND_API_KEY` je nastavený vo Vercel
   - Skontroluj, či začína s `re_`
   - Skús vytvoriť nový API kľúč

3. **Skontroluj limity:**
   - Free tier: 100 emailov/deň
   - Choď na [Resend Dashboard](https://resend.com) a pozri Usage

### Email skončil v spame

1. **Krátkodobé riešenie:**
   - Pridaj `noreply@resend.dev` do kontaktov
   - Označ email ako "Not Spam"

2. **Dlhodobé riešenie:**
   - Nastav vlastnú doménu (pozri vyššie)
   - Nakonfiguruj SPF, DKIM, DMARC záznamy

## Náklady

- **Free tier:** 100 emailov/deň, 3000/mesiac - **$0**
- **Pro tier:** 50,000 emailov/mesiac - **$20/mesiac**

Pre Taxi NearMe je free tier viac než dostačujúci.

## Porovnanie s predchádzajúcim riešením (FormSubmit.co)

| Vlastnosť | FormSubmit.co | Resend |
|-----------|---------------|--------|
| Cena | Zadarmo | Zadarmo (100/deň) |
| Verifikácia | Áno, pri každom nasadení | Raz, potom stačí API kľúč |
| Doručiteľnosť | Nižšia | Vyššia |
| Custom doména | Nie | Áno |
| Monitoring | Nie | Áno |
| API | Nie | Áno |
| Profesionalita | Nízka | Vysoká |

## Podpora

- **Resend dokumentácia:** https://resend.com/docs
- **Resend Discord:** https://resend.com/discord
- **Email podpora:** support@resend.com

## Súvisiace súbory v projekte

- `app/api/contact/route.ts` - API route pre odosielanie emailov
- `src/components/ContactFormModal.tsx` - Kontaktný formulár
- `.env.example` - Príklad konfigurácie
- `next.config.ts` - CSP konfigurácia
