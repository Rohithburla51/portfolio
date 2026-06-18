/**
 * auth/callback/route.ts - Supabase Magic Link callback handler
 *
 * ORIGINAL ISSUE: The redirect response was created BEFORE exchanging the code
 * for a session. This meant cookies weren't set before the redirect happened,
 * causing the session to be lost and users getting stuck in redirect loops.
 *
 * ROOT CAUSE: Line 17 created `NextResponse.redirect()` before the actual
 * `exchangeCodeForSession()` call. The redirect was created with empty cookies,
 * then the session was exchanged but the cookies were already attached to the
 * wrong response object.
 *
 * FIX APPLIED:
 * 1. Create the Supabase client first
 * 2. Exchange the code for a session (this sets session cookies via setAll)
 * 3. THEN create the redirect response (which now has the correct cookies)
 * 4. Validate the user email AFTER exchange (not before)
 * 5. Redirect to unauthorized if wrong email (bypassed in proxy, no loop)
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_ADMIN_EMAIL = "burlarohith999@gmail.com".toLowerCase();

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/admin/login?error=configuration", origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=auth", origin));
  }

  // Step 1: Create the response that will be used for redirect
  // We don't set the redirect URL yet - we need to set cookies first
  const response = NextResponse.redirect(new URL(redirectTo, origin), {
    status: 302,
  });

  // Step 2: Create Supabase client with the response to capture cookie updates
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

  // Step 3: Exchange the auth code for a session
  // This MUST happen before creating the final redirect
  // The supabase client's setAll callback will update our response cookies
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    // Session exchange failed - redirect to login with error
    const errorUrl = new URL("/admin/login", origin);
    errorUrl.searchParams.set("error", "auth");
    return NextResponse.redirect(errorUrl);
  }

  // Step 4: Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Step 5: Validate email authorization
  const userEmail = user?.email?.toLowerCase().trim();

  if (userEmail !== ALLOWED_ADMIN_EMAIL) {
    // Not authorized - sign out and redirect to unauthorized page
    await supabase.auth.signOut();

    const unauthorizedUrl = new URL("/admin/unauthorized", origin);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Step 6: User is authorized - redirect to the intended destination
  // The response already has the session cookies set from step 3
  return response;
}