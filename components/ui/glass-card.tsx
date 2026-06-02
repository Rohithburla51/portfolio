"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  glow?: boolean;
}

/**
 * Glassmorphism card with optional hover lift and glow.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass rounded-2xl p-6",
          hover && "glass-hover hover:-translate-y-1",
          glow && "hover:glow",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";
