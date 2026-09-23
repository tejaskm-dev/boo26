import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "../globals.css";

/**
 * The dashboard's own shell — a second root layout, so /admin shares nothing
 * with the site but its colours and its type.
 *
 * None of the site's motion is here on purpose: no smooth scrolling to fight
 * a long list, no preloader in front of a table, no page wipe between two
 * pages of records, and none of that code downloaded to read them. The site,
 * for its part, carries nothing of the dashboard's.
 */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], display: "swap", variable: "--font-archivo" });
const grotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Registrations — BOO! 2026",
  // never indexed, never followed: it isn't linked from the site either
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${grotesk.variable}`}>
      {/* set here rather than with utility classes: globals.css styles `body`
          outside Tailwind's layers, and unlayered rules win over layered ones */}
      <body style={{ background: "var(--color-ink)", color: "var(--color-bone)" }}>{children}</body>
    </html>
  );
}
