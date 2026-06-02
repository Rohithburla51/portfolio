"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { trackEvent } from "@/lib/utils";

interface ReadmeModalProps {
  owner: string;
  repo: string;
}

export function ReadmeModal({ owner, repo }: ReadmeModalProps) {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadReadme = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const candidates = ["README.md", "Readme.md", "readme.md", "README.MD"];
      let text: string | null = null;
      for (const filename of candidates) {
        const res = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filename}`,
        );
        if (res.ok) {
          const t = await res.text();
          if (t.trim()) {
            text = t;
            break;
          }
        }
      }
      if (!text) throw new Error("No README found");
      setContent(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load README");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  React.useEffect(() => {
    if (open && content === null && !loading) {
      loadReadme();
    }
  }, [open, content, loading, loadReadme]);

  const handleOpen = () => {
    setOpen(true);
    trackEvent("project_readme_open", { repo });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 transition-colors hover:text-white"
      >
        <FileText className="h-3.5 w-3.5" />
        README
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${repo} README`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-6 py-4 backdrop-blur">
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    github.com/{owner}/{repo}
                  </p>
                  <h3 className="font-display text-lg font-semibold">README.md</h3>
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

              <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-6 py-6">
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--color-text-muted)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading README…
                  </div>
                )}
                {error && !loading && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
                    {error}.{" "}
                    <a
                      href={`https://github.com/${owner}/${repo}#readme`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      onClick={() => trackEvent("external_link", { source: "readme-fallback" })}
                    >
                      View on GitHub →
                    </a>
                  </div>
                )}
                {content && !loading && (
                  <article className="prose prose-invert prose-sm max-w-none md:prose-base">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSlug]}
                    >
                      {content}
                    </ReactMarkdown>
                  </article>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
