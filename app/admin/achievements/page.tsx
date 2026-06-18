"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  Upload,
  Trophy,
  Code2,
  Award,
  GraduationCap,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  category: "hackathon" | "competition" | "certification" | "coding" | "academic" | "other";
  description: string | null;
  icon: string | null;
  date: string | null;
  link: string | null;
  display_order: number;
  is_active: boolean;
}

const CATEGORY_ICONS = {
  hackathon: Trophy,
  competition: Award,
  certification: Award,
  coding: Code2,
  academic: GraduationCap,
  other: HelpCircle,
};

const CATEGORIES = ["hackathon", "competition", "certification", "coding", "academic", "other"] as const;

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAch, setEditingAch] = React.useState<Achievement | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title: "",
    category: "other" as Achievement["category"],
    description: "",
    icon: "",
    date: "",
    link: "",
    display_order: 0,
    is_active: true,
  });

  const fetchAchievements = React.useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("achievements")
      .select("*")
      .order("display_order", { ascending: true });

    setAchievements(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const openCreateModal = () => {
    setEditingAch(null);
    setFormData({
      title: "",
      category: "other",
      description: "",
      icon: "",
      date: "",
      link: "",
      display_order: achievements.length,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (ach: Achievement) => {
    setEditingAch(ach);
    setFormData({
      title: ach.title,
      category: ach.category,
      description: ach.description || "",
      icon: ach.icon || "",
      date: ach.date || "",
      link: ach.link || "",
      display_order: ach.display_order,
      is_active: ach.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    const payload = {
      id: editingAch?.id || null,
      title: formData.title,
      category: formData.category,
      description: formData.description || null,
      icon: formData.icon || null,
      date: formData.date || null,
      link: formData.link || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
    };

    try {
      const res = await fetch("/api/admin/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(editingAch ? "Achievement updated!" : "Achievement added!");
      setModalOpen(false);
      fetchAchievements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save achievement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this achievement?")) return;

    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/achievements?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Achievement deleted!");
      fetchAchievements();
    } catch (err) {
      toast.error("Failed to delete achievement");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (ach: Achievement) => {
    const payload = {
      id: ach.id,
      title: ach.title,
      category: ach.category,
      description: ach.description,
      icon: ach.icon,
      date: ach.date,
      link: ach.link,
      display_order: ach.display_order,
      is_active: !ach.is_active,
    };

    try {
      const res = await fetch("/api/admin/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(ach.is_active ? "Achievement hidden" : "Achievement published");
      fetchAchievements();
    } catch (err) {
      toast.error("Failed to update achievement");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Achievements</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Manage hackathons, awards, and recognitions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <Plus className="h-4 w-4" />
          Add Achievement
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center">
          <p className="text-[var(--color-text-muted)]">
            No achievements yet. Add your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((ach) => {
            const CategoryIcon = CATEGORY_ICONS[ach.category] || HelpCircle;
            return (
              <div
                key={ach.id}
                className={cn(
                  "rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors",
                  ach.is_active
                    ? "border-white/[0.08]"
                    : "border-white/[0.04] opacity-60"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      ach.category === "hackathon" && "bg-amber-500/10 text-amber-400",
                      ach.category === "competition" && "bg-purple-500/10 text-purple-400",
                      ach.category === "certification" && "bg-blue-500/10 text-blue-400",
                      ach.category === "coding" && "bg-green-500/10 text-green-400",
                      ach.category === "academic" && "bg-cyan-500/10 text-cyan-400",
                      ach.category === "other" && "bg-white/5 text-white/60"
                    )}
                  >
                    <CategoryIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-white">{ach.title}</h3>
                      <span className="rounded bg-white/[0.05] px-2 py-0.5 text-xs text-[var(--color-text-muted)] capitalize">
                        {ach.category}
                      </span>
                      {!ach.is_active && (
                        <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                          Hidden
                        </span>
                      )}
                    </div>
                    {ach.description && (
                      <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                        {ach.description}
                      </p>
                    )}
                    {ach.date && (
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {new Date(ach.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(ach)}
                      className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(ach)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        ach.is_active
                          ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      )}
                    >
                      {ach.is_active ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => handleDelete(ach.id)}
                      disabled={deleting === ach.id}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === ach.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#1e293b] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingAch ? "Edit Achievement" : "Add Achievement"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Achievement title"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as Achievement["category"] })
                  }
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1e293b]">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the achievement..."
                  rows={3}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Link</label>
                  <input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Icon Name</label>
                <input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. trophy, code-2, award"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Lucide icon name (trophy, code-2, award, graduation-cap, etc.)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer-checked:bg-[#6366f1] h-5 w-9 rounded-full bg-white/10 transition-colors peer-checked:ring-2 peer-checked:ring-[#6366f1]/50" />
                  <div className="peer-checked:translate-x-5 pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:bg-white" />
                </label>
                <span className="text-sm text-white/80">Active</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save Achievement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}