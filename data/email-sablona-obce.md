# Email šablóna pre oslovenie obcí

## Pre Sender.net / Mailchimp / Sendinblue

Tieto nástroje podporujú "merge tags" - premenné ktoré sa nahradia údajmi z CSV.

### Import CSV súboru
Importuj súbor: `obce-mailing-list.csv`

Obsahuje stĺpce:
- `email` - emailová adresa obce
- `nazov_obce` - názov obce (s veľkým písmenom)
- `url_obce` - odkaz na taxinearme.sk

---

## PREDMET EMAILU

```
Taxislužby pre občanov obce {{nazov_obce}} - bezplatná služba pre vašu obec
```

Alternatívy:
- `Bezplatná služba pre občanov {{nazov_obce}} - telefónne čísla na taxi`
- `{{nazov_obce}} - užitočný odkaz pre vašich občanov`

---

## TEXT EMAILU

```
Dobrý deň,

obraciam sa na Vás s ponukou bezplatnej služby pre občanov obce {{nazov_obce}}.

Prevádzkujem webovú stránku TaxiNearMe.sk, ktorá pomáha ľuďom nájsť taxislužbu v ich okolí. Na jednom mieste sú zozbierané kontakty na overené taxislužby z celého Slovenska.


ČO PONÚKAM VAŠEJ OBCI:

Bezplatné pridanie odkazu na Vašu obecnú stránku. Vaši občania tak budú mať jednoduchý prístup k telefónnym číslam taxislužieb vo Vašom okolí.

Stačí pridať odkaz do sekcie "Užitočné odkazy" alebo "Služby pre občanov":

{{url_obce}}


PREČO JE TO UŽITOČNÉ:

• Aj starší občania poznajú obecný web - rýchlo nájdu kontakt na taxi
• Turistov rýchlo nasmeruje na dopravu
• Nie je potrebná žiadna údržba z Vašej strany
• Služba je úplne zadarmo


Ak by ste mali záujem, stačí pridať odkaz na Vašu webstránku. V prípade otázok som Vám k dispozícii.

S pozdravom,
Marián Fabián
TaxiNearMe.sk
info@taxinearme.sk
```

---

## HTML VERZIA (pre lepší vzhľad)

```html
<p>Dobrý deň,</p>

<p>obraciam sa na Vás s ponukou bezplatnej služby pre občanov obce <strong>{{nazov_obce}}</strong>.</p>

<p>Prevádzkujem webovú stránku <a href="https://www.taxinearme.sk">TaxiNearMe.sk</a>, ktorá pomáha ľuďom nájsť taxislužbu v ich okolí. Na jednom mieste sú zozbierané kontakty na overené taxislužby z celého Slovenska.</p>

<h3>ČO PONÚKAM VAŠEJ OBCI:</h3>

<p>Bezplatné pridanie odkazu na Vašu obecnú stránku. Vaši občania tak budú mať jednoduchý prístup k telefónnym číslam taxislužieb vo Vašom okolí.</p>

<p><strong>Stačí pridať odkaz do sekcie "Užitočné odkazy" alebo "Služby pre občanov":</strong></p>

<p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
  <a href="{{url_obce}}" style="color: #0066cc; font-size: 16px;">{{url_obce}}</a>
</p>

<h3>PREČO JE TO UŽITOČNÉ:</h3>

<ul>
  <li>Aj starší občania poznajú obecný web - rýchlo nájdu kontakt na taxi</li>
  <li>Turistov rýchlo nasmeruje na dopravu</li>
  <li>Nie je potrebná žiadna údržba z Vašej strany</li>
  <li>Služba je úplne zadarmo</li>
</ul>

<p>Ak by ste mali záujem, stačí pridať odkaz na Vašu webstránku. V prípade otázok som Vám k dispozícii.</p>

<p>S pozdravom,<br>
<strong>Marián Fabián</strong><br>
TaxiNearMe.sk<br>
<a href="mailto:info@taxinearme.sk">info@taxinearme.sk</a></p>
```

---

## POZNÁMKY

1. **Sender.net syntax**: `{{nazov_obce}}` - bez medzier
2. **Mailchimp syntax**: `*|NAZOV_OBCE|*` - upraviť podľa názvov polí
3. **Sendinblue syntax**: `{{contact.NAZOV_OBCE}}` - s prefixom contact

### Odporúčané nastavenia:

- **Denný limit**: 100-200 emailov denne (aby nebol označený ako spam)
- **Čas odoslania**: Pracovné dni 9:00-11:00 alebo 14:00-16:00
- **Reply-to**: Nastaviť funkčný email pre odpovede
- **Unsubscribe link**: Povinný pre GDPR!

### Pred odoslaním:

1. Otestuj na vlastnom emaile
2. Skontroluj či sa premenné správne nahrádzajú
3. Prvý deň pošli max 50 emailov a sleduj odpovede
