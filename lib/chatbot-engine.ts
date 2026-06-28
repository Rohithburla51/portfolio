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
/* Enhanced text similarity with TF-IDF inspired weighting           */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "and", "but", "or", "if", "while", "about", "what",
  "which", "who", "whom", "this", "that", "these", "those", "am", "it",
  "its", "he", "him", "his", "she", "her", "hers", "they", "them",
  "their", "me", "my", "i", "you", "your", "we", "our", "tell",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function nGrams(tokens: string[], n: number): string[] {
  const grams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(" "));
  }
  return grams;
}

function computeRelevance(query: string, ...fields: (string | null | undefined | string[])[]): number {
  const queryTokens = tokenize(query);
  const queryBigrams = nGrams(queryTokens, 2);
  let totalScore = 0;

  for (const field of fields) {
    if (!field) continue;
    const text = Array.isArray(field) ? field.join(" ") : field;
    const docTokens = tokenize(text);
    const docSet = new Set(docTokens);
    const docBigrams = new Set(nGrams(docTokens, 2));

    // Unigram match
    let unigramHits = 0;
    for (const token of queryTokens) {
      if (docSet.has(token)) unigramHits++;
    }

    // Bigram match (weighted higher)
    let bigramHits = 0;
    for (const bigram of queryBigrams) {
      if (docBigrams.has(bigram)) bigramHits++;
    }

    const unigramScore = queryTokens.length > 0 ? unigramHits / queryTokens.length : 0;
    const bigramScore = queryBigrams.length > 0 ? (bigramHits / queryBigrams.length) * 1.5 : 0;
    const fieldScore = Math.min(1, unigramScore * 0.6 + bigramScore * 0.4);

    if (fieldScore > totalScore) totalScore = fieldScore;
  }

  return totalScore;
}

/* ------------------------------------------------------------------ */
/* Intent detection with confidence scoring                          */
/* ------------------------------------------------------------------ */

type Intent =
  | "greeting"
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
  | "thanks"
  | "general";

function detectIntent(query: string): Intent {
  const q = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening)|sup|yo)\b/i.test(q) && q.length < 30) {
    return "greeting";
  }

  // Thanks
  if (/^(thanks?|thank\s*you|thx|appreciate|great|awesome|perfect|nice|cool)\b/i.test(q) && q.length < 50) {
    return "thanks";
  }

  if (/\b(who|about|tell me about|introduce|background|bio|overview)\b/.test(q) && /\b(rohith|himself|him|he|portfolio owner)\b/.test(q)) return "who_is";
  if (/\b(project|built|created|developed|portfolio)\b/.test(q) && /\b(ml|machine learning|ai|deep learning|computer vision|nlp|specific)\b/.test(q)) return "project_detail";
  if (/\b(project|built|created|developed|work|repository|repo|github project|made)\b/.test(q)) return "projects";
  if (/\b(skill|technolog|tech stack|stack|know|language|framework|tool|proficien|capable)\b/.test(q)) return "skills";
  if (/\b(certific|credential|course|training|cert|certified)\b/.test(q)) return "certificates";
  if (/\b(achiev|award|recognition|hackathon|competition|prize|trophy|winner|won|accomplishment)\b/.test(q)) return "achievements";
  if (/\b(experience|work|job|intern|role|position|company|employ|career|profession)\b/.test(q)) return "experience";
  if (/\b(education|study|university|college|degree|b\.?tech|school|academic|learn|studying)\b/.test(q)) return "education";
  if (/\b(contact|email|reach|phone|get in touch|mail|hire|connect)\b/.test(q)) return "contact";
  if (/\b(github|linkedin|leetcode|geeksforgeeks|social|profile|link|gfg|twitter|x\.com)\b/.test(q)) return "social_links";
  if (/\b(blog|post|article|write|written|medium|publish)\b/.test(q)) return "blog";

  return "general";
}

/* ------------------------------------------------------------------ */
/* Professional response generation                                   */
/* ------------------------------------------------------------------ */

function formatList(items: string[], limit?: number): string {
  const list = limit ? items.slice(0, limit) : items;
  if (list.length === 0) return "";
  if (list.length === 1) return list[0] ?? "";
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return list.slice(0, -1).join(", ") + ", and " + (list[list.length - 1] ?? "");
}

