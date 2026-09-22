"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";

/**
 * The register pages' own scroll behaviour, declared with data attributes the
 * way the rest of the site declares its own (src/components/fx/SectionMotion.tsx):
 *
 *   data-count="40"    a number counts up to itself when it comes into view
 *   data-pop           lands with a little scale and spin: sprites, marks
 *   data-grow          grows from its left edge: bars, rules, the split
 *   data-write         a handwritten note writes itself left to right
 *   data-draw          an SVG line draws itself as the section is scrolled
 *   data-track         marks the child [data-track-item] being read, and
 *                      writes its number into [data-track-of]
 *
 * Everything is already in its finished state in the markup, so with reduced
 * motion — or before this runs — the pages read exactly as they should; this
 * only takes things away to bring them back. Nothing starts until the page is
 * uncovered, so none of it is spent under the preloader.
 */
export default function RegisterMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

    let ctx: gsap.Context | undefined;
    const watchers: IntersectionObserver[] = [];
    const stop = whenOpen(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const to = Number(el.dataset.count);
          if (!Number.isFinite(to)) return;
          const n = { v: 0 };
          el.textContent = "0";
          gsap.to(n, {
            v: to,
            duration: 1.2,
            ease: "power2.out",
            snap: { v: 1 },
            onUpdate: () => (el.textContent = String(n.v)),
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-pop]").forEach((el) => {
          gsap.from(el, {
            scale: 0.35,
            rotate: gsap.utils.random(-18, 18),
            autoAlpha: 0,
            duration: 0.85,
            ease: "back.out(2)",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-grow]").forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: "power3.out",
            delay: Number(el.dataset.grow) || 0,
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          });
        });

        // the hand, writing: the note is uncovered from its left edge
        gsap.utils.toArray<HTMLElement>("[data-write]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(-15% 100% -15% -3%)" },
            {
              clipPath: "inset(-15% -3% -15% -3%)",
              duration: 1.1,
              ease: "power2.inOut",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            },
          );
        });

        gsap.utils.toArray<SVGElement>("[data-draw]").forEach((el) => {
          gsap.from(el, {
            drawSVG: "0%",
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-draw-along]") ?? el,
              start: "top 78%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          });
        });

        // which one is being read, for a list long enough to lose your place in
        gsap.utils.toArray<HTMLElement>("[data-track]").forEach((list) => {
          const items = gsap.utils.toArray<HTMLElement>("[data-track-item]", list);
          const count = document.querySelector<HTMLElement>(`[data-track-of="${list.dataset.track}"]`);
          if (!items.length) return;
          const inBand = new Set<number>();
          let at = -1;
          const io = new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                const i = items.indexOf(e.target as HTMLElement);
                if (i < 0) continue;
                if (e.isIntersecting) inBand.add(i);
                else inBand.delete(i);
              }
              const next = inBand.size ? Math.min(...inBand) : -1;
              if (next === at) return;
              if (at >= 0) items[at].removeAttribute("data-current");
              if (next >= 0) items[next].setAttribute("data-current", "true");
              at = next;
              if (!count || next < 0) return;
              // the number rolls over to the one you're on
              gsap.timeline()
                .to(count, { yPercent: -45, autoAlpha: 0, duration: 0.16, ease: "power2.in" })
                .add(() => (count.textContent = String(next + 1).padStart(2, "0")))
                .fromTo(count, { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.28, ease: "power3.out" });
            },
            { rootMargin: "-30% 0px -45% 0px" },
          );
          items.forEach((i) => io.observe(i));
          watchers.push(io);
        });
      });
    });

    return () => {
      stop();
      for (const io of watchers) io.disconnect();
      ctx?.revert();
    };
  }, []);

  return null;
}
