import { prisma } from "@/lib/db/prisma";
import { haversineKm, boundingBox } from "@/lib/utils/geo";
import type { JobType } from "@/lib/generated/prisma/client";
import type { NearbyWorker } from "@/types/worker";

interface FindNearbyWorkersInput {
  lat: number;
  lng: number;
  jobType?: JobType;
  radiusKm?: number;
  limit?: number;
}

/**
 * B9 — Find the best nearby workers for a job.
 *
 * Algorithm:
 * 1. Bounding-box pre-filter on worker lat/lng (avoids full table scan)
 * 2. Filter: isOnline=true, isApproved=true, no active job, matches skill
 * 3. Compute exact Haversine distances in JS
 * 4. Rank by: distance (40%), rating (40%), totalJobs (20%)
 * 5. Return top `limit` matches
 */
export async function findNearbyWorkers(
  input: FindNearbyWorkersInput
): Promise<NearbyWorker[]> {
  const { lat, lng, jobType, radiusKm = 5, limit = 5 } = input;

  const box = boundingBox(lat, lng, radiusKm);

  // Find workers with active jobs (to exclude)
  const busyWorkers = await prisma.job.findMany({
    where: { status: { in: ["ACCEPTED", "IN_PROGRESS"] } },
    select: { workerId: true },
  });
  const busyIds = new Set(busyWorkers.map((j) => j.workerId).filter(Boolean) as string[]);

  // Fetch candidates within bounding box
  const candidates = await prisma.workerProfile.findMany({
    where: {
      isOnline: true,
      isApproved: true,
      lat: { gte: box.minLat, lte: box.maxLat },
      lng: { gte: box.minLng, lte: box.maxLng },
      ...(jobType ? { skills: { has: jobType } } : {}),
    },
    include: {
      user: { select: { id: true, phone: true, name: true, fcmToken: true } },
    },
  });

  // Exact distance + exclude busy workers
  const withDistance = candidates
    .filter((w) => !busyIds.has(w.id))
    .map((w) => {
      const distanceKm = w.lat && w.lng
        ? haversineKm(lat, lng, w.lat, w.lng)
        : radiusKm; // fallback for workers without lat/lng
      return { worker: w, distanceKm };
    })
    .filter(({ distanceKm }) => distanceKm <= radiusKm);

  // Score: lower is better
  const scored = withDistance.map(({ worker: w, distanceKm }) => {
    const distScore  = distanceKm / radiusKm;                   // 0–1
    const ratingScore = 1 - (w.rating / 5);                     // 0–1, lower rating = worse
    const jobScore   = 1 - Math.min(w.totalJobs / 100, 1);      // 0–1, more jobs = more experienced = lower score
    const score = distScore * 0.4 + ratingScore * 0.4 + jobScore * 0.2;
    return { w, distanceKm, score };
  });

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, limit).map(({ w, distanceKm }) => ({
    workerId:   w.id,
    userId:     w.user.id,
    phone:      w.user.phone,
    name:       w.user.name,
    rating:     w.rating,
    totalJobs:  w.totalJobs,
    photoUrl:   w.photoUrl,
    distanceKm,
    lat:        w.lat ?? lat,
    lng:        w.lng ?? lng,
  }));
}
