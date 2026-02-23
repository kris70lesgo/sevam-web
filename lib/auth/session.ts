import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload, UserType } from "@/types/auth";
import { SESSION_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

// ─── Config ───────────────────────────────────────────────────────────────────

export { SESSION_COOKIE, REFRESH_COOKIE };
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

function getSecret(envVar: string, fallback: string): Uint8Array {
  const val = process.env[envVar] ?? fallback;
  return new TextEncoder().encode(val);
}

const ACCESS_SECRET = () =>
  getSecret("JWT_ACCESS_SECRET", "dev-access-secret-change-me");
const REFRESH_SECRET = () =>
  getSecret("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me");

// ─── Mint tokens ──────────────────────────────────────────────────────────────

export async function mintAccessToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(ACCESS_SECRET());
}

export async function mintRefreshToken(payload: Pick<SessionPayload, "userId">): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(REFRESH_SECRET());
}

// ─── Validate tokens ──────────────────────────────────────────────────────────

export async function verifyAccessToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

// ─── Cookie helpers (Server Components / Server Actions only) ─────────────────

export async function setSessionCookies(payload: SessionPayload): Promise<void> {
  const [access, refresh] = await Promise.all([
    mintAccessToken(payload),
    mintRefreshToken({ userId: payload.userId }),
  ]);

  const jar = await cookies();

  jar.set(SESSION_COOKIE, access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 min
  });

  jar.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

// ─── Token refresh ────────────────────────────────────────────────────────────

/**
 * Attempt to refresh the access token using the refresh token.
 * Returns the new session payload or null if refresh fails.
 * Must be called server-side (uses Prisma to re-fetch user).
 */
export async function refreshSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload) return null;

  // Re-fetch the user to get fresh userType
  const { prisma } = await import("@/lib/db/prisma");
  const user = await prisma.user.findUnique({
    where: { id: refreshPayload.userId },
    select: { id: true, phone: true, userType: true },
  });
  if (!user) return null;

  const newPayload: SessionPayload = {
    userId: user.id,
    phone: user.phone,
    userType: user.userType as UserType,
  };

  await setSessionCookies(newPayload);
  return newPayload;
}

