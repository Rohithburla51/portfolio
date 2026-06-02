import * as React from "react";
import { Star, GitFork, ExternalLink, Github, Code2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableLink } from "@/components/ui/trackable-link";
import { ReadmeModal } from "@/components/sections/readme-modal";
import { getGithubRepos, type GithubRepo } from "@/lib/github";
import { SITE, timeAgo } from "@/lib/utils";

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dart: "#00B4AB",
};

export async function GithubProjects() {
  const repos = await getGithubRepos(SITE.githubUsername);
  const [featured, others] = partitionRepos(repos);

  return (
    <section
      id="projects"
      className="section relative"
      aria-label="GitHub projects"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="GitHub"
          title="Everything I "
          gradientWord="build and ship"
          description={`Auto-synced from github.com/${SITE.githubUsername} — every new public repo appears here automatically.`}
        />

        {/* Featured row (if any) */}
        {featured.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Featured
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              {featured.map((r) => (
                <RepoCard key={r.id} repo={r} featured />
              ))}
            </div>
          </div>
        )}

        {/* All projects */}
        {others.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              All Projects
            </h3>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {others.map((r) => (
                <RepoCard key={r.id} repo={r} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {repos.length === 0 && (
          <GlassCard className="mt-12 p-12 text-center" hover={false}>
            <Github className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              No public repositories yet. Check back soon.
            </p>
          </GlassCard>
        )}

        {/* View all link */}
        <div className="mt-10 text-center">
          <TrackableLink
            href={`https://github.com/${SITE.githubUsername}?tab=repositories`}
            event="external_link"
            eventParams={{ source: "view-all-github" }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
          >
            View all on GitHub
            <ExternalLink className="h-4 w-4" />
          </TrackableLink>
        </div>
      </div>
    </section>
  );
}

function partitionRepos(repos: GithubRepo[]): [GithubRepo[], GithubRepo[]] {
  if (repos.length === 0) return [[], []];
  // Mark the top 2 by stars as featured
  const sorted = [...repos].sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
  });
  return [sorted.slice(0, 2), sorted.slice(2)];
}

function RepoCard({ repo, featured = false }: { repo: GithubRepo; featured?: boolean }) {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] ?? "#94a3b8" : null;
  return (
    <GlassCard
      className={`group flex h-full flex-col ${featured ? "p-7" : "p-6"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
          <Code2 className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.stargazers_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {repo.forks_count}
          </span>
        </div>
      </div>

      <h3
        className={`mt-4 font-display font-semibold tracking-tight ${
          featured ? "text-2xl" : "text-lg"
        }`}
      >
        {repo.name.replace(/_/g, " ")}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm text-[var(--color-text-muted)]">
        {repo.description ?? "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {repo.language && langColor && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            {repo.language}
          </span>
        )}
        {repo.topics.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-muted)]"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-[var(--color-text-muted)]">
        <span>Updated {timeAgo(repo.pushed_at)}</span>
        <div className="flex items-center gap-3">
          <ReadmeModal owner={repo.owner.login} repo={repo.name} />
          <TrackableLink
            href={repo.html_url}
            event="project_github"
            eventParams={{ repo: repo.name }}
            className="inline-flex items-center gap-1 transition-colors hover:text-white"
            ariaLabel={`${repo.name} source on GitHub`}
          >
            <Github className="h-3.5 w-3.5" />
            Source
          </TrackableLink>
        </div>
      </div>
    </GlassCard>
  );
}
