# Analýza pokrytia testami API routes - Taxi Vision Studio

**Dátum analýzy:** 24.12.2024
**Analyzované:** Next.js API routes v `app/api/`
**Testing framework:** Vitest + @testing-library/react

---

## 📊 Súhrn aktuálneho stavu

### Existujúce testy
- ✅ `src/components/ui/button.test.tsx` - UI komponenty
- ✅ `src/lib/utils.test.ts` - Utility funkcie
- ❌ **API routes: 0 testov**

### Kritické endpointy bez testov (24 routes)

#### 🔴 VYSOKÁ PRIORITA (bezpečnostné + finančné)
1. `/api/admin/login` - Autentifikácia admina
2. `/api/webhooks/stripe` - Stripe platby a subscriptions
3. `/api/partner/inline-edit/save` - Úprava partner dát
4. `/api/partner/inline-edit/publish` - Publikovanie zmien
5. `/api/partner/inline-edit/draft/[slug]` - Načítanie draft dát

#### 🟡 STREDNÁ PRIORITA (business logic)
6. `/api/admin/partner-drafts` - Schvaľovanie drafts
7. `/api/admin/partner-drafts/[id]` - Detail/update draftu
8. `/api/admin/cities` - Správa miest
9. `/api/admin/cities/[slug]` - Detail mesta
10. `/api/admin/revenue` - Revenue reporting
11. `/api/admin/seo` - SEO management
12. `/api/partner/upload-image` - Upload obrázkov
13. `/api/partner/notify-submission` - Notifikácie

#### 🟢 NÍZKA PRIORITA (pomocné + verejné)
14. `/api/municipalities` - Zoznam obcí
15. `/api/contact` - Kontaktný formulár
16. `/api/route` - Route handling
17. `/api/test` - Test endpoint
18. `/api/revalidate` - Cache revalidation

---

## 🎯 Detailné test scenáre pre kritické endpointy

### 1. `/api/admin/login` (POST)

**Security features:**
- Rate limiting (5 pokusov / 15 minút)
- IP-based throttling
- Credential validation

**Navrhované testy:**

```typescript
// app/api/admin/login/route.test.ts

describe('POST /api/admin/login', () => {

  describe('Autentifikácia', () => {
    it('should return 400 when username is missing', async () => {
      const response = await POST({ password: 'test123' });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'Username and password are required'
      });
    });

    it('should return 400 when password is missing', async () => {
      const response = await POST({ username: 'admin' });
      expect(response.status).toBe(400);
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await POST({
        username: 'admin',
        password: 'wrongpass'
      });
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({
        error: 'Invalid credentials'
      });
    });

    it('should return 200 with valid credentials', async () => {
      const response = await POST({
        username: 'admin',
        password: process.env.ADMIN_PASSWORD
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        success: true
      });
    });

    it('should create session cookie on successful login', async () => {
      const response = await POST({
        username: 'admin',
        password: process.env.ADMIN_PASSWORD
      });
      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('session=');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Secure');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow 5 failed login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await POST({
          username: 'admin',
          password: 'wrong'
        });
        expect(response.status).toBe(401);
      }
    });

    it('should return 429 after 5 failed attempts', async () => {
      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await POST({ username: 'admin', password: 'wrong' });
      }

      const response = await POST({
        username: 'admin',
        password: 'wrong'
      });

      expect(response.status).toBe(429);
      expect(await response.json()).toMatchObject({
        error: 'Too many login attempts. Please try again later.'
      });
    });

    it('should include Retry-After header on rate limit', async () => {
      // Trigger rate limit
      for (let i = 0; i < 6; i++) {
        await POST({ username: 'admin', password: 'wrong' });
      }

      const response = await POST({
        username: 'admin',
        password: 'wrong'
      });

      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeTruthy();
      expect(Number(retryAfter)).toBeGreaterThan(0);
    });

    it('should reset rate limit after window expires', async () => {
      // This test requires time manipulation or mock
      // Mock Date.now() to simulate 15 minutes passing
      vi.useFakeTimers();

      for (let i = 0; i < 5; i++) {
        await POST({ username: 'admin', password: 'wrong' });
      }

      // Advance time by 15 minutes
      vi.advanceTimersByTime(15 * 60 * 1000);

      const response = await POST({
        username: 'admin',
        password: 'wrong'
      });
      expect(response.status).toBe(401); // Not 429

      vi.useRealTimers();
    });
  });

  describe('IP Detection', () => {
    it('should use x-forwarded-for header', async () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '1.2.3.4' }
      });
      // Verify IP is correctly extracted
    });

    it('should use x-real-ip as fallback', async () => {
      const request = createMockRequest({
        headers: { 'x-real-ip': '5.6.7.8' }
      });
      // Verify IP is correctly extracted
    });

    it('should isolate rate limits per IP', async () => {
      // IP 1: trigger rate limit
      for (let i = 0; i < 6; i++) {
        await POST({ username: 'admin', password: 'wrong' }, { ip: '1.1.1.1' });
      }

      // IP 2: should still work
      const response = await POST(
        { username: 'admin', password: 'wrong' },
        { ip: '2.2.2.2' }
      );
      expect(response.status).toBe(401); // Not 429
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      // Mock verifyCredentials to throw error
      vi.mocked(verifyCredentials).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const response = await POST({
        username: 'admin',
        password: 'test'
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toMatchObject({
        error: 'Internal server error'
      });
    });

    it('should log error details for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      vi.mocked(verifyCredentials).mockRejectedValueOnce(
        new Error('DB error')
      );

      await POST({ username: 'admin', password: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Login error:',
        expect.any(Error)
      );
    });
  });
});
```

