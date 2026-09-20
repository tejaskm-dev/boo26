"use client";

import type Lenis from "lenis";

/**
 * The live smooth-scroll instance. The custom scrollbar has to drive Lenis
 * directly when it is dragged — writing scrollTop behind Lenis's back just
 * gets snapped away on its next frame.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}

/** Jump the page, through Lenis when it is running and natively when it is not. */
export function scrollPageTo(top: number, immediate = false) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, immediate ? { immediate: true } : { duration: 0.7 });
  else window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}
