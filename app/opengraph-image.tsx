import { ImageResponse } from "next/og";

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
          background:
            "linear-gradient(135deg, oklch(0.18 0 0) 0%, oklch(0.12 0 0) 100%)",
          color: "oklch(0.985 0 0)",
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
              background: "oklch(0.25 0 0)",
              border: "1px solid oklch(0.35 0 0)",
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
