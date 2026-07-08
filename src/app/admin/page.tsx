"use client";

import { useEffect, useState } from "react";
import {
  CategoryBarChart,
  StatusPieChart,
  MonthlyLineChart,
  RatingBarChart,
} from "@/components/AnalyticsCharts";
import { StatCardSkeleton, ChartSkeleton, Skeleton } from "@/components/Skeleton";

interface Stats {
  totalComplaints: number;
  totalUsers: number;
  totalFeedback: number;
  resolutionRate: number;
  pending: number;
  avgRating: number;
  byStatus: { name: string; value: number }[];
  byCategory: { name: string; value: number }[];
  byRole: { name: string; value: number }[];
  ratingDistribution: { name: string; value: number }[];
  monthly: { name: string; value: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }
  if (!stats) {
    return <div className="py-20 text-center text-red-500">Failed to load analytics.</div>;
  }

  const kpis = [
    { label: "Total Complaints", value: stats.totalComplaints, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10", icon: "M3 3v18h18M18 17V9M13 17V5M8 17v-3" },
    { label: "Resolution Rate", value: `${stats.resolutionRate}%`, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", icon: "M20 6 9 17l-5-5" },
    { label: "Pending", value: stats.pending, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10", icon: "M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" },
    { label: "Registered Users", value: stats.totalUsers, color: "text-violet-600 dark:text-violet-400 bg-violet-500/10", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
    { label: "Feedback Received", value: stats.totalFeedback, color: "text-pink-600 dark:text-pink-400 bg-pink-500/10", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    { label: "Avg. Rating", value: stats.avgRating ? `${stats.avgRating} ★` : "—", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Admin Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Overview of complaints, resolution performance and feedback.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${k.color}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={k.icon} />
              </svg>
            </span>
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">{k.label}</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Complaints by Status">
          {stats.byStatus.length ? <StatusPieChart data={stats.byStatus} /> : <EmptyChart />}
        </ChartPanel>
        <ChartPanel title="Complaints by Category">
          {stats.byCategory.length ? <CategoryBarChart data={stats.byCategory} /> : <EmptyChart />}
        </ChartPanel>
        <ChartPanel title="Monthly Submission Trend">
          {stats.monthly.length ? <MonthlyLineChart data={stats.monthly} /> : <EmptyChart />}
        </ChartPanel>
        <ChartPanel title="Feedback Rating Distribution">
          {stats.totalFeedback ? <RatingBarChart data={stats.ratingDistribution} /> : <EmptyChart />}
        </ChartPanel>
      </div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-semibold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-neutral-400">
      No data yet.
    </div>
  );
}