---

### 2. `/api/webhooks/stripe` (POST)

**Critical functionality:**
- Webhook signature verification
- Subscription lifecycle (created/updated/deleted)
- Invoice payment processing
- Database synchronization

**Navrhované testy:**

```typescript
// app/api/webhooks/stripe/route.test.ts

describe('POST /api/webhooks/stripe', () => {

  describe('Webhook Signature Verification', () => {
    it('should return 400 when signature is missing', async () => {
      const response = await POST({
        body: JSON.stringify({ type: 'test' }),
        headers: {}
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'Missing signature'
      });
    });

    it('should return 400 with invalid signature', async () => {
      const response = await POST({
        body: JSON.stringify({ type: 'test' }),
        headers: { 'stripe-signature': 'invalid_signature' }
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'Invalid signature'
      });
    });

    it('should accept valid Stripe signature', async () => {
      const payload = JSON.stringify({
        type: 'customer.subscription.created',
        data: { object: mockSubscription }
      });
      const signature = generateStripeSignature(
        payload,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const response = await POST({
        body: payload,
        headers: { 'stripe-signature': signature }
      });

      expect(response.status).toBe(200);
    });

    it('should reject signature with wrong secret', async () => {
      const payload = JSON.stringify({ type: 'test' });
      const signature = generateStripeSignature(
        payload,
        'wrong_secret'
      );

      const response = await POST({
        body: payload,
        headers: { 'stripe-signature': signature }
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Subscription Created', () => {
    it('should create subscription in database', async () => {
      const event = createStripeEvent('customer.subscription.created', {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        items: {
          data: [{
            price: {
              id: 'price_123',
              unit_amount: 1900, // 19€
            },
            current_period_start: 1703001600,
            current_period_end: 1705593600,
          }]
        },
        metadata: {
          city_slug: 'bratislava',
          taxi_service_name: 'Test Taxi'
        }
      });

      await POST(event);

      const subscription = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', 'sub_123')
        .single();

      expect(subscription.data).toMatchObject({
        stripe_subscription_id: 'sub_123',
        plan_type: 'basic',
        amount_cents: 1900,
        status: 'active',
        city_slug: 'bratislava',
        taxi_service_name: 'Test Taxi'
      });
    });

    it('should map amount to correct plan type', async () => {
      const testCases = [
        { amount: 1900, plan: 'basic' },
        { amount: 2900, plan: 'premium' },
        { amount: 4900, plan: 'pro' },
      ];

      for (const { amount, plan } of testCases) {
        const event = createSubscriptionEvent(amount);
        await POST(event);

        const sub = await getSubscriptionFromDB(event.data.object.id);
        expect(sub.plan_type).toBe(plan);
      }
    });

    it('should handle subscription without metadata', async () => {
      const event = createStripeEvent('customer.subscription.created', {
        id: 'sub_456',
        metadata: {} // Empty metadata
      });

      const response = await POST(event);

      expect(response.status).toBe(200);
      const sub = await getSubscriptionFromDB('sub_456');
      expect(sub.city_slug).toBe('unknown');
      expect(sub.taxi_service_name).toBe('Unknown Service');
    });
  });

  describe('Subscription Updated', () => {
    it('should update existing subscription', async () => {
      // Create initial subscription
      await createTestSubscription({
        id: 'sub_789',
        status: 'active'
      });

      // Update subscription
      const event = createStripeEvent('customer.subscription.updated', {
        id: 'sub_789',
        status: 'past_due',
        cancel_at_period_end: true
      });

      await POST(event);

      const sub = await getSubscriptionFromDB('sub_789');
      expect(sub.status).toBe('past_due');
      expect(sub.cancel_at_period_end).toBe(true);
    });

    it('should update period dates on renewal', async () => {
      await createTestSubscription({ id: 'sub_999' });

      const newPeriodStart = Math.floor(Date.now() / 1000);
      const newPeriodEnd = newPeriodStart + (30 * 24 * 60 * 60); // +30 days

      const event = createSubscriptionUpdatedEvent({
        id: 'sub_999',
        current_period_start: newPeriodStart,
        current_period_end: newPeriodEnd
      });

      await POST(event);

      const sub = await getSubscriptionFromDB('sub_999');
      expect(new Date(sub.current_period_start).getTime())
        .toBe(newPeriodStart * 1000);
      expect(new Date(sub.current_period_end).getTime())
        .toBe(newPeriodEnd * 1000);
    });
  });

  describe('Subscription Deleted', () => {
    it('should mark subscription as cancelled', async () => {
      await createTestSubscription({
        id: 'sub_cancelled',
        status: 'active'
      });

      const event = createStripeEvent('customer.subscription.deleted', {
        id: 'sub_cancelled',
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000)
      });

      await POST(event);

      const sub = await getSubscriptionFromDB('sub_cancelled');
      expect(sub.status).toBe('canceled');
      expect(sub.canceled_at).toBeTruthy();
    });

    it('should handle deletion of non-existent subscription', async () => {
      const event = createStripeEvent('customer.subscription.deleted', {
        id: 'sub_nonexistent'
      });

      const response = await POST(event);

      // Should not crash, log warning
      expect(response.status).toBe(200);
    });
  });

  describe('Invoice Paid', () => {
    it('should record successful payment', async () => {
      const event = createStripeEvent('invoice.paid', {
        id: 'inv_123',
        subscription: 'sub_123',
        amount_paid: 1900,
        status: 'paid'
      });

      await POST(event);

      // Verify payment recorded
      const payment = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_invoice_id', 'inv_123')
        .single();

      expect(payment.data).toMatchObject({
        amount_cents: 1900,
        status: 'paid'
      });
    });
  });

  describe('Invoice Payment Failed', () => {
    it('should record failed payment', async () => {
      const event = createStripeEvent('invoice.payment_failed', {
        id: 'inv_failed',
        subscription: 'sub_123',
        attempt_count: 2
      });

      await POST(event);

      const payment = await getPaymentFromDB('inv_failed');
      expect(payment.status).toBe('failed');
      expect(payment.attempt_count).toBe(2);
    });

    it('should update subscription status on payment failure', async () => {
      await createTestSubscription({
        id: 'sub_fail',
        status: 'active'
      });

      const event = createStripeEvent('invoice.payment_failed', {
        subscription: 'sub_fail'
      });

      await POST(event);

      const sub = await getSubscriptionFromDB('sub_fail');
      expect(sub.status).toBe('past_due');
    });
  });

  describe('Unhandled Events', () => {
    it('should log unhandled event types', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const event = createStripeEvent('payment_intent.created', {});
      await POST(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unhandled event type: payment_intent.created')
      );
    });

    it('should return 200 for unhandled events', async () => {
      const event = createStripeEvent('customer.created', {});
      const response = await POST(event);

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        received: true
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      vi.spyOn(supabase.from('subscriptions'), 'upsert')
        .mockRejectedValueOnce(new Error('DB error'));

      const event = createSubscriptionEvent();
      const response = await POST(event);

      expect(response.status).toBe(500);
      expect(await response.json()).toMatchObject({
        error: 'Webhook processing failed'
      });
    });

    it('should log processing errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      vi.spyOn(supabase.from('subscriptions'), 'upsert')
        .mockRejectedValueOnce(new Error('Test error'));

      const event = createSubscriptionEvent();
      await POST(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error processing webhook:',
        expect.any(Error)
      );
    });
  });

  describe('Idempotency', () => {
    it('should handle duplicate webhook delivery', async () => {
      const event = createSubscriptionEvent({ id: 'sub_idempotent' });

      // First delivery
      await POST(event);
      // Second delivery (duplicate)
      await POST(event);

      // Should have only one record
      const subs = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', 'sub_idempotent');

      expect(subs.data).toHaveLength(1);
    });
  });
});
```

