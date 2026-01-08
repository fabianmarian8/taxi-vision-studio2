# Cloudflare Worker Prerendering for taxinearme.sk

This Cloudflare Worker provides prerendering functionality for search engine bots, ensuring they receive fully rendered HTML with proper meta tags and structured data.

## How It Works

1. **Bot Detection**: Detects search engine crawlers (Googlebot, Bingbot, etc.) and social media link expanders
2. **Caching**: Caches prerendered HTML at the edge for 10 minutes with stale-while-revalidate for 24 hours
3. **Fallback**: Serves the normal React SPA to human visitors

## Deployment Options

### Option 1: Deploy via Cloudflare Dashboard (Recommended for First Time)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account and the `taxinearme.sk` domain
3. Navigate to **Workers & Pages** > **Create Application** > **Create Worker**
4. Name it `taxinearme-prerender`
5. Click **Deploy**
6. Click **Edit Code**
7. Copy the contents of `prerender-worker.js` and paste it into the editor
8. Click **Save and Deploy**
9. Go to **Settings** > **Triggers** > **Add Route**
10. Add routes:
    - `www.taxinearme.sk/*`
    - `taxinearme.sk/*`
11. Select zone: `taxinearme.sk`
12. Click **Save**

### Option 2: Deploy via Wrangler CLI

```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
cd cloudflare-worker
wrangler deploy
```

### Option 3: Deploy via Cloudflare API (Automated)

Use the Cloudflare API with your existing `CLOUDFLARE_API_TOKEN`:

```bash
# Set your API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Deploy using the provided script
node deploy-worker.js
```

## Testing

### Test Bot Detection

```bash
# Test as Googlebot
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -H "Accept: text/html" \
  https://www.taxinearme.sk/taxi/bratislava

# Test as normal user
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -H "Accept: text/html" \
  https://www.taxinearme.sk/taxi/bratislava
```

### Verify Prerendering

Check response headers:
- `X-Prerendered: true` - Indicates the response was prerendered
- `X-Prerender-Cache: HIT/MISS` - Cache status

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Use **URL Inspection** tool
4. Test a URL (e.g., `https://www.taxinearme.sk/taxi/bratislava`)
5. Click **Test Live URL**
6. Check **View Crawled Page** to see what Googlebot sees

## Monitoring

### Cloudflare Analytics

- Go to **Workers & Pages** > **taxinearme-prerender** > **Metrics**
- Monitor:
  - Requests per second
  - Success rate
  - CPU time
  - Cache hit ratio

### Expected Metrics

- **Cache hit ratio**: 80-95% (after warm-up)
- **Response time**: < 100ms (cached), < 2s (uncached)
- **Success rate**: > 99%

## Troubleshooting

### Worker Not Triggering

- Check routes are correctly configured
- Verify zone name matches your domain
- Ensure worker is deployed and enabled

### Bots Not Getting Prerendered Content

- Check bot user agent detection logic
- Verify `Accept: text/html` header is present
- Check worker logs in Cloudflare Dashboard

### High Cache Miss Rate

- Increase cache TTL in worker code
- Prewarm cache for important pages
- Check if query parameters are causing cache misses

## Next Steps

### Phase 2: Full Rendering with Browser Rendering API

Currently, the worker caches the original HTML. For full prerendering with React hydration, you can:

1. **Enable Cloudflare Browser Rendering** (requires paid plan)
2. Update worker to use `@cloudflare/puppeteer`
3. Fully render React app before serving to bots

Example code:

```javascript
import puppeteer from '@cloudflare/puppeteer';

// In the worker fetch handler
const browser = await puppeteer.launch(env.BROWSER);
const page = await browser.newPage();
await page.goto(url.toString(), { waitUntil: 'networkidle0' });
const html = await page.content();
await browser.close();
```

### Phase 3: Optimize Caching Strategy

- Implement route-specific TTLs
- Add cache warming for popular pages
- Use KV or R2 for persistent snapshots

## Cost Estimation

### Free Plan Limits
- 100,000 requests/day
- 10ms CPU time per request
- Sufficient for most small to medium sites

### Paid Plan (Workers Paid)
- $5/month
- 10 million requests/month included
- Additional requests: $0.50 per million

For taxinearme.sk with 885 pages and moderate traffic, the **Free plan should be sufficient** initially.

## Support

For issues or questions:
1. Check Cloudflare Workers documentation
2. Review worker logs in dashboard
3. Test with curl commands above
4. Contact Cloudflare support if needed
