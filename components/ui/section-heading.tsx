"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  gradientWord?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
  gradientWord,
}: SectionHeadingProps) {
  const reduce = useReducedMotion();

  const renderTitle = () => {
    if (!gradientWord) return title;
    const idx = title.indexOf(gradientWord);
    if (idx === -1) return title;
    return (
      <>
        {title.slice(0, idx)}
        <span className="text-gradient">{gradientWord}</span>
        {title.slice(idx + gradientWord.length)}
      </>
    );
  };

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
          {eyebrow}
        </motion.div>
      )}

      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className={cn(
          "font-display text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-6xl",
          titleClassName,
        )}
      >
        {renderTitle()}
      </motion.h2>

      {description && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
