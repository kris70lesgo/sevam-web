"use client";

import { useEffect, useState } from "react";
import { getWorkerEarnings } from "@/server/actions/workers/worker-dashboard";
import { Card, CardContent, PageSpinner } from "@/components/ui";
import { formatPrice } from "@/lib/utils/pricing";
import type { WorkerEarnings, EarningsBreakdown } from "@/types/worker";

export default function EarningsPage() {
  const [data,    setData]    = useState<WorkerEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await getWorkerEarnings();
      if (result.ok) setData(result.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <PageSpinner />;

  const stats = data?.stats;
  const daily = data?.daily ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Today"       value={formatPrice(stats?.todayEarnings ?? 0)} />
        <SummaryCard label="This Week"   value={formatPrice(stats?.weeklyEarnings ?? 0)} />
        <SummaryCard label="Last 30 Days" value={formatPrice(data?.last30DaysTotal ?? 0)} />
        <SummaryCard label="All Time"    value={formatPrice(stats?.totalEarnings ?? 0)} />
      </div>

      {/* Daily breakdown */}
      <div>
        <h2 className="text-base font-semibold mb-3">Daily Breakdown (Last 30 days)</h2>

        {daily.length === 0 ? (
          <p className="text-center text-muted py-10">No earnings yet. Complete jobs to see your stats!</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left">
                  <th className="px-4 py-2 font-medium text-muted">Date</th>
                  <th className="px-4 py-2 font-medium text-muted text-center">Jobs</th>
                  <th className="px-4 py-2 font-medium text-muted text-right">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {[...daily].reverse().map((row) => (
                  <EarningsRow key={row.date} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-3 text-center">
        <p className="text-xs text-muted mb-0.5">{label}</p>
        <p className="font-bold text-base">{value}</p>
      </CardContent>
    </Card>
  );
}

function EarningsRow({ row }: { row: EarningsBreakdown }) {
  const date = new Date(row.date);
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-2.5">{label}</td>
      <td className="px-4 py-2.5 text-center text-muted">{row.jobs}</td>
      <td className="px-4 py-2.5 text-right font-medium">{formatPrice(row.earnings)}</td>
    </tr>
  );
}
