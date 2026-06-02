import * as React from "react";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableLink } from "@/components/ui/trackable-link";
import { getFeaturedProjects } from "@/lib/data";

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="featured"
      className="section relative"
      aria-label="Featured projects"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Case Studies"
          title="Featured "
          gradientWord="deep dives"
          description="Long-form breakdowns of my most significant AI/ML projects — context, architecture, and outcomes."
        />

        <div className="mt-14 space-y-6">
          {projects.map((p, idx) => (
            <FeaturedCard key={p.id} project={p} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeaturedCardProps {
  project: Awaited<ReturnType<typeof getFeaturedProjects>>[number];
  index: number;
}

function FeaturedCard({ project, index }: FeaturedCardProps) {
  const isReversed = index % 2 === 1;
  return (
    <GlassCard className="overflow-hidden p-0" hover={false}>
      <div className="grid gap-0 md:grid-cols-2">
        {/* Media */}
        <div
          className={`relative aspect-[16/10] overflow-hidden md:aspect-auto ${
            isReversed ? "md:order-2" : ""
          }`}
        >
          {project.media_urls && project.media_urls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.media_urls[0]}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]"
              aria-label={`${project.title} preview placeholder`}
            >
              <div className="font-display text-4xl font-bold text-white/30 md:text-6xl">
                {project.title
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase()}
              </div>
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent md:bg-gradient-to-r"
            aria-hidden
          />
        </div>

        {/* Content */}
        <div
          className={`flex flex-col justify-center p-7 md:p-10 ${
            isReversed ? "md:order-1" : ""
          }`}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Case study · 0{index + 1}
          </p>
          <h3 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {project.title}
          </h3>
          {project.tagline && (
            <p className="mt-2 text-base text-[var(--color-text-muted)]">
              {project.tagline}
            </p>
          )}

          {project.long_description && (
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
              {project.long_description}
            </p>
          )}

          {project.highlights && project.highlights.length > 0 && (
            <ul className="mt-5 space-y-2">
              {project.highlights.slice(0, 4).map((h) => (
                <li
                  key={h}
                  className="flex gap-3 text-sm text-[var(--color-text)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-[var(--color-text-muted)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {project.github_url && (
              <TrackableLink
                href={project.github_url}
                event="project_github"
                eventParams={{ project: project.repo_name ?? project.title }}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
                ariaLabel={`View source of ${project.title}`}
              >
                <Github className="h-4 w-4" />
                View source
              </TrackableLink>
            )}
            {project.live_url && (
              <TrackableLink
                href={project.live_url}
                event="project_demo"
                eventParams={{ project: project.repo_name ?? project.title }}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                ariaLabel={`Live demo of ${project.title}`}
              >
                Live demo
                <ExternalLink className="h-3.5 w-3.5" />
              </TrackableLink>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
