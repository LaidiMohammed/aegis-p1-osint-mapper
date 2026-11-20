import type { Metadata } from "next";
import { Fraunces, DM_Sans, IBM_Plex_Mono } from "next/font/google";
const displayFont = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-display", display: "swap" });
const sansFont = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans", display: "swap" });
const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono", display: "swap" });
import "./globals.css";

export const metadata: Metadata = {
  title: "P1 / OSINT ATLAS — Cartographie d'une organisation open-source",
  description:
    "P1 — Cartographie OSINT automatisée : DNS, GitHub, Dorks et HIBP. Sources publiques, laboratoire local, zéro GPU.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr" className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}><body>{children}</body></html>;
}
