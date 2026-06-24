import { createBrowserClient } from "@supabase/ssr";
import type {
  Achievement,
  Certificate,
  Experience,
  FeaturedProject,
  Post,
  Profile,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Knowledge base: fetches all portfolio data for client-side search  */
/* ------------------------------------------------------------------ */

interface KnowledgeBase {
  profile: Profile | null;
  projects: FeaturedProject[];
  certificates: Certificate[];
  achievements: Achievement[];
  experiences: Experience[];
  posts: Post[];
  loadedAt: number;
}

let _kb: KnowledgeBase | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  if (_kb && Date.now() - _kb.loadedAt < CACHE_DURATION) {
    return _kb;
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [profileRes, projectsRes, certsRes, achRes, expRes, postsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("is_active", true).maybeSingle(),
      supabase
        .from("featured_projects")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("certificates")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("achievements")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("experiences")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(20),
    ]);

  _kb = {
    profile: (profileRes.data as Profile) ?? null,
    projects: (projectsRes.data as FeaturedProject[]) ?? [],
    certificates: (certsRes.data as Certificate[]) ?? [],
    achievements: (achRes.data as Achievement[]) ?? [],
    experiences: (expRes.data as Experience[]) ?? [],
    posts: (postsRes.data as Post[]) ?? [],
    loadedAt: Date.now(),
  };

  return _kb;
}

/* ------------------------------------------------------------------ */
/* Text similarity: simple token-overlap scoring                     */
/* ------------------------------------------------------------------ */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function similarity(a: string[], b: string[]): number {
  const setB = new Set(b);
  let matches = 0;
  for (const token of a) {
    if (setB.has(token)) matches++;
  }
  return a.length > 0 ? matches / a.length : 0;
}

function scoreDocument(query: string, ...fields: (string | null | undefined | string[])[]): number {
  const queryTokens = tokenize(query);
  let bestScore = 0;

  for (const field of fields) {
    if (!field) continue;
    const text = Array.isArray(field) ? field.join(" ") : field;
    const docTokens = tokenize(text);
    const score = similarity(queryTokens, docTokens);
    if (score > bestScore) bestScore = score;
  }

  return bestScore;
}

/* ------------------------------------------------------------------ */
/* Intent detection                                                   */
/* ------------------------------------------------------------------ */

type Intent =
  | "who_is"
  | "projects"
  | "project_detail"
  | "skills"
  | "certificates"
  | "achievements"
  | "experience"
  | "education"
  | "contact"
  | "social_links"
  | "blog"
  | "general";

function detectIntent(query: string): Intent {
  const q = query.toLowerCase();

  if (/\b(who|about|tell me about|介绍|bio)\b/.test(q) && /\brohith\b/.test(q)) return "who_is";
  if (/\b(project|built|created|developed|portfolio)\b/.test(q) && /\b(ml|machine learning|ai|deep learning|computer vision|nlp)\b/.test(q)) return "project_detail";
  if (/\b(project|built|created|developed|work|repository|repo|github)\b/.test(q)) return "projects";
  if (/\b(skill|technolog|tech stack|stack|know|language|framework|tool|proficien)\b/.test(q)) return "skills";
  if (/\b(certific|credential|course|training|cert)\b/.test(q)) return "certificates";
  if (/\b(achiev|award|recognition|hackathon|competition|prize|trophy|winner)\b/.test(q)) return "achievements";
  if (/\b(experience|work|job|intern|role|position|company|employ)\b/.test(q)) return "experience";
  if (/\b(education|study|university|college|degree|b\.?tech|school|academic)\b/.test(q)) return "education";
  if (/\b(contact|email|reach|phone|get in touch|mail)\b/.test(q)) return "contact";
  if (/\b(github|linkedin|leetcode|geeksforgeeks|social|profile|link)\b/.test(q)) return "social_links";
  if (/\b(blog|post|article|write|written|medium)\b/.test(q)) return "blog";

  return "general";
}

/* ------------------------------------------------------------------ */
/* Response generation                                                */
/* ------------------------------------------------------------------ */

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] ?? "";
  return items.slice(0, -1).join(", ") + ", and " + (items[items.length - 1] ?? "");
}

