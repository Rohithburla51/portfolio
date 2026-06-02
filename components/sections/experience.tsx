import * as React from "react";
import { Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { getExperiences } from "@/lib/data";

export async function Experience() {
  const experiences = await getExperiences();

  // Auto-hide if empty
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <section
      id="experience"
      className="section relative"
      aria-label="Experience"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Experience"
          title="Where I've "
          gradientWord="worked"
          description="Professional experience, internships, and roles."
        />

        <div className="relative mt-14">
          {/* Timeline line */}
          <div
            className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[#6366f1] via-[#8b5cf6] to-transparent md:left-1/2"
            aria-hidden
          />

          <ul className="space-y-8">
            {experiences.map((exp, i) => (
              <li
                key={exp.id}
                className={`relative md:grid md:grid-cols-2 md:gap-12 ${
                  i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
                }`}
              >
                {/* Marker */}
                <div
                  className="absolute left-4 top-6 -translate-x-1/2 md:left-1/2"
                  aria-hidden
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#6366f1] bg-[#0f172a]">
                    <Briefcase className="h-4 w-4 text-[#6366f1]" />
                  </div>
                </div>

                <div className={`pl-12 md:pl-0 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <GlassCard className="p-6">
                    <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                      {exp.duration}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                        {exp.description}
                      </p>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className={`mt-4 flex flex-wrap gap-1.5 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                        {exp.technologies.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </div>

                <div className="hidden md:block" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
