import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const reasonLabels: Record<string, string> = {
  'not_answering': '📵 Neberie telefón',
  'wrong_number': '❌ Zlé číslo',
  'not_exists': '🚫 Taxislužba neexistuje',
};

export async function POST(request: NextRequest) {
  try {
    const { serviceName, servicePhone, cityName, reason, comment, pageUrl } = await request.json();

    if (!serviceName || !servicePhone || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
    }

    const reasonText = reasonLabels[reason] || reason;
    const commentText = comment ? `\n💬 *Komentár:* ${comment}` : '';
    const urlText = pageUrl ? `\n🔗 *Stránka:* ${pageUrl}` : '';

    const telegramMessage = `🚨 *NAHLÁSENIE NEFUNKČNÉHO ČÍSLA*

🚕 *Taxislužba:* ${serviceName}
📞 *Telefón:* \`${servicePhone}\`
📍 *Mesto:* ${cityName}

⚠️ *Dôvod:* ${reasonText}${commentText}${urlText}

━━━━━━━━━━━━━━━━━━━━
_Nahlásené cez TaxiNearMe.sk_`;

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
    console.error('Report phone error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
