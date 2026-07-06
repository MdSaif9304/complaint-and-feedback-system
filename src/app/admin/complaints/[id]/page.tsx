"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import ComplaintTimeline from "@/components/ComplaintTimeline";
import { Skeleton } from "@/components/Skeleton";
import { COMPLAINT_STATUSES, PRIORITIES, STATUS_LABELS } from "@/lib/constants";

interface Complaint {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  department: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  createdAt: string;
  updates: { status: string; note?: string; by: string; at: string }[];
  user?: { name: string; email: string; role: string; department?: string };
}

export default function ManageComplaintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [response, setResponse] = useState("");

  async function load() {
    const res = await fetch(`/api/complaints/${id}`);
    if (res.ok) {
      const data = await res.json();
      setComplaint(data.complaint);
      setStatus(data.complaint.status);
      setPriority(data.complaint.priority);
      setAssignedTo(data.complaint.assignedTo || "");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, assignedTo, response: response || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Update failed");
        return;
      }
      setResponse("");
      setMsg("Complaint updated successfully.");
      load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="card space-y-4 p-6">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <div className="card space-y-3 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="card h-fit space-y-4 p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  if (!complaint) return <div className="py-20 text-center text-red-500">Complaint not found.</div>;

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <Link href="/admin/complaints" className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-white">
        ← Back to complaints
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-6">
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
              <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{complaint.description}</p>
            </div>
            {complaint.user && (
              <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">Submitted by:</span>{" "}
                {complaint.user.name} ({complaint.user.email}) ·{" "}
                <span className="capitalize">{complaint.user.role}</span>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Status Timeline</h2>
            <ComplaintTimeline updates={complaint.updates} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <form onSubmit={save} className="card space-y-4 p-6 lg:sticky lg:top-20">
            <h2 className="font-semibold tracking-tight">Manage</h2>
            {msg && (
              <div className="rounded-xl border border-neutral-300 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                {msg}
              </div>
            )}
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {COMPLAINT_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input capitalize" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Assign to</label>
              <input className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Staff / department name" />
            </div>
            <div>
              <label className="label">Response / note</label>
              <textarea className="input min-h-[80px]" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Add a note visible in the timeline" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? "Saving…" : "Update Complaint"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
