"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Loader2,
  X,
  CheckCircle,
  Star,
  ExternalLink,
  Github,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  repo_name: string;
  title: string;
  tagline: string | null;
  long_description: string | null;
  media_urls: string[] | null;
  technologies: string[] | null;
  highlights: string[] | null;
  github_url: string | null;
  live_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    repo_name: "",
    title: "",
    tagline: "",
    long_description: "",
    technologies: "",
    github_url: "",
    live_url: "",
    display_order: 0,
    is_active: true,
  });

  const fetchProjects = React.useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("featured_projects")
      .select("*")
      .order("display_order", { ascending: true });

    setProjects(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      repo_name: "",
      title: "",
      tagline: "",
      long_description: "",
      technologies: "",
      github_url: "",
      live_url: "",
      display_order: projects.length,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      repo_name: project.repo_name || "",
      title: project.title,
      tagline: project.tagline || "",
      long_description: project.long_description || "",
      technologies: project.technologies?.join(", ") || "",
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      display_order: project.display_order,
      is_active: project.is_active,
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
      id: editingProject?.id || null,
      repo_name: formData.repo_name || null,
      title: formData.title,
      tagline: formData.tagline || null,
      long_description: formData.long_description || null,
      technologies: formData.technologies
        ? formData.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      github_url: formData.github_url || null,
      live_url: formData.live_url || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(editingProject ? "Project updated!" : "Project created!");
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;

    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Project deleted!");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (project: Project) => {
    const payload = {
      id: project.id,
      repo_name: project.repo_name,
      title: project.title,
      tagline: project.tagline,
      long_description: project.long_description,
      technologies: project.technologies || [],
      github_url: project.github_url,
      live_url: project.live_url,
      display_order: project.display_order,
      is_active: !project.is_active,
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(project.is_active ? "Project hidden" : "Project published");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to update project");
    }
  };

  const handleReorder = async (project: Project, direction: "up" | "down") => {
    const currentIndex = projects.findIndex((p) => p.id === project.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= projects.length) return;

    const swapProject = projects[swapIndex]!;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase
      .from("featured_projects")
      .update({ display_order: swapProject.display_order, updated_at: new Date().toISOString() })
      .eq("id", project.id);

    await supabase
      .from("featured_projects")
      .update({ display_order: project.display_order, updated_at: new Date().toISOString() })
      .eq("id", swapProject.id);

    fetchProjects();
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
          <h1 className="font-display text-3xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Manage your featured projects
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center">
          <p className="text-[var(--color-text-muted)]">No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={cn(
                "rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors",
                project.is_active
                  ? "border-white/[0.08]"
                  : "border-white/[0.04] opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Reorder */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleReorder(project, "up")}
                    disabled={index === 0}
                    className="rounded p-1 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleReorder(project, "down")}
                    disabled={index === projects.length - 1}
                    className="rounded p-1 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white">{project.title}</h3>
                    {project.is_active ? (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
                        Hidden
                      </span>
                    )}
                  </div>
                  {project.tagline && (
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">{project.tagline}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies?.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-white/[0.05] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggleActive(project)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      project.is_active
                        ? "text-yellow-400 hover:bg-yellow-500/10"
                        : "text-green-400 hover:bg-green-500/10"
                    )}
                    title={project.is_active ? "Hide project" : "Publish project"}
                  >
                    <Star className={cn("h-4 w-4", project.is_active && "fill-current")} />
                  </button>
                  <button
                    onClick={() => openEditModal(project)}
                    className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deleting === project.id}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {deleting === project.id ? (
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
          <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#1e293b] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingProject ? "Edit Project" : "New Project"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Title *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project title"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Repo Name</label>
                  <input
                    value={formData.repo_name}
                    onChange={(e) => setFormData({ ...formData, repo_name: e.target.value })}
                    placeholder="e.g. my-project"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Tagline</label>
                <input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Short description"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Long Description</label>
                <textarea
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  placeholder="Detailed project description..."
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Technologies</label>
                <input
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, TypeScript, Node.js (comma-separated)"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">GitHub URL</label>
                  <input
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Live URL</label>
                  <input
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
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
                <span className="text-sm text-white/80">Active (visible on portfolio)</span>
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
                    Save Project
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

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}