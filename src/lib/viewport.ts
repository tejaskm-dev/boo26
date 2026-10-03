"use client";

import { isTouch } from "@/lib/tier";

/**
 * A phone's toolbars slide in and out as you scroll, and every time they do
 * the window says it's been resized: innerHeight changes by a toolbar's
 * height, and nothing else does — vh and svh are fixed, so the page's layout
 * doesn't move. Taken as a resize, that was a re-measure, a canvas made
 * again (and blank for a frame), a dropped frame — mid-scroll, over and
 * over. So only what's really a new size counts: a new width (the phone
 * turned round, a window dragged), or a change in height bigger than any
 * toolbar's (a quarter of the screen) — the line ScrollTrigger draws for
 * itself. Off a touch screen, every resize is real.
 */
export function onResize(fn: () => void): () => void {
  let w = window.innerWidth;
  let h = window.innerHeight;
  const touch = isTouch();
  const check = () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    if (touch && nw === w && Math.abs(nh - h) < nh * 0.25) return;
    w = nw;
    h = nh;
    large = 0;
    fn();
  };
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}

let large = 0;

/**
 * The screen's height with the toolbars away (100vh — the largest the
 * window gets): what anything covering the screen is sized to, so it still
 * covers it however far the toolbars are out, and needn't change when they
 * move. Off a phone it's simply the window's height.
 */
export function screenHeight(): number {
  if (large) return large;
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;top:0;left:0;width:0;height:100vh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  large = probe.offsetHeight || window.innerHeight;
  probe.remove();
  return large;
}
