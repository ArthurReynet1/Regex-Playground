import { ImageResponse } from "next/og";

// Required for `output: 'export'` — pre-render this image at build time
export const dynamic = "force-static";

export const alt = "Regex Playground — Testez, décomposez et exportez vos regex";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span
            style={{
              fontSize: 32,
              opacity: 0.6,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Regex Playground
          </span>
          <h1
            style={{
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Testez, décomposez et exportez vos regex.
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <code
            style={{
              fontSize: 44,
              padding: "16px 28px",
              borderRadius: "16px",
              background: "#262626",
              border: "1px solid #404040",
              fontFamily: "monospace",
            }}
          >
            <span style={{ color: "#a78bfa" }}>^</span>
            <span style={{ color: "#60a5fa" }}>(</span>
            <span style={{ color: "#fb923c" }}>\d</span>
            <span style={{ color: "#4ade80" }}>{"{3}"}</span>
            <span style={{ color: "#60a5fa" }}>)</span>
            <span>-</span>
            <span style={{ color: "#fb923c" }}>\d</span>
            <span style={{ color: "#4ade80" }}>{"{4}"}</span>
            <span style={{ color: "#a78bfa" }}>$</span>
          </code>
          <span style={{ fontSize: 28, opacity: 0.7 }}>
            Décomposition visuelle • Export JS / Python / C# • Détection ReDoS
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
