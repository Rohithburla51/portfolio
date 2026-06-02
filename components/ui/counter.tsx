"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  format?: "default" | "compact";
}

function compactFormat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function Counter({
  value,
  duration = 1.6,
  className,
  suffix = "",
  prefix = "",
  format = "default",
}: CounterProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(reduce ? value : 0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const step = (now: number) => {
              const elapsed = (now - start) / 1000;
              const progress = Math.min(1, elapsed / duration);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
              setDisplay(Math.floor(eased * value));
              if (progress < 1) requestAnimationFrame(step);
              else setDisplay(value);
            };
            requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format === "compact" ? compactFormat(display) : display.toString()}
      {suffix}
    </span>
  );
}
