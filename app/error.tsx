"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portfolio] runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-[var(--color-text-muted)]">
          A runtime error occurred. The issue has been logged. Try refreshing
          the page.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 text-sm font-semibold text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
