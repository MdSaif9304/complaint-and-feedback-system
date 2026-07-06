"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./theme/ThemeProvider";

interface NavLink {
  href: string;
  label: string;
}

export default function Navbar({
  name,
  email,
  role,
  links,
}: {
  name: string;
  email: string;
  role: string;
  links: NavLink[];
}) {
  const pathname = usePathname();
  const home = role === "admin" ? "/admin" : "/dashboard";
  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand + desktop nav */}
        <div className="flex items-center gap-6">
          <Link href={home} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
              CF
            </span>
            <span className="hidden font-semibold tracking-tight text-neutral-900 dark:text-white sm:inline">
              Complaint &amp; Feedback
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-200/70 dark:text-neutral-400 dark:hover:bg-neutral-800/70"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <UserMenu name={name} email={email} role={role} links={links} isActive={isActive} />
      </div>
    </header>
  );
}

function UserMenu({
  name,
  email,
  role,
  links,
  isActive,
}: {
  name: string;
  email: string;
  role: string;
  links: NavLink[];
  isActive: (href: string) => boolean;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByHover = useRef(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Small delay so moving the cursor from the avatar to the menu doesn't close it.
  const closeSoon = () => {
    openedByHover.current = false;
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  // Click cooperates with hover: if hover already opened it, the click keeps it
  // open; a deliberate second click (or a tap on touch) closes it.
  const handleClick = () => {
    if (open && !openedByHover.current) {
      setOpen(false);
    } else {
      openedByHover.current = false;
      openNow();
    }
  };

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        openedByHover.current = true;
        openNow();
      }}
      onMouseLeave={closeSoon}
    >
      <button
        onClick={handleClick}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-1 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 sm:pr-2.5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[120px] truncate text-sm font-medium leading-tight text-neutral-900 dark:text-white">
            {name.split(" ")[0]}
          </span>
          <span className="block text-xs capitalize leading-tight text-neutral-500">{role}</span>
        </span>
        <svg
          className={`hidden h-4 w-4 text-neutral-400 transition-transform sm:block ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 origin-top-right animate-fade-in overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          {/* Account header */}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{name}</p>
              <p className="truncate text-xs text-neutral-500">{email}</p>
              <span className="mt-1 inline-flex rounded-full border border-neutral-200 px-1.5 py-0.5 text-[10px] font-medium capitalize text-neutral-500 dark:border-neutral-700">
                {role}
              </span>
            </div>
          </div>

          <div className="my-1.5 h-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Navigation shortcuts — visible on mobile where the top-bar nav is hidden */}
          <div className="md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className={`${itemClass} ${
                  isActive(l.href) ? "bg-neutral-100 font-medium dark:bg-neutral-800" : ""
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                {l.label}
              </Link>
            ))}
            <div className="my-1.5 h-px bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Theme switch */}
          <button onClick={toggleTheme} role="menuitem" className={itemClass}>
            {theme === "dark" ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            disabled={loggingOut}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
