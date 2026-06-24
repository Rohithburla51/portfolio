/**
 * API route for chatbot settings CRUD operations using service role key.
 * This bypasses RLS so authenticated admin users can update chatbot settings.
 */

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { NextResponse, type NextRequest } from "next/server";

const SETTINGS_KEYS = [
  "enabled",
  "chatbot_name",
  "welcome_message",
  "suggested_questions",
];

export async function GET() {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("chatbot_settings")
    .select("key, value")
    .in("key", SETTINGS_KEYS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to a flat object
  const settings: Record<string, unknown> = {};
  data?.forEach((row) => {
    const value = row.value as { value: unknown };
    settings[row.key] = value.value;
  });

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Upsert each setting
    if (body.enabled !== undefined) {
      await supabase
        .from("chatbot_settings")
        .upsert(
          { key: "enabled", value: { value: body.enabled } },
          { onConflict: "key" }
        );
    }

    if (body.chatbot_name !== undefined) {
      await supabase
        .from("chatbot_settings")
        .upsert(
          { key: "chatbot_name", value: { value: body.chatbot_name } },
          { onConflict: "key" }
        );
    }

    if (body.welcome_message !== undefined) {
      await supabase
        .from("chatbot_settings")
        .upsert(
          { key: "welcome_message", value: { value: body.welcome_message } },
          { onConflict: "key" }
        );
    }

    if (body.suggested_questions !== undefined) {
      await supabase
        .from("chatbot_settings")
        .upsert(
          { key: "suggested_questions", value: { value: body.suggested_questions } },
          { onConflict: "key" }
        );
    }

    revalidateTag("chatbot-settings", "max");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/chatbot] POST error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}