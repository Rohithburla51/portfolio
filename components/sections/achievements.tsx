import * as React from "react";
import {
  Trophy,
  Code2,
  GraduationCap,
  Sparkles,
  Award,
  Target,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableLink } from "@/components/ui/trackable-link";
import { SeeMoreGrid } from "@/components/ui/see-more-grid";
import { getAchievements } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const VISIBLE_COUNT = 4;

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  code: Code2,
  "code-2": Code2,
  award: Award,
  graduation: GraduationCap,
  "graduation-cap": GraduationCap,
  target: Target,
  bot: Sparkles,
  sparkles: Sparkles,
};

const CATEGORY_LABEL: Record<string, string> = {
  hackathon: "Hackathon",
  competition: "Competition",
  certification: "Certification",
  coding: "Coding",
  academic: "Academic",
  other: "Other",
};

export async function Achievements() {
  const achievements = await getAchievements();

  if (achievements.length === 0) {
    return null;
  }

  return (
    <section
      id="achievements"
      className="section relative"
      aria-label="Achievements"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Achievements"
          title="Milestones and "
          gradientWord="recognition"
          description="Hackathons, certifications, and academic wins — the things that pushed my craft forward."
        />

        <AchievementsGrid achievements={achievements} />
      </div>
    </section>
  );
}

function AchievementsGrid({ achievements }: { achievements: Awaited<ReturnType<typeof getAchievements>> }) {
  return (
    <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <SeeMoreGrid visibleCount={VISIBLE_COUNT}>
        {achievements.map((a) => {
          const Icon = ICON_MAP[a.icon ?? ""] ?? Trophy;
          return (
            <TrackableLink
              key={a.id}
              href={a.link ?? "#"}
              event="external_link"
              eventParams={{ source: "achievements", title: a.title }}
              external={Boolean(a.link)}
              ariaLabel={a.title}
              className="group block focus:outline-none"
            >
              <GlassCard className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    {CATEGORY_LABEL[a.category] ?? a.category}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight">
                  {a.title}
                </h3>
                {a.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--color-text-muted)]">
                    {a.description}
                  </p>
                )}
                {a.date && (
                  <p className="mt-auto pt-4 font-mono text-xs text-[var(--color-text-muted)]">
                    {formatDate(a.date)}
                  </p>
                )}
              </GlassCard>
            </TrackableLink>
          );
        })}
      </SeeMoreGrid>
    </div>
  );
}
