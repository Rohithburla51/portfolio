import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b5cf6]">
          404
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight md:text-7xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-[var(--color-text-muted)]">
          The page you&apos;re looking for has drifted into the void. Let&apos;s get
          you back.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 text-sm font-semibold text-white"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