function buildResponse(intent: Intent, query: string, kb: KnowledgeBase): string {
  const profile = kb.profile;
  const name = profile?.name ?? "Rohith";

  switch (intent) {
    case "greeting": {
      const greetings = [
        `Hello! I'm ${name}'s portfolio assistant. I can help you learn about his projects, skills, experience, and more. What would you like to know?`,
        `Hi there! Welcome to ${name}'s portfolio. Feel free to ask me about his work, achievements, or how to get in touch.`,
        `Hey! I'm here to help you explore ${name}'s portfolio. Ask me anything about his projects, skills, or background.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)] ?? greetings[0]!;
    }

    case "thanks": {
      const responses = [
        "You're welcome! Let me know if there's anything else you'd like to know about Rohith's work.",
        "Happy to help! Feel free to ask if you have more questions.",
        "Glad I could help! Don't hesitate to ask anything else about the portfolio.",
      ];
      return responses[Math.floor(Math.random() * responses.length)] ?? responses[0]!;
    }

    case "who_is": {
      const parts: string[] = [];
      parts.push(`**${name}** is ${profile?.title ?? "an AI & ML Engineer"}.`);
      if (profile?.about_me) {
        parts.push("");
        parts.push(profile.about_me);
      }
      if (profile?.location) {
        parts.push("");
        parts.push(`📍 Based in ${profile.location}`);
      }
      if (kb.projects.length > 0) {
        parts.push("");
        const topProjects = kb.projects.slice(0, 3).map((p) => p.title);
        parts.push(`He has built notable projects including **${formatList(topProjects)}**.`);
      }
      if (kb.achievements.length > 0) {
        parts.push(`He has **${kb.achievements.length}** notable achievements in hackathons, competitions, and academic excellence.`);
      }
      if (kb.certificates.length > 0) {
        parts.push(`He holds **${kb.certificates.length}** professional certifications.`);
      }
      return parts.join("\n");
    }

    case "projects": {
      if (kb.projects.length === 0)
        return "No featured projects have been added to the portfolio yet. Check back soon!";

      const parts: string[] = [
        `${name} has **${kb.projects.length}** featured projects in his portfolio:\n`,
      ];
      for (const p of kb.projects) {
        const techs = p.technologies?.length
          ? ` — _${formatList(p.technologies.slice(0, 4))}_`
          : "";
        parts.push(`**${p.title}**${techs}`);
        if (p.tagline) parts.push(`${p.tagline}`);
        if (p.github_url) parts.push(`🔗 [GitHub](${p.github_url})`);
        parts.push("");
      }
      parts.push("Would you like to know more about any specific project?");
      return parts.join("\n");
    }

    case "project_detail": {
      const matched = kb.projects
        .map((p) => ({
          project: p,
          score: computeRelevance(
            query,
            p.title,
            p.tagline,
            p.long_description,
            p.technologies
          ),
        }))
        .filter((m) => m.score > 0.15)
        .sort((a, b) => b.score - a.score);

      if (matched.length === 0) {
        const allNames = kb.projects.map((p) => `**${p.title}**`);
        return `Here are all of ${name}'s projects: ${formatList(allNames)}.\n\nAsk me about any of these for more details!`;
      }

      const parts: string[] = [];
      for (const { project: p } of matched.slice(0, 2)) {
        parts.push(`### ${p.title}`);
        if (p.tagline) parts.push(`*${p.tagline}*`);
        parts.push("");
        if (p.long_description) {
          const desc = p.long_description.length > 400
            ? p.long_description.slice(0, 400) + "..."
            : p.long_description;
          parts.push(desc);
          parts.push("");
        }
        if (p.technologies?.length) {
          parts.push(`**Tech Stack:** ${formatList(p.technologies)}`);
        }
        if (p.highlights?.length) {
          parts.push(`**Key Highlights:**`);
          for (const h of p.highlights.slice(0, 4)) {
            parts.push(`• ${h}`);
          }
        }
        const links: string[] = [];
        if (p.github_url) links.push(`[GitHub](${p.github_url})`);
        if (p.live_url) links.push(`[Live Demo](${p.live_url})`);
        if (links.length > 0) parts.push(`\n🔗 ${links.join(" | ")}`);
        parts.push("");
      }
      return parts.join("\n").trim();
    }

    case "skills": {
      const allTechs = new Set<string>();
      kb.projects.forEach((p) => p.technologies?.forEach((t) => allTechs.add(t)));
      kb.experiences.forEach((e) => e.technologies?.forEach((t) => allTechs.add(t)));

      if (allTechs.size === 0) {
        return `${name} is ${profile?.title ?? "an AI & ML Engineer"} with expertise in Machine Learning, Deep Learning, Computer Vision, and NLP. Visit his portfolio for the complete skill set.`;
      }

      const techs = Array.from(allTechs);
      const categories: Record<string, string[]> = {
        "🤖 AI/ML": [],
        "🌐 Web Development": [],
        "🗄️ Databases & Cloud": [],
        "🛠️ Tools & Other": [],
      };

      for (const t of techs) {
        if (/python|pytorch|tensorflow|keras|opencv|scikit|ml|dl|nlp|llm|hugging|transformers|yolo|mediapipe|langchain/i.test(t)) {
          categories["🤖 AI/ML"]!.push(t);
        } else if (/react|next|node|flask|fastapi|html|css|js|javascript|typescript|tailwind|express|django|angular|vue/i.test(t)) {
          categories["🌐 Web Development"]!.push(t);
        } else if (/sql|postgres|mongo|firebase|supabase|aws|gcp|azure|docker|redis|prisma/i.test(t)) {
          categories["🗄️ Databases & Cloud"]!.push(t);
        } else {
          categories["🛠️ Tools & Other"]!.push(t);
        }
      }

      const parts: string[] = [`${name} has expertise across **${techs.length}+** technologies:\n`];
      for (const [category, items] of Object.entries(categories)) {
        if (items.length > 0) {
          parts.push(`${category}: ${formatList(items)}`);
        }
      }
      return parts.join("\n");
    }

    case "certificates": {
      if (kb.certificates.length === 0)
        return "No certificates have been added yet. Check back soon!";

      const parts: string[] = [
        `${name} holds **${kb.certificates.length}** professional certifications:\n`,
      ];

      // Group by category
      const grouped: Record<string, Certificate[]> = {};
      for (const c of kb.certificates) {
        const cat = c.category ?? "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat]!.push(c);
      }

      for (const [category, certs] of Object.entries(grouped)) {
        parts.push(`**${category}:**`);
        for (const c of certs) {
          parts.push(`• ${c.name} — _${c.organization}_`);
        }
        parts.push("");
      }
      return parts.join("\n").trim();
    }

    case "achievements": {
      if (kb.achievements.length === 0)
        return "No achievements have been listed yet. Check back soon!";

      const parts: string[] = [
        `${name} has **${kb.achievements.length}** notable achievements:\n`,
      ];
      for (const a of kb.achievements) {
        const desc = a.description ? ` — ${a.description.slice(0, 120)}${a.description.length > 120 ? "..." : ""}` : "";
        const icon = a.category === "hackathon" ? "🏆" : a.category === "coding" ? "💻" : a.category === "academic" ? "🎓" : "⭐";
        parts.push(`${icon} **${a.title}**${desc}`);
      }
      return parts.join("\n");
    }

    case "experience": {
      if (kb.experiences.length === 0)
        return `${name} is currently focused on building his portfolio of projects and pursuing his B.Tech in CSE (AI & ML). He's open to internship and collaboration opportunities!`;

      const parts: string[] = [`**${name}'s Professional Experience:**\n`];
      for (const e of kb.experiences) {
        parts.push(`### ${e.role} at ${e.company}`);
        parts.push(`📅 ${e.duration}`);
        if (e.description) parts.push(`\n${e.description.slice(0, 300)}${e.description.length > 300 ? "..." : ""}`);
        if (e.technologies?.length) parts.push(`\n**Technologies:** ${formatList(e.technologies)}`);
        parts.push("");
      }
      return parts.join("\n").trim();
    }

    case "education": {
      const parts: string[] = [];
      parts.push(`**Education:**\n`);
      parts.push(`🎓 **B.Tech in CSE (AI & ML)**`);
      parts.push(`CMR College of Engineering and Technology`);
      parts.push(`Expected Graduation: 2027`);
      parts.push("");
      parts.push(`${name} is consistently in the top 10% of his cohort, with a strong focus on Machine Learning, Deep Learning, and practical AI applications.`);
      return parts.join("\n");
    }

    case "contact": {
      const parts: string[] = [`Here's how you can reach **${name}**:\n`];
      if (profile?.email) parts.push(`📧 Email: ${profile.email}`);
      if (profile?.phone) parts.push(`📱 Phone: ${profile.phone}`);
      if (profile?.location) parts.push(`📍 Location: ${profile.location}`);
      if (profile?.linkedin_url) parts.push(`💼 LinkedIn: ${profile.linkedin_url}`);
      if (profile?.github_url) parts.push(`🐙 GitHub: ${profile.github_url}`);
      if (profile?.resume_url) parts.push(`📄 Resume: ${profile.resume_url}`);
      parts.push("");
      parts.push("You can also use the **contact form** on this portfolio to send a direct message.");
      return parts.join("\n");
    }

    case "social_links": {
      const parts: string[] = [`**${name}'s Online Profiles:**\n`];
      if (profile?.github_url) parts.push(`🐙 GitHub: ${profile.github_url}`);
      if (profile?.linkedin_url) parts.push(`💼 LinkedIn: ${profile.linkedin_url}`);

      const q = query.toLowerCase();
      if (q.includes("leetcode") || q.includes("coding")) {
        parts.push(`💻 LeetCode: https://leetcode.com/u/ROHITH_PROGRAMMER/`);
      }
      if (q.includes("geeksforgeeks") || q.includes("gfg")) {
        parts.push(`📗 GeeksforGeeks: https://www.geeksforgeeks.org/profile/burlaroh84ul`);
      }

      // If generic social links request, show all
      if (!q.includes("leetcode") && !q.includes("gfg") && !q.includes("geeksforgeeks")) {
        parts.push(`💻 LeetCode: https://leetcode.com/u/ROHITH_PROGRAMMER/`);
        parts.push(`📗 GeeksforGeeks: https://www.geeksforgeeks.org/profile/burlaroh84ul`);
      }

      return parts.join("\n");
    }

    case "blog": {
      if (kb.posts.length === 0)
        return `${name} hasn't published any blog posts yet. Stay tuned for technical articles and insights!`;

      const parts: string[] = [`${name} has published **${kb.posts.length}** articles:\n`];
      for (const p of kb.posts.slice(0, 5)) {
        const tags = p.tags?.length ? ` [${p.tags.slice(0, 3).join(", ")}]` : "";
        parts.push(`📝 **${p.title}**${tags}`);
        if (p.excerpt) parts.push(`   ${p.excerpt.slice(0, 100)}${p.excerpt.length > 100 ? "..." : ""}`);
        parts.push("");
      }
      if (kb.posts.length > 5) {
        parts.push(`_...and ${kb.posts.length - 5} more articles._`);
      }
      return parts.join("\n").trim();
    }

    case "general":
    default: {
      // Score all documents and find best matches
      const scores: { type: string; title: string; detail: string; score: number }[] = [];

      kb.projects.forEach((p) => {
        const s = computeRelevance(query, p.title, p.tagline, p.long_description, p.technologies);
        if (s > 0.15) scores.push({
          type: "Project",
          title: p.title,
          detail: p.tagline ?? "",
          score: s,
        });
      });
      kb.certificates.forEach((c) => {
        const s = computeRelevance(query, c.name, c.organization, c.category);
        if (s > 0.15) scores.push({
          type: "Certificate",
          title: c.name,
          detail: c.organization,
          score: s,
        });
      });
      kb.achievements.forEach((a) => {
        const s = computeRelevance(query, a.title, a.description, a.category);
        if (s > 0.15) scores.push({
          type: "Achievement",
          title: a.title,
          detail: a.description?.slice(0, 80) ?? "",
          score: s,
        });
      });
      kb.experiences.forEach((e) => {
        const s = computeRelevance(query, e.role, e.company, e.description, e.technologies);
        if (s > 0.15) scores.push({
          type: "Experience",
          title: `${e.role} at ${e.company}`,
          detail: e.duration,
          score: s,
        });
      });
      kb.posts.forEach((p) => {
        const s = computeRelevance(query, p.title, p.excerpt, p.tags);
        if (s > 0.15) scores.push({
          type: "Blog Post",
          title: p.title,
          detail: p.excerpt?.slice(0, 80) ?? "",
          score: s,
        });
      });

      scores.sort((a, b) => b.score - a.score);
      const top = scores.slice(0, 4);

      if (top.length > 0) {
        const parts: string[] = ["Here's what I found relevant in the portfolio:\n"];
        for (const match of top) {
          parts.push(`**${match.type}:** ${match.title}`);
          if (match.detail) parts.push(`_${match.detail}_`);
          parts.push("");
        }
        parts.push("Would you like more details on any of these?");
        return parts.join("\n");
      }

      return `I appreciate your question! While I don't have a specific answer for that, here's what I can help you with:

• **About Rohith** — his background, education, and interests
• **Projects** — the applications and systems he's built
• **Skills** — his technical expertise and tech stack
• **Certifications** — professional credentials
• **Achievements** — hackathons, competitions, and awards
• **Experience** — professional and internship work
• **Contact** — how to reach him or collaborate

Try asking something like "What projects has Rohith built?" or "Tell me about his achievements."`;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Public: generate a response                                       */
/* ------------------------------------------------------------------ */

export async function generateResponse(query: string): Promise<string> {
  try {
    // Basic input validation
    const trimmed = query.trim();
    if (!trimmed) {
      return "Please type a question and I'll do my best to help!";
    }
    if (trimmed.length > 500) {
      return "That's quite a long message! Could you try asking a more specific question? I work best with focused queries about Rohith's portfolio.";
    }

    const kb = await loadKnowledgeBase();
    const intent = detectIntent(trimmed);
    return buildResponse(intent, trimmed, kb);
  } catch (e) {
    console.error("[chatbot] generateResponse failed:", e);
    return "I'm having trouble accessing the portfolio data right now. Please try again in a moment.";
  }
}
