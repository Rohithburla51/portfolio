/**
 * Supabase clients.
 *
 * Client model:
 *   - `createBrowserSupabase()`  → browser (anon key)
 *   - `createServerSupabase()`   → RSC / Route Handlers (anon + cookies, for user context)
 *   - `createPublicSupabase()`   → server-only public reads (anon key, no cookies).
 *                                  This is what `lib/data.ts` uses. It respects RLS but
 *                                  does NOT impersonate the current user, which is fine
 *                                  for the public portfolio (all public tables grant
 *                                  SELECT to anon via RLS policies).
 *   - `createAdminClient()`      → server-only, bypasses RLS. Used for Phase 2 admin
 *                                  (magic-link auth, CRUD on posts/certs/etc).
 *                                  Returns `null` if the service role key is missing or
 *                                  malformed — callers must check.
 *
 * All clients normalize the project URL: any trailing path like `/rest/v1`, `/auth/v1`,
 * or `/storage/v1` is stripped before being passed to supabase-js, which would otherwise
 * produce double-suffix URLs (e.g. /rest/v1/rest/v1/...).
 */

import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createAdminSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfigured() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }
}

/**
 * Normalize a Supabase project URL.
 * Accepts:
 *   - https://xxx.supabase.co
 *   - https://xxx.supabase.co/
 *   - https://xxx.supabase.co/rest/v1/
 *   - https://xxx.supabase.co/auth/v1
 *   - https://custom-domain.com
 * Returns: canonical project URL with no trailing slash, no `/rest/v1` etc.
 */
function normalizeSupabaseUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  // strip trailing slash and any known Supabase subpath
  const host = `${u.protocol}//${u.host}`;
  return host;
}

const normalizedUrl = normalizeSupabaseUrl(url);

/* ------------------------------------------------------------------ */
/* Browser (Client Components)                                       */
/* ------------------------------------------------------------------ */
export function createBrowserSupabase() {
  assertConfigured();
  return createBrowserClient(normalizedUrl!, anonKey!);
}

/* ------------------------------------------------------------------ */
/* Server (RSC / Route Handlers with user session via cookies)        */
/* ------------------------------------------------------------------ */
export async function createServerSupabase() {
  assertConfigured();
  const cookieStore = await cookies();
  return createServerClient(normalizedUrl!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; only Route Handlers/Server Actions can.
        }
      },
    },
  });
}

/* ------------------------------------------------------------------ */
/* Public (server-only reads, anon key, no cookies)                  */
/* Use this for cached data layer reads — respects RLS but no user ctx */
/* ------------------------------------------------------------------ */
let _publicClient: SupabaseClient | null = null;
export function createPublicSupabase(): SupabaseClient | null {
  if (!normalizedUrl || !anonKey) {
    console.warn("[supabase] public client: missing URL or anon key");
    return null;
  }
  if (!_publicClient) {
    _publicClient = createAdminSupabaseClient(normalizedUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _publicClient;
}

/* ------------------------------------------------------------------ */
/* Admin (server-only, bypasses RLS)                                 */
/* Returns null if SUPABASE_SERVICE_ROLE_KEY is missing or empty.    */
/* Phase 2 admin dashboard will use this for writes.                  */
/* ------------------------------------------------------------------ */
let _adminClient: SupabaseClient | null = null;
let _adminWarned = false;
export function createAdminClient(): SupabaseClient | null {
  if (!normalizedUrl) {
    console.warn("[supabase] admin client: missing NEXT_PUBLIC_SUPABASE_URL");
    return null;
  }
  if (!serviceKey) {
    if (!_adminWarned) {
      console.warn(
        "[supabase] admin client: SUPABASE_SERVICE_ROLE_KEY not set — admin operations disabled",
      );
      _adminWarned = true;
    }
    return null;
  }
  if (!_adminClient) {
    _adminClient = createAdminSupabaseClient(normalizedUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _adminClient;
}
