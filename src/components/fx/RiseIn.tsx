"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A cat coming up from behind a section boundary.
 *
 * The wave edges are what the page is cut out of, so the cats that sit on them
 * should arrive *through* them — dropping in from above the seam and settling,
 * rather than fading in on the spot like everything else.
 */
export default function RiseIn({
  children,
  from = "top",
  className = "",
  start = "top 88%",
}: {
  children: React.ReactNode;
  from?: "top" | "bottom";
  className?: string;
  start?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(el, {
        yPercent: from === "top" ? -72 : 72,
        rotate: from === "top" ? -7 : 5,
        autoAlpha: 0,
        duration: 1.15,
        ease: "back.out(1.35)",
        scrollTrigger: { trigger: el, start, once: true },
        clearProps: "transform,willChange",
      });
    }, el);
    return () => ctx.revert();
  }, [from, start]);

  return (
    <span ref={root} className={`block ${className}`}>
      {children}
    </span>
  );
}
