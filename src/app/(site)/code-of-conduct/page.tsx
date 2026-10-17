import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/components/legal/LegalPage";
import { CONDUCT } from "@/components/legal/conduct";
import { EVENT } from "@/lib/site";
import { siteLive } from "@/lib/live";
import { pageMeta } from "@/lib/seo";

// Written about the night (the haunted house, the hunt, the games), so it
// waits for the full site; the teaser redirects this address home.
export const metadata: Metadata = !siteLive() ? {} : pageMeta({
  title: `Code of Conduct — ${EVENT.name} ${EVENT.year}`,
  description: `How everyone at ${EVENT.name} ${EVENT.year} looks after each other: make people react, never make them unsafe.`,
  path: "/code-of-conduct",
});

export default function CodeOfConductPage() {
  if (!siteLive()) notFound();
  return <LegalPage doc={CONDUCT} />;
}
