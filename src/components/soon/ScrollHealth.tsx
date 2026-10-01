"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenis";
import { whenOpen } from "@/lib/motion";

/**
 * Keeps every scroll-driven thing on the teaser measuring the page it's
 * actually on.
 *
 * Positions are worked out once, when the page lays out — but the page goes
 * on changing after that: the fonts arrive and every line re-wraps, a
 * heading swaps its words, a section grows. Each of those quietly moves
 * where things should start, and the effects begin firing early or late.
 * So when the fonts are in, when the loading screen opens, and whenever the
 * page's height changes, everything re-measures — once, a moment later, so
 * a burst of changes costs one pass, and only once the scroll has settled.
 */
export default function ScrollHealth() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // never while you're mid-scroll: re-measuring is a whole pass over the
    // page, and that's a dropped frame if it lands while you're moving
    let soon = 0;
    let moving = 0;
    let pending = false;
    const run = () => {
      if (!pending) return;
      if (performance.now() - moving < 350) {
        soon = window.setTimeout(run, 200);
        return;
      }
      pending = false;
      getLenis()?.resize();
      ScrollTrigger.refresh();
    };
    const refresh = () => {
      pending = true;
      window.clearTimeout(soon);
      soon = window.setTimeout(run, 200);
    };
    const onScroll = () => {
      moving = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    void document.fonts?.ready.then(refresh);
    const stop = whenOpen(refresh);
    let height = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - height) < 2) return;
      height = h;
      refresh();
    });
    ro.observe(document.body);
    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(soon);
    };
  }, []);
  return null;
}
