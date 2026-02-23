import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyRazorpaySignature } from "@/lib/utils/razorpay";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify webhook signature
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const isValid = verifyRazorpaySignature(rawBody, "", signature, RAZORPAY_WEBHOOK_SECRET);

  if (!isValid) {
    console.warn("[Razorpay Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event as string;

  if (eventType === "payment.captured") {
    const paymentEntity = (event.payload as Record<string, unknown>)?.payment as Record<string, unknown> | undefined;
    const entity = paymentEntity?.entity as Record<string, unknown> | undefined;

    const razorpayPaymentId = entity?.id as string | undefined;
    const razorpayOrderId   = entity?.order_id as string | undefined;

    if (razorpayOrderId && razorpayPaymentId) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data:  { status: "SUCCESS", razorpayPaymentId },
      });
    }
  }

  if (eventType === "payment.failed") {
    const paymentEntity = (event.payload as Record<string, unknown>)?.payment as Record<string, unknown> | undefined;
    const entity = paymentEntity?.entity as Record<string, unknown> | undefined;
    const razorpayOrderId = entity?.order_id as string | undefined;

    if (razorpayOrderId) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data:  { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
