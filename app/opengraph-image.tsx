import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Stevanus Paulus — Cybersecurity Analyst";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ alignItems: "center", background: "#12141c", color: "#edeae0", display: "flex", height: "100%", padding: "72px", position: "relative", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ color: "#6fa8b8", fontSize: 28, letterSpacing: 6 }}>JAKARTA · GROUP IT SECURITY</div>
          <div style={{ fontSize: 82, fontWeight: 700, letterSpacing: -4 }}>Stevanus Paulus</div>
          <div style={{ color: "#9498aa", fontSize: 34 }}>Cybersecurity analyst · NAC · Secure Access · Proxy</div>
        </div>
        <div style={{ alignItems: "center", border: "3px solid #e3a857", borderRadius: 24, color: "#e3a857", display: "flex", fontSize: 80, fontWeight: 700, height: 150, justifyContent: "center", position: "absolute", right: 80, top: 72, width: 150 }}>P</div>
      </div>
    ),
    size
  );
}
