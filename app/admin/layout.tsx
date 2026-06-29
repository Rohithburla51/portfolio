import Link from "next/link";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Award,
  Trophy,
  FileText,
  FileUp,
  MessageCircle,
  LogOut,
  ChevronRight,
  Briefcase,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/experiences", label: "Experience", icon: Briefcase },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/resume", label: "Resume", icon: FileUp },
  { href: "/admin/posts", label: "Blog Posts", icon: FileText },
  { href: "/admin/chatbot", label: "Chatbot", icon: MessageCircle },
];

export const metadata = {
  title: "Admin Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/[0.08] bg-[#0f172a]/80 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]">
            <span className="text-sm font-bold text-white">BR</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin Panel</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Burla Rohith
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-all hover:bg-white/[0.05] hover:text-white group"
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/[0.08] p-4">
          <form action="/api/admin/auth/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0f172a]/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-white transition-colors">
              Portfolio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Protected</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}