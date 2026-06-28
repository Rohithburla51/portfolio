/**
 * LeetCode live stats via LeetCode's public GraphQL API.
 * Falls back to manual `site_config.leetcode_solved` on failure.
 */

import { createPublicSupabase } from "@/lib/supabase";

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

const LEETCODE_GRAPHQL_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
        reputation
        starRating
      }
    }
  }
`;

/**
 * Fetch live LeetCode stats via LeetCode GraphQL API.
 * Order: LeetCode GraphQL -> Alfa API (backup) -> site_config DB -> hardcoded defaults.
 */
export async function getLeetCodeStats(): Promise<LeetCodeStats> {
  // 1. Try LeetCode's own GraphQL API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({
        query: LEETCODE_GRAPHQL_QUERY,
        variables: { username: LEETCODE_USERNAME },
      }),
      next: { revalidate: 3600, tags: ["leetcode-stats"] },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json() as {
        data?: {
          matchedUser?: {
            submitStats?: {
              acSubmissionNum?: Array<{ difficulty: string; count: number }>;
            };
            profile?: { ranking?: number; reputation?: number };
          };
        };
      };

      const user = json.data?.matchedUser;
      if (user) {
        const subs = user.submitStats?.acSubmissionNum ?? [];
        const find = (d: string) => subs.find((s) => s.difficulty === d)?.count ?? 0;
        return {
          total: find("All"),
          easy: find("Easy"),
          medium: find("Medium"),
          hard: find("Hard"),
          ranking: user.profile?.ranking ?? null,
          contributionPoints: 0,
          reputation: user.profile?.reputation ?? 0,
          source: "live",
          fetchedAt: new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.warn("[leetcode] GraphQL fetch failed:", error);
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
