import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/db/supabase-server";

type ProfileBody = {
  name?: string;
  email?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  preferredLanguage?: string | null;
  marketingOptIn?: boolean;
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
  });

  return { user, supaUser };
}

export async function GET(req: NextRequest) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await ensureCustomerUserFromToken(token);
    if (!resolved) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, supaUser } = resolved;

    const profile = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: supaUser.email ?? null,
      },
      update: {
        email: supaUser.email ?? undefined,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
      },
      profile: {
        email: profile.email,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        preferredLanguage: profile.preferredLanguage,
        marketingOptIn: profile.marketingOptIn,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await ensureCustomerUserFromToken(token);
    if (!resolved) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = resolved;
    const body = (await req.json().catch(() => ({}))) as ProfileBody;

    const name = body.name?.trim();
    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;

    const profile = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: body.email?.trim() || null,
        dateOfBirth,
        gender: body.gender?.trim() || null,
        preferredLanguage: body.preferredLanguage?.trim() || "en",
        marketingOptIn: Boolean(body.marketingOptIn),
      },
      update: {
        email: body.email?.trim() || null,
        dateOfBirth,
        gender: body.gender?.trim() || null,
        preferredLanguage: body.preferredLanguage?.trim() || "en",
        marketingOptIn: Boolean(body.marketingOptIn),
      },
    });

    return NextResponse.json({
      ok: true,
      profile: {
        email: profile.email,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        preferredLanguage: profile.preferredLanguage,
        marketingOptIn: profile.marketingOptIn,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}