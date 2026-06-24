/**
 * proxy.ts - Next.js 16 route protection using cookie-based password auth.
 *
 * No Supabase auth, no magic links. Simple HMAC-signed session cookie.
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateSessionToken, COOKIE_NAME } from "@/lib/auth";

/**
 * Paths that bypass authentication in the proxy.
 */
const BYPASS_PATHS = [
  "/admin/login",
  "/admin/unauthorized",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =====================================================================
  // 1. ALLOW PUBLIC PATHS - never redirect non-admin routes
  // =====================================================================
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // =====================================================================
  // 2. ALLOW BYPASS PATHS - login and unauthorized pages
  // =====================================================================
  if (BYPASS_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // =====================================================================
  // 3. CHECK SESSION COOKIE
  // =====================================================================
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionCookie || !validateSessionToken(sessionCookie)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // =====================================================================
  // 4. AUTHENTICATED - add noindex header and continue
  // =====================================================================
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};