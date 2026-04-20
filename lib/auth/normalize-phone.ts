/**
 * Resolve phone identity used by auth sync APIs.
 * Falls back to a synthetic oauth_ identifier when provider phone is absent.
 */
export function normalizeAuthPhone(input?: string | null, fallbackUserId?: string): string {
  const raw = (input ?? '').trim();
  if (raw) return raw;
  if (fallbackUserId) return `oauth_${fallbackUserId}`;
  return '';
}

export function isSyntheticPhone(phone: string): boolean {
  return phone.startsWith('oauth_');
}