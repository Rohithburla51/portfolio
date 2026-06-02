import { ImageResponse } from "next/og";
import { SITE } from "@/lib/utils";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
          }}
        />

        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            BR
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "16px", color: "#94a3b8" }}>PORTFOLIO</div>
            <div style={{ fontSize: "20px", fontWeight: 600 }}>{SITE.name}</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            AI &amp; ML Engineer
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#cbd5e1",
              maxWidth: "900px",
              lineHeight: 1.3,
            }}
          >
            Building intelligent systems in Machine Learning, Computer Vision,
            and NLP.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "20px",
            color: "#94a3b8",
          }}
        >
          <div>github.com/{SITE.githubUsername}</div>
          <div>{SITE.email}</div>
        </div>
      </div>
    ),
    size,
  );
}