---

### 3. `/api/partner/inline-edit/save` (POST)

**Security concerns:**
- Authorization (user ownership)
- Input sanitization
- Field whitelisting
- Type coercion attacks

**Navrhované testy:**

```typescript
// app/api/partner/inline-edit/save/route.test.ts

describe('POST /api/partner/inline-edit/save', () => {

  describe('Authentication & Authorization', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await POST({
        partner_id: 1,
        changes: { company_name: 'Test' }
      }, { authenticated: false });

      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({
        success: false,
        error: 'Unauthorized'
      });
    });

    it('should return 403 when user is not partner owner', async () => {
      const partner = await createTestPartner({ user_id: 'user_123' });

      const response = await POST({
        partner_id: partner.id,
        changes: { company_name: 'Test' }
      }, { user_id: 'user_456' }); // Different user

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        success: false,
        error: 'Not owner or partner not found'
      });
    });

    it('should allow owner to edit their partner', async () => {
      const partner = await createTestPartner({ user_id: 'user_789' });

      const response = await POST({
        partner_id: partner.id,
        changes: { company_name: 'Updated Name' }
      }, { user_id: 'user_789' });

      expect(response.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    it('should return 400 when partner_id is missing', async () => {
      const response = await POST({
        changes: { company_name: 'Test' }
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'partner_id is required'
      });
    });

    it('should return 400 when changes object is empty', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: {}
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'No changes provided'
      });
    });

    it('should return 400 when changes is missing', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Field Whitelisting', () => {
    it('should only save allowed fields', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: {
          company_name: 'Allowed',
          id: 999, // NOT ALLOWED
          user_id: 'hacker', // NOT ALLOWED
          created_at: '2020-01-01' // NOT ALLOWED
        }
      });

      expect(response.status).toBe(200);

      const draft = await getDraftFromDB(response.json().draft_id);
      expect(draft.company_name).toBe('Allowed');
      expect(draft.id).not.toBe(999);
      expect(draft.user_id).not.toBe('hacker');
    });

    it('should reject all changes if no valid fields', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: {
          id: 999,
          user_id: 'hacker'
        }
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'No valid fields to update'
      });
    });

    it('should allow all whitelisted fields', async () => {
      const allowedFields = [
        'company_name',
        'description',
        'show_description',
        'phone',
        'email',
        'website',
        'hero_title',
        'hero_subtitle',
        'hero_image_url',
        'services',
        'gallery',
        'template_variant'
      ];

      const partner = await createTestPartner();
      const changes = Object.fromEntries(
        allowedFields.map(f => [f, 'test_value'])
      );

      const response = await POST({
        partner_id: partner.id,
        changes
      });

      expect(response.status).toBe(200);
    });
  });

  describe('URL Field Validation', () => {
    const urlFields = [
      'website',
      'booking_url',
      'pricelist_url',
      'hero_image_url'
    ];

    urlFields.forEach(field => {
      it(`should accept valid HTTPS URL in ${field}`, async () => {
        const partner = await createTestPartner();

        const response = await POST({
          partner_id: partner.id,
          changes: { [field]: 'https://example.com' }
        });

        expect(response.status).toBe(200);
      });

      it(`should accept valid HTTP URL in ${field}`, async () => {
        const partner = await createTestPartner();

        const response = await POST({
          partner_id: partner.id,
          changes: { [field]: 'http://example.com' }
        });

        expect(response.status).toBe(200);
      });

      it(`should accept empty string in ${field}`, async () => {
        const partner = await createTestPartner();

        const response = await POST({
          partner_id: partner.id,
          changes: { [field]: '' }
        });

        expect(response.status).toBe(200);
      });

      it(`should reject invalid URL in ${field}`, async () => {
        const partner = await createTestPartner();

        const response = await POST({
          partner_id: partner.id,
          changes: { [field]: 'not-a-url' }
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: expect.stringContaining('must be a valid URL')
        });
      });

      it(`should reject javascript: URL in ${field}`, async () => {
        const partner = await createTestPartner();

        const response = await POST({
          partner_id: partner.id,
          changes: { [field]: 'javascript:alert(1)' }
        });

        expect(response.status).toBe(400);
      });
    });
  });

  describe('Type Coercion', () => {
    it('should convert hero_image_zoom to integer', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { hero_image_zoom: '150.7' } // String
      });

      expect(response.status).toBe(200);
      const draft = await getDraftFromDB(response.json().draft_id);
      expect(draft.hero_image_zoom).toBe(151); // Rounded integer
    });

    it('should convert hero_image_pos_x/y to integer', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: {
          hero_image_pos_x: '50.9',
          hero_image_pos_y: '75.2'
        }
      });

      const draft = await getDraftFromDB(response.json().draft_id);
      expect(draft.hero_image_pos_x).toBe(51);
      expect(draft.hero_image_pos_y).toBe(75);
    });

    it('should handle NaN gracefully for numeric fields', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { hero_image_zoom: 'not-a-number' }
      });

      const draft = await getDraftFromDB(response.json().draft_id);
      expect(draft.hero_image_zoom).toBe(0); // Falls back to 0
    });
  });

  describe('Array Field Validation', () => {
    it('should accept valid string array for services', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { services: ['Airport', 'City tours', 'Delivery'] }
      });

      expect(response.status).toBe(200);
    });

    it('should reject non-array for services', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { services: 'not-an-array' }
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: expect.stringContaining('must be an array of strings')
      });
    });

    it('should reject array with non-string items', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { services: ['Valid', 123, { invalid: true }] }
      });

      expect(response.status).toBe(400);
    });

    it('should accept empty array for gallery', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { gallery: [] }
      });

      expect(response.status).toBe(200);
    });
  });

  describe('WhatsApp Validation', () => {
    it('should accept valid phone number', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { whatsapp: '+421 123 456 789' }
      });

      expect(response.status).toBe(200);
    });

    it('should accept number without spaces', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { whatsapp: '+421123456789' }
      });

      expect(response.status).toBe(200);
    });

    it('should reject letters in whatsapp', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { whatsapp: '+421abc123' }
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: expect.stringContaining('only numbers, + and spaces')
      });
    });

    it('should accept empty string', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { whatsapp: '' }
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Template Variant Validation', () => {
    it('should accept valid template variant', async () => {
      const partner = await createTestPartner();

      const validVariants = ['classic', 'modern', 'minimal'];

      for (const variant of validVariants) {
        const response = await POST({
          partner_id: partner.id,
          changes: { template_variant: variant }
        });

        expect(response.status).toBe(200);
      }
    });

    it('should reject invalid template variant', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { template_variant: 'invalid_variant' }
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: expect.stringContaining('valid template option')
      });
    });
  });

  describe('Draft Creation vs Update', () => {
    it('should create new draft when draft_id is not provided', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: { company_name: 'New Draft' }
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.draft_id).toBeTruthy();

      const draft = await getDraftFromDB(json.draft_id);
      expect(draft.status).toBe('draft');
      expect(draft.company_name).toBe('New Draft');
    });

    it('should update existing draft when draft_id provided', async () => {
      const partner = await createTestPartner();
      const existingDraft = await createTestDraft({
        partner_id: partner.id,
        company_name: 'Original'
      });

      const response = await POST({
        partner_id: partner.id,
        draft_id: existingDraft.id,
        changes: { company_name: 'Updated' }
      });

      expect(response.status).toBe(200);

      const draft = await getDraftFromDB(existingDraft.id);
      expect(draft.company_name).toBe('Updated');
    });

    it('should NOT change status when updating approved draft', async () => {
      const partner = await createTestPartner();
      const approvedDraft = await createTestDraft({
        partner_id: partner.id,
        status: 'approved'
      });

      const response = await POST({
        partner_id: partner.id,
        draft_id: approvedDraft.id,
        changes: { company_name: 'Edit After Approval' }
      });

      const draft = await getDraftFromDB(approvedDraft.id);
      expect(draft.status).toBe('approved'); // Still approved!
      expect(draft.company_name).toBe('Edit After Approval');
    });

    it('should update updated_at timestamp', async () => {
      const partner = await createTestPartner();
      const draft = await createTestDraft({ partner_id: partner.id });

      const originalUpdatedAt = draft.updated_at;

      await new Promise(resolve => setTimeout(resolve, 100));

      await POST({
        partner_id: partner.id,
        draft_id: draft.id,
        changes: { company_name: 'Update' }
      });

      const updated = await getDraftFromDB(draft.id);
      expect(new Date(updated.updated_at).getTime())
        .toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should return all validation errors at once', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        changes: {
          website: 'not-a-url',
          whatsapp: 'invalid-phone-abc',
          template_variant: 'invalid'
        }
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('website');
      expect(json.error).toContain('whatsapp');
      expect(json.error).toContain('template_variant');
    });
  });

  describe('Database Errors', () => {
    it('should handle insert error gracefully', async () => {
      const partner = await createTestPartner();

      vi.spyOn(supabase.from('partner_drafts'), 'insert')
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') });

      const response = await POST({
        partner_id: partner.id,
        changes: { company_name: 'Test' }
      });

      expect(response.status).toBe(500);
    });

    it('should handle update error gracefully', async () => {
      const partner = await createTestPartner();
      const draft = await createTestDraft({ partner_id: partner.id });

      vi.spyOn(supabase.from('partner_drafts'), 'update')
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') });

      const response = await POST({
        partner_id: partner.id,
        draft_id: draft.id,
        changes: { company_name: 'Test' }
      });

      expect(response.status).toBe(500);
    });

    it('should log errors for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const partner = await createTestPartner();

      vi.spyOn(supabase.from('partner_drafts'), 'insert')
        .mockResolvedValueOnce({ data: null, error: new Error('Test error') });

      await POST({
        partner_id: partner.id,
        changes: { company_name: 'Test' }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[inline-edit/save] Insert error:',
        expect.any(Error)
      );
    });
  });
});
```

