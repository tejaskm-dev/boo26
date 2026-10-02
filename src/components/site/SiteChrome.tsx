"use client";

import { useState } from "react";
import Header from "./Header";
import FullscreenNav from "./FullscreenNav";
import { EVENT, NAV } from "@/lib/site";

/** The full site's header and menu. The teaser has its own (src/components/soon/SoonChrome.tsx). */
export default function SiteChrome() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Header onOpenMenu={() => setOpen(true)} menuOpen={open} cta={{ label: "Register", href: EVENT.registerHref }} />
      <FullscreenNav
        open={open}
        onClose={() => setOpen(false)}
        items={NAV}
        facts={[EVENT.date, EVENT.venue]}
        cta={{ label: "Register now", href: EVENT.registerHref }}
      />
    </>
  );
}
