"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The page-wide scroll behaviour, declared once with data attributes instead
 * of a hook in every section.
 *
 *   data-scrub="up|down|left|right"  travels against the scroll, scrubbed
 *   data-scrub-amount="24"           how far, in percent of its own box
 *   data-stagger                     children arrive one after another
 *
 * Everything is transform-only and scrubbed off the same scroll Lenis is
 * driving, so it tracks the page exactly rather than running on its own clock.
 */
export default function SectionMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Layers that travel at their own rate through a section.
      //
      // Desktop only. A scrubbed layer moves without reserving the space it
      // moves out of, which is invisible in a two-column composition and a
      // collision in a stacked one — on a phone the 20 Hours timeline slid
      // straight up over the note above it.
      const wide = window.matchMedia("(min-width: 1024px)").matches;

      if (wide) gsap.utils.toArray<HTMLElement>("[data-scrub]").forEach((el) => {
        const dir = el.dataset.scrub ?? "up";
        const amt = Number(el.dataset.scrubAmount ?? 14);
        const axis = dir === "left" || dir === "right" ? "xPercent" : "yPercent";
        const sign = dir === "up" || dir === "left" ? -1 : 1;
        gsap.fromTo(
          el,
          { [axis]: -sign * amt * 0.5 },
          {
            [axis]: sign * amt * 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });

      // Rows that should arrive in sequence rather than all at once.
      //
      // fromTo, never from: the children carry [data-anim], which CSS holds at
      // opacity 0 until JS takes over. A `from` tween reads that as the value
      // to land on and animates them to invisible, which is how whole lists of
      // facts and FAQ rows were ending up blank.
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const kids = gsap.utils.toArray<HTMLElement>(":scope > *", group);
        if (!kids.length) return;
        gsap.fromTo(
          kids,
          { yPercent: 22, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.09,
            clearProps: "willChange",
            scrollTrigger: { trigger: group, start: "top 86%", once: true },
          },
        );
      });
    });

    // the page grows as art loads; triggers have to be re-measured
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return null;
}
