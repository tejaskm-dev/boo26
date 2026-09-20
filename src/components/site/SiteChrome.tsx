"use client";

import { useState } from "react";
import Header from "./Header";
import FullscreenNav from "./FullscreenNav";

export default function SiteChrome() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Header onOpenMenu={() => setOpen(true)} menuOpen={open} />
      <FullscreenNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
