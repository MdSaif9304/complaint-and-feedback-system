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
    { label: "Total Complaints", value: stats.totalComplaints },
    { label: "Resolution Rate", value: `${stats.resolutionRate}%` },
    { label: "Pending", value: stats.pending },
    { label: "Registered Users", value: stats.totalUsers },
    { label: "Feedback Received", value: stats.totalFeedback },
    { label: "Avg. Rating", value: stats.avgRating ? `${stats.avgRating} ★` : "—" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Admin Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Overview of complaints, resolution performance and feedback.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{k.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{k.value}</p>
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
