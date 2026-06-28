"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * A subtle pointer-following glow that sits behind interactive elements.
 * Disabled on touch devices and when reduced motion is requested.
 */
export function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduce) return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;
    setEnabled(true);
  }, [reduce]);

  React.useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    let raf: number;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full opacity-40 mix-blend-screen dark:mix-blend-screen dark:opacity-40"
      style={{
        background:
          "radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.08) 35%, transparent 60%)",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
}
