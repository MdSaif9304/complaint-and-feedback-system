import Link from "next/link";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  await connectDB();

  const complaints = await Complaint.find({ user: session!.userId })
    .sort({ createdAt: -1 })
    .lean();

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter(
      (c) => c.status === "resolved" || c.status === "closed"
    ).length,
  };

  const stats = [
    { label: "Total Complaints", value: counts.total },
    { label: "Pending", value: counts.pending },
    { label: "Resolved / Closed", value: counts.resolved },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {session!.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Track your complaints and their resolution status.
          </p>
        </div>
        <Link href="/dashboard/complaints/new" className="btn-primary w-full sm:w-auto">
          + New Complaint
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Your Complaints</h2>
        {complaints.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">
              You haven&apos;t submitted any complaints yet.
            </p>
            <Link href="/dashboard/complaints/new" className="btn-primary mt-4">
              Submit your first complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <Link
                key={String(c._id)}
                href={`/dashboard/complaints/${c.ticketId}`}
                className="card block p-5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:hover:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400">{c.ticketId}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <h3 className="mt-1 truncate font-semibold tracking-tight">{c.title}</h3>
                    <p className="mt-1 truncate text-sm text-neutral-500 dark:text-neutral-400">
                      {c.category} · {c.department}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-neutral-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
