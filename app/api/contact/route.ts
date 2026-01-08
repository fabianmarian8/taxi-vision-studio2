import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { escapeHtml, escapeHtmlWithBreaks } from '@/lib/html-escape';

// Helper pre podmienené logovanie (iba v development)
const isDev = process.env.NODE_ENV === 'development';
const devLog = (message: string, data?: Record<string, unknown>) => {
  if (isDev) {
    console.log(message, data ?? '');
  }
};

// Zod schéma pre validáciu kontaktného formulára
const contactSchema = z.object({
  name: z.string().min(1, 'Meno je povinné').max(100, 'Meno je príliš dlhé'),
  email: z.string().email('Neplatný formát emailu'),
  city: z.string().min(1, 'Mesto je povinné').max(100, 'Názov mesta je príliš dlhý'),
  taxiName: z.string().min(1, 'Názov taxislužby je povinný').max(200, 'Názov taxislužby je príliš dlhý'),
  message: z.string().min(1, 'Správa je povinná').max(5000, 'Správa je príliš dlhá'),
});

// Funkcia pre lazy inicializáciu Resend klienta
// (inicializuje sa až pri použití, nie pri importe)
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Email template komponenta
const ContactFormEmail = ({
  name,
  email,
  city,
  taxiName,
  message,
}: {
  name: string;
  email: string;
  city: string;
  taxiName: string;
  message: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
    .field-value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚕 Nový príspevok z Taxi NearMe</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Niečo tu chýba - Kontaktný formulár</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">👤 Meno odosielateľa:</div>
        <div class="field-value">${escapeHtml(name)}</div>
      </div>

      <div class="field">
        <div class="field-label">📧 Email odosielateľa:</div>
        <div class="field-value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
      </div>

      <div class="field">
        <div class="field-label">🏙️ Mesto:</div>
        <div class="field-value">${escapeHtml(city)}</div>
      </div>

      <div class="field">
        <div class="field-label">🚖 Názov taxislužby:</div>
        <div class="field-value">${escapeHtml(taxiName)}</div>
      </div>

      <div class="field">
        <div class="field-label">💬 Správa / Údaje na doplnenie:</div>
        <div class="field-value">${escapeHtmlWithBreaks(message)}</div>
      </div>

      <div class="footer">
        <p>Tento email bol odoslaný z kontaktného formulára na <strong>taxinearme.cz</strong></p>
        <p>Môžete odpovedať priamo na email odosielateľa: ${escapeHtml(email)}</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request: NextRequest) {
  try {
    devLog('[Contact API] Received POST request');

    // Kontrola API kľúča
    if (!process.env.RESEND_API_KEY) {
      console.error('[Contact API] RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    devLog('[Contact API] RESEND_API_KEY is configured');

    // Parsovanie form data
    let formData;
    try {
      formData = await request.formData();
      devLog('[Contact API] FormData parsed successfully');
    } catch {
      console.error('[Contact API] Failed to parse FormData');
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Extrahovanie dát z formulára
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      city: formData.get('city'),
      taxiName: formData.get('taxiName'),
      message: formData.get('message'),
    };

    devLog('[Contact API] Form fields extracted:', {
      hasName: !!rawData.name,
      hasEmail: !!rawData.email,
      hasCity: !!rawData.city,
      hasTaxiName: !!rawData.taxiName,
      hasMessage: !!rawData.message,
    });

    // Validácia pomocou Zod schémy
    const validationResult = contactSchema.safeParse(rawData);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          error: firstError?.message || 'Validation failed',
          field: firstError?.path[0],
        },
        { status: 400 }
      );
    }

    const { name, email, city, taxiName, message } = validationResult.data;

    // Odoslanie emailu cez Resend
    devLog('[Contact API] Initializing Resend client...');
    const resend = getResendClient();

    // Určíme cieľový email a odosielateľskú adresu
    const recipientEmail = process.env.CONTACT_EMAIL || 'info@taxinearme.cz';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@taxinearme.cz';

    devLog('[Contact API] Email config:', {
      recipient: recipientEmail,
      from: fromEmail,
    });

    const { data, error: resendError } = await resend.emails.send({
      from: `Taxi NearMe <${fromEmail}>`,
      to: [recipientEmail],
      replyTo: email,
      subject: `Nový príspevok z Taxi NearMe - ${city} - ${taxiName}`,
      html: ContactFormEmail({ name, email, city, taxiName, message }),
    });

    devLog('[Contact API] Resend response received:', {
      hasData: !!data,
      hasError: !!resendError,
    });

    // Kontrola chyby od Resend
    if (resendError) {
      console.error('[Contact API] Resend API error:', resendError.message);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: isDev ? resendError.message : undefined,
        },
        { status: 500 }
      );
    }

    devLog('[Contact API] Email sent successfully:', {
      id: data?.id,
      city,
      taxiName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully',
        id: data?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    // Error handling - iba minimálne logovanie v produkcii
    console.error('[Contact API] Unexpected error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: isDev && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
