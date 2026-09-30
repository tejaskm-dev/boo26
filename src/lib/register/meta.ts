import type { Metadata } from "next";
import { EVENT } from "@/lib/site";
import { siteLive } from "@/lib/live";
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
 * A register page's metadata — or, while registration is switched off, the
 * coming-soon page's, because that's what every one of them shows.
 */
export function registerMeta(meta: Metadata): Metadata {
  if (!siteLive()) return TEASER;
  return registrationOpen() ? meta : SOON;
}
