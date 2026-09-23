import type { Metadata } from "next";
import { EVENT } from "@/lib/site";
import { registrationOpen } from "./mode";

const SOON: Metadata = {
  title: `Registration coming soon — ${EVENT.name} ${EVENT.year}`,
  description: `Registration for ${EVENT.name} ${EVENT.year} isn't open yet. ${EVENT.dateLong}, ASIET Kalady.`,
};

/**
 * A register page's metadata — or, while registration is switched off, the
 * coming-soon page's, because that's what every one of them shows.
 */
export function registerMeta(meta: Metadata): Metadata {
  return registrationOpen() ? meta : SOON;
}
