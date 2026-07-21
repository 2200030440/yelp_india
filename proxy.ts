// proxy.ts
// Next.js 16 proxy / edge middleware — Edge compatible.
// Uses authConfig without loading Node-only database drivers.

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // 1. Protect Admin Routes (requires ADMIN role)
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || userRole !== "ADMIN") {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }
  }

  // 2. Protect Authenticated User Routes (profile, saved)
  if (pathname.startsWith("/profile") || pathname.startsWith("/saved")) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }
  }

  // 3. Redirect authenticated users away from auth pages (login, register)
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|icons|images).*)",
  ],
};
