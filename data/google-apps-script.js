/**
 * Mail Merge pre obce - TaxiNearMe.sk
 *
 * INŠTRUKCIE:
 * 1. Otvor Google Sheet s importovanými dátami
 * 2. Klikni na Extensions > Apps Script
 * 3. Vymaž všetok existujúci kód a vlož tento celý súbor
 * 4. Ulož (Ctrl+S)
 * 5. V Gmail vytvor draft email s textom (pozri EMAIL_TEMPLATE nižšie)
 * 6. V Google Sheet klikni Mail Merge > Send Emails
 */

// Konfigurácia - uprav podľa potreby
const RECIPIENT_COL = "Recipient";
const EMAIL_SENT_COL = "Email Sent";
const DAILY_LIMIT = 100; // Koľko emailov poslať za jedno spustenie (Gmail limit je 500/deň)

// Predmet emailu
const EMAIL_SUBJECT = "Taxislužby pre občanov obce {{nazov_obce}} - bezplatná služba";

/**
 * Pridá menu do Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Mail Merge')
    .addItem('Send Emails', 'sendEmails')
    .addItem('Send Test Email', 'sendTestEmail')
    .addToUi();
}

/**
 * Odošle testovaciu správu na tvoj email
 */
function sendTestEmail() {
  const testEmail = Session.getActiveUser().getEmail();
  const testData = {
    nazov_obce: "Testovacia Obec",
    url_obce: "https://www.taxinearme.sk"
  };

  const subject = fillTemplate(EMAIL_SUBJECT, testData);
  const body = fillTemplate(getEmailBody(), testData);

  GmailApp.sendEmail(testEmail, subject, body);

  SpreadsheetApp.getUi().alert('Testovací email odoslaný na: ' + testEmail);
}

/**
 * Hlavná funkcia - odošle emaily
 */
function sendEmails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();

  // Nájdi indexy stĺpcov
  const headers = data[0];
  const recipientIdx = headers.indexOf(RECIPIENT_COL);
  const emailSentIdx = headers.indexOf(EMAIL_SENT_COL);
  const nazovObceIdx = headers.indexOf("nazov_obce");
  const urlObceIdx = headers.indexOf("url_obce");

  if (recipientIdx === -1) {
    SpreadsheetApp.getUi().alert('Chyba: Stĺpec "Recipient" nebol nájdený!');
    return;
  }

  let sentCount = 0;
  let skippedCount = 0;
  const emailBody = getEmailBody();

  // Spracuj každý riadok
  for (let i = 1; i < data.length && sentCount < DAILY_LIMIT; i++) {
    const row = data[i];
    const recipient = row[recipientIdx];
    const emailSent = row[emailSentIdx];

    // Preskočí ak už bol email odoslaný alebo nie je email adresa
    if (emailSent || !recipient || !recipient.includes('@')) {
      skippedCount++;
      continue;
    }

    // Vyčisti email (odstráň prípadnú čiarku na konci)
    const cleanEmail = recipient.toString().replace(/,+$/, '').trim();

    // Priprav dáta pre šablónu
    const templateData = {
      nazov_obce: row[nazovObceIdx] || '',
      url_obce: row[urlObceIdx] || 'https://www.taxinearme.sk'
    };

    // Vytvor personalizovaný email
    const subject = fillTemplate(EMAIL_SUBJECT, templateData);
    const body = fillTemplate(emailBody, templateData);

    try {
      // Odošli email
      GmailApp.sendEmail(cleanEmail, subject, body, {
        name: "Marián Fabián - TaxiNearMe.sk",
        replyTo: "info@taxinearme.sk"
      });

      // Označ ako odoslané
      sheet.getRange(i + 1, emailSentIdx + 1).setValue(new Date().toLocaleString('sk-SK'));
      sentCount++;

      // Malá pauza medzi emailami (aby sme nevyzerali ako spam)
      Utilities.sleep(1000);

    } catch (error) {
      // Označ chybu
      sheet.getRange(i + 1, emailSentIdx + 1).setValue('CHYBA: ' + error.message);
    }
  }

  // Zobraz výsledok
  const remaining = data.length - 1 - sentCount - skippedCount;
  SpreadsheetApp.getUi().alert(
    'Hotovo!\n\n' +
    'Odoslaných: ' + sentCount + ' emailov\n' +
    'Preskočených (už odoslané): ' + skippedCount + '\n' +
    'Zostáva: ' + remaining + '\n\n' +
    'Spusti znova zajtra pre ďalších ' + DAILY_LIMIT + ' emailov.'
  );
}

/**
 * Nahradí {{premenné}} v texte hodnotami z objektu
 */
function fillTemplate(template, data) {
  let result = template;
  for (const key in data) {
    const regex = new RegExp('{{' + key + '}}', 'g');
    result = result.replace(regex, data[key]);
  }
  return result;
}

/**
 * Vráti telo emailu - UPRAV TENTO TEXT PODĽA POTREBY
 */
function getEmailBody() {
  return `Dobrý deň,

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
info@taxinearme.sk`;
}
