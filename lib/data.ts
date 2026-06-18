/**
 * Data access layer.
 *
 * Uses `createPublicSupabase()` — anon key + RLS — for all reads.
 * Every public table has `SELECT ... to anon using (is_active = true)`
 * or equivalent policies, so anon reads work without the service role key.
 *
 * Each function returns [] / null on failure so the UI can render gracefully.
 */

import { unstable_cache as cache } from "next/cache";
import { createPublicSupabase } from "@/lib/supabase";
import type {
  Achievement,
  Certificate,
  Experience,
  FeaturedProject,
  Post,
  Profile,
} from "@/lib/types";

/* ------------------------------- Profile --------------------------- */
export const getProfile = cache(
  async (): Promise<Profile | null> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    } catch (e) {
      console.error("[data] getProfile failed:", e);
      return null;
    }
  },
  ["profile"],
  { revalidate: 600, tags: ["profile"] },
);

/* --------------------------- Certificates -------------------------- */
export const getCertificates = cache(
  async (): Promise<Certificate[]> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Certificate[];
    } catch (e) {
      console.error("[data] getCertificates failed:", e);
      return [];
    }
  },
  ["certificates"],
  { revalidate: 600, tags: ["certificates"] },
);

/* ------------------------ Featured projects ------------------------ */
export const getFeaturedProjects = cache(
  async (): Promise<FeaturedProject[]> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("featured_projects")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FeaturedProject[];
    } catch (e) {
      console.error("[data] getFeaturedProjects failed:", e);
      return [];
    }
  },
  ["featured-projects"],
  { revalidate: 600, tags: ["featured-projects"] },
);

/* --------------------------- Achievements -------------------------- */
export const getAchievements = cache(
  async (): Promise<Achievement[]> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Achievement[];
    } catch (e) {
      console.error("[data] getAchievements failed:", e);
      return [];
    }
  },
  ["achievements"],
  { revalidate: 600, tags: ["achievements"] },
);

/* ----------------------------- Experience -------------------------- */
export const getExperiences = cache(
  async (): Promise<Experience[]> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Experience[];
    } catch (e) {
      console.error("[data] getExperiences failed:", e);
      return [];
    }
  },
  ["experiences"],
  { revalidate: 600, tags: ["experiences"] },
);

/* ------------------------------- Posts ----------------------------- */
export const getPublishedPosts = cache(
  async (limit = 6): Promise<Post[]> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Post[];
    } catch (e) {
      console.error("[data] getPublishedPosts failed:", e);
      return [];
    }
  },
  ["posts"],
  { revalidate: 300, tags: ["posts"] },
);

export const getPostBySlug = cache(
  async (slug: string): Promise<Post | null> => {
    try {
      const supabase = createPublicSupabase();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Post | null;
    } catch (e) {
      console.error("[data] getPostBySlug failed:", e);
      return null;
    }
  },
  ["post-by-slug"],
  { revalidate: 300, tags: ["posts"] },
);

/* ------------------------- Site configuration ---------------------- */
export async function getSiteConfig<T = Record<string, unknown>>(
  key: string,
): Promise<T | null> {
  try {
    const supabase = createPublicSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return (data?.value as T) ?? null;
  } catch (e) {
    console.error(`[data] getSiteConfig(${key}) failed:`, e);
    return null;
  }
}
