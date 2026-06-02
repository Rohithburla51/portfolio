import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
}

export function GradientText({
  as: Tag = "span",
  className,
  children,
  ...props
}: GradientTextProps) {
  return React.createElement(
    Tag,
    { className: cn("text-gradient", className), ...props },
    children,
  );
}
