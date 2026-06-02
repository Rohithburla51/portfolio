"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink, FileText } from "lucide-react";
import { trackEvent, formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

interface CertificateModalProps {
  cert: Certificate;
  trigger: React.ReactNode;
}

export function CertificateModal({ cert, trigger }: CertificateModalProps) {
  const [open, setOpen] = React.useState(false);

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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
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
                  <div className="relative w-full overflow-hidden rounded-lg border border-white/10">
                    <Image
                      src={cert.image_url}
                      alt={cert.name}
                      width={1200}
                      height={850}
                      className="h-auto w-full"
                      unoptimized
                    />
                  </div>
                ) : cert.pdf_url ? (
                  <iframe
                    src={`${cert.pdf_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    title={`${cert.name} — certificate preview`}
                    className="h-[70vh] w-full rounded-lg border border-white/10 bg-white"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 py-12 text-sm text-[var(--color-text-muted)]">
                    <FileText className="h-10 w-10" />
                    <p>No preview available for this certificate.</p>
                  </div>
                )}
              </div>

              {(cert.pdf_url || cert.verify_url) && (
                <div className="flex items-center gap-2 border-t border-white/10 px-6 py-4">
                  {cert.pdf_url && (
                    <a
                      href={cert.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => trackEvent("cert_download", { cert: cert.name })}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-4 py-2 text-sm font-medium text-white"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  )}
                  {cert.verify_url && (
                    <a
                      href={cert.verify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("cert_verify", { cert: cert.name })}
                      className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-4 py-2 text-sm font-medium text-[#67e8f9] transition-colors hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verify
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
