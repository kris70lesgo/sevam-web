export interface WorkerRow {
  workerId: string;
  userId: string;
  name: string | null;
  phone: string;
  skills: string[];
  isApproved: boolean;
  isOnline: boolean;
  totalJobs: number;
  rating: number;
  joinedAt: Date;
}

export interface CustomerRow {
  id: string;
  name: string | null;
  phone: string;
  totalJobs: number;
  joinedAt: Date;
}

export interface AnalyticsSummary {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  jobsByType: Record<string, number>;
  totalRevenue: number;
  totalCustomers: number;
  totalWorkers: number;
  approvedWorkers: number;
  pendingWorkers: number;
  activeWorkers: number;
  activeDisputes: number;
  dailySeries: { date: string; jobs: number; revenue: number }[];
  allJobsDailySeries: { date: string; count: number }[];
}