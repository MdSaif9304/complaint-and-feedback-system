import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import ComplaintTimeline from "@/components/ComplaintTimeline";

export const dynamic = "force-dynamic";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  await connectDB();
  const { id } = await params;

  const complaint = await Complaint.findOne({
    ticketId: id,
    user: session!.userId,
  }).lean();

  if (!complaint) notFound();

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link href="/dashboard" className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-white">
        ← Back to dashboard
      </Link>

      <div className="card mt-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-neutral-400">{complaint.ticketId}</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{complaint.title}</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {complaint.category} · {complaint.department}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800/50">
          <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
            {complaint.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
          <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
          {complaint.assignedTo && <span>Assigned to: {complaint.assignedTo}</span>}
        </div>
      </div>

      <div className="card mt-5 p-6">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Status Timeline</h2>
        <ComplaintTimeline
          updates={complaint.updates.map((u) => ({
            ...u,
            at: u.at instanceof Date ? u.at.toISOString() : String(u.at),
          }))}
        />
      </div>
    </div>
  );
}
