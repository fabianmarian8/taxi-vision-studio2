import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Webhook secret pre overenie že request je od Sanity
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET

interface SanityWebhookPayload {
  _id: string
  _type: string
  _rev: string
  name?: string
  city?: string
  citySlug?: string
  status?: string
  // ... ďalšie polia
}

export async function POST(request: NextRequest) {
  try {
    // Overiť webhook secret
    const secret = request.headers.get('sanity-webhook-secret')
    if (SANITY_WEBHOOK_SECRET && secret !== SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const payload: SanityWebhookPayload = await request.json()

    console.log('[Sanity Webhook] Received:', {
      type: payload._type,
      id: payload._id,
      name: payload.name,
      status: payload.status,
    })

    // Spracuj len partnerTaxiService dokumenty
    if (payload._type !== 'partnerTaxiService') {
      return NextResponse.json({ message: 'Ignored - not a partner document' })
    }

    // === AKCIE PODĽA STATUSU ===

    // 1. Partner požiadal o schválenie
    if (payload.status === 'pending') {
      // Tu môžeš pridať:
      // - Odoslať email adminovi
      // - Poslať Slack notifikáciu
      // - Zapísať do logu

      console.log(`[PENDING] Partner "${payload.name}" čaká na schválenie`)

      // Príklad: Odoslanie emailu (potrebuješ nastaviť email service)
      // await sendEmail({
      //   to: 'admin@taxinearme.sk',
      //   subject: `Nová žiadosť o schválenie: ${payload.name}`,
      //   body: `Partner ${payload.name} z mesta ${payload.city} žiada o schválenie zmien.`
      // })
    }

    // 2. Admin schválil partnera
    if (payload.status === 'approved') {
      console.log(`[APPROVED] Partner "${payload.name}" bol schválený`)

      // Revaliduj stránky kde sa zobrazujú partneri
      if (payload.citySlug) {
        revalidatePath(`/taxi/${payload.citySlug}`)
        revalidatePath(`/taxi/${payload.citySlug}/[serviceSlug]`)
      }
      revalidatePath('/') // Homepage ak tam zobrazuješ partnerov
    }

    // 3. Admin zamietol
    if (payload.status === 'rejected') {
      console.log(`[REJECTED] Partner "${payload.name}" bol zamietnutý`)

      // Tu môžeš pridať notifikáciu partnerovi
    }

    return NextResponse.json({
      success: true,
      revalidated: payload.status === 'approved',
      message: `Processed ${payload._type} with status ${payload.status}`,
    })
  } catch (error) {
    console.error('[Sanity Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET pre health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Sanity webhook endpoint is running',
  })
}
