"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase-server";
import type { ActionResult } from "@/types/auth";

/** B14: Update worker location
 *
 * Throttled to max 1 update per 10 seconds using `lastLocUpdateMs`.
 * If the worker has an active job, broadcasts the location update
 * over the Supabase Realtime channel `job:<jobId>`.
 */
export async function updateWorkerLocation(
  lat: number,
  lng: number
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated.", code: "SERVER_ERROR" };
  if (session.userType !== "WORKER") return { ok: false, error: "Not a worker.", code: "SERVER_ERROR" };

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      jobs: {
        where: { status: { in: ["ACCEPTED", "IN_PROGRESS"] } },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!profile) return { ok: false, error: "Worker profile not found.", code: "SERVER_ERROR" };

  // Throttle: allow at most 1 update per 10 seconds
  const now = BigInt(Date.now());
  const THROTTLE_MS = BigInt(10_000);
  if (profile.lastLocUpdateMs && now - profile.lastLocUpdateMs < THROTTLE_MS) {
    return { ok: true }; // silently ignore, not an error
  }

  await prisma.workerProfile.update({
    where: { id: profile.id },
    data:  { lat, lng, lastLocUpdate: new Date(), lastLocUpdateMs: now },
  });

  // Realtime broadcast if worker has an active job
  const activeJob = profile.jobs[0];
  if (activeJob) {
    try {
      const supabase = createClient();
      await supabase
        .channel(`job:${activeJob.id}`)
        .send({
          type:    "broadcast",
          event:   "WORKER_LOCATION",
          payload: { lat, lng, ts: Number(now) },
        });
    } catch (err) {
      // Non-fatal — the DB update succeeded
      console.warn("[updateWorkerLocation] Realtime broadcast failed:", err);
    }
  }

  return { ok: true };
}

// ─── Toggle online/offline ────────────────────────────────────────────────────

export async function setWorkerOnlineStatus(isOnline: boolean): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.userType !== "WORKER") {
    return { ok: false, error: "Not authenticated.", code: "SERVER_ERROR" };
  }

  await prisma.workerProfile.update({
    where: { userId: session.userId },
    data:  { isOnline },
  });

  return { ok: true };
}
