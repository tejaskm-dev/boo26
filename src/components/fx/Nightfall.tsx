"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The night, as you scroll it: the page gets darker at the edges the further
 * down you go, slowly enough that you don't notice it happening — and lifts
 * again at the end, from the last call to the footer, with a little light
 * coming up from the bottom of the screen. Make it to morning, made visible.
 *
 * The teaser's Dread with a dawn. Two fixed layers and their opacity, set
 * when the scroll moves and only when it changes; where the night ends is
 * measured when the page lays out, never per frame.
 */
export default function Nightfall({ dawn = "#register" }: { /** where the dark starts to lift */ dawn?: string }) {
  const veil = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const night = veil.current;
    const first = light.current;
    if (!night || !first || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    let lift = Infinity;
    let end = Infinity;
    const measure = () => {
      const at = document.querySelector<HTMLElement>(dawn);
      const vh = window.innerHeight;
      const y0 = getLenis()?.scroll ?? window.scrollY;
      lift = at ? at.getBoundingClientRect().top + y0 - vh * 0.6 : Infinity;
      end = document.documentElement.scrollHeight - vh;
    };

    let lastDark = -1;
    let lastLight = -1;
    const onScroll = () => {
      const y = getLenis()?.scroll ?? window.scrollY;
      const vh = window.innerHeight;
      // falling: from nothing at the top to its darkest just before the end
      const fall = Math.min(1, Math.max(0, y / Math.max(1, lift)));
      // and lifting: over the screen and a half after that
      const rise = Math.min(1, Math.max(0, (y - lift) / (vh * 1.5)));
      const dark = Math.round(Math.pow(fall, 1.5) * 0.32 * (1 - rise) * 100) / 100;
      // first light, as the bottom of the page comes up
      const dawnLight = Math.round(Math.min(1, Math.max(0, (y - lift) / Math.max(1, end - lift))) * 100) / 100;
      if (dark !== lastDark) {
        lastDark = dark;
        night.style.opacity = String(dark);
      }
      if (dawnLight !== lastLight) {
        lastLight = dawnLight;
        first.style.opacity = String(dawnLight);
      }
    };

    measure();
    onScroll();
    const lenis = getLenis();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });
    const remeasure = () => {
      measure();
      onScroll();
    };
    ScrollTrigger.addEventListener("refresh", remeasure);
    window.addEventListener("resize", remeasure);
    return () => {
      if (lenis) lenis.off("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
      ScrollTrigger.removeEventListener("refresh", remeasure);
      window.removeEventListener("resize", remeasure);
    };
  }, [dawn]);

  return (
    <>
      <div ref={veil} className="fx-night" aria-hidden="true" />
      <div ref={light} className="fx-dawn" aria-hidden="true" />
    </>
  );
}
