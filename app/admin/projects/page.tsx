"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  Github,
  Star,
  GitFork,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface MergedProject {
  repo_name: string;
  github_description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  pushed_at: string;
  created_at: string;
  // enrichment
  enrichment_id: string | null;
  title_override: string | null;
  description: string | null;
  highlights: string[];
  technologies: string[];
  live_url: string | null;
  is_hidden: boolean;
  display_order: number;
  is_enriched: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Go: "#00ADD8",
  Rust: "#dea584",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = React.useState<MergedProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<MergedProject | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [togglingHide, setTogglingHide] = React.useState<string | null>(null);
  const [deletingEnrichment, setDeletingEnrichment] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title_override: "",
    description: "",
    highlights: "",
    technologies: "",
    live_url: "",
    is_hidden: false,
    display_order: 0,
  });

  const fetchProjects = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        setProjects(await res.json());
      } else {
        toast.error("Failed to load projects");
      }
    } catch {
      toast.error("Failed to load projects");
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openEditModal = (project: MergedProject) => {
    setEditingProject(project);
    setFormData({
      title_override: project.title_override ?? "",
      description: project.description ?? project.github_description ?? "",
      highlights: project.highlights.join("\n"),
      technologies: project.technologies.length
        ? project.technologies.join(", ")
        : project.topics.join(", "),
      live_url: project.live_url ?? project.homepage ?? "",
      is_hidden: project.is_hidden,
      display_order: project.display_order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingProject) return;
    setSaving(true);

    const payload = {
      repo_name: editingProject.repo_name,
      title_override: formData.title_override.trim() || null,
      description: formData.description.trim() || null,
      highlights: formData.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      technologies: formData.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      live_url: formData.live_url.trim() || null,
      is_hidden: formData.is_hidden,
      display_order: formData.display_order,
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success("Project updated!");
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHide = async (project: MergedProject) => {
    setTogglingHide(project.repo_name);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_name: project.repo_name,
          title_override: project.title_override,
          description: project.description,
          highlights: project.highlights,
          technologies: project.technologies,
          live_url: project.live_url,
          is_hidden: !project.is_hidden,
          display_order: project.display_order,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(project.is_hidden ? "Project shown on portfolio" : "Project hidden from portfolio");
      fetchProjects();
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setTogglingHide(null);
    }
  };

  const handleDeleteEnrichment = async (project: MergedProject) => {
    if (!project.is_enriched) return;
    if (!confirm(`Remove all custom data for "${project.repo_name}"? It will revert to raw GitHub data.`)) return;
    setDeletingEnrichment(project.repo_name);
    try {
      const res = await fetch(`/api/admin/projects?repo_name=${encodeURIComponent(project.repo_name)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Enrichment removed — reverted to GitHub data");
      fetchProjects();
    } catch {
      toast.error("Failed to remove enrichment");
    } finally {
      setDeletingEnrichment(null);
    }
  };

  const filtered = projects.filter((p) =>
    search
      ? p.repo_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.title_override ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.github_description ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  const visible = filtered.filter((p) => !p.is_hidden);
  const hidden = filtered.filter((p) => p.is_hidden);

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
          <h1 className="font-display text-3xl font-bold text-white">GitHub Projects</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            All {projects.length} repos from GitHub · {visible.length} visible · {hidden.length} hidden
          </p>
        </div>
        <button
          onClick={() => fetchProjects(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh from GitHub
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-[#6366f1]/20 bg-[#6366f1]/5 px-4 py-3 text-sm text-[var(--color-text-muted)]">
        <span className="font-medium text-white">How it works:</span> All your GitHub repos appear here automatically.
        Click <strong className="text-white">Edit</strong> to add a custom description, highlights, tech stack, and live demo link.
        Changes reflect instantly on your portfolio. Use <strong className="text-white">Hide</strong> to remove a repo from your portfolio without deleting it.
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories..."
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
        />
      </div>

      {/* Visible projects */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Visible on Portfolio ({visible.length})
        </h2>
        {visible.map((project) => (
          <ProjectRow
            key={project.repo_name}
            project={project}
            onEdit={openEditModal}
            onToggleHide={handleToggleHide}
            onDeleteEnrichment={handleDeleteEnrichment}
            togglingHide={togglingHide}
            deletingEnrichment={deletingEnrichment}
          />
        ))}
        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/[0.08] p-6 text-center text-sm text-[var(--color-text-muted)]">
            No visible projects. All repos are hidden.
          </p>
        )}
      </div>

      {/* Hidden projects */}
      {hidden.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Hidden from Portfolio ({hidden.length})
          </h2>
          {hidden.map((project) => (
            <ProjectRow
              key={project.repo_name}
              project={project}
              onEdit={openEditModal}
              onToggleHide={handleToggleHide}
              onDeleteEnrichment={handleDeleteEnrichment}
              togglingHide={togglingHide}
              deletingEnrichment={deletingEnrichment}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#1e293b] max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Edit: {editingProject.repo_name}
                </h2>
                <a
                  href={editingProject.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 text-xs text-[#6366f1] hover:text-[#818cf8]"
                >
                  {editingProject.html_url} ↗
                </a>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* GitHub original data — read only preview */}
              {editingProject.github_description && (
                <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                  <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">
                    GitHub description (original):
                  </p>
                  <p className="text-sm text-white/70">{editingProject.github_description}</p>
                </div>
              )}

              {/* Title override */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Display Title <span className="text-[var(--color-text-muted)]">(leave blank to use repo name)</span>
                </label>
                <input
                  value={formData.title_override}
                  onChange={(e) => setFormData({ ...formData, title_override: e.target.value })}
                  placeholder={editingProject.repo_name.replace(/_/g, " ")}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Description <span className="text-[var(--color-text-muted)]">(overrides GitHub description)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this project do? What problem does it solve?"
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Highlights <span className="text-[var(--color-text-muted)]">(one per line)</span>
                </label>
                <textarea
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder={"Achieved 95% accuracy on test set\nReal-time inference at 30fps\nDeployed to production with 1000+ users"}
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white font-mono placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                />
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Technologies <span className="text-[var(--color-text-muted)]">(comma-separated, overrides GitHub topics)</span>
                </label>
                <input
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="Python, PyTorch, FastAPI, React"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Live URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Live Demo URL</label>
                <input
                  value={formData.live_url}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  placeholder="https://my-project.vercel.app"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              {/* Hidden toggle */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Hide from portfolio</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Project stays on GitHub but won&apos;t appear on your portfolio
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_hidden}
                    onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer-checked:bg-red-500 h-5 w-9 rounded-full bg-white/10 transition-colors" />
                  <div className="peer-checked:translate-x-5 pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform" />
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/80 hover:border-white/20 hover:bg-white/5 transition-all"
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
                    Save Changes
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

function ProjectRow({
  project,
  onEdit,
  onToggleHide,
  onDeleteEnrichment,
  togglingHide,
  deletingEnrichment,
}: {
  project: MergedProject;
  onEdit: (p: MergedProject) => void;
  onToggleHide: (p: MergedProject) => void;
  onDeleteEnrichment: (p: MergedProject) => void;
  togglingHide: string | null;
  deletingEnrichment: string | null;
}) {
  const langColor = project.language
    ? LANGUAGE_COLORS[project.language] ?? "#94a3b8"
    : null;

  const displayTitle = project.title_override ?? project.repo_name.replace(/_/g, " ");
  const displayDesc = project.description ?? project.github_description ?? "No description.";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors",
        project.is_hidden
          ? "border-white/[0.04] opacity-60"
          : "border-white/[0.08]"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">{displayTitle}</h3>
            {project.repo_name !== displayTitle.replace(/\s/g, "_") && (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                ({project.repo_name})
              </span>
            )}
            {project.is_enriched && (
              <span className="rounded-full bg-[#6366f1]/10 px-2 py-0.5 text-[10px] font-medium text-[#a5b4fc]">
                ✦ enriched
              </span>
            )}
            {project.is_hidden && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                hidden
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
            {displayDesc}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
            {project.language && langColor && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                {project.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {project.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {project.forks_count}
            </span>
            {project.technologies.length > 0 && (
              <span className="text-[var(--color-text-muted)]">
                {project.technologies.slice(0, 4).join(", ")}
                {project.technologies.length > 4 && ` +${project.technologies.length - 4}`}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
            title="Open on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
              title="Live demo"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => onToggleHide(project)}
            disabled={togglingHide === project.repo_name}
            title={project.is_hidden ? "Show on portfolio" : "Hide from portfolio"}
            className={cn(
              "rounded-lg p-2 transition-colors disabled:opacity-50",
              project.is_hidden
                ? "text-green-400 hover:bg-green-500/10"
                : "text-yellow-400 hover:bg-yellow-500/10"
            )}
          >
            {togglingHide === project.repo_name ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : project.is_hidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(project)}
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
            title="Edit project details"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {project.is_enriched && (
            <button
              onClick={() => onDeleteEnrichment(project)}
              disabled={deletingEnrichment === project.repo_name}
              title="Reset to raw GitHub data"
              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {deletingEnrichment === project.repo_name ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
