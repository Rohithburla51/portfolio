/**
 * Admin API: GitHub projects enrichment.
 * GET  — returns all GitHub repos merged with DB enrichments
 * POST — upsert enrichment for a repo
 * DELETE — remove enrichment (repo goes back to raw GitHub data)
 */

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { NextResponse, type NextRequest } from "next/server";
import { getGithubRepos } from "@/lib/github";
import { SITE } from "@/lib/utils";

export async function GET() {
  try {
    // Fetch GitHub repos + DB enrichments in parallel
    const [repos, supabase] = await Promise.all([
      getGithubRepos(SITE.githubUsername, { includeForks: false }),
      createAdminClient(),
    ]);

    // Get all enrichments from DB
    let enrichments: Record<string, {
      id: string;
      repo_name: string;
      title_override: string | null;
      description: string | null;
      highlights: string[] | null;
      technologies: string[] | null;
      live_url: string | null;
      is_hidden: boolean;
      display_order: number;
    }> = {};

    if (supabase) {
      const { data } = await supabase
        .from("github_projects")
        .select("*")
        .order("display_order", { ascending: true });

      if (data) {
        for (const row of data) {
          enrichments[row.repo_name] = row;
        }
      }
    }

    // Merge GitHub repos with DB enrichments
    const merged = repos.map((repo) => {
      const enrichment = enrichments[repo.name];
      return {
        // Raw GitHub data
        repo_name: repo.name,
        github_description: repo.description,
        html_url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        topics: repo.topics,
        pushed_at: repo.pushed_at,
        created_at: repo.created_at,
        // DB enrichments (null if not yet enriched)
        enrichment_id: enrichment?.id ?? null,
        title_override: enrichment?.title_override ?? null,
        description: enrichment?.description ?? null,
        highlights: enrichment?.highlights ?? [],
        technologies: enrichment?.technologies ?? [],
        live_url: enrichment?.live_url ?? null,
        is_hidden: enrichment?.is_hidden ?? false,
        display_order: enrichment?.display_order ?? 0,
        is_enriched: !!enrichment,
      };
    });

    // Sort: non-hidden first, then by stars
    merged.sort((a, b) => {
      if (a.is_hidden !== b.is_hidden) return a.is_hidden ? 1 : -1;
      return b.stargazers_count - a.stargazers_count;
    });

    return NextResponse.json(merged);
  } catch (err) {
    console.error("[api/admin/projects] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    if (!body.repo_name) {
      return NextResponse.json({ error: "repo_name is required" }, { status: 400 });
    }

    const enrichmentData = {
      repo_name: body.repo_name,
      title_override: body.title_override || null,
      description: body.description || null,
      highlights: body.highlights || [],
      technologies: body.technologies || [],
      live_url: body.live_url || null,
      is_hidden: body.is_hidden ?? false,
      display_order: body.display_order ?? 0,
    };

    // Upsert by repo_name
    const { data, error } = await supabase
      .from("github_projects")
      .upsert(enrichmentData, { onConflict: "repo_name" })
      .select()
      .single();

    if (error) throw error;

    revalidateTag("github-projects-enrichments", "max");
    revalidateTag("github-repos", "max");
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/projects] POST error:", err);
    return NextResponse.json({ error: "Failed to save project enrichment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const repoName = searchParams.get("repo_name");

    if (!repoName) {
      return NextResponse.json({ error: "repo_name required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("github_projects")
      .delete()
      .eq("repo_name", repoName);

    if (error) throw error;

    revalidateTag("github-projects-enrichments", "max");
    revalidateTag("github-repos", "max");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete enrichment" }, { status: 500 });
  }
}
