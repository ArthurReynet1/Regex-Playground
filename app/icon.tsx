import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "oklch(0.18 0 0)",
          color: "oklch(0.985 0 0)",
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
