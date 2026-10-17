import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { privacy } from "@/components/legal/privacy";
import { EVENT } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { siteLive } from "@/lib/live";

export const metadata: Metadata = pageMeta({
  title: `Privacy Policy — ${EVENT.name} ${EVENT.year}`,
  description: `What the ${EVENT.name} ${EVENT.year} website and event do with information about you. No cookies, no analytics, no trackers.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPage doc={privacy(siteLive())} />;
}