---

### 4. `/api/partner/inline-edit/publish` (POST)

**Navrhované testy:**

```typescript
// app/api/partner/inline-edit/publish/route.test.ts

describe('POST /api/partner/inline-edit/publish', () => {

  describe('Authentication & Authorization', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await POST({
        partner_id: 1,
        draft_id: 'draft_123'
      }, { authenticated: false });

      expect(response.status).toBe(401);
    });

    it('should return 403 when not owner', async () => {
      const partner = await createTestPartner({ user_id: 'user_1' });
      const draft = await createTestDraft({ partner_id: partner.id });

      const response = await POST({
        partner_id: partner.id,
        draft_id: draft.id
      }, { user_id: 'user_2' });

      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('should require partner_id', async () => {
      const response = await POST({
        draft_id: 'draft_123'
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: 'partner_id and draft_id are required'
      });
    });

    it('should require draft_id', async () => {
      const response = await POST({
        partner_id: 1
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Publishing', () => {
    it('should update draft status to approved', async () => {
      const partner = await createTestPartner();
      const draft = await createTestDraft({
        partner_id: partner.id,
        status: 'draft'
      });

      const response = await POST({
        partner_id: partner.id,
        draft_id: draft.id
      });

      expect(response.status).toBe(200);

      const updated = await getDraftFromDB(draft.id);
      expect(updated.status).toBe('approved');
    });

    it('should set submitted_at timestamp', async () => {
      const partner = await createTestPartner();
      const draft = await createTestDraft({ partner_id: partner.id });

      await POST({
        partner_id: partner.id,
        draft_id: draft.id
      });

      const updated = await getDraftFromDB(draft.id);
      expect(updated.submitted_at).toBeTruthy();
    });

    it('should set reviewed_at timestamp (self-approved)', async () => {
      const partner = await createTestPartner();
      const draft = await createTestDraft({ partner_id: partner.id });

      await POST({
        partner_id: partner.id,
        draft_id: draft.id
      });

      const updated = await getDraftFromDB(draft.id);
      expect(updated.reviewed_at).toBeTruthy();
    });

    it('should return 404 when draft not found', async () => {
      const partner = await createTestPartner();

      const response = await POST({
        partner_id: partner.id,
        draft_id: 'nonexistent_draft'
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({
        error: 'Draft not found or already published'
      });
    });
  });

  describe('Cache Revalidation', () => {
    it('should revalidate partner page', async () => {
      const partner = await createTestPartner({
        city_slug: 'bratislava',
        slug: 'test-taxi'
      });
      const draft = await createTestDraft({ partner_id: partner.id });

      const revalidateSpy = vi.spyOn(revalidatePath);

      await POST({
        partner_id: partner.id,
        draft_id: draft.id
      });

      expect(revalidateSpy).toHaveBeenCalledWith(
        '/taxi/bratislava/test-taxi'
      );
    });

    it('should return revalidated path in response', async () => {
      const partner = await createTestPartner({
        city_slug: 'kosice',
        slug: 'kosice-taxi'
      });
      const draft = await createTestDraft({ partner_id: partner.id });

      const response = await POST({
        partner_id: partner.id,
        draft_id: draft.id
      });

      expect(await response.json()).toMatchObject({
        success: true,
        revalidated: true,
        path: '/taxi/kosice/kosice-taxi'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database error', async () => {
      const partner = await createTestPartner();
      const draft = await createTestDraft({ partner_id: partner.id });

      vi.spyOn(supabase.from('partner_drafts'), 'update')
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') });

      const response = await POST({
        partner_id: partner.id,
        draft_id: draft.id
      });

      expect(response.status).toBe(500);
    });

    it('should log errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const partner = await createTestPartner();

      vi.spyOn(supabase, 'from').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await POST({
        partner_id: partner.id,
        draft_id: 'draft_123'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[inline-edit/publish] Unexpected error:',
        expect.any(Error)
      );
    });
  });
});
```

