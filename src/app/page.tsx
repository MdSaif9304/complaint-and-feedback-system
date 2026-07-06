import Link from "next/link";
import { getSession } from "@/lib/auth";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default async function HomePage() {
  const session = await getSession();
  const homeHref = session
    ? session.role === "admin"
      ? "/admin"
      : "/dashboard"
    : "/login";

  const features = [
    {
      title: "Submit Complaints",
      desc: "Raise grievances under the right category & department and get a unique tracking ID.",
      icon: (
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      ),
    },
    {
      title: "Track Status",
      desc: "Follow every complaint in real time — pending, under review, resolved or closed.",
      icon: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    },
    {
      title: "Share Feedback",
      desc: "Rate services and share suggestions — anonymously if you prefer.",
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      ),
    },
    {
      title: "Admin Analytics",
      desc: "Dashboards and reports help administrators resolve issues faster.",
      icon: <><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>,
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
              CF
            </span>
            <span className="hidden font-semibold tracking-tight sm:inline">
              Complaint &amp; Feedback
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <Link href={homeHref} className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Login
                </Link>
                <Link href="/register" className="btn-primary hidden sm:inline-flex">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 text-neutral-200/70 bg-dots dark:text-neutral-800/50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <span className="badge border-neutral-300 bg-white/60 text-neutral-600 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
            College Grievance Redressal
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            A transparent way to raise complaints &amp; share feedback
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-600 dark:text-neutral-400 sm:text-lg">
            Replace paper forms and suggestion boxes with a structured, trackable
            and accountable digital platform for students, faculty and
            administrators.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={session ? homeHref : "/register"} className="btn-primary px-6 py-3 text-base">
              Get Started
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="card group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-neutral-900">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-6 dark:border-neutral-800">
        <p className="text-center text-sm text-neutral-500">
          Complaint &amp; Feedback System in College — Final Year Project
        </p>
      </footer>
    </div>
  );
}
