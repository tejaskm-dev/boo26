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
    });

    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const leaners = isTouch ? [] : Array.from(document.querySelectorAll<HTMLElement>(".lean"));
    let raf = 0;
    const publish = ({ velocity }: { velocity: number }) => {
      if (raf || isTouch) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const v = (Math.max(-1, Math.min(1, velocity / 34))).toFixed(3);
        for (const el of leaners) el.style.setProperty("--scroll-v", v);
      });
    };
    if (!isTouch) {
      lenis.on("scroll", publish);
    }

    // Lenis marks every change of state — scrolling, gliding, stopped — as
    // a class on <html>, at the start and the end of every swipe and every
    // hold. Any change to <html>'s classes restyles the whole document:
    // ~2,000 elements, measured at 25–50ms on a phone, landing just as a
    // swipe begins. Nothing here styles by those classes (the teaser's holds
    // lock the page from <body>, src/components/soon/hold.ts), so it keeps
    // the one it starts with, and stops there.
    const quiet = lenis as unknown as { updateClassName?: () => void };
    if (typeof quiet.updateClassName === "function") quiet.updateClassName = () => {};

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    // At the front of the ticker, ahead of GSAP's own render. Behind it, every
    // frame's scroll landed on styles the tweens had just written, and moving
    // the page forced a full style and layout flush to do it. In front, the
    // scroll lands on the layout the last frame drew, and the scrubbed tweens
    // then render against this frame's position rather than the one before.
    gsap.ticker.add(tick, false, true);

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
