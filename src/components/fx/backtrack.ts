"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The teaser's switcharoos (soon/backtrack.ts), without its sound.
 *
 * Runs `fn` once: the first time you scroll back up to `el` after having gone
 * all the way past it — while it's still a little way out of sight above
 * the screen, so whatever changes has already changed by the time it comes
 * back into view. It stays changed; nothing flips back and forth.
 */
export function onBacktrack(el: Element, fn: () => void, end = "bottom -35%"): () => void {
  gsap.registerPlugin(ScrollTrigger);
  let passed = false;
  let done = false;
  const st = ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    // how far past it you have to have gone; the same line, coming back, is the switch
    end,
    onLeave: () => {
      passed = true;
    },
    onEnterBack: () => {
      if (!passed || done) return;
      done = true;
      fn();
    },
  });
  return () => st.kill();
}

/** `onBacktrack` for a component: `fn` can change between renders without resetting it */
export function useBacktrack(ref: React.RefObject<Element | null>, fn: () => void, end?: string) {
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onBacktrack(el, () => latest.current(), end);
  }, [ref, end]);
}
