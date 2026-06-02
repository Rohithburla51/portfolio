import * as React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, Code2, Trophy } from "lucide-react";
import { SITE } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0a1224]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tight"
            >
              <span className="text-gradient">{SITE.name}</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[var(--color-text-muted)]">
              {SITE.role} · B.Tech CSE (AI &amp; ML) &lsquo;27 @ CMR College of Engineering
              and Technology.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Connect
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <a
                  href={SITE.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Code2 className="h-4 w-4" /> LeetCode
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.geeksforgeeks}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Trophy className="h-4 w-4" /> GeeksforGeeks
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.email}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" /> {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Build
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Designed and engineered by Burla Rohith. Built with Next.js,
              Tailwind, Framer Motion, and Supabase.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-[var(--color-text-muted)] md:flex-row">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <p>
            Built with <span className="text-[#8b5cf6]">♥</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
