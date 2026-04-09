#!/usr/bin/env node

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function testServicesCatalog() {
  const response = await fetch(`${BASE_URL}/api/services/catalog`, { method: 'GET' });
  assert(response.ok, `services/catalog failed with status ${response.status}`);

  const payload = await response.json();
  assert(Array.isArray(payload?.categories), 'services/catalog missing categories array');

  if (payload.categories.length > 0) {
    const firstCategory = payload.categories[0];
    assert(typeof firstCategory.name === 'string', 'first category missing name');
    assert(Array.isArray(firstCategory.services), 'first category missing services array');
  }

  return { categories: payload.categories.length };
}

async function testCartApi() {
  const sampleCart = [
    { id: 'svc_1', name: 'Plumbing Service', price: 299, quantity: 2 },
    { id: 'svc_2', name: 'Cleaning Service', price: 499, quantity: 1 },
  ];

  const postRes = await fetch(`${BASE_URL}/api/customer/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: JSON.stringify(sampleCart) }),
  });

  assert(postRes.ok, `customer/cart POST failed with status ${postRes.status}`);
  const postPayload = await postRes.json();
  assert(postPayload?.ok === true, 'customer/cart POST did not return ok=true');
  assert(postPayload?.summary?.itemCount === 3, 'customer/cart POST summary itemCount mismatch');
  assert(postPayload?.summary?.subtotal === 1097, 'customer/cart POST summary subtotal mismatch');

  const setCookie = postRes.headers.get('set-cookie') || '';
  assert(setCookie.includes('sevam_service_cart_cookie='), 'customer/cart POST did not set cart cookie');

  const getRes = await fetch(`${BASE_URL}/api/customer/cart`, {
    method: 'GET',
    headers: {
      Cookie: setCookie,
    },
  });

  assert(getRes.ok, `customer/cart GET failed with status ${getRes.status}`);
  const getPayload = await getRes.json();
  assert(Array.isArray(getPayload?.items), 'customer/cart GET missing items');
  assert(getPayload?.summary?.itemCount === 3, 'customer/cart GET summary itemCount mismatch');

  return getPayload.summary;
}

async function main() {
  console.log(`Running checkout API tests against ${BASE_URL}`);

  const catalog = await testServicesCatalog();
  console.log(`PASS /api/services/catalog categories=${catalog.categories}`);

  const cart = await testCartApi();
  console.log(`PASS /api/customer/cart itemCount=${cart.itemCount} subtotal=${cart.subtotal}`);

  console.log('All checkout API tests passed.');
}

main().catch((error) => {
  console.error('Checkout API tests failed:');
  console.error(error?.message || error);
  process.exit(1);
});
