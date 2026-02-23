"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import type { ActionResult } from "@/types/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalJobs:          number;
  jobsByStatus:       Record<string, number>;
  jobsByType:         Record<string, number>;
  totalRevenue:       number;
  totalCustomers:     number;
  totalWorkers:       number;
  approvedWorkers:    number;
  pendingWorkers:     number;
  activeWorkers:      number;
  activeDisputes:     number;
  dailySeries:        { date: string; jobs: number; revenue: number }[];
  allJobsDailySeries: { date: string; count: number }[];
}

// ─── B15: Admin analytics ─────────────────────────────────────────────────────

export async function getAnalytics(): Promise<ActionResult<AnalyticsSummary>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated.", code: "SERVER_ERROR" };
  if (session.userType !== "ADMIN") return { ok: false, error: "Admin access required.", code: "SERVER_ERROR" };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Count jobs by status using findMany instead of groupBy (more portable)
  const allJobsRaw = await prisma.job.findMany({
    select: { status: true, type: true, createdAt: true },
  });

  const [
    customers,
    workerProfiles,
    activeDisputes,
    completedJobsLast30,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { userType: "CUSTOMER" } }),
    prisma.workerProfile.findMany({ select: { isApproved: true, isOnline: true } }),
    prisma.jobDispute.count({ where: { status: "OPEN" } }),
    prisma.job.findMany({
      where:  { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
      select: { completedAt: true, finalPrice: true, estimatedPrice: true },
    }),
  ]);

  // Flat counts by status + type
  const jobsByStatus: Record<string, number> = {};
  const jobsByType:   Record<string, number> = {};
  let totalJobs = 0;
  for (const row of allJobsRaw) {
    jobsByStatus[row.status] = (jobsByStatus[row.status] ?? 0) + 1;
    jobsByType[row.type]     = (jobsByType[row.type]     ?? 0) + 1;
    totalJobs += 1;
  }

  const totalRevenue = completedJobsLast30.reduce(
    (sum, j) => sum + (j.finalPrice ?? j.estimatedPrice), 0
  );

  const totalWorkers    = workerProfiles.length;
  const approvedWorkers = workerProfiles.filter((w) => w.isApproved).length;
  const pendingWorkers  = totalWorkers - approvedWorkers;
  const activeWorkers   = workerProfiles.filter((w) => w.isOnline).length;

  // Revenue daily series (completed jobs last 30 days)
  const dayMap = new Map<string, { jobs: number; revenue: number }>();
  for (const job of completedJobsLast30) {
    const key = job.completedAt!.toISOString().slice(0, 10);
    if (!dayMap.has(key)) dayMap.set(key, { jobs: 0, revenue: 0 });
    const entry = dayMap.get(key)!;
    entry.jobs    += 1;
    entry.revenue += job.finalPrice ?? job.estimatedPrice;
  }
  const dailySeries = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // All jobs created per day (last 30 days)
  const allDayMap = new Map<string, number>();
  for (const job of allJobsRaw) {
    const key = job.createdAt.toISOString().slice(0, 10);
    if (key >= thirtyDaysAgo.toISOString().slice(0, 10)) {
      allDayMap.set(key, (allDayMap.get(key) ?? 0) + 1);
    }
  }
  const allJobsDailySeries = Array.from(allDayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    ok: true,
    data: {
      totalJobs,
      jobsByStatus,
      jobsByType,
      totalRevenue,
      totalCustomers: customers,
      totalWorkers,
      approvedWorkers,
      pendingWorkers,
      activeWorkers,
      activeDisputes,
      dailySeries,
      allJobsDailySeries,
    },
  };
}

// ─── Admin: Approve / reject worker ──────────────────────────────────────────

export async function setWorkerApproval(
  workerId: string,
  approved: boolean
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.userType !== "ADMIN") {
    return { ok: false, error: "Admin access required.", code: "SERVER_ERROR" };
  }

  await prisma.workerProfile.update({
    where: { id: workerId },
    data:  { isApproved: approved },
  });

  return { ok: true };
}
