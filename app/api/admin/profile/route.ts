/**
 * API route for profile CRUD operations using service role key.
 * This bypasses RLS so authenticated admin users can update the profile.
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
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
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

    // Check if profile exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: body.name,
          title: body.title,
          about_me: body.about_me,
          email: body.email,
          github_url: body.github_url || null,
          linkedin_url: body.linkedin_url || null,
          resume_url: body.resume_url || null,
          profile_image_url: body.profile_image_url || null,
          location: body.location || null,
          phone: body.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      revalidateTag("profile", "max");
      return NextResponse.json(data);
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          name: body.name,
          title: body.title,
          about_me: body.about_me,
          email: body.email,
          github_url: body.github_url || null,
          linkedin_url: body.linkedin_url || null,
          resume_url: body.resume_url || null,
          profile_image_url: body.profile_image_url || null,
          location: body.location || null,
          phone: body.phone || null,
          is_active: true,
          display_order: 1,
        })
        .select()
        .single();

      if (error) throw error;
      revalidateTag("profile", "max");
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error("[api/admin/profile] POST error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}