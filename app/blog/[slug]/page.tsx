import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { getPostBySlug, getPublishedPosts } from "@/lib/data";
import { formatDate, readingTime } from "@/lib/utils";
import { blogPostingJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const readTime = post.reading_time_min ?? readingTime(post.content_md);

  return (
    <article className="relative mx-auto max-w-3xl px-4 py-24 md:py-32 md:px-6">
      <Link
        href="/#blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all posts
      </Link>

      <header className="mb-10">
        {post.tags && post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
          {post.published_at && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {readTime} min read
          </span>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="relative mb-10 aspect-[2/1] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
        >
          {post.content_md}
        </ReactMarkdown>
      </div>

      <footer className="mt-16 border-t border-white/5 pt-8">
        <Link
          href="/#blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All articles
        </Link>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostingJsonLd({
              title: post.title,
              excerpt: post.excerpt ?? "",
              slug: post.slug,
              publishedAt: post.published_at ?? new Date().toISOString(),
              image: post.cover_image_url ?? undefined,
            }),
          ),
        }}
      />
    </article>
  );
}
