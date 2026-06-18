/**
 * API route for certificates CRUD using service role key.
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
    .from("certificates")
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

    const certData = {
      name: body.name,
      organization: body.organization,
      issue_date: body.issue_date || null,
      image_url: body.image_url || null,
      pdf_url: body.pdf_url || null,
      verify_url: body.verify_url || null,
      category: body.category || null,
      display_order: body.display_order ?? 0,
      is_active: body.is_active ?? true,
    };

    if (body.id) {
      const { data, error } = await supabase
        .from("certificates")
        .update(certData)
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("certificates", "max");
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from("certificates")
        .insert(certData)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("certificates", "max");
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("[api/admin/certificates] POST error:", err);
    return NextResponse.json({ error: "Failed to save certificate" }, { status: 500 });
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
      .from("certificates")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidateTag("certificates", "max");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 });
  }
}