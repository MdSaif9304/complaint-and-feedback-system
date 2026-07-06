import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const links = [
    { href: "/admin", label: "Analytics" },
    { href: "/admin/complaints", label: "Complaints" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/feedback", label: "Feedback" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar name={session.name} email={session.email} role={session.role} links={links} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
