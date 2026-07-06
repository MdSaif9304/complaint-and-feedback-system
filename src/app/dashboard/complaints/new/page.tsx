"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEPARTMENTS, PRIORITIES } from "@/lib/constants";

interface Category {
  _id: string;
  name: string;
  description?: string;
  sensitive: boolean;
}

export default function NewComplaintPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [form, setForm] = useState<{
    title: string;
    category: string;
    department: string;
    priority: string;
    description: string;
  }>({
    title: "",
    category: "",
    department: DEPARTMENTS[0],
    priority: "medium",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        const cats: Category[] = d.categories || [];
        setCategories(cats);
        if (cats.length) setForm((f) => ({ ...f, category: cats[0].name }));
      })
      .finally(() => setCatLoading(false));
  }, []);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedCategory = categories.find((c) => c.name === form.category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(data.error || "Failed to submit complaint");
        return;
      }
      router.push(`/dashboard/complaints/${data.complaint.ticketId}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <Link href="/dashboard" className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-white">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Submit a Complaint</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Fill in the details below. You&apos;ll get a tracking ID to follow up.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-5 space-y-4 p-6">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Brief summary of the issue"
            required
          />
          {fieldErrors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              disabled={catLoading || categories.length === 0}
              required
            >
              {catLoading ? (
                <option>Loading…</option>
              ) : categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => update("department", e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category guidance + confidentiality note */}
        {selectedCategory?.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{selectedCategory.description}</p>
        )}
        {selectedCategory?.sensitive && (
          <div className="flex items-start gap-2 rounded-xl border border-neutral-300 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            This is a sensitive matter and will be handled confidentially by the administration.
          </div>
        )}

        <div>
          <label className="label">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update("priority", p)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition ${
                  form.priority === p
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[120px]"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the issue in detail…"
            required
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading || categories.length === 0}>
            {loading ? "Submitting…" : "Submit Complaint"}
          </button>
          <Link href="/dashboard" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
