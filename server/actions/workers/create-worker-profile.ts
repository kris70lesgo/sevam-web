"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { JobTypeSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/types/auth";

// ─── Validation schema ────────────────────────────────────────────────────────

const WorkerProfileSchema = z.object({
  name:     z.string().min(2).max(80),
  bio:      z.string().max(300).optional(),
  skills:   z.array(JobTypeSchema).min(1, "Select at least one skill"),
  photoUrl: z.string().url("Invalid photo URL").optional(),
});

export type CreateWorkerProfileInput = z.infer<typeof WorkerProfileSchema>;

// ─── B12: Create (or update) worker profile ───────────────────────────────────

export async function createWorkerProfile(
  input: CreateWorkerProfileInput
): Promise<ActionResult<{ workerId: string }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated.", code: "SERVER_ERROR" };
  if (session.userType === "ADMIN") return { ok: false, error: "Admins cannot create worker profiles.", code: "SERVER_ERROR" };

  const parsed = WorkerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message, code: "SERVER_ERROR" };
  }

  const { name, bio, skills, photoUrl } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update user name + type to WORKER
      await tx.user.update({
        where:  { id: session.userId },
        data:   { name, userType: "WORKER" },
      });

      // Upsert worker profile
      const profile = await tx.workerProfile.upsert({
        where:  { userId: session.userId },
        create: { userId: session.userId, skills, bio, photoUrl },
        update: { skills, bio, photoUrl },
      });

      return profile;
    });

    return { ok: true, data: { workerId: result.id } };
  } catch (err) {
    console.error("[createWorkerProfile]", err);
    return { ok: false, error: "Failed to save profile.", code: "SERVER_ERROR" };
  }
}
