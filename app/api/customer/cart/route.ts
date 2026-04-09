import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const CART_COOKIE_KEY = 'sevam_service_cart_cookie';
const CART_MAX_AGE = 60 * 60 * 24 * 30;

function normalizeCart(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const candidate = item as Partial<CartItem>;
      return {
        id: String(candidate?.id ?? ''),
        name: String(candidate?.name ?? ''),
        price: Number(candidate?.price ?? 0),
        quantity: Number(candidate?.quantity ?? 0),
      };
    })
    .filter(
      (item) =>
        Boolean(item.id) &&
        Boolean(item.name) &&
        Number.isFinite(item.price) &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
}

function summarize(items: CartItem[]) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { itemCount, subtotal };
}

export async function GET(req: NextRequest) {
  try {
    const rawCookie = req.cookies.get(CART_COOKIE_KEY)?.value ?? '';
    const decoded = rawCookie ? decodeURIComponent(rawCookie) : '';
    const parsed = decoded ? JSON.parse(decoded) : [];
    const items = normalizeCart(parsed);

    return NextResponse.json({
      items,
      summary: summarize(items),
    });
  } catch {
    return NextResponse.json({ items: [], summary: { itemCount: 0, subtotal: 0 } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { raw?: string };
    const raw = body.raw ?? '[]';
    const parsed = JSON.parse(raw);
    const items = normalizeCart(parsed);

    const response = NextResponse.json({
      ok: true,
      summary: summarize(items),
    });

    response.cookies.set(CART_COOKIE_KEY, encodeURIComponent(JSON.stringify(items)), {
      path: '/',
      maxAge: CART_MAX_AGE,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid cart payload' }, { status: 400 });
  }
}
