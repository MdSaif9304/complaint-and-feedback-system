"use client";

import { useEffect, useState } from "react";
import { RowSkeleton } from "@/components/Skeleton";

interface Category {
  _id: string;
  name: string;
  description?: string;
  sensitive: boolean;
  active: boolean;
}

const EMPTY = { name: "", description: "", sensitive: false, active: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    sensitive: boolean;
    active: boolean;
  }>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/categories?all=1");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
  }

  function startEdit(c: Category) {
    setEditingId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
      sensitive: c.sensitive,
      active: c.active,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.fieldErrors?.name || "Failed to save category");
        return;
      }
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Category) {
    await fetch(`/api/categories/${c._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c._id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete");
      return;
    }
    load();
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Complaint Categories</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Create and manage the categories students &amp; faculty choose when filing a complaint.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={submit} className="card h-fit space-y-4 p-6 lg:col-span-2 lg:sticky lg:top-20">
          <h2 className="font-semibold tracking-tight">
            {editingId ? "Edit category" : "Add category"}
          </h2>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Harassment"
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input min-h-[70px]"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short guidance shown to users"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.sensitive}
              onChange={(e) => setForm((f) => ({ ...f, sensitive: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-neutral-900 dark:accent-white"
            />
            <span>
              Mark as <strong>sensitive / confidential</strong>
              <span className="block text-xs text-neutral-500">
                Shows a confidentiality note (e.g. harassment, ragging, abuse).
              </span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-900 dark:accent-white"
            />
            Active (available in the complaint form)
          </label>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update category" : "Add category"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="space-y-3 lg:col-span-3">
          {loading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : categories.length === 0 ? (
            <div className="card p-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No categories yet. Add your first one on the left.
            </div>
          ) : (
            categories.map((c) => (
              <div key={c._id} className="card flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold tracking-tight">{c.name}</h3>
                    {c.sensitive && (
                      <span className="badge border-neutral-900 text-neutral-900 dark:border-white dark:text-white">
                        Sensitive
                      </span>
                    )}
                    {!c.active && (
                      <span className="badge border-neutral-200 text-neutral-400 dark:border-neutral-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{c.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => toggleActive(c)} className="btn-ghost !px-2.5 !py-1.5 text-xs" title={c.active ? "Deactivate" : "Activate"}>
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => startEdit(c)} className="btn-ghost !px-2.5 !py-1.5 text-xs">
                    Edit
                  </button>
                  <button onClick={() => remove(c)} className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
