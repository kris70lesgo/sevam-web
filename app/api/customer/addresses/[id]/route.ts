import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AddressLabel } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/db/supabase-server";

type UpdateAddressBody = {
  label?: "HOME" | "OFFICE" | "OTHER";
  line1?: string;
  line2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
  isActive?: boolean;
};

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

function normalizeLabel(label?: string): AddressLabel {
  if (label === "OFFICE") return AddressLabel.OFFICE;
  if (label === "OTHER") return AddressLabel.OTHER;
  return AddressLabel.HOME;
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureCustomerUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Address id is required" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as UpdateAddressBody;

    const existing = await prisma.customerAddress.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updates: {
      label?: AddressLabel;
      line1?: string;
      line2?: string | null;
      landmark?: string | null;
      city?: string;
      state?: string;
      pincode?: string;
      lat?: number | null;
      lng?: number | null;
      isDefault?: boolean;
      isActive?: boolean;
    } = {};

    if (body.label) updates.label = normalizeLabel(body.label);
    if (typeof body.line1 === "string") updates.line1 = body.line1.trim();
    if (typeof body.line2 === "string") updates.line2 = body.line2.trim() || null;
    if (typeof body.landmark === "string") updates.landmark = body.landmark.trim() || null;
    if (typeof body.city === "string") updates.city = body.city.trim();
    if (typeof body.state === "string") updates.state = body.state.trim();
    if (typeof body.pincode === "string") updates.pincode = body.pincode.trim();
    if (Object.hasOwn(body, "lat")) updates.lat = Number.isFinite(body.lat) ? Number(body.lat) : null;
    if (Object.hasOwn(body, "lng")) updates.lng = Number.isFinite(body.lng) ? Number(body.lng) : null;
    if (Object.hasOwn(body, "isActive")) updates.isActive = Boolean(body.isActive);

    const makeDefault = body.isDefault === true;

    const updated = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: user.id, isActive: true, isDefault: true },
          data: { isDefault: false },
        });
        updates.isDefault = true;
      }

      return tx.customerAddress.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          label: true,
          line1: true,
          line2: true,
          landmark: true,
          city: true,
          state: true,
          pincode: true,
          lat: true,
          lng: true,
          isDefault: true,
          isActive: true,
        },
      });
    });

    return NextResponse.json({ address: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureCustomerUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Address id is required" }, { status: 400 });
    }

    const existing = await prisma.customerAddress.findFirst({
      where: {
        id,
        userId: user.id,
        isActive: true,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.customerAddress.update({
      where: { id },
      data: { isActive: false, isDefault: false },
    });

    return NextResponse.json({ ok: true });
   } catch {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
   }
 }
