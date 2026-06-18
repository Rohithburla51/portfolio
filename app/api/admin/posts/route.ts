/**
 * API route for posts (blog) CRUD using service role key.
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
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

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

    const postData = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content_md: body.content_md || "",
      cover_image_url: body.cover_image_url || null,
      tags: body.tags || [],
      is_published: body.is_published ?? false,
      published_at: body.is_published ? (body.published_at || new Date().toISOString()) : null,
      reading_time_min: body.reading_time_min || null,
    };

    if (body.id) {
      const { data, error } = await supabase
        .from("posts")
        .update({ ...postData, updated_at: new Date().toISOString() })
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("posts", "max");
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("posts", "max");
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("[api/admin/posts] POST error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
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

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) throw error;
    revalidateTag("posts", "max");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}