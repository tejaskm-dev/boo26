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

    // velocity is published as a CSS variable, so anything on the page can
    // lean into the scroll without each piece running its own listener
    const root = document.documentElement;
    let raf = 0;
    const publish = ({ velocity }: { velocity: number }) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const v = Math.max(-1, Math.min(1, velocity / 34));
        root.style.setProperty("--scroll-v", v.toFixed(3));
      });
    };
    lenis.on("scroll", publish);

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--scroll-v");
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
