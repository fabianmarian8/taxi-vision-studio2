# 🚀 Rýchly Návod - Nastavenie Admin Panelu

## Krok 1: Vytvorenie GitHub Personal Access Token

1. Choďte na: https://github.com/settings/tokens
2. Kliknite na "Generate new token" → "Generate new token (classic)"
3. Nastavte:
   - **Note**: `Vercel Admin Panel`
   - **Expiration**: `No expiration` alebo `1 year`
   - **Scopes**: Zaškrtnite `repo` (complete control of private repositories)
4. Kliknite na "Generate token"
5. **DÔLEŽITÉ**: Skopírujte token (začína `ghp_...`) - už ho neuvidíte!

## Krok 2: Nastavenie Environment Variables vo Vercel

### Option A: Cez Vercel Dashboard (Jednoduchšie)

1. Prejdite na: https://vercel.com/marian-fabians-projects/taxi-vision-studio/settings/environment-variables

2. Pridajte prvú premennú:
   - **Name**: `ADMIN_PASSWORD`
   - **Value**: `YourSecurePassword123!` (zvoľte si bezpečné heslo)
   - **Environment**: Zaškrtnite všetky tri (Production, Preview, Development)
   - Kliknite "Save"

3. Pridajte druhú premennú:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Váš GitHub token (začína `ghp_...`)
   - **Environment**: Zaškrtnite všetky tri
   - Kliknite "Save"

### Option B: Cez Vercel CLI (Pre pokročilých)

```bash
# Nainštalujte Vercel CLI (ak ešte nemáte)
npm i -g vercel

# Prihláste sa
vercel login

# Nastavte environment variables
vercel env add ADMIN_PASSWORD
# Zadajte heslo
# Vyberte: Production, Preview, Development

vercel env add GITHUB_TOKEN
# Prilepte GitHub token
# Vyberte: Production, Preview, Development
```

## Krok 3: Redeploy Projektu

1. Prejdite na: https://vercel.com/marian-fabians-projects/taxi-vision-studio
2. Kliknite na najnovší deployment
3. Kliknite na tlačidlo s tromi bodkami (...) → "Redeploy"
4. Potvrďte redeploy

**ALEBO** jednoducho pushne nový commit:
```bash
cd /path/to/taxi-vision-studio
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Krok 4: Prihlásenie do Admin Panelu

1. Otvorte: https://taxi-vision-studio.vercel.app/admin/login
2. Zadajte heslo, ktoré ste nastavili v `ADMIN_PASSWORD`
3. Kliknite "Prihlásiť sa"

## ✅ Hotovo!

Teraz môžete:
- Pridávať taxislužby pre každé mesto
- Editovať kontaktné údaje
- Mazať zastaralé záznamy

Všetky zmeny sa automaticky uložia do GitHub repozitára a prejavia sa okamžite na webe!

## 🔒 Bezpečnostné Tipy

- Nepoužívajte slabé heslo ako `admin123`
- Nikdy nezdieľajte GitHub token
- Token uschovajte v password manageri
- Pravidelne obnovujte token (každých 6-12 mesiacov)

## 🆘 Potrebujete Pomoc?

Ak máte problém, napíšte mi alebo otvorte Issue na GitHube!
