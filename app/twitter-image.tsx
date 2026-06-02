import { ImageResponse } from "next/og";
import { SITE } from "@/lib/utils";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Twitter() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px",
          background: "#0f172a",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {SITE.name}
        </div>
        <div style={{ fontSize: "32px", color: "#cbd5e1", marginTop: "20px" }}>
          {SITE.role}
        </div>
      </div>
    ),
    size,
  );
}
