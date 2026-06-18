/**
 * API route for achievements CRUD using service role key.
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
    .from("achievements")
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

    const achData = {
      title: body.title,
      category: body.category || "other",
      description: body.description || null,
      icon: body.icon || null,
      date: body.date || null,
      link: body.link || null,
      display_order: body.display_order ?? 0,
      is_active: body.is_active ?? true,
    };

    if (body.id) {
      const { data, error } = await supabase
        .from("achievements")
        .update(achData)
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("achievements", "max");
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from("achievements")
        .insert(achData)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("achievements", "max");
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("[api/admin/achievements] POST error:", err);
    return NextResponse.json({ error: "Failed to save achievement" }, { status: 500 });
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
      .from("achievements")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidateTag("achievements", "max");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
}