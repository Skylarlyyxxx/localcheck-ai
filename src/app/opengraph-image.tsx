import { ImageResponse } from "next/og";

export const alt = "LocalCheck AI — Ecommerce Localization Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", height: "100%", width: "100%", background: "#f8fafc", color: "#12263f", padding: "72px", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 32, fontWeight: 700 }}><span style={{ display: "flex", width: 52, height: 52, borderRadius: 12, background: "#2867f0", color: "white", alignItems: "center", justifyContent: "center" }}>L</span>LocalCheck <span style={{ color: "#2867f0" }}>AI</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}><div style={{ color: "#2867f0", fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>AUTOMATED LOCALIZATION AUDIT</div><div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>Is your store ready for global customers?</div></div>
      <div style={{ display: "flex", gap: "28px", color: "#667085", fontSize: 24 }}><span>Currency</span><span>Payments</span><span>Trust</span><span>SEO</span><span>Policy</span></div>
    </div>,
    size,
  );
}
