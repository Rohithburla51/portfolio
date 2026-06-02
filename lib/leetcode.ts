/**
 * LeetCode live stats via Alfa LeetCode API.
 * Falls back to manual `site_config.leetcode_solved` on failure.
 */

import { createPublicSupabase } from "@/lib/supabase";

const ALFA_API_BASE = process.env.LEETCODE_API_BASE ?? "https://alfa-leetcode-api.onrender.com";
const LEETCODE_USERNAME = process.env.NEXT_PUBLIC_LEETCODE_USERNAME ?? "ROHITH_PROGRAMMER";

export interface LeetCodeStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number | null;
  contributionPoints: number;
  reputation: number;
  source: "live" | "fallback" | "default";
  fetchedAt: string;
}

const FALLBACK_DEFAULTS: Omit<LeetCodeStats, "source" | "fetchedAt"> = {
  total: 395,
  easy: 0,
  medium: 0,
  hard: 0,
  ranking: null,
  contributionPoints: 0,
  reputation: 0,
};

interface AlfaUserProfile {
  username: string;
  totalSolved?: number;
  totalSubmissions?: Array<{ difficulty: string; count: number; submissions: number }>;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  ranking?: number;
  contributionPoints?: number;
  reputation?: number;
}

/**
 * Fetch live LeetCode stats with timeout and fallback chain.
 * Order: Alfa API -> site_config.leetcode_solved -> hardcoded defaults.
 */
export async function getLeetCodeStats(): Promise<LeetCodeStats> {
  // 1. Try live API with a 5s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${ALFA_API_BASE}/userProfile/${LEETCODE_USERNAME}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 3600, tags: ["leetcode-stats"] },
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = (await res.json()) as AlfaUserProfile;
      const submissions = data.totalSubmissions ?? [];
      const findSub = (d: string) => submissions.find((s) => s.difficulty === d)?.count ?? 0;
      return {
        total: data.totalSolved ?? data.easySolved ?? 0,
        easy: data.easySolved ?? findSub("Easy"),
        medium: data.mediumSolved ?? findSub("Medium"),
        hard: data.hardSolved ?? findSub("Hard"),
        ranking: data.ranking ?? null,
        contributionPoints: data.contributionPoints ?? 0,
        reputation: data.reputation ?? 0,
        source: "live",
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("[leetcode] live fetch failed, falling back:", error);
  }

  // 2. Fallback to site_config.leetcode_solved (DB)
  try {
    const supabase = createPublicSupabase();
    if (!supabase) throw new Error("public supabase unavailable");
    const { data, error } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "leetcode_solved")
      .maybeSingle();
    if (!error && data?.value) {
      const v = data.value as Partial<LeetCodeStats>;
      return {
        total: v.total ?? FALLBACK_DEFAULTS.total,
        easy: v.easy ?? 0,
        medium: v.medium ?? 0,
        hard: v.hard ?? 0,
        ranking: v.ranking ?? null,
        contributionPoints: v.contributionPoints ?? 0,
        reputation: v.reputation ?? 0,
        source: "fallback",
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("[leetcode] DB fallback failed:", error);
  }

  // 3. Hardcoded defaults
  return {
    ...FALLBACK_DEFAULTS,
    source: "default",
    fetchedAt: new Date().toISOString(),
  };
}
