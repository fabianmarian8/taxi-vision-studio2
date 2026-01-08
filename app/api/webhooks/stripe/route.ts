import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { constructWebhookEvent, formatSubscriptionForDB, getPlanTypeFromAmount } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const subscriptionItem = subscription.items.data[0];
  const amountCents = subscriptionItem?.price?.unit_amount || 0;
  const periodStart = subscriptionItem?.current_period_start || Math.floor(Date.now() / 1000);
  const periodEnd = subscriptionItem?.current_period_end || Math.floor(Date.now() / 1000);

  // Get customer email
  const { data: customerData } = await supabase
    .from('subscriptions')
    .select('customer_email')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  const customerEmail = customerData?.customer_email || '';

  // Insert new subscription
  const { error } = await supabase.from('subscriptions').upsert({
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: subscriptionItem?.price?.id || '',
    plan_type: getPlanTypeFromAmount(amountCents),
    status: subscription.status,
    amount_cents: amountCents,
    currency: subscription.currency,
    current_period_start: new Date(periodStart * 1000).toISOString(),
    current_period_end: new Date(periodEnd * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    customer_email: customerEmail,
    // city_slug and taxi_service_name need to be mapped manually or from metadata
    city_slug: (subscription.metadata?.city_slug as string) || 'unknown',
    taxi_service_name: (subscription.metadata?.taxi_service_name as string) || 'Unknown Service',
    metadata: subscription.metadata || {},
  }, {
    onConflict: 'stripe_subscription_id',
  });

  if (error) {
    console.error('Error inserting subscription:', error);
    throw error;
  }

  // Link subscription to taxi service (auto-enables premium)
  await linkSubscriptionToTaxiService(
    subscription.id,
    subscription.metadata?.city_slug as string,
    subscription.metadata?.taxi_service_name as string
  );

  // Log event
  await logSubscriptionEvent(subscription.id, 'created', amountCents, null, subscription.status);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionItem = subscription.items.data[0];
  const amountCents = subscriptionItem?.price?.unit_amount || 0;
  const periodStart = subscriptionItem?.current_period_start || Math.floor(Date.now() / 1000);
  const periodEnd = subscriptionItem?.current_period_end || Math.floor(Date.now() / 1000);

  // Get previous status
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  const previousStatus = existing?.status || null;

  // Update subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      amount_cents: amountCents,
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  // Log event if status changed
  if (previousStatus !== subscription.status) {
    await logSubscriptionEvent(
      subscription.id,
      'updated',
      amountCents,
      previousStatus,
      subscription.status
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Get previous status
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  const previousStatus = existing?.status || null;

  // Update subscription status to canceled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

  // Log cancellation event
  await logSubscriptionEvent(
    subscription.id,
    'canceled',
    null,
    previousStatus,
    'canceled'
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Get subscription ID from invoice (handle both old and new API structure)
  const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription;
  if (!subscriptionId) return;

  // Log renewal event
  await logSubscriptionEvent(
    subscriptionId,
    'renewed',
    invoice.amount_paid,
    null,
    null
  );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID from invoice (handle both old and new API structure)
  const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription;
  if (!subscriptionId) return;

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  // Log event
  await logSubscriptionEvent(
    subscriptionId,
    'payment_failed',
    invoice.amount_due,
    null,
    'past_due'
  );
}

/**
 * Link Stripe subscription to taxi service for auto premium enable/disable
 */
async function linkSubscriptionToTaxiService(
  stripeSubscriptionId: string,
  citySlug: string | undefined,
  taxiServiceName: string | undefined
) {
  if (!citySlug || !taxiServiceName) {
    console.warn('Missing city_slug or taxi_service_name in subscription metadata');
    return;
  }

  // Get our subscription ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, status, current_period_end')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!subscription) {
    console.warn(`Subscription not found: ${stripeSubscriptionId}`);
    return;
  }

  // Find and update the matching taxi service
  const { error } = await supabase
    .from('taxi_services')
    .update({
      subscription_id: subscription.id,
      is_premium: subscription.status === 'active',
      premium_expires_at: subscription.status === 'active' ? subscription.current_period_end : null,
      updated_at: new Date().toISOString(),
    })
    .eq('city_slug', citySlug)
    .ilike('name', taxiServiceName);

  if (error) {
    console.error('Error linking subscription to taxi service:', error);
  } else {
    console.log(`Linked subscription ${stripeSubscriptionId} to ${taxiServiceName} in ${citySlug}`);
  }
}

async function logSubscriptionEvent(
  stripeSubscriptionId: string,
  eventType: string,
  amountCents: number | null,
  previousStatus: string | null,
  newStatus: string | null
) {
  // Get subscription ID from our database
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!subscription) {
    console.warn(`Subscription not found for ${stripeSubscriptionId}`);
    return;
  }

  await supabase.from('subscription_events').insert({
    subscription_id: subscription.id,
    event_type: eventType,
    amount_cents: amountCents,
    previous_status: previousStatus,
    new_status: newStatus,
  });
}
