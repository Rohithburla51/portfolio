"use client";

import * as React from "react";
import { SeeMoreButton } from "@/components/ui/see-more-button";

interface SeeMoreGridProps {
  children: React.ReactNode[];
  visibleCount: number;
}

export function SeeMoreGrid({ children, visibleCount }: SeeMoreGridProps) {
  const [expanded, setExpanded] = React.useState(false);
  const visible = expanded ? children : children.slice(0, visibleCount);

  return (
    <>
      {visible}
      {children.length > visibleCount && (
        <SeeMoreButton
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          moreCount={children.length - visibleCount}
        />
      )}
    </>
  );
}
