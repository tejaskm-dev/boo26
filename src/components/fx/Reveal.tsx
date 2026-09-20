"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * One reveal pass for the page. Anything inside [data-intro] plays on load as
 * the hero's entrance; everything else waits for its own scroll position.
 *
 * A sweep runs alongside the ScrollTriggers because the page is long and full
 * of late-loading art — if a jump or a font swap moves a trigger past its own
 * start, the sweep makes sure nothing is left stranded at opacity 0.
 */
export default function Reveal() {
  useEffect(() => {
    const all = gsap.utils.toArray<HTMLElement>("[data-anim]");
    if (prefersReducedMotion()) {
      gsap.set(all, { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const intro = all.filter((el) => el.closest("[data-intro]"));
      const rest = all.filter((el) => !el.closest("[data-intro]"));

      gsap.to(intro, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.085,
        ease: "power3.out",
        delay: 0.12,
      });

      ScrollTrigger.batch(rest, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.95, stagger: 0.07, ease: "power3.out" }),
      });

      // triggers are measured before the art and web fonts land
      ScrollTrigger.refresh();
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });

    const sweep = () => {
      for (const el of all) {
        if (parseFloat(getComputedStyle(el).opacity) > 0.5) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
        }
      }
    };
    const timer = window.setInterval(sweep, 500);

    return () => {
      window.clearInterval(timer);
      ctx.revert();
    };
  }, []);

  return null;
}
