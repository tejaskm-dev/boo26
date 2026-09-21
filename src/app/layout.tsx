import type { Metadata, Viewport } from "next";
import { Archivo, Bagel_Fat_One, Caveat, Space_Grotesk } from "next/font/google";
import Grain from "@/components/fx/Grain";
import Drift from "@/components/fx/Drift";
import IdleGuard from "@/components/fx/IdleGuard";
import Tilt from "@/components/fx/Tilt";
import SmoothScroll from "@/components/fx/SmoothScroll";
import FieldTone from "@/components/site/FieldTone";
import Reveal from "@/components/fx/Reveal";
import Scrollbar from "@/components/fx/Scrollbar";
import SectionMotion from "@/components/fx/SectionMotion";
import Toaster from "@/components/ui/Toaster";
import PageWipe from "@/components/fx/PageWipe";
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
  description: `A Halloween-night creative technology hackathon at ASIET, Kalady. One challenge: build something that makes someone react. ${EVENT.dateLong}.`,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: `${EVENT.name} ${EVENT.year}`,
    description: `Most hackathons start with a problem. ${EVENT.name} starts with a reaction. ${EVENT.dateLong}, ASIET Kalady.`,
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
        {/* Before first paint, and only when motion is welcome: hide the
            animated elements, and cover the page for PageWipe to open —
            `arrive` if the last page just wiped over to this one (a fresh
            flag only), `reload` if this visit has seen the preloader, else
            `load` for the full count. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement,m='load';d.dataset.js='true';try{var t=+sessionStorage.getItem('boo:wipe');if(t&&Date.now()-t<10000)m='arrive';else if(sessionStorage.getItem('boo:seen'))m='reload'}catch(e){}d.dataset.wipe=m}",
          }}
        />
        <SmoothScroll />
        <Tilt />
        <Drift />
        <IdleGuard />
        <Reveal />
        <SectionMotion />
        <FieldTone />
        {children}
        <Toaster />
        <PageWipe />
        <Scrollbar />
        <Grain />
      </body>
    </html>
  );
}
