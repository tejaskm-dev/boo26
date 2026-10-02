"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The page gets darker the further down it you go — at the edges only, and
 * slowly enough that you don't notice it happening. One fixed layer and its
 * opacity, set when the scroll moves.
 */
export default function Dread() {
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = veil.current;
    if (!el || prefersReducedMotion()) return;
    let last = -1;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, (getLenis()?.scroll ?? window.scrollY) / max) : 0;
      const o = Math.round(Math.pow(p, 1.4) * 0.34 * 100) / 100;
      if (o === last) return;
      last = o;
      el.style.opacity = String(o);
    };
    const lenis = getLenis();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      if (lenis) lenis.off("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <div ref={veil} className="soon-dread" aria-hidden="true" />;
}
