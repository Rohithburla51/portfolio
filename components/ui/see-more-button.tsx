"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface SeeMoreButtonProps {
  expanded: boolean;
  onClick: () => void;
  moreCount: number;
}

export function SeeMoreButton({ expanded, onClick, moreCount }: SeeMoreButtonProps) {
  return (
    <div className="mt-8 text-center">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
      >
        {expanded ? (
          <>
            Show less
            <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            See more ({moreCount} more)
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
