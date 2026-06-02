"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  showArrow?: boolean;
  icon?: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<LinkProps, keyof BaseProps> & {
    href: string;
    external?: boolean;
  };

type GradientButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]",
  secondary:
    "glass text-[var(--color-text)] hover:bg-[var(--color-glass-hover)] border border-[var(--color-border)]",
  ghost: "text-[var(--color-text)] hover:bg-white/5",
  outline:
    "border border-[var(--color-primary)]/40 text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export const GradientButton = React.forwardRef<HTMLElement, GradientButtonProps>(
  function GradientButton(props, ref) {
    const reduce = useReducedMotion();
    const {
      variant = "primary",
      size = "md",
      className,
      children,
      showArrow = false,
      icon,
      ...rest
    } = props as BaseProps & { href?: string; external?: boolean } & Record<string, unknown>;

    const classes = cn(
      "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    const content = (
      <>
        {variant === "primary" && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
        {icon && <span className="relative">{icon}</span>}
        <span className="relative">{children}</span>
        {showArrow && (
          <ArrowRight
            className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        )}
      </>
    );

    if ("href" in rest && rest.href) {
      const { href, external, ...linkRest } = rest as LinkProps & { external?: boolean };
      if (external) {
        return (
          <motion.a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href as string}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { y: 0 }}
            {...(linkRest as object)}
          >
            {content}
          </motion.a>
        );
      }
      return (
        <motion.span
          ref={ref as React.Ref<HTMLSpanElement>}
          className="inline-block"
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { y: 0 }}
        >
          <Link href={href} className={classes} {...(linkRest as object)}>
            {content}
          </Link>
        </motion.span>
      );
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        whileHover={reduce ? undefined : { y: -2 }}
        whileTap={reduce ? undefined : { y: 0 }}
      >
        {content}
      </motion.button>
    );
  },
);
