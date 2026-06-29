import { createAdminClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  Award,
  Trophy,
  FileText,
  Clock,
  TrendingUp,
  Eye,
  Briefcase,
  Github,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const supabase = await createAdminClient();
  if (!supabase) return { certificates: 0, achievements: 0, posts: 0, experiences: 0 };

  const [
    { count: certificates },
    { count: achievements },
    { count: posts },
    { count: experiences },
  ] = await Promise.all([
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("experiences").select("*", { count: "exact", head: true }),
  ]);

  return {
    certificates: certificates ?? 0,
    achievements: achievements ?? 0,
    posts: posts ?? 0,
    experiences: experiences ?? 0,
  };
}

async function getRecentPosts() {
  const supabase = await createAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("posts")
    .select("id, title, is_published, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return data ?? [];
}

const STAT_CARDS = [
  { label: "Certificates", key: "certificates" as const, icon: Award, color: "from-purple-500 to-pink-500" },
  { label: "Achievements", key: "achievements" as const, icon: Trophy, color: "from-amber-500 to-orange-500" },
  { label: "Blog Posts", key: "posts" as const, icon: FileText, color: "from-green-500 to-emerald-500" },
  { label: "Experience", key: "experiences" as const, icon: Briefcase, color: "from-indigo-500 to-violet-500" },
];

export const metadata = {
  title: "Dashboard — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [stats, recentPosts] = await Promise.all([getStats(), getRecentPosts()]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Welcome back! Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <div
              key={card.key}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{value}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} bg-opacity-20`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-[#6366f1]" />
            Quick Actions
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/admin/experiences"
              className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4 text-center transition-all hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5"
            >
              <Briefcase className="h-6 w-6 text-[#6366f1]" />
              <span className="text-sm font-medium text-white">Add Experience</span>
            </Link>
            <Link
              href="/admin/experiences"
              className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4 text-center transition-all hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5"
            >
              <Github className="h-6 w-6 text-[#8b5cf6]" />
              <span className="text-sm font-medium text-white">GitHub Auto-sync</span>
            </Link>
            <Link
              href="/admin/posts"
              className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4 text-center transition-all hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5"
            >
              <FileText className="h-6 w-6 text-[#8b5cf6]" />
              <span className="text-sm font-medium text-white">Write Blog Post</span>
            </Link>
            <Link
              href="/admin/certificates"
              className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4 text-center transition-all hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/5"
            >
              <Award className="h-6 w-6 text-[#06b6d4]" />
              <span className="text-sm font-medium text-white">Add Certificate</span>
            </Link>
            <Link
              href="/admin/profile"
              className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] p-4 text-center transition-all hover:border-white/20 hover:bg-white/[0.06]"
            >
              <Eye className="h-6 w-6 text-white/60" />
              <span className="text-sm font-medium text-white">Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-5 w-5 text-[#6366f1]" />
              Recent Posts
            </h2>
            <Link
              href="/admin/posts"
              className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
            >
              View all
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                No blog posts yet. Start writing!
              </p>
              <Link
                href="/admin/posts"
                className="mt-3 inline-block text-sm text-[#6366f1] hover:text-[#818cf8]"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentPosts.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{post.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {post.is_published ? "Published" : "Draft"} ·{" "}
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.is_published
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {post.is_published ? "Live" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Content Summary</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
              <div className="flex h-full">
                {stats.certificates > 0 && (
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${(stats.certificates / (stats.certificates + stats.achievements + stats.experiences)) * 100}%` }}
                  />
                )}
                {stats.achievements > 0 && (
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${(stats.achievements / (stats.certificates + stats.achievements + stats.experiences)) * 100}%` }}
                  />
                )}
                {stats.experiences > 0 && (
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${(stats.experiences / (stats.certificates + stats.achievements + stats.experiences)) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              Certificates ({stats.certificates})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              Achievements ({stats.achievements})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              Experience ({stats.experiences})
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          <Github className="inline h-3.5 w-3.5 mr-1" />
          Projects are auto-synced from GitHub — no manual management needed.
        </p>
      </div>
    </div>
  );
}