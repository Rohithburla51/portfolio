import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Loading
        </p>
      </div>
    </div>
  );
}
