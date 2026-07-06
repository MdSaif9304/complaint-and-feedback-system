"use client";

import { useEffect, useState } from "react";
import { FEEDBACK_CATEGORIES } from "@/lib/constants";
import { CardGridSkeleton } from "@/components/Skeleton";

interface FeedbackItem {
  _id: string;
  category: string;
  rating: number;
  comments?: string;
  anonymous: boolean;
  createdAt: string;
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-2xl leading-none transition ${
            s <= value
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-300 dark:text-neutral-700"
          } ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          aria-label={`${s} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [form, setForm] = useState<{
    category: string;
    rating: number;
    comments: string;
    anonymous: boolean;
  }>({
    category: FEEDBACK_CATEGORIES[0],
    rating: 0,
    comments: "",
    anonymous: false,
  });
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  async function loadFeedback() {
    const res = await fetch("/api/feedback");
    if (res.ok) {
      const data = await res.json();
      setItems(data.feedback);
    }
    setListLoading(false);
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.rating < 1) {
      setError("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit feedback");
        return;
      }
      setSuccess("Thank you! Your feedback was submitted.");
      setForm({ category: FEEDBACK_CATEGORIES[0], rating: 0, comments: "", anonymous: false });
      loadFeedback();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Rate college services and share your suggestions.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card h-fit space-y-4 p-6">
          <h2 className="font-semibold tracking-tight">Share your feedback</h2>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-neutral-300 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
              {success}
            </div>
          )}

          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {FEEDBACK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Rating</label>
            <Stars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>

          <div>
            <label className="label">Comments (optional)</label>
            <textarea
              className="input min-h-[90px]"
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              placeholder="Tell us more…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={(e) => setForm((f) => ({ ...f, anonymous: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-900 dark:accent-white"
            />
            Submit anonymously (your name won&apos;t be stored)
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Submitting…" : "Submit Feedback"}
          </button>
        </form>

        <div>
          <h2 className="mb-3 font-semibold tracking-tight">Your past feedback</h2>
          {listLoading ? (
            <CardGridSkeleton count={3} />
          ) : items.length === 0 ? (
            <div className="card p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No feedback submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((f) => (
                <div key={f._id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{f.category}</span>
                    <Stars value={f.rating} />
                  </div>
                  {f.comments && (
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.comments}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                    <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                    {f.anonymous && (
                      <span className="badge border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
