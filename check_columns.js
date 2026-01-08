const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kkuybturazislquqaxci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdXlidHVyYXppc2xxdXFheGNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg4NDkzMSwiZXhwIjoyMDY5NDYwOTMxfQ.gjhAliUYpwQCQxvjDO4Cxqch0O1DGHLsdDGPJqyE9Rc'
);

async function main() {
  // Check if columns exist
  const { data, error } = await supabase
    .from('partner_drafts')
    .select('whatsapp, booking_url, email')
    .limit(1);

  if (error) {
    console.log('Columns check error:', error.message);
  } else {
    console.log('Columns exist! Data:', JSON.stringify(data));
  }
}

main();
