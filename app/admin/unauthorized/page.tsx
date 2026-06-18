import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0f172a]">
      <div className="bg-mesh absolute inset-0 opacity-60" />

      <div className="relative z-10 w-full max-w-md px-4 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <ShieldX className="h-10 w-10 text-red-400" />
        </div>

        <h1 className="font-display text-3xl font-bold text-white">Unauthorized Access</h1>

        <p className="mt-4 text-[var(--color-text-muted)]">
          Your email address is not authorized to access this admin panel.
          Only <span className="text-white">burlarohith999@gmail.com</span> is allowed.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            Return to Portfolio
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Try another account
          </Link>
        </div>
      </div>
    </div>
  );
}