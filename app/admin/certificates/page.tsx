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
  ExternalLink,
  Upload,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  id: string;
  name: string;
  organization: string;
  issue_date: string;
  image_url: string | null;
  pdf_url: string | null;
  verify_url: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCert, setEditingCert] = React.useState<Certificate | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    organization: "",
    issue_date: "",
    verify_url: "",
    category: "",
    display_order: 0,
    is_active: true,
    image_url: "",
  });

  const fetchCertificates = React.useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("certificates")
      .select("*")
      .order("display_order", { ascending: true });

    setCertificates(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const openCreateModal = () => {
    setEditingCert(null);
    setFormData({
      name: "",
      organization: "",
      issue_date: new Date().toISOString().split("T")[0] ?? "",
      verify_url: "",
      category: "",
      display_order: certificates.length,
      is_active: true,
      image_url: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (cert: Certificate) => {
    setEditingCert(cert);
    setFormData({
      name: cert.name,
      organization: cert.organization,
      issue_date: cert.issue_date,
      verify_url: cert.verify_url || "",
      category: cert.category || "",
      display_order: cert.display_order,
      is_active: cert.is_active,
      image_url: cert.image_url || "",
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("bucket", "certificates");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await res.json();
      setFormData({ ...formData, image_url: url });
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.organization.trim()) {
      toast.error("Name and organization are required");
      return;
    }

    setSaving(true);

    const payload = {
      id: editingCert?.id || null,
      name: formData.name,
      organization: formData.organization,
      issue_date: formData.issue_date || null,
      verify_url: formData.verify_url || null,
      category: formData.category || null,
      display_order: formData.display_order,
      is_active: formData.is_active,
      image_url: formData.image_url || null,
    };

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(editingCert ? "Certificate updated!" : "Certificate added!");
      setModalOpen(false);
      fetchCertificates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;

    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/certificates?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Certificate deleted!");
      fetchCertificates();
    } catch (err) {
      toast.error("Failed to delete certificate");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (cert: Certificate) => {
    const payload = {
      id: cert.id,
      name: cert.name,
      organization: cert.organization,
      issue_date: cert.issue_date,
      verify_url: cert.verify_url,
      category: cert.category,
      display_order: cert.display_order,
      is_active: !cert.is_active,
      image_url: cert.image_url,
    };

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(cert.is_active ? "Certificate hidden" : "Certificate published");
      fetchCertificates();
    } catch (err) {
      toast.error("Failed to update certificate");
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
          <h1 className="font-display text-3xl font-bold text-white">Certificates</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Manage your professional certifications
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <Plus className="h-4 w-4" />
          Add Certificate
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center">
          <p className="text-[var(--color-text-muted)]">
            No certificates yet. Add your first one!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className={cn(
                "rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors",
                cert.is_active
                  ? "border-white/[0.08]"
                  : "border-white/[0.04] opacity-60"
              )}
            >
              {cert.image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-white/5 mb-4">
                  <img
                    src={cert.image_url}
                    alt={cert.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white">{cert.name}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {cert.organization}
                  </p>
                  {cert.issue_date && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Calendar className="h-3 w-3" />
                      {new Date(cert.issue_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                  {cert.category && (
                    <span className="mt-2 inline-block rounded bg-white/[0.05] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                      {cert.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {cert.verify_url && (
                    <a
                      href={cert.verify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(cert)}
                    className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    disabled={deleting === cert.id}
                    className="rounded p-1.5 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {deleting === cert.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(cert)}
                  className={cn(
                    "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                    cert.is_active
                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      : "bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10"
                  )}
                >
                  {cert.is_active ? "Active" : "Hidden"}
                </button>
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
                {editingCert ? "Edit Certificate" : "Add Certificate"}
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
                <label className="text-sm font-medium text-white/80">Certificate Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Issuing Organization *</label>
                <input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Category</label>
                  <input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Cloud, AI/ML"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Verification URL</label>
                <input
                  value={formData.verify_url}
                  onChange={(e) => setFormData({ ...formData, verify_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Certificate Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="cert-image-upload"
                  />
                  <label
                    htmlFor="cert-image-upload"
                    className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white cursor-pointer hover:bg-white/[0.12] transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </label>
                  {formData.image_url && (
                    <span className="text-xs text-green-400">Image uploaded</span>
                  )}
                </div>
                {formData.image_url && (
                  <div className="mt-2 aspect-video w-full max-w-[200px] overflow-hidden rounded-lg bg-white/5">
                    <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
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
                    Save Certificate
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