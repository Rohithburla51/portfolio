import * as React from "react";
import { Download, FileText, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableLink } from "@/components/ui/trackable-link";
import { SITE } from "@/lib/utils";
import { getSiteConfig } from "@/lib/data";

export async function Resume() {
  const config = await getSiteConfig<{ url: string | null; version: string | null } | null>(
    "resume_url",
  );
  const resumeUrl = config?.url ?? null;

  // Local fallback to /resume.pdf if not uploaded yet
  const finalUrl = resumeUrl ?? "/resume.pdf";

  return (
    <section id="resume" className="section relative" aria-label="Resume">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Resume"
          title="My "
          gradientWord="story on one page"
          description="A printable one-pager covering education, projects, skills, and achievements."
        />

        <GlassCard className="mt-14 overflow-hidden p-0" hover={false}>
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-center gap-4 p-7 md:p-10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    {SITE.name} — Resume
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    PDF · Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]">
                Built around the roles I want: ML Engineer, AI Engineer, and
                Software Developer. The PDF mirrors my website content for
                recruiters who prefer a one-page attachment.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <TrackableLink
                  href={finalUrl}
                  event="resume_download"
                  eventParams={{ source: "resume-section" }}
                  external={false}
                  download
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
                  ariaLabel="Download resume PDF"
                >
                  <Download className="h-4 w-4" />
                  Download Resume
                </TrackableLink>
                <TrackableLink
                  href={finalUrl}
                  event="external_link"
                  eventParams={{ source: "resume-preview" }}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  ariaLabel="Open resume in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </TrackableLink>
              </div>
            </div>

            {/* PDF preview */}
            <div className="relative h-72 border-l border-white/5 bg-black/40 md:h-auto md:min-h-[360px]">
              <iframe
                src={`${finalUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Resume preview"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent md:hidden"
                aria-hidden
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
