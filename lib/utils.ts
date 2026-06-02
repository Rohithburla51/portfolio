import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export tracking helpers so callers can `import { trackEvent } from "@/lib/utils"`.
export { trackEvent, pageview, GA_ID, type EventName } from "@/lib/analytics";

/**
 * Combine class names with Tailwind merge to deduplicate conflicting classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display in the UI.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date as a relative time (e.g., "3 days ago").
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: Array<[number, string]> = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const interval = Math.floor(seconds / secs);
    if (interval >= 1) {
      return `${interval} ${label}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

/**
 * Estimate reading time in minutes from text.
 */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Slugify a string for URLs.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

/**
 * Sleep for ms milliseconds (server-side use).
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Site-wide constants.
 */
export const SITE = {
  name: "Burla Rohith",
  role: "AI & ML Engineer",
  shortRole: "AI & ML Engineer · Software Developer",
  email: "burlarohith999@gmail.com",
  phone: "", // intentionally hidden
  location: "Medak, Telangana, India",
  bio: "B.Tech CSE (AI & ML) '27 at CMR College of Engineering and Technology. Building AI-powered solutions in Machine Learning, Computer Vision, and NLP — with a goal to become a skilled ML Engineer creating impactful, scalable tech.",
  initials: "BR",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  githubUsername: process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "Rohithburla51",
  leetcodeUsername: process.env.NEXT_PUBLIC_LEETCODE_USERNAME ?? "ROHITH_PROGRAMMER",
  socials: {
    github: "https://github.com/Rohithburla51",
    linkedin: "https://www.linkedin.com/in/burla-rohith-25a31a361",
    leetcode: "https://leetcode.com/u/ROHITH_PROGRAMMER/",
    geeksforgeeks: "https://www.geeksforgeeks.org/profile/burlaroh84ul",
    email: "mailto:burlarohith999@gmail.com",
  },
} as const;
