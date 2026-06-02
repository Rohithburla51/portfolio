import * as React from "react";
import { Award, Download, ExternalLink, Eye } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableLink } from "@/components/ui/trackable-link";
import { CertificateModal } from "@/components/sections/certificate-modal";
import { getCertificates } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function Certifications() {
  const certs = await getCertificates();

  if (certs.length === 0) {
    return null;
  }

  return (
    <section
      id="certifications"
      className="section relative"
      aria-label="Certifications"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Certifications"
          title="Lifelong "
          gradientWord="learner"
          description="Industry-recognized certifications across AI, data science, networking, and programming."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificateCard({ cert }: { cert: Awaited<ReturnType<typeof getCertificates>>[number] }) {
  return (
    <GlassCard className="group flex h-full flex-col p-6">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
          <Award className="h-5 w-5" />
        </div>
        {cert.category && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            {cert.category}
          </span>
        )}
      </div>

      <h3 className="mt-4 line-clamp-2 font-display text-lg font-semibold leading-tight tracking-tight">
        {cert.name}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {cert.organization}
      </p>
      {cert.issue_date && (
        <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
          Issued {formatDate(cert.issue_date)}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4 text-xs">
        <CertificateModal
          cert={cert}
          trigger={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10">
              <Eye className="h-3 w-3" />
              View
            </span>
          }
        />

        {cert.pdf_url && (
          <TrackableLink
            href={cert.pdf_url}
            event="cert_download"
            eventParams={{ cert: cert.name }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
            ariaLabel={`Download ${cert.name}`}
          >
            <Download className="h-3 w-3" />
            Download
          </TrackableLink>
        )}

        {cert.verify_url && (
          <TrackableLink
            href={cert.verify_url}
            event="cert_verify"
            eventParams={{ cert: cert.name }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-1.5 text-[11px] font-medium text-[#67e8f9] transition-colors hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/20"
            ariaLabel={`Verify ${cert.name}`}
          >
            <ExternalLink className="h-3 w-3" />
            Verify
          </TrackableLink>
        )}
      </div>
    </GlassCard>
  );
}
