"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#achievements", label: "Achievements" },
  { href: "#blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string>("");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.href.replace("#", ""));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={reduce ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(15,23,42,0.7)] backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
          aria-label={`${SITE.name} — home`}
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
            <span className="text-sm font-bold">{SITE.initials}</span>
            <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-50" />
          </span>
          <span className="hidden sm:inline-block">
            {SITE.name.split(" ")[0]}
            <span className="text-[var(--color-text-muted)]">
              {SITE.name.split(" ")[1] ? " " + SITE.name.split(" ")[1] : ""}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  "relative inline-block px-3 py-2 text-sm font-medium transition-colors",
                  active === l.href
                    ? "text-white"
                    : "text-[var(--color-text-muted)] hover:text-white",
                )}
              >
                {l.label}
                {active === l.href && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Right CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#resume"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-medium text-white/90 transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Resume
          </a>
          <a
            href="#contact"
            className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-shadow hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          >
            Contact
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full glass md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/[0.06] bg-[rgba(15,23,42,0.9)] backdrop-blur-xl md:hidden"
          >
            <ul className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="flex gap-2 pt-2">
                <a
                  href="#resume"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-white/10 px-4 py-3 text-center text-sm font-medium"
                >
                  Resume
                </a>
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-3 text-center text-sm font-medium"
                >
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
