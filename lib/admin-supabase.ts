import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function normalizeSupabaseUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

const normalizedUrl = normalizeSupabaseUrl(url);

export async function createAdminSupabaseServerClient() {
  if (!normalizedUrl || !serviceKey) {
    console.warn("[admin-supabase] Missing URL or service key");
    return null;
  }
  const cookieStore = await cookies();
  return createServerClient(normalizedUrl, serviceKey, {
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
          // Server Components cannot set cookies
        }
      },
    },
  });
}

export async function createAdminBrowserClient() {
  if (!normalizedUrl || !anonKey) {
    console.warn("[admin-supabase] Missing URL or anon key");
    return null;
  }
  const { createBrowserClient } = await import("@supabase/ssr");
  return createBrowserClient(normalizedUrl, anonKey);
}