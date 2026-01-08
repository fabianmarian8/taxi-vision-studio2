import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { escapeHtml, sanitizeUrl } from '@/lib/html-escape';

// Lazy initialization
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Email template for new submission notification
const SubmissionNotificationEmail = ({
  companyName,
  partnerEmail,
  cityName,
  submittedAt,
  adminUrl,
}: {
  companyName: string;
  partnerEmail: string;
  cityName: string;
  submittedAt: string;
  adminUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #8b5cf6; margin-bottom: 5px; }
    .field-value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #8b5cf6; }
    .cta-button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nový návrh na schválenie</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Partner portál - Taxi NearMe</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Taxislužba:</div>
        <div class="field-value">${escapeHtml(companyName)}</div>
      </div>

      <div class="field">
        <div class="field-label">Email partnera:</div>
        <div class="field-value"><a href="mailto:${escapeHtml(partnerEmail)}">${escapeHtml(partnerEmail)}</a></div>
      </div>

      <div class="field">
        <div class="field-label">Mesto:</div>
        <div class="field-value">${escapeHtml(cityName)}</div>
      </div>

      <div class="field">
        <div class="field-label">Odoslané:</div>
        <div class="field-value">${escapeHtml(submittedAt)}</div>
      </div>

      <a href="${sanitizeUrl(adminUrl)}" class="cta-button">Pozrieť v admin paneli</a>

      <div class="footer">
        <p>Tento email bol automaticky odoslaný z Partner portálu na <strong>taxinearme.cz</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Notify API] RESEND_API_KEY not configured, skipping notification');
      return NextResponse.json({ success: true, skipped: true });
    }

    // Get request body
    const body = await request.json();
    const { companyName, citySlug } = body;

    if (!companyName) {
      return NextResponse.json({ error: 'Missing companyName' }, { status: 400 });
    }

    // Get city name from slug
    let cityName = citySlug || 'Neznáme';
    if (citySlug) {
      // Capitalize first letter and replace hyphens
      cityName = citySlug
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Notification email destination
    const notificationEmail = process.env.PARTNER_NOTIFICATION_EMAIL || 'fabianmarian8@gmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@taxinearme.cz';

    // Format date in Czech format
    const submittedAt = new Intl.DateTimeFormat('cs-CZ', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());

    // Admin URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://taxinearme.cz';
    const adminUrl = `${baseUrl}/admin/partner-drafts`;

    // Send email
    const resend = getResendClient();
    const { error: resendError } = await resend.emails.send({
      from: `Taxi NearMe <${fromEmail}>`,
      to: [notificationEmail],
      subject: `Nový návrh: ${companyName}`,
      html: SubmissionNotificationEmail({
        companyName,
        partnerEmail: user.email || 'Neznámy',
        cityName,
        submittedAt,
        adminUrl,
      }),
    });

    if (resendError) {
      console.error('[Notify API] Failed to send email:', resendError.message);
      // Don't fail the request, just log the error
      return NextResponse.json({ success: true, emailSent: false, error: resendError.message });
    }

    console.log(`[Notify API] Email sent to ${notificationEmail} for ${companyName}`);

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('[Notify API] Unexpected error:', error);
    // Don't fail the request, just log the error
    return NextResponse.json({ success: true, emailSent: false });
  }
}
