"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * One reveal pass for the page. Anything inside [data-intro] plays on load as
 * the hero's entrance; everything else waits for its own scroll position.
 *
 * Elements inside a [data-stagger] group are left alone — that group animates
 * its own children in sequence, and two systems tweening one element is how
 * they end up fighting over opacity and landing on invisible.
 */
export default function Reveal() {
  useEffect(() => {
    const all = gsap.utils.toArray<HTMLElement>("[data-anim]");
    if (prefersReducedMotion()) {
      gsap.set(all, { opacity: 1, y: 0, clearProps: "transform,willChange" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const mine = all.filter((el) => !el.closest("[data-stagger]"));

    const ctx = gsap.context(() => {
      const intro = mine.filter((el) => el.closest("[data-intro]"));
      const rest = mine.filter((el) => !el.closest("[data-intro]"));

      gsap.to(intro, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.085,
        ease: "power3.out",
        delay: 0.12,
        clearProps: "willChange",
      });

      ScrollTrigger.batch(rest, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.95,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "willChange",
          }),
      });

      // triggers are measured before the art and web fonts land
      ScrollTrigger.refresh();
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });

    /**
     * Last line of defence. The page is long and full of late-loading art, so
     * a trigger can end up measured against a layout that no longer exists and
     * leave its element stranded at opacity 0. This looks for anything hidden
     * that is already well inside the viewport — but only just after the
     * scroll settles, never on a timer, because walking the page for computed
     * styles forces a layout and doing that four times a second is its own
     * kind of slow.
     */
    let idle = 0;
    const sweep = () => {
      const stranded: HTMLElement[] = [];
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.top > window.innerHeight * 0.9 || r.bottom < 0) continue;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.5 || cs.visibility === "hidden") stranded.push(el);
      }
      if (stranded.length) {
        gsap.to(stranded, { autoAlpha: 1, opacity: 1, y: 0, yPercent: 0, duration: 0.5, ease: "power3.out" });
      }
    };
    const settle = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(sweep, 400);
    };

    window.addEventListener("scroll", settle, { passive: true });
    window.addEventListener("resize", settle);
    settle();

    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("scroll", settle);
      window.removeEventListener("resize", settle);
      ctx.revert();
    };
  }, []);

  return null;
}
