"use client";

import { useCallback, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function useGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine) and (min-width: 768px)";

/**
 * Tailwind's md and lg, for scripts that have to agree with the CSS about which
 * layout is on screen. In rem, as Tailwind writes them: a rem in a media query
 * follows the browser's default font size, so a visitor who has changed it
 * gets the breakpoints moved — and a script checking 1024px would then be
 * animating a layout the CSS isn't showing.
 */
export const MD = "(min-width: 48rem)";
export const LG = "(min-width: 64rem)";

/** Dispatched on window by PageWipe as the cover starts to open. */
export const OPEN_EVENT = "boo:open";

/**
 * Runs `fn` once the page is uncovered — straight away if it isn't covered.
 * Entrances wait on this so they play where they can be seen, not under the
 * preloader. Capped, so a cover that never opens can't hold the page's
 * content back.
 */
export function whenOpen(fn: () => void): () => void {
  if (typeof document === "undefined" || !document.documentElement.dataset.wipe) {
    fn();
    return () => {};
  }
  let done = false;
  let cap = 0;
  const run = () => {
    if (done) return;
    done = true;
    window.removeEventListener(OPEN_EVENT, run);
    window.clearTimeout(cap);
    fn();
  };
  window.addEventListener(OPEN_EVENT, run);
  cap = window.setTimeout(run, 8000);
  return () => {
    done = true;
    window.removeEventListener(OPEN_EVENT, run);
    window.clearTimeout(cap);
  };
}

/** Subscribes to a media query. Renders false on the server, then settles. */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor has asked for less movement. */
export function useReducedMotion() {
  return useMediaQuery(REDUCED);
}

/** True on a real mouse at desktop width, where the pointer effects run. */
export function useFinePointer() {
  return useMediaQuery(FINE);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
}
