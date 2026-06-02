"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ZoomIn,
  ImageOff,
} from "lucide-react";
import { trackEvent, formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

interface CertificateModalProps {
  cert: Certificate;
  trigger: React.ReactNode;
}

export function CertificateModal({ cert, trigger }: CertificateModalProps) {
  const [open, setOpen] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  const [scale, setScale] = React.useState(1);

  // Reset zoom state when the modal closes or cert changes
  React.useEffect(() => {
    if (!open) {
      setZoomed(false);
      setScale(1);
    }
  }, [open]);

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {trigger}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            // NOTE: backdrop-blur intentionally omitted here.
            // backdrop-filter re-runs on every child repaint (hover transitions,
            // shadow changes) which causes a visible 1-frame flicker on Windows
            // Chromium. The bg-black/85 alone provides enough visual depth.
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={cert.name}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl"
              style={{ isolation: "isolate" }}
            >
              <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    {cert.organization}
                  </p>
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {cert.name}
                  </h3>
                  {cert.issue_date && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Issued {formatDate(cert.issue_date)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full glass transition-colors hover:bg-white/10"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(92vh-9rem)] overflow-hidden bg-[#0a0f1f] p-3">
                {cert.image_url ? (
                  <ImageViewer
                    src={cert.image_url}
                    alt={`${cert.name} — certificate image`}
                    zoomed={zoomed}
                    setZoomed={setZoomed}
                    scale={scale}
                    setScale={setScale}
                  />
                ) : cert.pdf_url ? (
                  <PdfPrompt cert={cert} />
                ) : (
                  <NoPreview />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-6 py-4">
                {cert.pdf_url && (
                  <a
                    href={cert.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("cert_pdf_open", { cert: cert.name })
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow hover:shadow-[0_0_35px_rgba(139,92,246,0.5)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open PDF in new tab
                  </a>
                )}
                {cert.image_url && (
                  <a
                    href={cert.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={() =>
                      trackEvent("cert_download", { cert: cert.name })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
                {cert.pdf_url && cert.image_url && (
                  <a
                    href={cert.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("cert_pdf_open", { cert: cert.name })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </a>
                )}
                {cert.verify_url && (
                  <a
                    href={cert.verify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("cert_verify", { cert: cert.name })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-4 py-2 text-sm font-medium text-[#67e8f9] transition-colors hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Verify
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Image viewer — click to enter fullscreen with scroll-wheel zoom   */
/* ------------------------------------------------------------------ */
function ImageViewer({
  src,
  alt,
  zoomed,
  setZoomed,
  scale,
  setScale,
}: {
  src: string;
  alt: string;
  zoomed: boolean;
  setZoomed: (z: boolean) => void;
  scale: number;
  setScale: (s: number | ((prev: number) => number)) => void;
}) {
  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      setScale((s) => Math.min(4, Math.max(0.5, s + delta)));
    },
    [setScale],
  );

  return (
    <>
      <div className="relative flex h-full min-h-[300px] items-center justify-center">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="group relative block max-h-[60vh] w-auto cursor-zoom-in overflow-hidden rounded-lg border border-white/10"
          aria-label="Open fullscreen zoom"
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={850}
            unoptimized
            className="h-auto max-h-[60vh] w-auto object-contain"
          />
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-3 w-3" />
            Click to zoom
          </div>
        </button>
      </div>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setZoomed(false);
              setScale(1);
            }}
            onWheel={handleWheel}
            className="fixed inset-0 z-[110] flex cursor-zoom-out items-center justify-center bg-black/95"
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} — fullscreen zoom`}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ transform: `scale(${scale})` }}
              className="relative max-h-[92vh] max-w-[92vw] transition-transform duration-100 ease-out"
            >
              <Image
                src={src}
                alt={alt}
                width={2400}
                height={1700}
                unoptimized
                className="max-h-[92vh] max-w-[92vw] object-contain"
              />
            </motion.div>

            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white">
              <span className="font-mono">{Math.round(scale * 100)}%</span>
              <span className="mx-2 opacity-40">·</span>
              Scroll to zoom · click to close
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(false);
                setScale(1);
              }}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
              aria-label="Close zoom"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PDF prompt — clean panel, never embeds                              */
/* ------------------------------------------------------------------ */
function PdfPrompt({ cert }: { cert: Certificate }) {
  const filename = cert.pdf_url?.split("/").pop() ?? "certificate.pdf";

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 px-4 py-10 text-center">
      <div className="relative">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white shadow-[0_0_40px_rgba(99,102,241,0.3)]">
          <FileText className="h-10 w-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-[#0a0f1f] bg-emerald-500 text-white">
          <ExternalLink className="h-3.5 w-3.5" />
        </div>
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-white">
          PDF certificate
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-[var(--color-text-muted)]">
          Click below to open the certificate in a new tab. The viewer there
          supports zoom, search, and download.
        </p>
      </div>

      <a
        href={cert.pdf_url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("cert_pdf_open", { cert: cert.name })}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
      >
        <ExternalLink className="h-4 w-4" />
        Open PDF
      </a>

      <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] opacity-60">
        {filename}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fallback                                                            */
/* ------------------------------------------------------------------ */
function NoPreview() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 py-12 text-sm text-[var(--color-text-muted)]">
      <ImageOff className="h-10 w-10 opacity-50" />
      <p>No preview available for this certificate.</p>
    </div>
  );
}
