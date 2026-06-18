/**
 * API route for featured_projects CRUD using service role key.
 */

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { NextResponse, type NextRequest } from "next/server";

export async function GET() {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("featured_projects")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    const projectData = {
      repo_name: body.repo_name || null,
      title: body.title,
      tagline: body.tagline || null,
      long_description: body.long_description || null,
      media_urls: body.media_urls || [],
      technologies: body.technologies || [],
      highlights: body.highlights || [],
      github_url: body.github_url || null,
      live_url: body.live_url || null,
      display_order: body.display_order ?? 0,
      is_active: body.is_active ?? true,
    };

    if (body.id) {
      // Update
      const { data, error } = await supabase
        .from("featured_projects")
        .update({ ...projectData, updated_at: new Date().toISOString() })
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("featured-projects", "max");
      return NextResponse.json(data);
    } else {
      // Insert
      const { data, error } = await supabase
        .from("featured_projects")
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("featured-projects", "max");
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("[api/admin/projects] POST error:", err);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("featured_projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidateTag("featured-projects", "max");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}