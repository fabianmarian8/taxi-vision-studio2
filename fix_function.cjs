const https = require('https');

const SQL = `
DROP FUNCTION IF EXISTS get_approved_partner_data(text);

CREATE OR REPLACE FUNCTION get_approved_partner_data(p_slug TEXT)
RETURNS TABLE (
  company_name TEXT,
  description TEXT,
  show_description BOOLEAN,
  phone TEXT,
  email TEXT,
  website TEXT,
  hero_image_url TEXT,
  hero_image_zoom INTEGER,
  hero_image_pos_x INTEGER,
  hero_image_pos_y INTEGER,
  hero_title TEXT,
  hero_subtitle TEXT,
  banner_title TEXT,
  banner_subtitle TEXT,
  services TEXT[],
  services_description TEXT,
  show_services BOOLEAN,
  gallery TEXT[],
  social_facebook TEXT,
  social_instagram TEXT,
  whatsapp TEXT,
  booking_url TEXT,
  pricelist_url TEXT,
  transport_rules_url TEXT,
  contact_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.company_name,
    pd.description,
    pd.show_description,
    pd.phone,
    pd.email,
    pd.website,
    pd.hero_image_url,
    pd.hero_image_zoom,
    pd.hero_image_pos_x,
    pd.hero_image_pos_y,
    pd.hero_title,
    pd.hero_subtitle,
    pd.banner_title,
    pd.banner_subtitle,
    pd.services,
    pd.services_description,
    pd.show_services,
    pd.gallery,
    pd.social_facebook,
    pd.social_instagram,
    pd.whatsapp,
    pd.booking_url,
    pd.pricelist_url,
    pd.transport_rules_url,
    pd.contact_url
  FROM partner_drafts pd
  INNER JOIN partners p ON pd.partner_id = p.id
  WHERE p.slug = p_slug
    AND pd.status = 'approved'
  ORDER BY pd.updated_at DESC
  LIMIT 1;
END;
$$;
`;

const data = JSON.stringify({ query: SQL });

const options = {
  hostname: 'kkuybturazislquqaxci.supabase.co',
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdXlidHVyYXppc2xxdXFheGNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg4NDkzMSwiZXhwIjoyMDY5NDYwOTMxfQ.gjhAliUYpwQCQxvjDO4Cxqch0O1DGHLsdDGPJqyE9Rc',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdXlidHVyYXppc2xxdXFheGNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg4NDkzMSwiZXhwIjoyMDY5NDYwOTMxfQ.gjhAliUYpwQCQxvjDO4Cxqch0O1DGHLsdDGPJqyE9Rc',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
