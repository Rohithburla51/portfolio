"use client";

import * as React from "react";
import { useReducedMotion, useScroll, useTransform, motion } from "framer-motion";

/**
 * Decorative animated mesh background used in the hero and section dividers.
 * Renders 3 blurred orbs that drift slowly.
 */
export function AnimatedMesh({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -100]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      {/* base gradient mesh */}
      <div className="absolute inset-0 bg-mesh opacity-60" />

      {/* drifting orbs */}
      {!reduce && (
        <>
          <motion.div
            style={{ y: y1 }}
            className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-[#6366f1] opacity-[0.15] blur-[120px]"
            animate={{
              x: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-[#8b5cf6] opacity-[0.18] blur-[120px]"
            animate={{
              x: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-[#06b6d4] opacity-[0.12] blur-[120px]"
            animate={{
              x: [0, 40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />
    </div>
  );
}
