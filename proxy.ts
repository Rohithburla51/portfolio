/**
 * proxy.ts - Next.js 16 route protection using the App Router proxy convention.
 *
 * ORIGINAL ISSUE: Admin panel was in an infinite redirect loop.
 *
 * ROOT CAUSE:
 * 1. middleware.ts was NOT excluding /admin/unauthorized - so when an
 *    unauthorized user was redirected to /admin/unauthorized, the middleware
 *    would intercept it, find the wrong email, and redirect to /admin/unauthorized
 *    again → infinite loop.
 * 2. middleware.ts is deprecated in Next.js 16 - needed migration to proxy.ts
 * 3. The auth callback route was creating the redirect Response BEFORE
 *    exchanging the code for session, so cookies weren't properly set.
 * 4. The admin layout was ALSO checking auth and redirecting to /admin/login
 *    (same URL) even when the user visited /admin/login - causing a loop
 *    because the proxy bypassed /admin/login but the layout didn't.
 *
 * FIX APPLIED:
 * 1. Created proxy.ts using Next.js 16 App Router proxy approach
 * 2. Added /admin/unauthorized to the bypass list (alongside /admin/login,
 *    /admin/auth/callback)
 * 3. Auth callback now properly sequences: validate → exchange → set cookies → redirect
 * 4. Admin layout NO LONGER redirects - it only renders the admin shell
 *    when user is authenticated. When not authenticated, it just renders
 *    children (allowing the login page to show itself without loop).
 * 5. /admin root is NOT bypassed - it goes through auth check like all
 *    protected routes.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_ADMIN_EMAIL = "burlarohith999@gmail.com".toLowerCase();

/**
 * Paths that bypass authentication in the proxy.
 * These must NEVER redirect or check auth - they are auth entry/exit points.
 * IMPORTANT: /admin/unauthorized must be here to prevent loop when layout
 * redirects unauthorized users here.
 */
const BYPASS_PATHS = [
  "/admin/login",
  "/admin/auth/callback",
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
  // 2. ALLOW BYPASS PATHS - login, callback, unauthorized pages
  // These must load without any auth checks. The login page shows itself,
  // the callback processes auth, and unauthorized page shows access denied.
  // =====================================================================
  if (BYPASS_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // =====================================================================
  // 3. PROTECT ALL OTHER /admin routes (including /admin itself)
  // =====================================================================

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Config missing - redirect to login
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "configuration");
    return NextResponse.redirect(loginUrl);
  }

  // Create response with cookie handling
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase server client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Get the authenticated user from the session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If no user or auth error, redirect to login
  if (!user || authError) {
    const loginUrl = new URL("/admin/login", request.url);
    // Pass the original path as redirect param so we can go there after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // =====================================================================
  // 4. CHECK EMAIL AUTHORIZATION
  // =====================================================================
  const userEmail = user.email?.toLowerCase().trim();

  if (userEmail !== ALLOWED_ADMIN_EMAIL) {
    // User is authenticated but NOT the authorized admin email
    // Redirect to unauthorized page (which IS in bypass list, so no loop)
    const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // =====================================================================
  // 5. ADD NOINDEX HEADER FOR ALL ADMIN ROUTES
  // =====================================================================
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all admin paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - Public files
     */
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};