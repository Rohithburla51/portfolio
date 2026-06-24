"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Lock, Shield, AlertCircle } from "lucide-react";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const params = React.use(searchParams);
  const redirectTo = params.redirect || "/admin/dashboard";

  React.useEffect(() => {
    if (params.error === "configuration") {
      setError("Server configuration error. Please try again.");
    }
    if (params.error === "unauthorized") {
      setError("Access denied. Invalid credentials.");
    }
  }, [params.error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid password");
        setLoading(false);
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0f172a]">
      {/* Background mesh */}
      <div className="bg-mesh absolute inset-0 opacity-60" />
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Enter the admin password to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.03)] p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className={cn(
                    "w-full rounded-lg border border-white/[0.08] bg-white/[0.04]",
                    "pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)]",
                    "focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50",
                    "transition-colors"
                  )}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className={cn(
                "w-full rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]",
                "py-2.5 text-sm font-medium text-white",
                "transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          This panel is protected and hidden from search engines.
        </p>
      </div>
    </div>
  );
}