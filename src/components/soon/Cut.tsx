"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { cue } from "./sound";

/**
 * A cut between acts: the picture fades to black as you scroll into the next
 * section, a title card comes up in the dark, and the next scene fades in
 * behind it. Dropped at the very top of the section it leads into.
 *
 * It's tied to the scroll, not a clock — stop halfway and it waits with you,
 * the title still up, so it never reads as the page having ended. One fixed
 * layer and its opacity: nothing underneath repaints. With motion turned
 * down there's no cut, just the section.
 */
export default function Cut({ title }: { title: string }) {
  const mark = useRef<HTMLSpanElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    let rang = false;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: mark.current,
            start: "top 92%",
            end: "top -40%",
            scrub: 0.5,
            onUpdate: (self) => {
              // the hush as it goes dark, once each way through
              const dark = self.progress > 0.3 && self.progress < 0.7;
              if (dark && !rang) {
                rang = true;
                cue("whoosh");
              } else if (!dark) rang = false;
            },
          },
        })
        .fromTo(veil.current, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.in", duration: 0.4 })
        .fromTo(card.current, { autoAlpha: 0, scale: 1.18, filter: "blur(8px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 0.28 }, 0.24)
        .to({}, { duration: 0.12 })
        .to(card.current, { autoAlpha: 0, scale: 0.94, ease: "power1.in", duration: 0.16 })
        .to(veil.current, { autoAlpha: 0, ease: "power1.out", duration: 0.36 }, "-=0.06");
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <span ref={mark} aria-hidden="true" className="block h-0" />
      <div ref={veil} className="soon-cut" aria-hidden="true">
        <p ref={card} className="soon-cut-card label">
          {title}
        </p>
      </div>
    </>
  );
}
