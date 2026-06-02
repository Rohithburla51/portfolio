/**
 * SEO helpers — JSON-LD builders, OpenGraph defaults, etc.
 */

import { SITE } from "@/lib/utils";
import type { Metadata } from "next";

export const SITE_METADATA: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.bio,
  applicationName: SITE.name,
  keywords: [
    "Burla Rohith",
    "AI Engineer",
    "ML Engineer",
    "Machine Learning",
    "Computer Vision",
    "NLP",
    "Deep Learning",
    "SegFormer",
    "MediaPipe",
    "PyTorch",
    "Next.js",
    "Portfolio",
    "CMR College",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.bio,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.bio,
    images: ["/og.png"],
    creator: "@burla_rohith",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

/* ----------------------- JSON-LD builders ----------------------- */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    jobTitle: SITE.role,
    description: SITE.bio,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Medak",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "CMR College of Engineering and Technology",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },
    sameAs: [
      SITE.socials.github,
      SITE.socials.linkedin,
      SITE.socials.leetcode,
      SITE.socials.geeksforgeeks,
    ],
    knowsAbout: [
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Natural Language Processing",
      "PyTorch",
      "SegFormer",
      "MediaPipe",
      "Python",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.bio,
    author: { "@type": "Person", name: SITE.name },
  };
}

export function creativeWorkJsonLd(project: {
  name: string;
  description: string;
  url: string;
  technologies: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    url: project.url,
    author: { "@type": "Person", name: SITE.name },
    keywords: project.technologies.join(", "),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    publisher: {
      "@type": "Person",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/${post.slug}`,
    },
  };
}
