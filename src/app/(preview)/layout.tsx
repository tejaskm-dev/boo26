import type { Metadata, Viewport } from "next";
import SiteShell from "@/components/site/SiteShell";
import PreviewBar from "@/components/admin/PreviewBar";
import { adminOnly } from "@/lib/admin/preview";
import { siteLive } from "@/lib/live";
import { registerUrl } from "@/lib/register/external";
import { PRELOADER } from "@/lib/site";

/**
 * The dashboard's preview of the full site, for the core team to see before
 * LIVE_STATUS turns it on for everyone (/admin/preview).
 *
 * A root layout of its own, on the site's own shell (SiteShell) with the
 * full site's loading screen, so what's previewed is the real thing, the
 * motion and all, rather than an impression of it. It's rendered on request
 * for a signed-in admin only, and never indexed: nothing about it is built
 * into a page anyone else can load.
 */
export const metadata: Metadata = {
  title: "Preview — BOO! 2026",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "light",
};

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await adminOnly();
  return (
    <SiteShell preloader={PRELOADER}>
      {children}
      <PreviewBar live={siteLive()} register={registerUrl()} />
    </SiteShell>
  );
}
