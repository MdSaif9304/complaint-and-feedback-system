import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const links = [
    { href: "/dashboard", label: "My Complaints" },
    { href: "/dashboard/complaints/new", label: "New Complaint" },
    { href: "/dashboard/feedback", label: "Feedback" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar name={session.name} email={session.email} role={session.role} links={links} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
