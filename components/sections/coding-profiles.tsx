import * as React from "react";
import { Github, Linkedin, Code2, Trophy, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableLink } from "@/components/ui/trackable-link";
import { Counter } from "@/components/ui/counter";
import { getLeetCodeStats } from "@/lib/leetcode";
import { getGithubProfile, getGithubRepos } from "@/lib/github";
import { SITE } from "@/lib/utils";

interface ProfileLink {
  platform: "GitHub" | "LinkedIn" | "LeetCode" | "GeeksforGeeks";
  username: string;
  url: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
  hoverTrack: "github_click" | "linkedin_click" | "leetcode_click" | "geeksforgeeks_click";
}

export async function CodingProfiles() {
  const [profile, repos, leetcode] = await Promise.all([
    getGithubProfile(SITE.githubUsername),
    getGithubRepos(SITE.githubUsername),
    getLeetCodeStats(),
  ]);

  const profileLinks: ProfileLink[] = [
    {
      platform: "GitHub",
      username: SITE.githubUsername,
      url: SITE.socials.github,
      Icon: Github,
      accent: "from-zinc-700 to-zinc-900",
      hoverTrack: "github_click",
    },
    {
      platform: "LinkedIn",
      username: "burla-rohith-25a31a361",
      url: SITE.socials.linkedin,
      Icon: Linkedin,
      accent: "from-blue-600 to-blue-800",
      hoverTrack: "linkedin_click",
    },
    {
      platform: "LeetCode",
      username: SITE.leetcodeUsername,
      url: SITE.socials.leetcode,
      Icon: Code2,
      accent: "from-amber-500 to-orange-700",
      hoverTrack: "leetcode_click",
    },
    {
      platform: "GeeksforGeeks",
      username: "burlaroh84ul",
      url: SITE.socials.geeksforgeeks,
      Icon: Trophy,
      accent: "from-emerald-500 to-emerald-800",
      hoverTrack: "geeksforgeeks_click",
    },
  ];

  return (
    <section
      id="profiles"
      className="section relative"
      aria-label="Coding profiles"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Coding Profiles"
          title="Where I "
          gradientWord="compete and contribute"
          description="Live stats from public profiles. Numbers update hourly where supported."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {profileLinks.map((p) => (
            <ProfileCard
              key={p.platform}
              profile={p}
              githubProfile={profile}
              repoCount={repos.length}
              leetcodeTotal={leetcode.total}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileCard({
  profile,
  githubProfile,
  repoCount,
  leetcodeTotal,
}: {
  profile: ProfileLink;
  githubProfile: Awaited<ReturnType<typeof getGithubProfile>>;
  repoCount: number;
  leetcodeTotal: number;
}) {
  const { Icon, platform, username, url, accent, hoverTrack } = profile;

  const liveStats = (() => {
    if (platform === "GitHub" && githubProfile) {
      return [
        { label: "Repos", value: repoCount },
        { label: "Stars", value: githubProfile.followers },
        { label: "Followers", value: githubProfile.followers },
      ];
    }
    if (platform === "LeetCode") {
      return [
        { label: "Solved", value: leetcodeTotal },
        { label: "Ranking", value: 1639983, format: true },
        { label: "Reputation", value: 0 },
      ];
    }
    return null;
  })();

  return (
    <TrackableLink
      href={url}
      event={hoverTrack}
      eventParams={{ source: "profiles" }}
      className="group block focus:outline-none"
      ariaLabel={`${platform} profile of ${username}`}
    >
      <GlassCard className="relative h-full overflow-hidden p-6">
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50`}
          aria-hidden
        />

        <div className="relative flex items-start justify-between">
          <div
            className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <ArrowUpRight className="h-5 w-5 text-[var(--color-text-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
        </div>

        <h3 className="relative mt-4 font-display text-xl font-semibold tracking-tight">
          {platform}
        </h3>
        <p className="relative mt-1 break-all font-mono text-xs text-[var(--color-text-muted)]">
          @{username}
        </p>

        {liveStats && (
          <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
            {liveStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-lg font-bold text-white">
                  <Counter
                    value={s.value}
                    format={s.format ? "compact" : "default"}
                  />
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors group-hover:text-white">
          Open Profile
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </GlassCard>
    </TrackableLink>
  );
}
