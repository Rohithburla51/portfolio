/**
 * API route for resume URL management in site_config.
 * Uses service role key to bypass RLS.
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
    .from("site_config")
    .select("value")
    .eq("key", "resume_url")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.value ?? { url: null, version: null, uploaded_at: null });
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    const value = {
      url: body.url ?? null,
      version: body.version ?? null,
      uploaded_at: body.url ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("site_config")
      .upsert(
        { key: "resume_url", value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) throw error;

    revalidateTag("profile", "max");

    return NextResponse.json({ success: true, value });
  } catch (err) {
    console.error("[api/admin/resume] POST error:", err);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}