---

### 5. `/api/partner/inline-edit/draft/[slug]` (GET)

**Navrhované testy:**

```typescript
// app/api/partner/inline-edit/draft/[slug]/route.test.ts

describe('GET /api/partner/inline-edit/draft/[slug]', () => {

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await GET({ slug: 'test-taxi' }, { authenticated: false });

      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({
        success: false,
        error: 'Unauthorized',
        isOwner: false
      });
    });
  });

  describe('Ownership Check', () => {
    it('should return 403 when user is not owner', async () => {
      const partner = await createTestPartner({
        slug: 'test-taxi',
        user_id: 'user_123'
      });

      const response = await GET(
        { slug: 'test-taxi' },
        { user_id: 'user_456' }
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        success: false,
        error: 'Not owner',
        isOwner: false
      });
    });

    it('should allow owner to access', async () => {
      const partner = await createTestPartner({
        slug: 'my-taxi',
        user_id: 'user_789'
      });

      const response = await GET(
        { slug: 'my-taxi' },
        { user_id: 'user_789' }
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        success: true,
        isOwner: true
      });
    });
  });

  describe('Partner Lookup', () => {
    it('should return 404 when partner not found', async () => {
      const response = await GET({ slug: 'nonexistent' });

      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({
        success: false,
        error: 'Partner not found'
      });
    });

    it('should return partner data', async () => {
      const partner = await createTestPartner({
        slug: 'test-taxi',
        name: 'Test Taxi Service',
        city_slug: 'bratislava'
      });

      const response = await GET({ slug: 'test-taxi' });

      const json = await response.json();
      expect(json.partner).toMatchObject({
        id: partner.id,
        name: 'Test Taxi Service',
        slug: 'test-taxi',
        city_slug: 'bratislava'
      });
    });
  });

  describe('Draft Loading', () => {
    it('should return null when no drafts exist', async () => {
      const partner = await createTestPartner({ slug: 'no-drafts' });

      const response = await GET({ slug: 'no-drafts' });

      expect(await response.json()).toMatchObject({
        success: true,
        draft: null
      });
    });

    it('should return latest draft when multiple exist', async () => {
      const partner = await createTestPartner({ slug: 'multi-drafts' });

      await createTestDraft({
        partner_id: partner.id,
        company_name: 'Old Draft',
        updated_at: '2024-01-01T00:00:00Z'
      });

      await createTestDraft({
        partner_id: partner.id,
        company_name: 'Latest Draft',
        updated_at: '2024-12-24T00:00:00Z'
      });

      const response = await GET({ slug: 'multi-drafts' });
      const json = await response.json();

      expect(json.draft.company_name).toBe('Latest Draft');
    });

    it('should include all draft fields', async () => {
      const partner = await createTestPartner({ slug: 'full-draft' });

      await createTestDraft({
        partner_id: partner.id,
        company_name: 'Full Taxi',
        description: 'Best taxi service',
        phone: '+421123456789',
        email: 'info@fulltaxi.sk',
        website: 'https://fulltaxi.sk',
        services: ['Airport', 'City'],
        gallery: ['img1.jpg', 'img2.jpg'],
        template_variant: 'modern'
      });

      const response = await GET({ slug: 'full-draft' });
      const json = await response.json();

      expect(json.draft).toMatchObject({
        company_name: 'Full Taxi',
        description: 'Best taxi service',
        phone: '+421123456789',
        services: ['Airport', 'City'],
        gallery: ['img1.jpg', 'img2.jpg'],
        template_variant: 'modern'
      });
    });

    it('should include draft status', async () => {
      const partner = await createTestPartner({ slug: 'status-test' });

      await createTestDraft({
        partner_id: partner.id,
        status: 'approved'
      });

      const response = await GET({ slug: 'status-test' });
      const json = await response.json();

      expect(json.draft.status).toBe('approved');
    });

    it('should include timestamps', async () => {
      const partner = await createTestPartner({ slug: 'timestamps' });

      await createTestDraft({
        partner_id: partner.id,
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-24T00:00:00Z'
      });

      const response = await GET({ slug: 'timestamps' });
      const json = await response.json();

      expect(json.draft.created_at).toBeTruthy();
      expect(json.draft.updated_at).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      vi.spyOn(supabase.from('partners'), 'select')
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') });

      const response = await GET({ slug: 'error-test' });

      expect(response.status).toBe(404);
    });

    it('should log errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error');

      vi.spyOn(supabase, 'from').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await GET({ slug: 'crash-test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[inline-edit/draft] Unexpected error:',
        expect.any(Error)
      );
    });

    it('should return 500 on unexpected errors', async () => {
      vi.spyOn(supabase, 'from').mockImplementation(() => {
        throw new Error('Crash');
      });

      const response = await GET({ slug: 'crash' });

      expect(response.status).toBe(500);
      expect(await response.json()).toMatchObject({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
```

