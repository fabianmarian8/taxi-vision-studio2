import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
  };
  chat: {
    id: number;
  };
  text?: string;
  reply_to_message?: {
    text?: string;
    message_id: number;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body first for better error handling
    const rawBody = await request.text();
    console.log('Telegram webhook raw body length:', rawBody.length);

    let update: TelegramUpdate;
    try {
      update = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw body preview:', rawBody.substring(0, 500));
      // Return 200 to prevent Telegram from retrying
      return NextResponse.json({ ok: true, error: 'parse_error' });
    }

    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

    // Only process messages from our admin chat
    if (!update.message) {
      console.log('No message in update');
      return NextResponse.json({ ok: true });
    }

    const chatId = String(update.message.chat.id);
    console.log('Chat ID:', chatId, 'Expected:', TELEGRAM_CHAT_ID);

    if (chatId !== TELEGRAM_CHAT_ID) {
      console.log('Chat ID mismatch, ignoring');
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const text = message.text;

    // Skip if no text
    if (!text) {
      console.log('No text in message');
      return NextResponse.json({ ok: true });
    }

    console.log('Message text:', text);
    console.log('Reply to message:', message.reply_to_message?.text);

    // Extract partner_id from reply or from /reply command
    let partnerId: string | null = null;
    let replyText: string | null = null;

    // Method 1: Reply to message - extract partner_id from original message
    if (message.reply_to_message?.text) {
      const originalText = message.reply_to_message.text;
      console.log('Looking for partner ID in:', originalText);

      // Look for partner ID - try multiple patterns
      // Pattern 1: 🆔 `uuid` or 🆔 uuid
      let idMatch = originalText.match(/🆔\s*`?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})`?/i);

      // Pattern 2: Just UUID anywhere in text
      if (!idMatch) {
        idMatch = originalText.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      }

      console.log('ID match result:', idMatch);

      if (idMatch) {
        partnerId = idMatch[1];
        replyText = text;
        console.log('Found partner ID:', partnerId);
      }
    }

    // Method 2: /reply command - /reply <partner_id> <message>
    if (!partnerId && text.startsWith('/reply ')) {
      const parts = text.slice(7).split(' ');
      if (parts.length >= 2) {
        const potentialId = parts[0];
        // Validate UUID format
        if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(potentialId)) {
          partnerId = potentialId;
          replyText = parts.slice(1).join(' ');
          console.log('Found partner ID from /reply command:', partnerId);
        }
      }
    }

    // If we have a valid reply, save it to Supabase
    if (partnerId && replyText) {
      console.log('Saving reply to Supabase for partner:', partnerId);

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // Verify partner exists
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('id, name')
        .eq('id', partnerId)
        .single();

      console.log('Partner lookup result:', partner, partnerError);

      if (!partner) {
        await sendTelegramMessage(`❌ Partner s ID ${partnerId} neexistuje.`);
        return NextResponse.json({ ok: true });
      }

      // Insert admin reply
      const { error } = await supabase.from('chat_messages').insert({
        partner_id: partnerId,
        sender_type: 'admin',
        message: replyText,
      });

      if (error) {
        console.error('Error saving reply:', error);
        await sendTelegramMessage(`❌ Chyba pri ukladaní odpovede: ${error.message}`);
      } else {
        console.log('Reply saved successfully');
        await sendTelegramMessage(`✅ Odpoveď odoslaná partnerovi ${partner.name}`);
      }
    } else {
      console.log('No valid partner ID or reply text found');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendTelegramMessage(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
    }),
  });
}

// Handle GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook endpoint active' });
}
