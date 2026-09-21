"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { subscribeToast, type Toast } from "@/lib/toast";
import { prefersReducedMotion } from "@/lib/motion";

const HOLD = 2600;

/**
 * The site's one toast: an ink blob that rises off the bottom edge, holds for
 * a moment and sinks away. It borrows what the page already uses — the organic
 * radius of the lime marks, the marquee's lime diamond, label type and the
 * lime hairline the fields are edged with — so it reads as part of the page
 * rather than a system notice laid over it.
 *
 * The animated pill is decoration. The words are also written into a visually
 * hidden live region, which is what a screen reader announces.
 */
export default function Toaster() {
  const [current, setCurrent] = useState<Toast | null>(null);
  const pill = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const timer = useRef(0);

  useEffect(() => subscribeToast(setCurrent), []);

  useEffect(() => {
    const el = pill.current;
    if (!current || !el) return;
    const reduced = prefersReducedMotion();

    gsap.killTweensOf(el);
    if (reduced) {
      gsap.set(el, { autoAlpha: 1, yPercent: 0, rotate: 0, scale: 1 });
    } else if (shown.current) {
      // already up: a small nudge, so a second click still visibly answers
      gsap.fromTo(
        el,
        { scale: 0.93 },
        { scale: 1, autoAlpha: 1, yPercent: 0, rotate: 0, duration: 0.45, ease: "back.out(2.2)" },
      );
    } else {
      gsap.fromTo(
        el,
        { autoAlpha: 0, yPercent: 130, rotate: -4, scale: 0.9 },
        { autoAlpha: 1, yPercent: 0, rotate: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
      );
    }
    shown.current = true;

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      shown.current = false;
      if (reduced) gsap.set(el, { autoAlpha: 0 });
      else gsap.to(el, { autoAlpha: 0, yPercent: 110, rotate: 3, duration: 0.4, ease: "power2.in" });
    }, HOLD);
  }, [current]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(clamp(1rem,3.5vh,2rem)+env(safe-area-inset-bottom))] z-[80] flex justify-center px-[var(--edge)]">
        <div
          ref={pill}
          aria-hidden="true"
          style={{ visibility: "hidden", opacity: 0 }}
          className="flex items-center gap-3 bg-ink px-6 py-3.5 text-bone shadow-[0_14px_34px_rgba(8,8,8,0.3)] ring-1 ring-lime/40 [border-radius:46%_54%_58%_42%/42%_60%_40%_58%] md:px-7 md:py-4"
        >
          <span className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
          {current?.label ? (
            <span className="label whitespace-nowrap text-[0.66rem] text-bone/55 md:text-[0.72rem]">{current.label}</span>
          ) : null}
          <span className="label whitespace-nowrap text-[0.66rem] text-lime md:text-[0.72rem]">{current?.message}</span>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {current ? (
          <span key={current.id}>
            {current.label ? `${current.label}: ` : ""}
            {current.message}
          </span>
        ) : null}
      </p>
    </>
  );
}
