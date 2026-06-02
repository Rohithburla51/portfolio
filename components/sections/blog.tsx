import * as React from "react";
import { ArrowUpRight, BookOpen, Calendar } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TrackableNextLink } from "@/components/ui/trackable-next-link";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function Blog() {
  const posts = await getPublishedPosts(6);

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="section relative" aria-label="Blog">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Blog"
          title="Writing on "
          gradientWord="AI, ML, and code"
          description="Notes, tutorials, and reflections on building intelligent systems."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <TrackableNextLink
              key={post.id}
              href={`/blog/${post.slug}`}
              event="external_link"
              eventParams={{ source: "blog", slug: post.slug }}
              className="group block focus:outline-none"
            >
              <GlassCard className="flex h-full flex-col overflow-hidden p-0">
                {post.cover_image_url && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    {post.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </span>
                    )}
                    {post.reading_time_min && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {post.reading_time_min} min
                      </span>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight tracking-tight">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--color-text-muted)]">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-medium text-[var(--color-text-muted)] transition-colors group-hover:text-white">
                    Read article
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </GlassCard>
            </TrackableNextLink>
          ))}
        </div>
      </div>
    </section>
  );
}
