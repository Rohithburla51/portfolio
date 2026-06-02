import * as React from "react";
import Image from "next/image";
import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Counter } from "@/components/ui/counter";
import { SITE } from "@/lib/utils";
import { aggregateStats, getGithubRepos } from "@/lib/github";
import { getLeetCodeStats } from "@/lib/leetcode";

export async function About() {
  const [repos, leetcode] = await Promise.all([
    getGithubRepos(SITE.githubUsername),
    getLeetCodeStats(),
  ]);
  const stats = aggregateStats(repos);

  return (
    <section
      id="about"
      className="section relative"
      aria-label="About"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="About"
          title="Building the future with "
          gradientWord="intelligent systems"
          description="An AI-first engineer with a builder's mindset — turning research papers into shipped products."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Bio */}
          <GlassCard className="p-8 md:p-10" hover={false}>
            <p className="text-lg leading-relaxed text-[var(--color-text)] md:text-xl">
              I am{" "}
              <span className="font-semibold text-white">Burla Rohith</span>, a
              B.Tech student specializing in{" "}
              <span className="text-gradient font-semibold">
                Artificial Intelligence and Machine Learning
              </span>{" "}
              at CMR College of Engineering and Technology.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--color-text-muted)]">
              I am passionate about building AI-powered solutions that solve
              real-world problems through Machine Learning, Computer Vision, and
              Natural Language Processing. I enjoy transforming innovative
              ideas into practical applications and continuously improving my
              skills in software development and emerging technologies.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--color-text-muted)]">
              My goal is to become a skilled{" "}
              <span className="font-semibold text-white">ML Engineer</span> who
              creates impactful and scalable technology solutions.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Projects" value={stats.totalRepos} />
              <Stat label="GitHub Stars" value={stats.totalStars} />
              <Stat
                label="LeetCode"
                value={leetcode.total}
                hint={leetcode.source === "live" ? "live" : "cached"}
              />
              <Stat label="Certifications" value={10} suffix="+" />
            </div>
          </GlassCard>

          {/* Education + Quick facts */}
          <div className="flex flex-col gap-6">
            <GlassCard className="p-7" hover={false}>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                    Education
                  </p>
                  <p className="font-semibold">Current</p>
                </div>
              </div>
              <h3 className="font-display text-2xl font-semibold leading-tight">
                CMR College of Engineering and Technology
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                B.Tech · Computer Science (AI &amp; ML)
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <MapPin className="h-3 w-3" /> Hyderabad, Telangana
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
                  Class of 2027
                </span>
              </div>
            </GlassCard>

            <GlassCard className="p-7" hover={false}>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  What I do
                </p>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "Train and fine-tune deep learning models (CNNs, Transformers, SegFormer)",
                  "Build production CV systems (MediaPipe, OpenCV, custom pipelines)",
                  "Ship end-to-end AI products — from notebook to deployment",
                  "Compete in hackathons and competitive programming",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]" />
                    <span className="text-[var(--color-text)]">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  suffix,
}: {
  label: string;
  value: number;
  hint?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
      <p className="font-display text-2xl font-bold text-white md:text-3xl">
        <Counter value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] md:text-xs">
        {label}
        {hint && (
          <span className="ml-1 text-[var(--color-accent)]">· {hint}</span>
        )}
      </p>
    </div>
  );
}
