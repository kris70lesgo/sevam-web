const CART_STORAGE_KEY = 'sevam_service_cart';
const CART_COOKIE_KEY = 'sevam_service_cart_cookie';
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function readCartRaw(): string {
  if (typeof window === 'undefined') return '';

  const localRaw = window.localStorage.getItem(CART_STORAGE_KEY) ?? '';
  if (localRaw.trim()) return localRaw;

  return readCookie(CART_COOKIE_KEY);
}

export function writeCartRaw(raw: string) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(CART_STORAGE_KEY, raw);
  document.cookie = `${CART_COOKIE_KEY}=${encodeURIComponent(raw)}; path=/; max-age=${CART_COOKIE_MAX_AGE}; samesite=lax`;
}

export async function syncCartRawToServer(raw: string) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/customer/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
      cache: 'no-store',
    });
  } catch {
    // Non-blocking best-effort sync.
  }
}

export function clearCartRaw() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(CART_STORAGE_KEY);
  document.cookie = `${CART_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export { CART_STORAGE_KEY };
