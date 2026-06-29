/**
 * API route for experiences CRUD using service role key.
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
    .from("experiences")
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

    const expData = {
      company: body.company,
      role: body.role,
      duration: body.duration,
      description: body.description || null,
      technologies: body.technologies || [],
      display_order: body.display_order ?? 0,
      is_active: body.is_active ?? true,
    };

    if (body.id) {
      const { data, error } = await supabase
        .from("experiences")
        .update(expData)
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("experiences", "max");
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from("experiences")
        .insert(expData)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("experiences", "max");
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("[api/admin/experiences] POST error:", err);
    return NextResponse.json({ error: "Failed to save experience" }, { status: 500 });
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

    const { error } = await supabase.from("experiences").delete().eq("id", id);

    if (error) throw error;
    revalidateTag("experiences", "max");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
