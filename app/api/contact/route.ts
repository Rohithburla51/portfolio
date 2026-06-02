import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { createPublicSupabase } from "@/lib/supabase";
import { sendContactEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(5000),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;

    // 1. Persist to database (anon INSERT allowed by RLS policy on contact_messages)
    try {
      const supabase = createPublicSupabase();
      if (supabase) {
        const { error: dbError } = await supabase
          .from("contact_messages")
          .insert({ name, email, subject, message });

        if (dbError) {
          console.error("[contact] DB insert failed:", dbError);
        } else {
          revalidateTag("contact-messages", "max");
        }
      }
    } catch (e) {
      console.error("[contact] Supabase error:", e);
    }

    // 2. Send email via Resend
    try {
      await sendContactEmail({ name, email, subject, message });
    } catch (e) {
      console.error("[contact] Resend failed:", e);
      // Don't fail the request if email fails — message is in DB
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] unexpected error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
