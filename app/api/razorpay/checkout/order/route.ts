import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, customerCartLimiter } from '@/lib/utils/rate-limit';
import { getRazorpay } from '@/lib/utils/razorpay';
import { badRequest, getRequestId, internalError, ok, tooManyRequests } from '@/lib/server/api/http';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const CART_COOKIE_KEY = 'sevam_service_cart_cookie';

const CreateOrderSchema = z.object({
  amount: z.number().finite().positive(),
  currency: z.literal('INR').default('INR'),
  addressLine: z.string().trim().max(300).optional(),
  label: z.string().trim().max(40).optional(),
  itemCount: z.number().int().min(0).max(500).optional(),
});

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon'
  );
}

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

function summarizeCart(items: CartItem[]) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const handlingFee = items.length > 0 ? 10.62 : 0;
  const maxPayable = subtotal + handlingFee;
  return { itemCount, subtotal, handlingFee, maxPayable };
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);

  try {
    const rl = await checkRateLimit(customerCartLimiter, getClientIp(req));
    if (!rl.allowed) {
      return tooManyRequests(requestId, rl.retryAfter ?? 60);
    }

    const body = (await req.json().catch(() => ({}))) as unknown;
    const parsedBody = CreateOrderSchema.safeParse(body);
    if (!parsedBody.success) {
      return badRequest(parsedBody.error.issues[0]?.message ?? 'Invalid payload', requestId);
    }

    const rawCookie = req.cookies.get(CART_COOKIE_KEY)?.value ?? '';
    const decoded = rawCookie ? decodeURIComponent(rawCookie) : '';
    const parsed = decoded ? JSON.parse(decoded) : [];
    const cart = normalizeCart(parsed);
    const summary = summarizeCart(cart);

    if (summary.itemCount === 0) {
      return badRequest('Cart is empty', requestId);
    }

    const amountRupees = Number(parsedBody.data.amount);
    const roundedAmount = Number(amountRupees.toFixed(2));

    if (!Number.isFinite(roundedAmount) || roundedAmount <= 0) {
      return badRequest('Invalid amount', requestId);
    }

    if (roundedAmount > summary.maxPayable + Number.EPSILON) {
      return badRequest('Requested amount exceeds payable total', requestId);
    }

    const amountPaise = Math.round(roundedAmount * 100);
    if (amountPaise < 100) {
      return badRequest('Minimum payable amount is ₹1', requestId);
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `sevam_checkout_${Date.now()}`.slice(0, 40),
      notes: {
        flow: 'customer_checkout',
        request_id: requestId,
        item_count: String(summary.itemCount),
        address_label: parsedBody.data.label ?? '',
        address_line: parsedBody.data.addressLine ?? '',
      },
    });

    return ok(
      {
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        keyId: process.env.RAZORPAY_KEY_ID ?? '',
      },
      requestId
    );
  } catch {
    return internalError('Failed to create Razorpay order', requestId);
  }
}
