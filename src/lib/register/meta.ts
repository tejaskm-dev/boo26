import type { Metadata } from "next";
import { EVENT } from "@/lib/site";
import { siteLive } from "@/lib/live";
import { pageMeta } from "@/lib/seo";
import { registrationOpen } from "./mode";

const SOON: Metadata = {
  title: `Registration coming soon — ${EVENT.name} ${EVENT.year}`,
  description: `Registration for ${EVENT.name} ${EVENT.year} isn't open yet. ${EVENT.dateLong}, ASIET Kalady.`,
};

/** the same page while the teaser is up: no date, and not "coming soon" either */
const TEASER: Metadata = {
  title: `Not yet — ${EVENT.name} ${EVENT.year}`,
  description: `Registration for ${EVENT.name} ${EVENT.year} isn't open. ASIET, Kalady.`,
};

/**
 * Closed, it's the same page at every /register address: not one for search
 * results (the home page is), though its links still count.
 */
const CLOSED: Metadata["robots"] = { index: false, follow: true };

/**
 * A register page's metadata, with its own address for search engines
 * (`path`) — or, while registration is switched off, the coming-soon page's,
 * because that's what every one of them shows.
 */
export function registerMeta(meta: Metadata, path?: string): Metadata {
  if (!siteLive()) return { ...TEASER, robots: CLOSED };
  if (!registrationOpen()) return { ...SOON, robots: CLOSED };
  if (!path) return meta;
  return { ...pageMeta({ title: String(meta.title), description: String(meta.description ?? ""), path }), ...meta };
}
