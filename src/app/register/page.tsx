"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEPARTMENTS } from "@/lib/constants";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    rollNo: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, department: form.department || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const err = (k: string) =>
    fieldErrors[k] ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors[k]}</p> : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 text-neutral-200/60 bg-dots dark:text-neutral-800/40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="card animate-fade-in relative w-full max-w-md p-8">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-lg font-bold text-white dark:bg-white dark:text-neutral-900"
          >
            CF
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Register as a student or faculty member
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            {err("name")}
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            {err("email")}
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => update("password", e.target.value)} required />
            {err("password")}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => update("role", e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            <div>
              <label className="label">Roll / Emp No.</label>
              <input className="input" value={form.rollNo} onChange={(e) => update("rollNo", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => update("department", e.target.value)}>
              <option value="">Select department (optional)</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
