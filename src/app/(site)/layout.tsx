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
import { PRELOADER, SEO } from "@/lib/site";
import { SOON } from "@/lib/soon";
import { siteLive } from "@/lib/live";
import { KEYWORDS, NAME, SHARE, SITE, indexable } from "@/lib/seo";
import { WIPE_BOOT } from "@/lib/wipe";
import "lenis/dist/lenis.css";
import "../globals.css";

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

/**
 * What every page carries unless it says otherwise, the 404s included: the
 * site's address (so a page can name itself by its path), whether search
 * engines should have this deploy at all (src/lib/seo.ts), and the large
 * share card. The icons are files Next finds by name (src/app/icon*.png,
 * apple-icon.png) — every page gets them.
 */
const verify = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const BASE: Metadata = {
  metadataBase: SITE,
  applicationName: NAME,
  robots: indexable()
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
      }
    : { index: false, follow: false },
  ...(verify ? { verification: { google: verify } } : {}),
};

/** a card's words, the same way on both sides */
const card = (title: string, description: string): Metadata => ({
  openGraph: { type: "website", siteName: NAME, locale: "en_IN", title, description, images: [SHARE] },
  twitter: { card: "summary_large_image", title, description, images: [SHARE] },
});

/** while the teaser is up there's no date in any of it, and no "Halloween" either */
const TEASER: Metadata = {
  ...BASE,
  title: SOON.meta.title,
  description: SOON.meta.description,
  keywords: KEYWORDS,
  ...card(SOON.meta.title, SOON.meta.description),
};

export const metadata: Metadata = !siteLive() ? TEASER : {
  ...BASE,
  title: SEO.title,
  description: SEO.description,
  keywords: [...KEYWORDS, ...SEO.keywords],
  ...card(SEO.title, SEO.share),
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "light",
};

/**
 * The site's own shell. /admin has a second root layout of its own
 * (src/app/(admin)/layout.tsx) with none of this: a dashboard has no business
 * loading smooth scrolling, the preloader or the page wipe, and the site has
 * no business loading anything the dashboard needs.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${bagel.variable} ${caveat.variable} ${spaceGrotesk.variable}`}>
      <body>
        {/* Before first paint, and only when motion is welcome: hide the
            animated elements, cover the page for PageWipe to open, and start
            the preloader's count (src/lib/wipe.ts). */}
        <script dangerouslySetInnerHTML={{ __html: WIPE_BOOT }} />
        <SmoothScroll />
        <Tilt />
        <Drift />
        <IdleGuard />
        <Reveal />
        <SectionMotion />
        <FieldTone />
        {/* Ahead of the page in the markup, so on a slow connection the first
            thing drawn is the cover rather than a glimpse of what it hides.
            After SmoothScroll, whose Lenis it holds still while covered. */}
        <PageWipe {...(siteLive() ? PRELOADER : SOON.preloader)} />
        {children}
        <Toaster />
        <Scrollbar />
        <Grain />
      </body>
    </html>
  );
}