---

## 🛠️ Test Infrastructure Setup

### Test Helper Functions

Vytvoriť `src/test/api-helpers.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

// Mock Supabase client
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };
}

// Mock authenticated request
export function createAuthenticatedRequest(user_id: string) {
  return {
    user_id,
    authenticated: true
  };
}

// Test data factories
export async function createTestPartner(data: Partial<Partner> = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: data.user_id || 'test_user',
    slug: data.slug || 'test-taxi',
    name: data.name || 'Test Taxi',
    city_slug: data.city_slug || 'bratislava',
    ...data
  };
}

export async function createTestDraft(data: Partial<PartnerDraft> = {}) {
  return {
    id: crypto.randomUUID(),
    partner_id: data.partner_id!,
    status: data.status || 'draft',
    updated_at: data.updated_at || new Date().toISOString(),
    created_at: data.created_at || new Date().toISOString(),
    ...data
  };
}

// Stripe helpers
export function generateStripeSignature(payload: string, secret: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

export function createStripeEvent(type: string, data: any) {
  return {
    id: `evt_${crypto.randomUUID()}`,
    type,
    data: { object: data },
    created: Math.floor(Date.now() / 1000)
  };
}
```

---

## 📋 Prioritizácia implementácie

### Fáza 1: Kritické bezpečnostné testy (1-2 dni)
1. ✅ `/api/admin/login` - Rate limiting a auth
2. ✅ `/api/partner/inline-edit/save` - Input sanitization
3. ✅ `/api/webhooks/stripe` - Signature verification

### Fáza 2: Business logic testy (2-3 dni)
4. ✅ `/api/partner/inline-edit/publish`
5. ✅ `/api/partner/inline-edit/draft/[slug]`
6. ✅ `/api/admin/partner-drafts`
7. ✅ `/api/partner/upload-image`

### Fáza 3: Pomocné endpointy (1 deň)
8. ✅ `/api/admin/cities`
9. ✅ `/api/admin/revenue`
10. ✅ `/api/contact`

---

## 🎓 Test Coverage Metriky

Po implementácii všetkých testov by mali byť dosiahnuté:

- **Statement Coverage:** > 80%
- **Branch Coverage:** > 75%
- **Function Coverage:** > 90%
- **Critical Path Coverage:** 100%

Spustiť coverage report:
```bash
npm run test -- --coverage
```

---

## 🚀 Ďalšie kroky

1. **Setup CI/CD**: Integrovať testy do GitHub Actions
2. **Pre-commit hooks**: Spustiť testy pred commitom
3. **Integration tests**: E2E testy s reálnou databázou
4. **Load testing**: Performance testy pre webhooks
5. **Security scanning**: Automatické security audity

---

**Autor:** Claude Code Expert
**Projekt:** Taxi Vision Studio
**Verzia:** 1.0
