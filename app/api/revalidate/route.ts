import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

/**
 * Webhook endpoint to revalidate cached GitHub data.
 * Configure in GitHub repo settings → Webhooks with shared secret.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.REVALIDATE_SECRET;
    if (secret) {
      const provided = request.headers.get("x-revalidate-secret");
      if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const tags = Array.isArray(body.tags) ? body.tags : ["github-repos", "github-profile"];

    for (const tag of tags) {
      if (typeof tag === "string") {
        revalidateTag(tag, "max");
      }
    }

    return NextResponse.json({ revalidated: true, tags, now: Date.now() });
  } catch (e) {
    console.error("[revalidate] error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
