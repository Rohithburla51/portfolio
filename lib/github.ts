/**
 * GitHub REST API integration.
 * Fetches public repositories for a user with server-side caching.
 */

const GITHUB_API = "https://api.github.com";

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string; html_url: string };
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  archived: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  visibility: "public" | "private";
}

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
}

export interface GithubLanguages {
  [language: string]: number;
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-burla-rohith",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch the authenticated user's profile.
 * 1-hour ISR cache.
 */
export async function getGithubProfile(username: string): Promise<GithubProfile | null> {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}`, {
      headers: authHeaders(),
      next: { revalidate: 3600, tags: ["github-profile"] },
    });
    if (!res.ok) return null;
    return (await res.json()) as GithubProfile;
  } catch (error) {
    console.error("[github] profile fetch failed:", error);
    return null;
  }
}

/**
 * Fetch all public repos for a user (excludes forks by default).
 * Cached 1 hour, tagged for revalidation.
 */
export async function getGithubRepos(
  username: string,
  options: { includeForks?: boolean; sort?: "created" | "updated" | "pushed" } = {},
): Promise<GithubRepo[]> {
  const { includeForks = false, sort = "updated" } = options;
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=${sort}&type=owner`,
      {
        headers: authHeaders(),
        next: { revalidate: 3600, tags: ["github-repos"] },
      },
    );
    if (!res.ok) {
      console.error(`[github] repos fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const repos = (await res.json()) as GithubRepo[];
    return repos
      .filter((r) => (includeForks ? true : !r.fork) && !r.archived)
      .sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      });
  } catch (error) {
    console.error("[github] repos fetch failed:", error);
    return [];
  }
}

/**
 * Fetch language byte counts for a repo.
 */
export async function getRepoLanguages(
  owner: string,
  repo: string,
): Promise<GithubLanguages> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
      headers: authHeaders(),
      next: { revalidate: 86400, tags: [`github-langs-${repo}`] },
    });
    if (!res.ok) return {};
    return (await res.json()) as GithubLanguages;
  } catch {
    return {};
  }
}

/**
 * Fetch raw README.md for a repo. Tries multiple casings.
 * Returns null if none found.
 */
export async function getRepoReadme(owner: string, repo: string): Promise<string | null> {
  const candidates = ["README.md", "Readme.md", "readme.md", "README.MD", "README"];
  for (const filename of candidates) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filename}`,
        {
          headers: { Accept: "text/plain" },
          next: { revalidate: 3600, tags: [`github-readme-${repo}`] },
        },
      );
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) return text;
      }
    } catch {
      // try next
    }
  }
  return null;
}

/**
 * Aggregate stats from a list of repos.
 */
export function aggregateStats(repos: GithubRepo[]) {
  return {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
    languages: Array.from(
      new Set(repos.map((r) => r.language).filter((l): l is string => Boolean(l))),
    ),
  };
}
