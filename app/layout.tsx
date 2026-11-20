import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P1 / OSINT ATLAS — Cartographie d'une organisation open-source",
  description:
    "P1 — Cartographie OSINT automatisée : DNS, GitHub, Dorks et HIBP. Sources publiques, laboratoire local, zéro GPU.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
