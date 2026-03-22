require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('ENV_CHECK', JSON.stringify({
  url: Boolean(url),
  anon: Boolean(anon),
  service: Boolean(service),
}));

if (!url || !service) {
  console.log('SUPABASE_ADMIN_CHECK', 'FAIL', 'Missing required env vars');
  process.exit(2);
}

(async () => {
  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.storage.listBuckets();

  if (error) {
    console.log('SUPABASE_ADMIN_CHECK', 'FAIL', error.message);
    process.exit(1);
  }

  console.log('SUPABASE_ADMIN_CHECK', 'OK', `buckets:${Array.isArray(data) ? data.length : 'n/a'}`);
})();
