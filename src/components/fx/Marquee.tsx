"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A band of running text.
 *
 * It exists to do a job, not to fill a hole: every band carries the facts a
 * visitor actually needs — when, where, how long, how many — so the answer is
 * never more than a screen away, and the wide empty measures between sections
 * stop reading as nothing.
 *
 * The speed is the scroll's. Stop moving and it idles; scroll hard and it
 * runs, and it runs *against* you, which is what makes a strip of type read as
 * something the page is doing rather than a loop playing next to it.
 */
export default function Marquee({
  items,
  className = "",
  reverse = false,
  speed = 34,
}: {
  items: readonly string[];
  className?: string;
  reverse?: boolean;
  /** seconds for one full pass at rest */
  speed?: number;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    const dir = reverse ? 1 : -1;
    const tween = gsap.to(el, {
      xPercent: dir * 50,
      duration: speed,
      ease: "none",
      repeat: -1,
    });

    // the band leans into the scroll: faster with it, briefly backwards
    // against a hard flick, then settles back to its idle drift
    const lenis = getLenis();
    let raf = 0;
    const onScroll = ({ velocity }: { velocity: number }) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const v = Math.max(-2.6, Math.min(2.6, velocity / 26));
        gsap.to(tween, { timeScale: 1 + v * dir * -1, duration: 0.4, overwrite: true });
      });
    };
    lenis?.on("scroll", onScroll);

    return () => {
      lenis?.off("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      tween.kill();
    };
  }, [reverse, speed]);

  // two copies so the loop never shows its seam
  const run = [...items, ...items];

  return (
    <div className={`relative w-full overflow-hidden ${className}`} aria-hidden="true">
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {run.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex shrink-0 items-center">
                <span className="whitespace-nowrap">{item}</span>
                <span
                  aria-hidden="true"
                  className="mx-[clamp(1rem,2.6vw,2.75rem)] inline-block h-[0.34em] w-[0.34em] shrink-0 rotate-45 bg-lime"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
