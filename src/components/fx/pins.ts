"use client";

import type { ScrollTrigger } from "gsap/ScrollTrigger";

/** what a pinned scene says about itself as it's scrolled through (CornerEyes.tsx listens) */
export type PinDetail = { id: string; active: boolean; progress: number; direction: number };

export const PIN_EVENT = "fx:pin";

/**
 * A pinned scene reports in: from its own ScrollTrigger's onToggle and
 * onUpdate, so whatever listens reads the pin itself rather than working out
 * a second copy of where it starts and ends.
 */
export function reportPin(id: string, st: ScrollTrigger) {
  window.dispatchEvent(
    new CustomEvent<PinDetail>(PIN_EVENT, {
      detail: { id, active: st.isActive, progress: st.progress, direction: st.direction },
    }),
  );
}
