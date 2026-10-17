import type { Metadata, Viewport } from "next";
import SiteShell from "@/components/site/SiteShell";
import { PRELOADER, SEO } from "@/lib/site";
import { SOON } from "@/lib/soon";
import { siteLive } from "@/lib/live";
import { KEYWORDS, NAME, SHARE, SITE, indexable } from "@/lib/seo";

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
 * The site's root layout: its words for search and share cards, and the
 * shell every page sits in (src/components/site/SiteShell.tsx). /admin has a
 * root layout of its own (src/app/(admin)/layout.tsx), and so does the
 * dashboard's preview of the full site (src/app/(preview)/layout.tsx).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell preloader={siteLive() ? PRELOADER : SOON.preloader}>{children}</SiteShell>;
}
