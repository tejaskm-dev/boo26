import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/components/legal/LegalPage";
import { TERMS } from "@/components/legal/terms";
import { EVENT } from "@/lib/site";
import { siteLive } from "@/lib/live";
import { pageMeta } from "@/lib/seo";

// The terms describe the night itself (its date, what happens in it), so
// they wait for the full site; the teaser redirects this address home.
export const metadata: Metadata = !siteLive() ? {} : pageMeta({
  title: `Terms of Service — ${EVENT.name} ${EVENT.year}`,
  description: `The terms for taking part in ${EVENT.name} ${EVENT.year}, a Halloween-night hackathon at ASIET, Kalady, on ${EVENT.dateLong}.`,
  path: "/terms",
});

export default function TermsPage() {
  if (!siteLive()) notFound();
  return <LegalPage doc={TERMS} />;
}
