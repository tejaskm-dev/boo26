"use client";

import { useEffect } from "react";

/**
 * Stops the page's ambient motion when nobody is watching it.
 *
 * Browsers already throttle hidden tabs, but a page left open in the
 * foreground and untouched keeps paying for every infinite animation on it —
 * the drift, the grain, and a looping tween on every sprite near the viewport.
 * None of that is doing any work for a visitor who has walked away, and on a
 * laptop it is the difference between a warm fan and a quiet one.
 *
 * Only the declarative, compositor-level animations are paused. GSAP's ticker
 * is deliberately left alone: Lenis is driven by it, so sleeping the ticker
 * stops the page scrolling until some other input happens to wake it, which is
 * a far worse bug than a warm fan.
 */
const IDLE_AFTER = 45_000;

export default function IdleGuard() {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;

    const sleep = () => {
      root.dataset.idle = "true";
    };

    const wake = () => {
      if (root.dataset.idle === "true") delete root.dataset.idle;
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(sleep, IDLE_AFTER);
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(timer);
        sleep();
      } else {
        wake();
      }
    };

    const events = ["pointermove", "pointerdown", "wheel", "keydown", "touchstart", "scroll"] as const;
    for (const e of events) window.addEventListener(e, wake, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    wake();

    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, wake);
      document.removeEventListener("visibilitychange", onVisibility);
      delete root.dataset.idle;
    };
  }, []);

  return null;
}
