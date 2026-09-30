"use client";

import { useState } from "react";
import Header from "@/components/site/Header";
import FullscreenNav from "@/components/site/FullscreenNav";
import { BRAND } from "@/lib/brand";
import { SOON } from "@/lib/soon";

/** The teaser's header and menu: the full site's, with the teaser's own index and no date. */
export default function SoonChrome() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Header onOpenMenu={() => setOpen(true)} menuOpen={open} cta={SOON.hero.cta} />
      <FullscreenNav
        open={open}
        onClose={() => setOpen(false)}
        items={SOON.nav}
        looks={SOON.navLook}
        facts={[BRAND.venue]}
        cta={SOON.hero.cta}
      />
    </>
  );
}
