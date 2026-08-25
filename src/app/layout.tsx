import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalCheck AI — Ecommerce Localization Audit",
  description: "Audit your ecommerce website for localization gaps across currency, payments, trust, SEO and policy signals.",
  applicationName: "LocalCheck AI",
  metadataBase: new URL("https://localcheck-ai.vercel.app"),
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "LocalCheck AI — Ecommerce Localization Audit",
    description: "An automated, market-specific localization readiness audit for ecommerce websites.",
    siteName: "LocalCheck AI",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "LocalCheck AI — Ecommerce Localization Audit", description: "Audit ecommerce localization signals across markets." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
