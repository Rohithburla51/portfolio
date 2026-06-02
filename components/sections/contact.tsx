"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { SITE, trackEvent } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(200),
  subject: z.string().min(3, "Subject is too short").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export function Contact() {
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", honeypot: "" },
  });

  const onSubmit = async (data: ContactForm) => {
    if (data.honeypot) return; // bot
    setSubmitting(true);
    try {
      trackEvent("contact_submit", { subject: data.subject });
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to send");
      }
      setSuccess(true);
      trackEvent("contact_success", { subject: data.subject });
      toast.success("Message sent! I'll get back to you soon.");
      reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      trackEvent("contact_error", { error: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section relative" aria-label="Contact">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Let's "
          gradientWord="build something"
          description="Open to internships, ML engineering roles, and interesting AI collaborations. Drop a message below."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Direct contact */}
          <div className="flex flex-col gap-4">
            <GlassCard className="p-7" hover={false}>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                    Email
                  </p>
                  <p className="font-semibold">Drop a line</p>
                </div>
              </div>
              <a
                href={SITE.socials.email}
                onClick={() => trackEvent("email_click", { source: "contact" })}
                className="break-all font-mono text-sm text-white underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#a78bfa] hover:decoration-[#a78bfa]/50"
              >
                {SITE.email}
              </a>
            </GlassCard>

            <GlassCard className="p-7" hover={false}>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                Location
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {SITE.location}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Open to remote &amp; on-site roles across India.
              </p>
            </GlassCard>

            <GlassCard className="p-7" hover={false}>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                Response time
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
                Within 24h
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                I read every message and reply personally.
              </p>
            </GlassCard>
          </div>

          {/* Form */}
          <GlassCard className="p-7 md:p-9" hover={false}>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex min-h-[440px] flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                    Message sent!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
                    Thanks for reaching out. I'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  {/* Honeypot */}
                  <input
                    type="text"
                    {...register("honeypot")}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Name"
                      id="name"
                      placeholder="Your full name"
                      error={errors.name?.message}
                      registration={register("name")}
                    />
                    <Field
                      label="Email"
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      error={errors.email?.message}
                      registration={register("email")}
                    />
                  </div>

                  <Field
                    label="Subject"
                    id="subject"
                    placeholder="What's this about?"
                    error={errors.subject?.message}
                    registration={register("subject")}
                  />

                  <Field
                    label="Message"
                    id="message"
                    placeholder="Tell me about your project, role, or question…"
                    error={errors.message?.message}
                    registration={register("message")}
                    textarea
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-[var(--color-text-muted)]">
                    Your message is stored in a private database and emailed to
                    me directly. No marketing, ever.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<ContactForm>>["register"]>;
  textarea?: boolean;
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  error,
  registration,
  textarea,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={5}
          placeholder={placeholder}
          {...registration}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...registration}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      )}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
