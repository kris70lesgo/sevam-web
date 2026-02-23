// Worker-facing types

export interface WorkerStats {
  totalJobs: number;
  totalEarnings: number;
  rating: number;
  todayEarnings: number;
  weeklyEarnings: number;
}

export interface NearbyWorker {
  workerId: string;
  userId: string;
  phone: string;
  name: string | null;
  rating: number;
  totalJobs: number;
  photoUrl: string | null;
  distanceKm: number;
  lat: number;
  lng: number;
}

export type SkillType =
  | "PLUMBING"
  | "ELECTRICAL"
  | "PAINTING"
  | "CARPENTRY"
  | "CLEANING"
  | "AC_REPAIR"
  | "APPLIANCE_REPAIR"
  | "OTHER";

export interface CreateWorkerProfileInput {
  skills: SkillType[];
  bio?: string;
}

export interface EarningsBreakdown {
  date: string;
  jobs: number;
  earnings: number;
}

export interface WorkerEarnings {
  stats: WorkerStats;
  daily: EarningsBreakdown[];
  last30DaysTotal: number;
}
