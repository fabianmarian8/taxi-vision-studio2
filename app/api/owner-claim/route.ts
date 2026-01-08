import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const {
      serviceName,
      servicePhone,
      cityName,
      citySlug,
      ownerName,
      ownerPhone,
      ownerEmail,
      message
    } = await request.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
    }

    // Validate required fields
    if (!serviceName || !ownerName || !ownerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const telegramMessage = `🚕 *MAJITEĽ TAXISLUŽBY - Žiadosť o úpravu*

📍 *Taxislužba:* ${serviceName}
📞 *Tel. v databáze:* ${servicePhone || 'neuvedené'}
🏙️ *Mesto:* ${cityName}
🔗 *URL:* taxinearme.cz/taxi/${citySlug}

👤 *Kontaktná osoba:*
• Meno: ${ownerName}
• Telefón: ${ownerPhone}
• Email: ${ownerEmail || 'neuvedený'}

💬 *Správa:*
${message || '(bez správy)'}

⏰ *Čas:* ${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Owner claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
