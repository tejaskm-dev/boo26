"use client";

import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Holds the page still for a moment a scene needs to be seen — a title card,
 * the count, the cat waking up — so a quick flick can't carry you straight
 * past it.
 *
 * Each moment holds once a visit, only on the way down, and never while
 * another is holding. It can ease the page to the right spot first. It
 * always lets go: after its time, the moment the tab is hidden, and — if
 * anything ever went wrong — a few seconds after that. With motion turned
 * down nothing is ever held.
 *
 * Held means Lenis stopped: wheel and touch are swallowed, and the root is
 * clipped (soon.css) so the keyboard can't move it either.
 */

let current: { key: string; release: () => void } | null = null;
const done = new Set<string>();

export type HoldOptions = {
  /** ease here first: a scroll position, or an element to bring to the top */
  to?: number | HTMLElement;
  offset?: number;
  /** how long the ease takes, in seconds */
  glide?: number;
  /** once it's still */
  onHeld?: () => void;
  /** as it lets go */
  onRelease?: () => void;
};

export function hold(key: string, ms: number, opts: HoldOptions = {}): boolean {
  if (done.has(key) || current || prefersReducedMotion()) return false;
  const lenis = getLenis();
  if (!lenis || lenis.direction < 0) return false;
  done.add(key);
  let released = false;
  const timers: number[] = [];
  const release = () => {
    if (released) return;
    released = true;
    timers.forEach((t) => window.clearTimeout(t));
    document.removeEventListener("visibilitychange", onHide);
    lenis.start();
    current = null;
    window.dispatchEvent(new CustomEvent("soon:hold", { detail: { key, held: false } }));
    opts.onRelease?.();
  };
  const onHide = () => {
    if (document.hidden) release();
  };
  document.addEventListener("visibilitychange", onHide);
  let held = false;
  const still = () => {
    if (released || held) return;
    held = true;
    lenis.stop();
    window.dispatchEvent(new CustomEvent("soon:hold", { detail: { key, held: true } }));
    opts.onHeld?.();
    timers.push(window.setTimeout(release, ms));
  };
  if (opts.to !== undefined) {
    lenis.scrollTo(opts.to, {
      offset: opts.offset ?? 0,
      duration: opts.glide ?? 0.6,
      easing: (x: number) => 1 - Math.pow(1 - x, 3),
      force: true,
      lock: true,
      onComplete: still,
    });
    // if the ease never reports back, hold from where we are
    timers.push(window.setTimeout(still, (opts.glide ?? 0.6) * 1000 + 250));
  } else {
    still();
  }
  timers.push(window.setTimeout(release, ms + (opts.glide ?? 0.6) * 1000 + 6000));
  current = { key, release };
  return true;
}

/** let go early — when the moment has finished before its time */
export function letGo(key?: string) {
  if (current && (!key || current.key === key)) current.release();
}

export const holding = () => current !== null;
