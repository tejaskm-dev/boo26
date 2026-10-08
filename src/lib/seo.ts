import type { Metadata } from "next";
import { BRAND } from "./brand";

/**
 * What search engines and share cards are told, on either side of
 * LIVE_STATUS. Only date-free facts live here (brand.ts): the teaser's pages
 * use it as much as the full site's, so nothing in it may say when, or what
 * the night is. The full site adds its own words from site.ts, in its own
 * pages.
 */

/** where the site lives: every canonical address, card and sitemap entry is built on it */
export const SITE = new URL(BRAND.url);

/** the name, as a search result and a share card show it */
export const NAME = `${BRAND.name} ${BRAND.year}`;

/** what else people type to find it — the address is boo26.live */
export const ALSO = ["BOO26", "BOO 2026", "BOO! 26"];

/** the same everywhere: who, and where */
export const KEYWORDS = [
  NAME,
  ...ALSO,
  "ASIET",
  "ASIET Kalady",
  BRAND.host,
  "µLearn",
  "Adi Shankara Institute of Engineering and Technology",
  "Kalady",
  "Kerala",
];

/** a page's full address */
export const absolute = (path = "/") => new URL(path, SITE).toString();

/**
 * The share card's picture: the lockup in the dark, the venue, the address —
 * and no date, so both sides can use it (public/og.jpg). Named on every page
 * rather than left to a file convention, which a page setting its own card
 * would drop. Give it a new name if it ever changes: the apps that show
 * cards keep the old picture for an address for a long time.
 */
export const SHARE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "BOO! 2026: glossy white dripping letters with a black cat peeking over them, glowing eyes in the dark. ASIET, Kalady.",
};

/** the same picture, by its full address, for structured data */
export const SHARE_IMAGE = absolute(SHARE.url);

/** the badge, big enough to stand for the organisation (src/app/icon3.png, 192px) */
const LOGO = absolute("/icon3.png");

/**
 * Whether search engines should have this deploy: the production one, yes;
 * a Vercel preview, no — it's a copy of the site at another address, and
 * shouldn't compete with the real one. Off Vercel (`next start` on a laptop)
 * it behaves like production.
 */
export function indexable(): boolean {
  const env = process.env.VERCEL_ENV;
  return env ? env === "production" : true;
}

/**
 * A page's own metadata: its title and description, its one canonical
 * address, and the share card that goes with it.
 */
export function pageMeta({
  title,
  description,
  share = description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  /** what the share card says, if not the description */
  share?: string;
  path: string;
  keywords?: string[];
}): Metadata {
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: NAME,
      locale: "en_IN",
      url: path,
      title,
      description: share,
      images: [SHARE],
    },
    twitter: { card: "summary_large_image", title, description: share, images: [SHARE] },
  };
}

/** structured data as a script's contents, with every "<" escaped so nothing in it can close the tag */
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** the organisation behind it: the BOO! core team, under the µLearn ASIET banner */
export const ORG_ID = absolute("/#org");

/**
 * The site and who's behind it — dateless, so the teaser carries it too.
 * The site's name and its other names are what search shows above a result.
 */
export function siteGraph(description: string) {
  return [
    {
      "@type": "WebSite",
      "@id": absolute("/#website"),
      name: NAME,
      alternateName: [...ALSO, BRAND.name],
      url: absolute("/"),
      description,
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: NAME,
      alternateName: ALSO,
      url: absolute("/"),
      logo: LOGO,
      image: SHARE_IMAGE,
      email: BRAND.email,
      parentOrganization: { "@type": "Organization", name: BRAND.host },
    },
  ];
}

/** where it happens, as structured data */
export const PLACE = {
  "@type": "Place",
  name: "Adi Shankara Institute of Engineering and Technology (ASIET)",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kalady",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
};
