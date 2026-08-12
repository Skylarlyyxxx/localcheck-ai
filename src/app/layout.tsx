import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalCheck AI — Ecommerce Localization Audit",
  description: "Audit your ecommerce website for localization gaps across currency, payments, trust, SEO and policy signals.",
  applicationName: "LocalCheck AI",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
