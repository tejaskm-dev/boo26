"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { setLenis } from "@/lib/lenis";

/**
 * Lenis drives the scroll and GSAP's ticker drives Lenis, so ScrollTrigger and
 * the smoothing never disagree about the current position. Skipped entirely
 * when the visitor asked for reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.7,
    });

    // Velocity is published as a CSS variable so anything on the page can lean
    // into the scroll without each piece running its own listener — but it is
    // set on the leaning elements themselves, not on :root. A custom property
    // written to the root every frame invalidates style for the whole document,
    // which is over a thousand elements recalculated to move four headings.
    const leaners = Array.from(document.querySelectorAll<HTMLElement>(".lean"));
    let raf = 0;
    const publish = ({ velocity }: { velocity: number }) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const v = (Math.max(-1, Math.min(1, velocity / 34))).toFixed(3);
        for (const el of leaners) el.style.setProperty("--scroll-v", v);
      });
    };
    lenis.on("scroll", publish);

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      if (raf) cancelAnimationFrame(raf);
      for (const el of leaners) el.style.removeProperty("--scroll-v");
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
