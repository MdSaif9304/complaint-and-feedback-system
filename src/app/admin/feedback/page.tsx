"use client";

import { useEffect, useState } from "react";
import { CardGridSkeleton } from "@/components/Skeleton";

interface FeedbackItem {
  _id: string;
  category: string;
  rating: number;
  comments?: string;
  anonymous: boolean;
  createdAt: string;
  user?: { name: string; email: string; role: string };
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-neutral-900 dark:text-white">
      {"★".repeat(value)}
      <span className="text-neutral-300 dark:text-neutral-700">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d) => setItems(d.feedback || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filtered = filter ? items.filter((i) => i.category === filter) : items;
  const avg =
    filtered.length > 0
      ? (filtered.reduce((s, i) => s + i.rating, 0) / filtered.length).toFixed(2)
      : "—";

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        All feedback submitted by students and faculty. Anonymous entries hide identity.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <select className="input max-w-[220px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-white">{filtered.length}</span> entries · Avg rating{" "}
          <span className="font-medium text-neutral-900 dark:text-white">{avg} ★</span>
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <CardGridSkeleton count={6} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card mt-5 p-10 text-center text-neutral-500 dark:text-neutral-400">No feedback yet.</div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filtered.map((f) => (
            <div key={f._id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.category}</span>
                <Stars value={f.rating} />
              </div>
              {f.comments && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.comments}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>
                  {f.anonymous || !f.user ? "Anonymous" : `${f.user.name} · ${f.user.role}`}
                </span>
                <span>{new Date(f.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
