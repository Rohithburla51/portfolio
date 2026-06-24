"use client";

import * as React from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white",
        "shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all",
        "hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-110",
        "md:bottom-8 md:right-8",
        mounted ? "opacity-100 scale-100" : "opacity-0 scale-0"
      )}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
      aria-label={isOpen ? "Close chat" : "Open chat assistant"}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
      {!isOpen && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#06b6d4] opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#06b6d4]" />
        </span>
      )}
    </button>
  );
}