import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

// Protected route prefixes and which roles may access them.
const ADMIN_PREFIX = "/admin";
const USER_PREFIXES = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isUserRoute = USER_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Redirect logged-in users away from login/register to their home.
  if (isAuthPage && session) {
    const dest = session.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if ((isAdminRoute || isUserRoute) && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Admins shouldn't use the student/faculty dashboard and vice-versa.
  if (isAdminRoute && session && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isUserRoute && session && session.role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
