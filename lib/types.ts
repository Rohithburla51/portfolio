/**
 * Database row types (Supabase tables).
 * These mirror the SQL schema in `supabase/schema.sql`.
 */

export interface Certificate {
  id: string;
  name: string;
  organization: string;
  issue_date: string;
  image_url: string | null;
  pdf_url: string | null;
  verify_url: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FeaturedProject {
  id: string;
  repo_name: string;
  title: string;
  tagline: string | null;
  long_description: string | null;
  media_urls: string[] | null;
  technologies: string[] | null;
  highlights: string[] | null;
  github_url: string | null;
  live_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: "hackathon" | "competition" | "certification" | "coding" | "academic" | "other";
  description: string | null;
  icon: string | null;
  date: string | null;
  link: string | null;
  display_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteConfig {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string | null;
  technologies: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string;
  cover_image_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  reading_time_min: number | null;
  created_at: string;
  updated_at: string;
}
