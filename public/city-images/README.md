# City Hero Images

Tento adresár obsahuje hero obrázky pre jednotlivé mestá, ktoré sa zobrazujú ako pozadie nadpisu na stránke mesta.

## Ako pridať obrázok

1. **Nájdite voľne šíriteľnú fotku** námestia alebo panorámy mesta:
   - **Wikimedia Commons**: https://commons.wikimedia.org/
   - **Pixabay**: https://pixabay.com/
   - **Unsplash**: https://unsplash.com/
   - **Pexels**: https://pexels.com/

2. **Stiahnite obrázok** v dobrej kvalite (odporúčaná šírka: minimálne 1920px)

3. **Optimalizujte obrázok**:
   - Konvertujte do WebP formátu (pre menšiu veľkosť)
   - Skomprimujte (cca 200-500 KB)
   - Nástroje: https://squoosh.app/

4. **Pomenujte súbor** podľa slug názvu mesta:
   - Príklad: `banska-bystrica-snp-square.jpg`
   - Alebo: `banska-bystrica-snp-square.webp`

5. **Uložte súbor** do tohto adresára (`public/city-images/`)

6. **Pridajte do cities.json**:
   ```json
   {
     "name": "Banská Bystrica",
     ...
     "heroImage": "/city-images/banska-bystrica-snp-square.jpg"
   }
   ```

## Príklad pre Banskú Bystricu

Pre Banskú Bystricu môžete použiť fotku námestia SNP:
- Wikimedia Commons: https://commons.wikimedia.org/wiki/Category:Námestie_SNP_(Banská_Bystrica)
- Vyberte pekný wide-angle shot námestia
- Stiahnite a optimalizujte
- Uložte ako `banska-bystrica-snp-square.jpg`

## Technické detaily

- **Odporúčaná veľkosť**: 1920x1080px alebo vyššie
- **Formát**: JPG alebo WebP
- **Veľkosť súboru**: 200-500 KB (po optimalizácii)
- **Licensing**: Len voľne šíriteľné obrázky (CC0, Public Domain, CC-BY)