function buildResponse(intent: Intent, query: string, kb: KnowledgeBase): string {
  const profile = kb.profile;
  const name = profile?.name ?? "Rohith";

  switch (intent) {
    case "who_is": {
      const parts: string[] = [];
      parts.push(`${name} is ${profile?.title ?? "an AI & ML Engineer"}.`);
      if (profile?.about_me) parts.push(profile.about_me);
      if (profile?.location) parts.push(`He is based in ${profile.location}.`);
      if (kb.projects.length > 0) {
        const projectNames = kb.projects.map((p) => p.title);
        parts.push(`He has built notable projects like ${formatList(projectNames)}.`);
      }
      if (kb.achievements.length > 0 && kb.achievements[0]) {
        parts.push(`Among his achievements are ${kb.achievements[0].title}.`);
      }
      return parts.join(" ");
    }

    case "projects": {
      if (kb.projects.length === 0)
        return "Rohith hasn't added any featured projects to his portfolio yet.";
      const parts: string[] = [
        `Rohith has ${kb.projects.length} featured project${kb.projects.length > 1 ? "s" : ""} in his portfolio:`,
      ];
      for (const p of kb.projects) {
        const techs = p.technologies?.length ? ` (built with ${formatList(p.technologies.slice(0, 4))})` : "";
        const link = p.github_url ? ` — ${p.github_url}` : "";
        parts.push(`• ${p.title}: ${p.tagline ?? "No description"}${techs}${link}`);
      }
      return parts.join("\n");
    }

    case "project_detail": {
      const q = query.toLowerCase();
      const matched = kb.projects.filter((p) => {
        const haystack = `${p.title} ${p.tagline ?? ""} ${p.long_description ?? ""} ${(p.technologies ?? []).join(" ")}`.toLowerCase();
        return scoreDocument(query, haystack) > 0.2;
      });
      if (matched.length === 0) {
        return `Rohith has worked on various ML/AI projects. Here are some: ${formatList(kb.projects.map((p) => p.title))}. Ask me about any specific project!`;
      }
      const parts: string[] = [];
      for (const p of matched.slice(0, 3)) {
        parts.push(`**${p.title}**: ${p.tagline ?? ""}`);
        if (p.long_description) parts.push(p.long_description.slice(0, 300) + (p.long_description.length > 300 ? "..." : ""));
        if (p.technologies?.length) parts.push(`Technologies: ${formatList(p.technologies)}`);
        if (p.highlights?.length) parts.push(`Highlights: ${formatList(p.highlights.slice(0, 3))}`);
        if (p.github_url) parts.push(`GitHub: ${p.github_url}`);
        parts.push("");
      }
      return parts.join("\n").trim();
    }

    case "skills": {
      const allTechs = new Set<string>();
      kb.projects.forEach((p) => p.technologies?.forEach((t) => allTechs.add(t)));
      kb.experiences.forEach((e) => e.technologies?.forEach((t) => allTechs.add(t)));

      if (allTechs.size === 0) {
        return `${name} is an ${profile?.title ?? "AI & ML Engineer"} with expertise in Machine Learning, Computer Vision, and NLP. Check his portfolio for the latest skills.`;
      }

      const techs = Array.from(allTechs);
      const mlTechs = techs.filter((t) => /python|pytorch|tensorflow|keras|opencv|ml|dl|nlp|llm/i.test(t));
      const webTechs = techs.filter((t) => /react|next|node|flask|fastapi|html|css|js/i.test(t));
      const otherTechs = techs.filter((t) => !mlTechs.includes(t) && !webTechs.includes(t));

      const parts: string[] = [`${name} has skills across ${techs.length}+ technologies:`];
      if (mlTechs.length > 0) parts.push(`• AI/ML: ${formatList(mlTechs)}`);
      if (webTechs.length > 0) parts.push(`• Web: ${formatList(webTechs)}`);
      if (otherTechs.length > 0) parts.push(`• Other: ${formatList(otherTechs)}`);
      return parts.join("\n");
    }

    case "certificates": {
      if (kb.certificates.length === 0)
        return "Rohith hasn't added any certificates yet. Check back soon!";
      const parts: string[] = [
        `Rohith has ${kb.certificates.length} professional certifications:`,
      ];
      for (const c of kb.certificates) {
        parts.push(`• ${c.name} — ${c.organization} (${c.category ?? "General"})`);
      }
      return parts.join("\n");
    }

    case "achievements": {
      if (kb.achievements.length === 0)
        return "Rohith hasn't added any achievements yet. Check back soon!";
      const parts: string[] = [
        `Rohith has ${kb.achievements.length} notable achievements:`,
      ];
      for (const a of kb.achievements) {
        const desc = a.description ? ` — ${a.description.slice(0, 150)}` : "";
        parts.push(`• ${a.title}${desc}`);
      }
      return parts.join("\n");
    }

    case "experience": {
      if (kb.experiences.length === 0)
        return "Rohith hasn't added any work experience yet. He's currently pursuing his B.Tech at CMR College.";
      const parts: string[] = [`${name}'s professional experience:`];
      for (const e of kb.experiences) {
        parts.push(`• ${e.role} at ${e.company} (${e.duration})`);
        if (e.description) parts.push(`  ${e.description.slice(0, 200)}`);
        if (e.technologies?.length) parts.push(`  Technologies: ${formatList(e.technologies)}`);
      }
      return parts.join("\n");
    }

    case "education": {
      return `${name} is pursuing a B.Tech in CSE (AI & ML) at CMR College of Engineering and Technology, expected to graduate in 2027. He is consistently in the top 10% of his cohort.`;
    }

    case "contact": {
      const parts: string[] = [];
      if (profile?.email) parts.push(`Email: ${profile.email}`);
      if (profile?.phone) parts.push(`Phone: ${profile.phone}`);
      if (profile?.location) parts.push(`Location: ${profile.location}`);
      if (profile?.resume_url) parts.push(`Resume: ${profile.resume_url}`);
      parts.push("You can also reach out via the contact form on this portfolio.");
      return parts.join("\n");
    }

    case "social_links": {
      const parts: string[] = [];
      if (profile?.github_url) parts.push(`GitHub: ${profile.github_url}`);
      if (profile?.linkedin_url) parts.push(`LinkedIn: ${profile.linkedin_url}`);
      const q = query.toLowerCase();
      if (q.includes("leetcode")) {
        parts.push(`LeetCode: https://leetcode.com/u/ROHITH_PROGRAMMER/`);
      }
      if (q.includes("geeksforgeeks") || q.includes("gfg")) {
        parts.push(`GeeksforGeeks: https://www.geeksforgeeks.org/profile/burlaroh84ul`);
      }
      if (parts.length === 0) {
        parts.push("You can find Rohith's profiles on GitHub, LinkedIn, and LeetCode.");
      }
      return parts.join("\n");
    }

    case "blog": {
      if (kb.posts.length === 0)
        return "Rohith hasn't published any blog posts yet. Stay tuned for technical articles and insights!";
      const parts: string[] = [`Rohith has ${kb.posts.length} published blog posts:`];
      for (const p of kb.posts.slice(0, 5)) {
        const excerpt = p.excerpt ? `: ${p.excerpt.slice(0, 100)}` : "";
        parts.push(`• ${p.title}${excerpt}`);
      }
      return parts.join("\n");
    }

    case "general":
    default: {
      // Score all documents and find best matches
      const scores: { type: string; item: string; score: number }[] = [];
      kb.projects.forEach((p) => {
        const s = scoreDocument(query, p.title, p.tagline, p.long_description, p.technologies);
        if (s > 0.1) scores.push({ type: "project", item: p.title, score: s });
      });
      kb.certificates.forEach((c) => {
        const s = scoreDocument(query, c.name, c.organization, c.category);
        if (s > 0.1) scores.push({ type: "certificate", item: c.name, score: s });
      });
      kb.achievements.forEach((a) => {
        const s = scoreDocument(query, a.title, a.description, a.category);
        if (s > 0.1) scores.push({ type: "achievement", item: a.title, score: s });
      });
      kb.experiences.forEach((e) => {
        const s = scoreDocument(query, e.role, e.company, e.description);
        if (s > 0.1) scores.push({ type: "experience", item: e.role, score: s });
      });
      kb.posts.forEach((p) => {
        const s = scoreDocument(query, p.title, p.excerpt, p.tags);
        if (s > 0.1) scores.push({ type: "blog post", item: p.title, score: s });
      });

      scores.sort((a, b) => b.score - a.score);
      const top = scores.slice(0, 3);

      if (top.length > 0) {
        const parts: string[] = ["Here's what I found in Rohith's portfolio:"];
        for (const match of top) {
          parts.push(`• ${match.type.charAt(0).toUpperCase() + match.type.slice(1)}: ${match.item}`);
        }
        parts.push("");
        parts.push("Would you like to know more about any of these?");
        return parts.join("\n");
      }

      return `I'm not sure I understand that question. Here are some things I can help with:
• Who Rohith is and his background
• His projects and technologies
• His certifications and achievements
• His experience and education
• How to contact him
• His social media links

Try asking something like "What ML projects has Rohith built?" or "Tell me about his certifications."`;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Public: generate a response                                       */
/* ------------------------------------------------------------------ */

export async function generateResponse(query: string): Promise<string> {
  try {
    const kb = await loadKnowledgeBase();
    const intent = detectIntent(query);
    return buildResponse(intent, query, kb);
  } catch (e) {
    console.error("[chatbot] generateResponse failed:", e);
    return "Sorry, I'm having trouble accessing the portfolio data right now. Please try again in a moment.";
  }
}