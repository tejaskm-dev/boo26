import type { Metadata, Viewport } from "next";
import { Archivo, Bagel_Fat_One, Caveat, Space_Grotesk } from "next/font/google";
import Grain from "@/components/fx/Grain";
import SmoothScroll from "@/components/fx/SmoothScroll";
import FieldTone from "@/components/site/FieldTone";
import Reveal from "@/components/fx/Reveal";
import Scrollbar from "@/components/fx/Scrollbar";
import SectionMotion from "@/components/fx/SectionMotion";
import { EVENT } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

/**
 * The board calls for Death Graffiti and Satoshi, which are commercial. These
 * are the closest free stand-ins: Bagel Fat One for the fat brush headings,
 * Caveat for the handwritten annotations. Archivo stays the editorial voice.
 */
const bagel = Bagel_Fat_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bagel",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: `${EVENT.name} ${EVENT.year} — ${EVENT.date}, ${EVENT.venue}`,
  description: `${EVENT.format}. ${EVENT.dateLong} at ASIET, Kalady.`,
  openGraph: {
    title: `${EVENT.name} ${EVENT.year}`,
    description: `${EVENT.format} — ${EVENT.dateLong}, ASIET Kalady.`,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${bagel.variable} ${caveat.variable} ${spaceGrotesk.variable}`}>
      <body>
        {/* hide animated elements before first paint, but only when motion is welcome */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.js='true'",
          }}
        />
        <SmoothScroll />
        <Reveal />
        <SectionMotion />
        <FieldTone />
        {children}
        <Scrollbar />
        <Grain />
      </body>
    </html>
  );
}
