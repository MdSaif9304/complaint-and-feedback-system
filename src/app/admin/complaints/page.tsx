"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { TableSkeleton } from "@/components/Skeleton";
import { COMPLAINT_STATUSES, STATUS_LABELS } from "@/lib/constants";

interface Complaint {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  department: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { name: string; email: string; role: string };
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories?all=1")
      .then((r) => r.json())
      .then((d) => setCategoryOptions((d.categories || []).map((c: { name: string }) => c.name)))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    const res = await fetch(`/api/complaints?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setComplaints(data.complaints);
    }
    setLoading(false);
  }, [status, category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">All Complaints</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        View, filter and manage every complaint in the system.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {COMPLAINT_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select className="input max-w-[200px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-5">
          <TableSkeleton rows={7} />
        </div>
      ) : (
        <div className="card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-100/60 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/40">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="hidden px-4 py-3 md:table-cell">Submitted by</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Category</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c._id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-neutral-400">{c.ticketId}</td>
                      <td className="px-4 py-3 font-medium">{c.title}</td>
                      <td className="hidden px-4 py-3 text-neutral-600 dark:text-neutral-400 md:table-cell">
                        {c.user ? (
                          <div>
                            <div>{c.user.name}</div>
                            <div className="text-xs capitalize text-neutral-400">{c.user.role}</div>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-neutral-600 dark:text-neutral-400 sm:table-cell">{c.category}</td>
                      <td className="hidden px-4 py-3 lg:table-cell"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/complaints/${c.ticketId}`} className="font-medium underline-offset-4 hover:underline">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
