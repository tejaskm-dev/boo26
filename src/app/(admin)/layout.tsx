import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "../globals.css";
import "./admin.css";

/**
 * The dashboard's own shell — a second root layout, so /admin shares nothing
 * with the site but its type and its green.
 *
 * It's on paper rather than in the dark. The site is a black room with a
 * light on, which is right for a night in October and wrong for a table of
 * names somebody reads for an hour on a laptop in a corridor: black on off
 * white is simply easier to read, and it keeps the tool and the show from
 * being mistaken for each other.
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
      {/* the class carries the dashboard's own colours (admin.css); the
          inline background is here because globals.css styles `body` outside
          Tailwind's layers, and unlayered rules win over layered ones */}
      <body className="admin" style={{ background: "#f4f2ec", color: "#16150f" }}>
        {children}
      </body>
    </html>
  );
}
