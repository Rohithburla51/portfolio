"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  Briefcase,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string | null;
  technologies: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = React.useState<Experience[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingExp, setEditingExp] = React.useState<Experience | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    company: "",
    role: "",
    duration: "",
    description: "",
    technologies: "",
    display_order: 0,
    is_active: true,
  });

  const fetchExperiences = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/experiences");
      if (res.ok) {
        setExperiences(await res.json());
      }
    } catch {
      toast.error("Failed to load experiences");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const openCreateModal = () => {
    setEditingExp(null);
    setFormData({
      company: "",
      role: "",
      duration: "",
      description: "",
      technologies: "",
      display_order: experiences.length,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (exp: Experience) => {
    setEditingExp(exp);
    setFormData({
      company: exp.company,
      role: exp.role,
      duration: exp.duration,
      description: exp.description || "",
      technologies: exp.technologies?.join(", ") || "",
      display_order: exp.display_order,
      is_active: exp.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.company.trim() || !formData.role.trim() || !formData.duration.trim()) {
      toast.error("Company, role, and duration are required");
      return;
    }

    setSaving(true);

    const payload = {
      id: editingExp?.id || null,
      company: formData.company,
      role: formData.role,
      duration: formData.duration,
      description: formData.description || null,
      technologies: formData.technologies
        ? formData.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      display_order: formData.display_order,
      is_active: formData.is_active,
    };

    try {
      const res = await fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(editingExp ? "Experience updated!" : "Experience added!");
      setModalOpen(false);
      fetchExperiences();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save experience");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/experiences?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Experience deleted!");
      fetchExperiences();
    } catch {
      toast.error("Failed to delete experience");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (exp: Experience) => {
    try {
      const res = await fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exp.id,
          company: exp.company,
          role: exp.role,
          duration: exp.duration,
          description: exp.description,
          technologies: exp.technologies || [],
          display_order: exp.display_order,
          is_active: !exp.is_active,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(exp.is_active ? "Experience hidden" : "Experience published");
      fetchExperiences();
    } catch {
      toast.error("Failed to update experience");
    }
  };

  const handleReorder = async (exp: Experience, direction: "up" | "down") => {
    const currentIndex = experiences.findIndex((e) => e.id === exp.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= experiences.length) return;

    const swapExp = experiences[swapIndex]!;

    await Promise.all([
      fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exp, display_order: swapExp.display_order }),
      }),
      fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...swapExp, display_order: exp.display_order }),
      }),
    ]);

    fetchExperiences();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Experience</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Manage work history, internships, and roles
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </button>
      </div>

      {/* Empty state */}
      {experiences.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="mt-3 text-[var(--color-text-muted)]">
            No experience entries yet. Add your first one!
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-sm text-[#6366f1] hover:text-[#818cf8]"
          >
            Add experience
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={cn(
                "rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors",
                exp.is_active ? "border-white/[0.08]" : "border-white/[0.04] opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Reorder */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => handleReorder(exp, "up")}
                    disabled={index === 0}
                    className="rounded p-1 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(exp, "down")}
                    disabled={index === experiences.length - 1}
                    className="rounded p-1 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/10 text-[#6366f1]">
                  <Briefcase className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{exp.role}</h3>
                    <span className="text-[var(--color-text-muted)]">@</span>
                    <span className="text-base font-medium text-[#8b5cf6]">{exp.company}</span>
                    {!exp.is_active && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {exp.duration}
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exp.technologies.slice(0, 6).map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-white/[0.05] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                      {exp.technologies.length > 6 && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          +{exp.technologies.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(exp)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      exp.is_active
                        ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    )}
                  >
                    {exp.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => openEditModal(exp)}
                    className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deleting === exp.id}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {deleting === exp.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#1e293b] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingExp ? "Edit Experience" : "Add Experience"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Role / Position *</label>
                <input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Machine Learning Intern"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Company / Organization *</label>
                <input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google, IIT Hyderabad"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Duration *</label>
                <input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. Jun 2024 – Aug 2024 · 3 months"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Free-form text — e.g. &quot;Jan 2025 – Present&quot; or &quot;Summer 2024&quot;
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What did you do? Key responsibilities and achievements..."
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                />
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Technologies Used</label>
                <input
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="Python, PyTorch, FastAPI (comma-separated)"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Active toggle */}
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
                <span className="text-sm text-white/80">Active (visible on portfolio)</span>
              </div>
            </div>

            {/* Footer */}
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
                    {editingExp ? "Update Experience" : "Add Experience"}
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
