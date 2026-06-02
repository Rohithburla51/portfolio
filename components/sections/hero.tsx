"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Download, Mail, Github, Linkedin, Sparkles } from "lucide-react";
import { AnimatedMesh } from "@/components/motion/animated-mesh";
import { TypingAnimation } from "@/components/motion/typing-animation";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { SITE, trackEvent } from "@/lib/utils";

const TYPING_WORDS = [
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Software Development",
];

export function Hero() {
  const reduce = useReducedMotion();
  const [resumeUrl, setResumeUrl] = React.useState<string | null>(null);

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen items-center overflow-hidden pt-24 md:pt-28"
      aria-label="Introduction"
    >
      <AnimatedMesh />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 md:grid-cols-[1.4fr_1fr] md:px-6 md:pb-32">
        {/* LEFT */}
        <div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[var(--color-text-muted)]">
              Available for internships · MLE roles
            </span>
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.95] tracking-tight"
          >
            Burla
            <br />
            <span className="text-gradient">Rohith</span>
          </motion.h1>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 flex flex-col gap-2"
          >
            <p className="text-lg font-medium text-white md:text-xl">
              {SITE.shortRole}
            </p>
            <p className="font-mono text-sm text-[var(--color-text-muted)] md:text-base">
              <span className="text-[var(--color-text-muted)]">I build with </span>
              <TypingAnimation
                words={TYPING_WORDS}
                className="text-gradient font-medium"
              />
            </p>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg"
          >
            B.Tech CSE (AI &amp; ML) &lsquo;27 @ CMR College of Engineering and
            Technology. Focused on building AI-powered products that bridge
            research and real-world deployment.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href={resumeUrl ?? "#resume"}
              onClick={() => trackEvent("resume_download", { source: "hero" })}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
            >
              <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Download Resume
            </a>
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
            >
              <Mail className="h-4 w-4" />
              Contact Me
            </a>
            <a
              href={SITE.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("github_click", { source: "hero" })}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={SITE.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("linkedin_click", { source: "hero" })}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[var(--color-text-muted)]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
              <span>
                <span className="font-semibold text-white">2</span> Production AI
                Projects
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#06b6d4]" />
              <span>
                <span className="font-semibold text-white">95.66%</span> mIoU
                (SegFormer-B2)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#6366f1]" />
              <span>
                <span className="font-semibold text-white">IIT Tirupati</span>{" "}
                Hackathon &lsquo;25
              </span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Profile image card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative mx-auto w-full max-w-sm md:mx-0 md:ml-auto"
        >
          <div className="relative">
            {/* Decorative ring */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-60 blur-2xl"
              style={{
                background:
                  "conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
              }}
              aria-hidden
            />

            <GlassCard className="relative overflow-hidden rounded-3xl p-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/profile.jpg"
                  alt={`${SITE.name} — portrait`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"
                  aria-hidden
                />
                <div
                  className="absolute inset-0 mix-blend-overlay"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.15) 100%)",
                  }}
                  aria-hidden
                />
              </div>

              <div className="relative -mt-12 flex items-end gap-3 p-5">
                <div className="flex-1">
                  <p className="font-display text-xl font-semibold tracking-tight">
                    {SITE.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {SITE.location}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Open to work
                </span>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        aria-label="Scroll to About"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[var(--color-text-muted)]"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={reduce ? undefined : { duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em]"
        >
          <span>Scroll</span>
          <ArrowDown className="h-3 w-3" />
        </motion.div>
      </motion.a>
    </section>
  );
}
