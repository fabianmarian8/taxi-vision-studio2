/**
 * API Test Helpers
 *
 * Utility functions for testing Next.js API routes
 */

import { vi, expect } from 'vitest';

// =============================================================================
// MOCK FACTORIES
// =============================================================================

/**
 * Create a mock NextRequest object
 */
export function createMockRequest(options: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  url?: string;
  ip?: string;
} = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    cookies = {},
    url = 'http://localhost:3000/api/test',
    ip = '127.0.0.1'
  } = options;

  return {
    method,
    url,
    headers: new Headers({
      'content-type': 'application/json',
      'x-forwarded-for': ip,
      ...headers
    }),
    cookies: {
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
    nextUrl: new URL(url),
  };
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient() {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: mockFrom,
  };
}

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

/**
 * Create a test partner
 */
export function createTestPartner(data: Partial<{
  id: string;
  user_id: string;
  slug: string;
  name: string;
  city_slug: string;
  email: string;
  created_at: string;
  updated_at: string;
}> = {}) {
  return {
    id: data.id || crypto.randomUUID(),
    user_id: data.user_id || 'test_user_' + crypto.randomUUID().slice(0, 8),
    slug: data.slug || 'test-taxi',
    name: data.name || 'Test Taxi Service',
    city_slug: data.city_slug || 'praha',
    email: data.email || 'test@example.com',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create a test partner draft
 */
export function createTestDraft(data: Partial<{
  id: string;
  partner_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  company_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  hero_image_url: string;
  services: string[];
  gallery: string[];
  template_variant: string;
  created_at: string;
  updated_at: string;
}> = {}) {
  return {
    id: data.id || crypto.randomUUID(),
    partner_id: data.partner_id || crypto.randomUUID(),
    status: data.status || 'draft',
    company_name: data.company_name || null,
    description: data.description || null,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    hero_image_url: data.hero_image_url || null,
    services: data.services || null,
    gallery: data.gallery || null,
    template_variant: data.template_variant || 'classic',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create a test subscription
 */
export function createTestSubscription(data: Partial<{
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  city_slug: string;
  taxi_service_name: string;
  plan_type: 'premium' | 'partner';
  status: 'active' | 'past_due' | 'canceled';
  amount_cents: number;
  current_period_start: string;
  current_period_end: string;
}> = {}) {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    id: data.id || crypto.randomUUID(),
    stripe_subscription_id: data.stripe_subscription_id || 'sub_' + crypto.randomUUID().slice(0, 14),
    stripe_customer_id: data.stripe_customer_id || 'cus_' + crypto.randomUUID().slice(0, 14),
    city_slug: data.city_slug || 'praha',
    taxi_service_name: data.taxi_service_name || 'Test Taxi',
    plan_type: data.plan_type || 'premium',
    status: data.status || 'active',
    amount_cents: data.amount_cents || 1900,
    current_period_start: data.current_period_start || now.toISOString(),
    current_period_end: data.current_period_end || nextMonth.toISOString(),
  };
}

// =============================================================================
// STRIPE HELPERS
// =============================================================================

/**
 * Generate a Stripe webhook signature
 */
export function generateStripeSignature(payload: string, secret: string): string {
  // Note: In real tests, use stripe.webhooks.generateTestHeaderString
  const timestamp = Math.floor(Date.now() / 1000);
  // This is a simplified version - real implementation needs crypto
  return `t=${timestamp},v1=mock_signature_for_testing`;
}

/**
 * Create a Stripe webhook event
 */
export function createStripeEvent(type: string, data: Record<string, unknown>) {
  return {
    id: 'evt_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24),
    type,
    data: { object: data },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  };
}

/**
 * Create a Stripe subscription created event
 */
export function createSubscriptionCreatedEvent(data: Partial<{
  id: string;
  customer: string;
  status: string;
  amount: number;
  city_slug: string;
  taxi_service_name: string;
}> = {}) {
  return createStripeEvent('customer.subscription.created', {
    id: data.id || 'sub_' + crypto.randomUUID().slice(0, 14),
    customer: data.customer || 'cus_' + crypto.randomUUID().slice(0, 14),
    status: data.status || 'active',
    items: {
      data: [{
        price: {
          id: 'price_test',
          unit_amount: data.amount || 1900,
        },
      }],
    },
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    metadata: {
      city_slug: data.city_slug || 'praha',
      taxi_service_name: data.taxi_service_name || 'Test Taxi',
    },
  });
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Assert response status and return JSON body
 */
export async function expectJsonResponse(
  response: Response,
  expectedStatus: number
): Promise<unknown> {
  expect(response.status).toBe(expectedStatus);
  return response.json();
}

/**
 * Assert response contains specific error
 */
export async function expectError(
  response: Response,
  expectedStatus: number,
  errorContains?: string
): Promise<void> {
  expect(response.status).toBe(expectedStatus);
  const json = await response.json() as { error?: string };
  expect(json.error).toBeDefined();
  if (errorContains) {
    expect(json.error).toContain(errorContains);
  }
}

// =============================================================================
// RATE LIMIT HELPERS
// =============================================================================

/**
 * Simulate multiple requests for rate limit testing
 */
export async function simulateRequests(
  handler: (req: unknown) => Promise<Response>,
  count: number,
  requestFactory: () => unknown
): Promise<Response[]> {
  const responses: Response[] = [];
  for (let i = 0; i < count; i++) {
    const response = await handler(requestFactory());
    responses.push(response);
  }
  return responses;
}

/**
 * Get rate limit headers from response
 */
export function getRateLimitHeaders(response: Response) {
  return {
    limit: response.headers.get('X-RateLimit-Limit'),
    remaining: response.headers.get('X-RateLimit-Remaining'),
    reset: response.headers.get('X-RateLimit-Reset'),
    retryAfter: response.headers.get('Retry-After'),
  };
}
