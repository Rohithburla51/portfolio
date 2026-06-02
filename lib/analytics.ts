/**
 * Google Analytics 4 (gtag.js) helpers.
 * Use these on client components for event tracking.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function pageview(url: string) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
}

export type EventName =
  | "resume_download"
  | "contact_submit"
  | "contact_success"
  | "contact_error"
  | "github_click"
  | "linkedin_click"
  | "leetcode_click"
  | "geeksforgeeks_click"
  | "email_click"
  | "cert_view"
  | "cert_download"
  | "cert_verify"
  | "cert_pdf_open"
  | "project_readme_open"
  | "project_github"
  | "project_demo"
  | "external_link";

export function trackEvent(name: EventName, params: Record<string, string | number> = {}) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
