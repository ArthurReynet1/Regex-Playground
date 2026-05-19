import { ImageResponse } from "next/og";

// Required for `output: 'export'` — pre-render this icon at build time
export const dynamic = "force-static";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a1a1a",
          color: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "monospace",
          letterSpacing: "-0.05em",
        }}
      >
        /R/
      </div>
    ),
    { ...size },
  );
}
