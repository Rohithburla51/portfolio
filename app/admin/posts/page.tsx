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
  Eye,
  Globe,
  GlobeLock,
  Calendar,
  Clock,
  FileText,
  SplitSquareHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/utils";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string;
  cover_image_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  reading_time_min: number | null;
  created_at: string;
  updated_at: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<Post | null>(null);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
    cover_image_url: "",
    tags: "",
    is_published: false,
  });

  const fetchPosts = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch {
      // fallback
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content_md: "",
      cover_image_url: "",
      tags: "",
      is_published: false,
    });
    setPreviewMode(false);
    setModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content_md: post.content_md,
      cover_image_url: post.cover_image_url || "",
      tags: post.tags?.join(", ") || "",
      is_published: post.is_published,
    });
    setPreviewMode(false);
    setModalOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || slugify(value),
    }));
  };

  const handleSlugAuto = () => {
    setFormData((prev) => ({
      ...prev,
      slug: slugify(prev.title),
    }));
  };

  const estimateReadingTime = (text: string): number => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fileName = `blog-${Date.now()}.${file.name.split(".").pop()}`;

    const { error } = await supabase.storage.from("blog_covers").upload(fileName, file, {
      upsert: true,
    });

    if (error) {
      toast.error("Failed to upload image");
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("blog_covers").getPublicUrl(fileName);
    setFormData({ ...formData, cover_image_url: urlData.publicUrl });
    setUploadingImage(false);
    toast.success("Image uploaded!");
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);

    const tags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const readingTime = estimateReadingTime(formData.content_md);

    const payload: Record<string, unknown> = {
      id: editingPost?.id || null,
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content_md: formData.content_md,
      cover_image_url: formData.cover_image_url || null,
      tags,
      is_published: formData.is_published,
      published_at: formData.is_published ? (editingPost?.published_at || new Date().toISOString()) : null,
      reading_time_min: readingTime,
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error?.toLowerCase().includes("slug")) {
          toast.error("Slug already exists. Please use a unique slug.");
        } else {
          throw new Error(err.error || "Failed to save");
        }
        return;
      }

      toast.success(editingPost ? "Post updated!" : "Post created!");
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Post deleted!");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    const newPublished = !post.is_published;

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: post.title,
          slug: post.slug,
          is_published: newPublished,
          published_at: newPublished ? (post.published_at || new Date().toISOString()) : null,
          reading_time_min: post.reading_time_min,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(newPublished ? "Post published!" : "Post unpublished");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to update post");
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
          <h1 className="font-display text-3xl font-bold text-white">Blog Posts</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Manage your blog content
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="mt-3 text-[var(--color-text-muted)]">
            No blog posts yet. Start writing!
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-sm text-[#6366f1] hover:text-[#818cf8]"
          >
            Create your first post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={cn(
                "rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors",
                post.is_published
                  ? "border-white/[0.08]"
                  : "border-white/[0.04] opacity-70"
              )}
            >
              <div className="flex items-start gap-4">
                {post.cover_image_url && (
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white truncate">{post.title}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                        post.is_published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      )}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.reading_time_min && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.reading_time_min} min read
                      </span>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <span className="truncate">
                        {post.tags.slice(0, 3).join(", ")}
                        {post.tags.length > 3 && ` +${post.tags.length - 3}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {post.is_published && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                      title="View post"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      post.is_published
                        ? "text-yellow-400 hover:bg-yellow-500/10"
                        : "text-green-400 hover:bg-green-500/10"
                    )}
                    title={post.is_published ? "Unpublish" : "Publish"}
                  >
                    {post.is_published ? (
                      <GlobeLock className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(post)}
                    className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {deleting === post.id ? (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 my-8 w-full max-w-6xl rounded-2xl border border-white/[0.08] bg-[#1e293b] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                {editingPost ? "Edit Post" : "New Blog Post"}
              </h2>
              <div className="flex items-center gap-3">
                {/* Preview toggle */}
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    previewMode
                      ? "bg-[#6366f1] text-white"
                      : "bg-white/[0.08] text-white/80 hover:bg-white/[0.12]"
                  )}
                >
                  <SplitSquareHorizontal className="h-4 w-4" />
                  {previewMode ? "Edit" : "Preview"}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex">
              {previewMode ? (
                /* Preview Mode */
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mx-auto max-w-3xl">
                    {formData.cover_image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-xl bg-white/5 mb-8">
                        <img
                          src={formData.cover_image_url}
                          alt={formData.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <h1 className="font-display text-4xl font-bold text-white">
                      {formData.title || "Untitled Post"}
                    </h1>
                    <div className="mt-4 flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {estimateReadingTime(formData.content_md)} min read
                      </span>
                      {formData.tags && (
                        <span>
                          {formData.tags.split(",").filter(Boolean).length} tags
                        </span>
                      )}
                    </div>
                    <hr className="my-8 border-white/[0.08]" />
                    <div className="prose">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formData.content_md || "_No content yet_"}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="grid gap-5 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Title *</label>
                        <input
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Post title"
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-lg font-semibold text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-white/80">Slug *</label>
                          <button
                            type="button"
                            onClick={handleSlugAuto}
                            className="text-xs text-[#6366f1] hover:text-[#818cf8]"
                          >
                            Auto-generate from title
                          </button>
                        </div>
                        <input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="post-url-slug"
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white font-mono placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Excerpt</label>
                        <textarea
                          value={formData.excerpt}
                          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                          placeholder="Brief summary for the post listing..."
                          rows={2}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                          Content (Markdown) *
                        </label>
                        <textarea
                          value={formData.content_md}
                          onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                          placeholder="Write your post content in Markdown..."
                          rows={20}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white font-mono placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 resize-none"
                        />
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Supports Markdown: **bold**, *italic*, `code`, ## headings, - lists, etc.
                        </p>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                      {/* Publish */}
                      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                        <h3 className="text-sm font-semibold text-white">Publishing</h3>
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/80">Status</span>
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 text-xs font-medium",
                                formData.is_published
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              )}
                            >
                              {formData.is_published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                checked={formData.is_published}
                                onChange={(e) =>
                                  setFormData({ ...formData, is_published: e.target.checked })
                                }
                                className="peer sr-only"
                              />
                              <div className="peer-checked:bg-[#6366f1] h-5 w-9 rounded-full bg-white/10 transition-colors peer-checked:ring-2 peer-checked:ring-[#6366f1]/50" />
                              <div className="peer-checked:translate-x-5 pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:bg-white" />
                            </label>
                            <span className="text-sm text-white/80">Publish now</span>
                          </div>
                        </div>
                      </div>

                      {/* Cover Image */}
                      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                        <h3 className="text-sm font-semibold text-white">Cover Image</h3>
                        <div className="mt-3 space-y-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="cover-image-upload"
                          />
                          <label
                            htmlFor="cover-image-upload"
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-medium text-white hover:bg-white/[0.12] transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            {uploadingImage ? "Uploading..." : "Upload Image"}
                          </label>
                          {formData.cover_image_url && (
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-white/5">
                              <img
                                src={formData.cover_image_url}
                                alt="Cover"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                        <h3 className="text-sm font-semibold text-white">Tags</h3>
                        <div className="mt-3">
                          <input
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="react, typescript, ai"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                          />
                          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                            Comma-separated tags
                          </p>
                        </div>
                      </div>

                      {/* Reading Time */}
                      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                        <h3 className="text-sm font-semibold text-white">Reading Time</h3>
                        <p className="mt-2 text-2xl font-bold text-white">
                          {estimateReadingTime(formData.content_md)}{" "}
                          <span className="text-sm font-normal text-[var(--color-text-muted)]">
                            min
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4">
              <div className="text-sm text-[var(--color-text-muted)]">
                {editingPost ? (
                  <>Last updated: {new Date(editingPost.updated_at).toLocaleString()}</>
                ) : (
                  <>Auto-saves reading time when saving</>
                )}
              </div>
              <div className="flex items-center gap-3">
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
                      {editingPost ? "Update Post" : "Publish Post"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}