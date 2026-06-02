"use client";

import * as React from "react";
import { motion } from "framer-motion";

const TYPING_SPEED = 90;
const DELETING_SPEED = 50;
const PAUSE_AFTER_TYPED = 1800;
const PAUSE_AFTER_DELETED = 350;

interface TypingAnimationProps {
  words: string[];
  className?: string;
  cursorClassName?: string;
}

/**
 * Type-out / delete animation cycling through a list of words.
 * Uses setTimeout-driven state changes (not synchronous effect cascades).
 */
export function TypingAnimation({
  words,
  className,
  cursorClassName,
}: TypingAnimationProps) {
  const [wordIndex, setWordIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const reduceMotion = React.useRef(false);

  React.useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  React.useEffect(() => {
    if (words.length === 0) return;

    if (reduceMotion.current) {
      setText(words[0] ?? "");
      return;
    }

    const current = words[wordIndex] ?? "";
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (text === current) {
      // word fully typed → pause, then advance
      timer = setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length);
        setText("");
      }, PAUSE_AFTER_TYPED);
    } else if (text.length < current.length) {
      // typing forward
      timer = setTimeout(
        () => setText(current.slice(0, text.length + 1)),
        TYPING_SPEED,
      );
    } else {
      // overshoot (shouldn't happen) — reset
      timer = setTimeout(() => setText(""), PAUSE_AFTER_TYPED);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [text, wordIndex, words]);

  return (
    <span className={className}>
      <span aria-live="polite" className="sr-only">
        {text || words[0] || ""}
      </span>
      <span aria-hidden>{text || (reduceMotion.current ? words[0] : "")}</span>
      <motion.span
        className={`ml-1 inline-block h-[1em] w-[3px] translate-y-[0.1em] bg-current align-middle ${
          cursorClassName ?? ""
        }`}
        animate={reduceMotion.current ? undefined : { opacity: [1, 0] }}
        transition={
          reduceMotion.current
            ? undefined
            : { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </span>
  );
}
