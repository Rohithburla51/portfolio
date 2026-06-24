"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, Loader2, Trash2, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ResumeData {
  url: string | null;
  version: string | null;
  uploaded_at: string | null;
}

export default function AdminResumePage() {
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [resume, setResume] = React.useState<ResumeData>({
    url: null,
    version: null,
    uploaded_at: null,
  });
  const [version, setVersion] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await fetch("/api/admin/resume");
      if (res.ok) {
        const data = await res.json();
        setResume({
          url: data?.url ?? null,
          version: data?.version ?? null,
          uploaded_at: data?.uploaded_at ?? null,
        });
        setVersion(data?.version ?? "");
      }
    } catch (err) {
      console.error("Failed to fetch resume:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "resumes");

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await uploadRes.json();

      // Save URL to site_config
      const saveRes = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          version: version || `v${Date.now()}`,
        }),
      });

      if (!saveRes.ok) {
        const error = await saveRes.json();
        throw new Error(error.error || "Failed to save");
      }

      setResume({
        url,
        version: version || `v${Date.now()}`,
        uploaded_at: new Date().toISOString(),
      });

      toast.success("Resume uploaded successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: null, version: null }),
      });

      if (!res.ok) throw new Error("Failed to remove");

      setResume({ url: null, version: null, uploaded_at: null });
      setVersion("");
      toast.success("Resume removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove resume");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Resume Management</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Upload and manage your resume PDF
        </p>
      </div>

      {/* Current Resume */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Current Resume</h2>

        {resume.url ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">resume.pdf</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Uploaded</span>
                  {resume.version && <span>· {resume.version}</span>}
                  {resume.uploaded_at && (
                    <span>· {new Date(resume.uploaded_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={handleRemove}
                disabled={loading}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* PDF Preview */}
            <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
              <iframe
                src={`${resume.url}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Resume preview"
                className="h-[500px] w-full"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-white/[0.1] p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              No resume uploaded yet
            </p>
            <p className="mt-1 text-xs text-[#475569]">
              Upload a PDF to display on your portfolio
            </p>
          </div>
        )}
      </div>

      {/* Upload New */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">
          {resume.url ? "Replace Resume" : "Upload Resume"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Upload a new PDF file to update your resume
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Version (optional)</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v2.0 - June 2026"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white",
              "bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]",
              "transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {resume.url ? "Upload New PDF" : "Upload PDF"}
              </>
            )}
          </button>

          <p className="text-xs text-[#475569]">
            Accepted format: PDF only · Max size: 10MB
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-[#6366f1]/20 bg-[#6366f1]/5 p-6">
        <h3 className="text-sm font-semibold text-white">How it works</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
          <li>• Uploaded PDF is stored in Supabase Storage (resumes bucket)</li>
          <li>• The resume URL is saved in site_config and used by the portfolio</li>
          <li>• Visitors can download or preview the PDF from the Resume section</li>
          <li>• You can upload a new PDF anytime to replace the current one</li>
        </ul>
      </div>
    </div>
  );
}