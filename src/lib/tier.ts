"use client";

import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * How much this device can be asked to do every frame.
 *
 * "Rich" devices get the extras that cost something on every frame — a
 * canvas of bats redrawn sixty times a second, ink that reshapes itself.
 * Everyone else gets the same page holding still where those would move.
 *
 * It starts from what the device says about itself (cores, memory, data
 * saver; a phone has to be a good one) and then keeps an eye on the frames
 * themselves: if they start running long — a quarter of them missing the
 * frame for a couple of seconds running — it steps down, for the rest of the
 * visit, and says so to whoever asked. It never steps back up: a page that
 * keeps changing its mind is worse than one that's a little plainer.
 */

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

let poor: boolean | null = null;
const listeners = new Set<(rich: boolean) => void>();

function guess(): boolean {
  if (prefersReducedMotion()) return false;
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return false;
  // memory is only reported by Chromium browsers; cores by everyone
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency || 4;
  if (memory !== undefined && memory < 4) return false;
  const phone = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (phone) return cores >= 6 && (memory === undefined || memory >= 6);
  return cores >= 4;
}

/** a frame this long has missed a 60Hz deadline */
const LONG = 24;
/** frames per verdict: about two seconds' worth */
const WINDOW = 120;

let watching = false;
function watch() {
  if (watching || poor) return;
  watching = true;
  let frames = 0;
  let long = 0;
  let strikes = 0;
  const root = document.documentElement;
  const tick = (_t: number, dms: number) => {
    // only frames someone could see, and not while the page is still arriving
    if (document.hidden || root.dataset.wipe || root.dataset.wiping) return;
    frames += 1;
    if (dms > LONG && dms < 250) long += 1;
    if (frames < WINDOW) return;
    strikes = long / frames > 0.25 ? strikes + 1 : 0;
    frames = 0;
    long = 0;
    if (strikes >= 2) {
      poor = true;
      gsap.ticker.remove(tick);
      watching = false;
      listeners.forEach((fn) => fn(false));
    }
  };
  gsap.ticker.add(tick);
}

/** can this device take the extras? (watches the frames from the first time it's asked) */
export function rich(): boolean {
  if (typeof window === "undefined") return false;
  if (poor === null) poor = !guess();
  if (!poor) watch();
  return !poor;
}

/** told once, if this device steps down */
export function onTierDrop(fn: () => void): () => void {
  const f = (r: boolean) => !r && fn();
  listeners.add(f);
  return () => listeners.delete(f);
}

/** a phone or tablet, by how it's held: no hover, a finger for a pointer */
export function isTouch(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}
