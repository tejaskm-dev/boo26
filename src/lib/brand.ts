/**
 * The facts that never date anything: who, where, and how to reach us.
 *
 * Anything a browser downloads imports from here rather than site.ts. The
 * coming-soon teaser shares the header, the menu, the footer and the loading
 * screen with the full site, and a component that imported site.ts for its
 * name would ship the whole of it — dates, schedule and all — inside the
 * teaser's JavaScript, where anyone who opens the console can read it. The
 * full site's words reach those components as props from the server instead.
 */
export const BRAND = {
  name: "BOO!",
  year: "2026",
  venue: "ASIET, KALADY",
  venueLong: "Adi Shankara Institute of Engineering and Technology, Kalady, Kerala",
  /* The µ is U+00B5, the micro sign: it is in the Latin subset the fonts load
     and the Greek mu is not. Anywhere the type is uppercased it has to go
     through <Micro>, or it renders as a plain M. */
  host: "µLearn ASIET",
  /* Where the site lives. Every canonical address, share card, sitemap entry
     and structured-data URL is built on this (src/lib/seo.ts); www. and the
     vercel.app address both redirect here. */
  url: "https://boo26.live",
  /* Every register CTA lands here. Until registration opens, /register and
     everything under it is the coming-soon page (src/lib/register/mode.ts). */
  registerHref: "/register",
  /* A temporary address until BOO! has its own. Change it here and the
     legal pages follow. */
  email: "boo26team@gmail.com",
} as const;

/**
 * BOO!'s own channels. None are live yet, so none has an href: without one,
 * each shows the coming-soon toast instead of linking anywhere. Add the URL
 * here when a channel goes live.
 */
export const SOCIALS: { label: string; icon: string; href?: string }[] = [
  { label: "Discord", icon: "discord" },
  { label: "Instagram", icon: "instagram" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "YouTube", icon: "youtube" },
];
