import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyRazorpaySignature } from '@/lib/utils/razorpay';
import { badRequest, getRequestId, internalError, ok } from '@/lib/server/api/http';

const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);

  try {
    const body = (await req.json().catch(() => ({}))) as unknown;
    const parsedBody = VerifyPaymentSchema.safeParse(body);
    if (!parsedBody.success) {
      return badRequest(parsedBody.error.issues[0]?.message ?? 'Invalid payload', requestId);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsedBody.data;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return badRequest('Invalid payment signature', requestId);
    }

    return ok(
      {
        ok: true,
        payment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        },
      },
      requestId
    );
  } catch {
    return internalError('Failed to verify payment', requestId);
  }
}
