"use client";

import { useState } from "react";
import Header from "./Header";
import FullscreenNav from "./FullscreenNav";
import { EVENT, NAV, type NavItem } from "@/lib/site";

/**
 * The full site's header and menu. The teaser has its own
 * (src/components/soon/SoonChrome.tsx). The menu's items come from the page
 * when it leaves a section out (TEAM_SECTION=0, src/lib/team.ts).
 */
export default function SiteChrome({ items = NAV }: { items?: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Header onOpenMenu={() => setOpen(true)} menuOpen={open} cta={{ label: "Register", href: EVENT.registerHref }} />
      <FullscreenNav
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        facts={[EVENT.date, EVENT.venue]}
        cta={{ label: "Register now", href: EVENT.registerHref }}
      />
    </>
  );
}
