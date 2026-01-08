import Stripe from 'stripe';

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Price IDs from Stripe Dashboard
export const STRIPE_PRICES = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  partner: process.env.STRIPE_PARTNER_PRICE_ID || '',
};

// Plan amounts in cents
export const PLAN_AMOUNTS = {
  premium: 399, // 3.99 EUR
  partner: 899, // 8.99 EUR
};

/**
 * Get all active subscriptions from Stripe
 */
export async function getActiveSubscriptions() {
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    expand: ['data.customer'],
    limit: 100,
  });

  return subscriptions.data;
}

/**
 * Get subscription history for the last N months
 */
export async function getSubscriptionHistory(months: number = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const subscriptions = await stripe.subscriptions.list({
    created: { gte: Math.floor(since.getTime() / 1000) },
    expand: ['data.customer'],
    limit: 100,
  });

  return subscriptions.data;
}

/**
 * Get a single subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'latest_invoice'],
  });
}

/**
 * Get customer by ID
 */
export async function getCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId);
}

/**
 * Get invoices for a customer
 */
export async function getCustomerInvoices(customerId: string, limit: number = 10) {
  return stripe.invoices.list({
    customer: customerId,
    limit,
  });
}

/**
 * Calculate MRR from active subscriptions
 */
export function calculateMRR(subscriptions: Stripe.Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.status === 'active') {
      const amount = sub.items.data[0]?.price?.unit_amount || 0;
      return total + amount;
    }
    return total;
  }, 0) / 100; // Convert cents to EUR
}

/**
 * Get plan type from price ID
 */
export function getPlanTypeFromPrice(priceId: string): 'premium' | 'partner' | 'unknown' {
  if (priceId === STRIPE_PRICES.premium) return 'premium';
  if (priceId === STRIPE_PRICES.partner) return 'partner';

  // Fallback: detect by amount
  return 'unknown';
}

/**
 * Get plan type from subscription amount
 */
export function getPlanTypeFromAmount(amountCents: number): 'premium' | 'partner' {
  // Partner is 899 cents, Premium is 399 cents
  return amountCents >= 800 ? 'partner' : 'premium';
}

/**
 * Format Stripe subscription for database
 */
export function formatSubscriptionForDB(
  subscription: Stripe.Subscription,
  customer: Stripe.Customer | Stripe.DeletedCustomer
) {
  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem?.price?.id || '';
  const amountCents = subscriptionItem?.price?.unit_amount || 0;
  const periodStart = subscriptionItem?.current_period_start || Math.floor(Date.now() / 1000);
  const periodEnd = subscriptionItem?.current_period_end || Math.floor(Date.now() / 1000);

  return {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: priceId,
    plan_type: getPlanTypeFromAmount(amountCents),
    status: subscription.status,
    amount_cents: amountCents,
    currency: subscription.currency,
    current_period_start: new Date(periodStart * 1000).toISOString(),
    current_period_end: new Date(periodEnd * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    customer_email: 'email' in customer ? customer.email : null,
    customer_name: 'name' in customer ? customer.name : null,
    metadata: subscription.metadata || {},
  };
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string,
  signature: string,
  endpointSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
}
