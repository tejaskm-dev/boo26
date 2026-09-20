"use client";

import { useEffect } from "react";
import { enableTilt, recalibrateTilt } from "@/lib/pointer";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Turns the device's tilt into the page's motion source on touch devices.
 *
 * iOS only hands out orientation from inside a user gesture, so the request is
 * made on the first touch rather than on load — the visitor is already doing
 * something, and nothing has to be asked of them in a dialog they did not
 * expect. Android grants it silently and this is a no-op there beyond the
 * listener. Rotating the device re-levels, so landscape does not arrive with
 * the whole composition shoved to one side.
 */
export default function Tilt() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    // a pointer that can hover is a mouse, and the mouse is already the source
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const start = () => {
      void enableTilt();
      window.removeEventListener("touchstart", start);
      window.removeEventListener("pointerdown", start);
    };
    window.addEventListener("touchstart", start, { passive: true, once: true });
    window.addEventListener("pointerdown", start, { passive: true, once: true });

    const onOrient = () => recalibrateTilt();
    window.addEventListener("orientationchange", onOrient);

    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("orientationchange", onOrient);
    };
  }, []);

  return null;
}
