import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const { partnerId, partnerName, partnerEmail, message, attachmentUrl, attachmentType } = await request.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
    }

    // Format message with partner ID for reply functionality
    const attachmentInfo = attachmentUrl
      ? `\n📎 *Príloha:* [${attachmentType === 'image' ? 'Obrázok' : 'PDF'}](${attachmentUrl})`
      : '';

    const messageText = message || (attachmentUrl ? '(len príloha)' : '');

    const telegramMessage = `🚕 *Nova sprava od partnera*

👤 *Partner:* ${partnerName}
📧 *Email:* ${partnerEmail}

💬 *Sprava:*
${messageText}${attachmentInfo}

➡️ *Pre odpoved odpiste na tuto spravu*
🆔 \`${partnerId}\``;

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
    console.error('Chat notify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
