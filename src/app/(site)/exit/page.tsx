import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NoExit from "@/components/site/NoExit";
import { siteLive } from "@/lib/live";

// (while the teaser is up this is only ever built as a 404, which says nothing of its own)
export const metadata: Metadata = !siteLive() && process.env.NODE_ENV === "production"
  ? {}
  : { title: "no exit.", robots: { index: false, follow: false } };

/**
 * The full site's hidden page (src/components/site/NoExit.tsx). It comes
 * with the full site: while the teaser is up there's nothing here, and the
 * teaser keeps its own (/shh). Always here in `next dev`.
 */
export default function ExitPage() {
  if (!siteLive() && process.env.NODE_ENV === "production") notFound();
  return <NoExit />;
}
