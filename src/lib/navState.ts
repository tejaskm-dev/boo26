"use client";

type NavListener = (active: boolean) => void;
const listeners = new Set<NavListener>();
let navActive = false;

/**
 * Sets whether the fullscreen nav is active (opening, open, or closing).
 * When active, background hero animations (liquid flow, pointer parallax,
 * gyro tilt, eye blinking, layout measurements) are completely frozen
 * so the GPU/CPU can dedicate 100% of frame budget to the nav wipe animation.
 */
export function setNavActive(active: boolean) {
  if (navActive === active) return;
  navActive = active;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.navActive = active ? "true" : "false";
  }
  for (const fn of listeners) fn(active);
}

/**
 * Instant nanosecond check whether the nav is currently active.
 */
export function isNavActive(): boolean {
  return navActive;
}

/**
 * Subscribe to nav active/inactive transitions.
 */
export function subscribeNavActive(fn: NavListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
