import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/db/supabase-server";

function normalizePhone(input?: string | null, fallbackUserId?: string) {
  const raw = (input ?? "").trim();
  if (raw) return raw;
  if (fallbackUserId) return `oauth_${fallbackUserId}`;
  return "";
}

function parseBearerToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

async function ensureCustomerUserFromToken(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  const supaUser = data.user;
  const phone = normalizePhone(supaUser.phone, supaUser.id);
  if (!phone) return null;

  const name =
    (supaUser.user_metadata?.full_name as string | undefined)?.trim() ||
    (supaUser.user_metadata?.name as string | undefined)?.trim() ||
    "Customer";

  const user = await prisma.user.upsert({
    where: { phone },
    create: {
      phone,
      name,
      userType: "CUSTOMER",
    },
    update: {
      name,
      userType: "CUSTOMER",
    },
    select: { id: true },
  });

  return user;
}

function formatMoney(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "₹0";

  const hasFraction = Math.abs(parsed % 1) > Number.EPSILON;
  return `₹${parsed.toLocaleString("en-IN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureCustomerUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: {
        customerId: user.id,
        status: "COMPLETED",
      },
      orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
        completedAt: true,
        estimatedPrice: true,
        finalPrice: true,
        payment: {
          select: {
            amount: true,
          },
        },
        worker: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const orders = jobs.map((job) => {
      const amountSource = job.finalPrice ?? job.payment?.amount ?? job.estimatedPrice;
      const amountValue = typeof amountSource === "object" ? amountSource.toString() : String(amountSource);

      return {
        id: job.id,
        type: job.type,
        description: job.description,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt ? job.completedAt.toISOString() : null,
        providerName: job.worker?.user?.name || "Sevam Partner",
        totalPaid: formatMoney(amountValue),
      };
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
