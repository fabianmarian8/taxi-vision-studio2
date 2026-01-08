#!/usr/bin/env node
/**
 * Hromadné odosielanie emailov obciam cez Resend API
 *
 * Použitie:
 *   node scripts/send-emails-resend.cjs --test          # Pošle test na tvoj email
 *   node scripts/send-emails-resend.cjs --dry-run      # Simulácia bez odoslania
 *   node scripts/send-emails-resend.cjs --limit=10     # Pošle prvých 10
 *   node scripts/send-emails-resend.cjs                # Pošle všetky neodoslané (max 100/deň)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// === KONFIGURÁCIA ===
const RESEND_API_KEY = 're_85fb8hVQ_8pkLheudxM3NLjwZMMcJjGxa';
const FROM_EMAIL = 'Marián Fabián <info@taxinearme.sk>';
const REPLY_TO = 'info@taxinearme.sk';
const DAILY_LIMIT = 1000; // Zvýšené predplatné - poslať všetko naraz
const DELAY_MS = 1000; // 1 sekunda medzi emailami (rýchlejšie)

// === SÚBORY ===
const JSON_FILE = path.join(__dirname, '..', 'data', 'obce-mailing-list-v4-remaining.json'); // v4 - zostávajúce obce
const SENT_LOG = path.join(__dirname, '..', 'data', 'obce-sent-log-v4.json'); // Nový log pre v4

// === EMAIL ŠABLÓNA ===
function getEmailSubject(nazovObce) {
  return `Taxislužby pre občanov obce ${nazovObce} - bezplatná služba pre vašu obec`;
}

// Plain text verzia (fallback)
function getEmailBodyText(nazovObce, urlObce) {
  return `Dobrý deň,

obraciam sa na Vás s ponukou bezplatnej služby pre občanov obce ${nazovObce}.

Prevádzkujem webovú stránku TaxiNearMe.sk a pre Vašu obec som vytvoril vlastnú stránku s mapou a kontaktami na najbližšie overené taxislužby.

Stránku pre obec ${nazovObce} si môžete pozrieť tu:
${urlObce}


ČO OBSAHUJE STRÁNKA PRE VAŠU OBEC:

• Interaktívna mapa s najbližšími taxislužbami
• Telefónne čísla na overené taxislužby vo Vašom okolí
• Vzdialenosti a odhadované ceny jazdy
• Informácie o službách jednotlivých taxíkov


ČO PONÚKAM:

Môžete pridať odkaz na túto stránku na Váš obecný web do sekcie "Užitočné odkazy" alebo "Služby pre občanov". Vaši občania tak budú mať jednoduchý prístup k telefónnym číslam taxislužieb.


PREČO JE TO UŽITOČNÉ:

• Starší občania poznajú obecný web - rýchlo nájdu kontakt na taxi
• Turistom a návštevníkom pomôže s dopravou
• Nie je potrebná žiadna údržba z Vašej strany
• Služba je úplne zadarmo


Ak by ste mali záujem, stačí pridať odkaz na Vašu webstránku. V prípade otázok som Vám k dispozícii.

S pozdravom,
Marián Fabián
TaxiNearMe.sk
info@taxinearme.sk

---
Tento e-mail bol zaslaný na verejne dostupný kontakt obce. Ak si neželáte dostávať ďalšie informácie, odpovedzte prosím s predmetom STOP.`;
}

// HTML verzia - kompaktná, obrázok na konci
function getEmailBodyHtml(nazovObce, urlObce) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 15px;">

  <p style="margin: 0 0 10px;">Dobrý deň,</p>

  <p style="margin: 0 0 15px;">pre Vašu obec <strong>${nazovObce}</strong> som vytvoril stránku s mapou a kontaktami na najbližšie overené taxislužby.</p>

  <!-- CTA tlačidlo -->
  <div style="text-align: center; margin: 20px 0;">
    <a href="${urlObce}" style="display: inline-block; background-color: #f5c518; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
      Pozrieť stránku pre ${nazovObce}
    </a>
  </div>

  <p style="margin: 0 0 10px;"><strong>Čo stránka obsahuje:</strong></p>
  <ul style="padding-left: 20px; margin: 0 0 15px;">
    <li>Interaktívna mapa s taxislužbami</li>
    <li>Telefónne čísla na overené taxíky</li>
    <li>Vzdialenosti a odhadované ceny</li>
  </ul>

  <p style="margin: 0 0 15px;">Môžete pridať odkaz na Váš obecný web do sekcie "Užitočné odkazy". Služba je zadarmo a nevyžaduje žiadnu údržbu.</p>

  <p style="margin: 0 0 15px;">V prípade otázok som Vám k dispozícii.</p>

  <!-- Podpis s fotkou -->
  <div style="padding-top: 15px; border-top: 1px solid #ddd; font-size: 14px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align: top; padding-right: 12px;">
          <img src="https://www.taxinearme.sk/author-marian.png" alt="Marián Fabián" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        </td>
        <td style="vertical-align: top;">
          <p style="margin: 0;">S pozdravom,<br><strong>Marián Fabián</strong></p>
          <p style="margin: 5px 0 0; color: #666;">
            <a href="https://www.taxinearme.sk" style="color: #0066cc;">TaxiNearMe.sk</a> · <a href="mailto:info@taxinearme.sk" style="color: #0066cc;">info@taxinearme.sk</a>
          </p>
        </td>
      </tr>
    </table>
  </div>

  <!-- Logo na konci -->
  <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
    <a href="https://www.taxinearme.sk" target="_blank">
      <img src="https://www.taxinearme.sk/email-logo.png" alt="TaxiNearMe - Slovenský zoznam taxislužieb" style="max-width: 280px; height: auto;">
    </a>
  </div>

  <!-- GDPR disclaimer -->
  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center;">
    Tento e-mail bol zaslaný na verejne dostupný kontakt obce.<br>
    Ak si neželáte dostávať ďalšie informácie, odpovedzte prosím s predmetom STOP.
  </div>

</body>
</html>`;
}

// === POMOCNÉ FUNKCIE ===

function loadContacts() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  return data.map(item => ({
    email: item.email,
    nazovObce: item.nazov_obce,
    urlObce: item.url_obce
  })).filter(c => c.email && c.email.includes('@'));
}

function loadSentLog() {
  if (fs.existsSync(SENT_LOG)) {
    return JSON.parse(fs.readFileSync(SENT_LOG, 'utf8'));
  }
  return { sent: [], failed: [], lastRun: null };
}

function saveSentLog(log) {
  fs.writeFileSync(SENT_LOG, JSON.stringify(log, null, 2), 'utf8');
}

function sendEmail(to, subject, text, html) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      reply_to: REPLY_TO,
      subject: subject,
      text: text,
      html: html
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === HLAVNÁ LOGIKA ===

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const isDryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const customLimit = limitArg ? parseInt(limitArg.split('=')[1]) : DAILY_LIMIT;

  console.log('='.repeat(60));
  console.log('TaxiNearMe.sk - Email kampaň pre obce');
  console.log('='.repeat(60));

  // Test mode
  if (isTest) {
    console.log('\n📧 TESTOVACÍ REŽIM - posielam na tvoj email...\n');
    try {
      const testObec = 'Testovacia Obec';
      const testUrl = 'https://www.taxinearme.sk/obec/testovacia-obec';
      const result = await sendEmail(
        'fabianmarian8@gmail.com',
        getEmailSubject(testObec),
        getEmailBodyText(testObec, testUrl),
        getEmailBodyHtml(testObec, testUrl)
      );
      console.log('✅ Testovací email odoslaný!');
      console.log('   ID:', result.id);
      console.log('\nSkontroluj svoju schránku: fabianmarian8@gmail.com');
    } catch (error) {
      console.error('❌ Chyba:', error.message);
    }
    return;
  }

  // Load data
  const contacts = loadContacts();
  const log = loadSentLog();

  console.log(`\n📊 Štatistiky:`);
  console.log(`   Celkom kontaktov: ${contacts.length}`);
  console.log(`   Už odoslaných: ${log.sent.length}`);
  console.log(`   Zlyhalo: ${log.failed.length}`);
  console.log(`   Zostáva: ${contacts.length - log.sent.length}`);
  console.log(`   Dnešný limit: ${customLimit}`);

  if (isDryRun) {
    console.log('\n🔍 DRY-RUN REŽIM - žiadne emaily sa neodošlú\n');
  }

  // Filter unsent contacts
  const sentEmails = new Set(log.sent.map(s => s.email));
  const toSend = contacts.filter(c => !sentEmails.has(c.email)).slice(0, customLimit);

  if (toSend.length === 0) {
    console.log('\n✅ Všetky emaily už boli odoslané alebo bol dosiahnutý denný limit!');
    return;
  }

  console.log(`\n📤 Odosielam ${toSend.length} emailov...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toSend.length; i++) {
    const contact = toSend[i];
    const progress = `[${i + 1}/${toSend.length}]`;

    process.stdout.write(`${progress} ${contact.nazovObce} (${contact.email})... `);

    if (isDryRun) {
      console.log('⏭️  (dry-run)');
      continue;
    }

    try {
      const subject = getEmailSubject(contact.nazovObce);
      const textBody = getEmailBodyText(contact.nazovObce, contact.urlObce);
      const htmlBody = getEmailBodyHtml(contact.nazovObce, contact.urlObce);

      const result = await sendEmail(contact.email, subject, textBody, htmlBody);

      log.sent.push({
        email: contact.email,
        nazovObce: contact.nazovObce,
        sentAt: new Date().toISOString(),
        resendId: result.id
      });

      console.log('✅');
      successCount++;

    } catch (error) {
      log.failed.push({
        email: contact.email,
        nazovObce: contact.nazovObce,
        error: error.message,
        failedAt: new Date().toISOString()
      });

      console.log('❌', error.message);
      failCount++;
    }

    // Save after each email (in case of crash)
    log.lastRun = new Date().toISOString();
    saveSentLog(log);

    // Wait between emails
    if (i < toSend.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VÝSLEDOK:');
  console.log(`   ✅ Úspešne odoslaných: ${successCount}`);
  console.log(`   ❌ Zlyhalo: ${failCount}`);
  console.log(`   📝 Celkom odoslaných: ${log.sent.length}/${contacts.length}`);
  console.log(`   🕐 Zostáva: ${contacts.length - log.sent.length}`);
  console.log('='.repeat(60));

  if (contacts.length - log.sent.length > 0) {
    console.log('\n💡 Spusti znova zajtra pre ďalších', DAILY_LIMIT, 'emailov.');
  } else {
    console.log('\n🎉 Všetky emaily boli odoslané!');
  }
}

main().catch(console.error);
