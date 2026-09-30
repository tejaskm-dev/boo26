"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";
import type { SpriteName } from "@/lib/sprites";

/**
 * A note somebody taped up. It's taped on as you arrive — dropped, settled,
 * the tape slapped on after — and it sways in whatever draft there is. Tap it
 * and it turns over; the backs have been written on too.
 */
export default function PinnedNote({
  front,
  back,
  tape,
  i,
}: {
  front: string;
  back: string;
  tape: SpriteName;
  i: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLSpanElement>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;
    const stop = whenOpen(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        tl.from(el, {
          y: -46,
          rotation: i % 2 ? 9 : -9,
          autoAlpha: 0,
          duration: 0.8,
          delay: i * 0.12,
          ease: "back.out(1.7)",
          clearProps: "transform,opacity,visibility",
        }).from(
          strip.current,
          { scale: 1.6, autoAlpha: 0, duration: 0.35, ease: "back.out(3)", clearProps: "transform,opacity,visibility" },
          "-=0.25",
        );
      }, el);
    });
    return () => {
      stop();
      ctx?.revert();
    };
  }, [i]);

  return (
    <div ref={root} className="relative">
      <span ref={strip} className="absolute -top-4 left-1/2 z-10 block w-[5.2rem] -translate-x-1/2" style={{ rotate: `${i % 2 ? 5 : -6}deg` }}>
        <Sprite name={tape} scale={0.26} className="w-full" />
      </span>

      <div className="soon-sway soon-loop" style={{ animationDelay: `${-i * 1.3}s` }}>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? back : front}
          data-flipped={flipped ? "true" : undefined}
          className="soon-note block w-full cursor-pointer text-left outline-none focus-visible:[&_.soon-note-face]:ring-2 focus-visible:[&_.soon-note-face]:ring-lime"
        >
          <span className="soon-note-inner">
            <span className="soon-note-face hand flex min-h-[7.5rem] items-center px-5 py-6 text-[clamp(1.12rem,1.5vw,1.3rem)] leading-[1.2] text-ink/85">
              {front}
            </span>
            <span className="soon-note-face soon-note-back hand flex min-h-[7.5rem] items-center px-5 py-6 text-[clamp(1.05rem,1.4vw,1.2rem)] leading-[1.2] text-ink/60">
              {back}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
