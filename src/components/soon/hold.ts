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
 * Every hold says so on window as "soon:hold" — `{ key, held: true, ms }`
 * once it's still, `{ key, held: false }` as it lets go — which is how the
 * eyes in the corner (Waiting.tsx) know how long you're waiting.
 *
 * Held means Lenis stopped (wheel and touch swallowed) and the scrolling
 * keys ignored. Whatever was already moving the page — a fling's momentum on
 * a phone — is stopped dead first, for two frames, so the ease to the right
 * spot never has to fight it.
 */

/** the keys that scroll a page */
const KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);
const twoFrames = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));

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
  // claim the slot before anything else: stopping the scroll fires a scroll
  // event right away, and whatever's listening mustn't start a second hold
  const slot = { key, release: () => {} };
  current = slot;
  let released = false;
  const timers: number[] = [];
  const root = document.documentElement;
  // stop whatever's moving the page, momentum and all
  lenis.stop();
  root.classList.add("soon-halt");
  // where it caught you: stopping just synced Lenis with the page (a phone's
  // own scrolling can leave it behind), so this is the real position
  const at = lenis.scroll;
  twoFrames(() => {
    root.classList.remove("soon-halt");
    // On a phone the fling runs on the compositor, which only learns the
    // page has stopped once this frame is drawn — and the frame a scene
    // starts in is a busy one (a slam, a sound, a heading), so a fast
    // fling can carry on a few hundred pixels before it does. Bring the
    // page back to where it was caught, or the moment is held off screen.
    if (released || opts.to !== undefined) return;
    if (Math.abs(window.scrollY - at) > 24) {
      lenis.scrollTo(at, { duration: 0.35, easing: (x: number) => 1 - Math.pow(1 - x, 3), force: true, lock: true });
    }
  });
  const onKey = (e: KeyboardEvent) => {
    if (KEYS.has(e.key) && !(e.target as Element)?.closest?.("input,textarea,select,[contenteditable]")) e.preventDefault();
  };
  window.addEventListener("keydown", onKey);
  const release = () => {
    if (released) return;
    released = true;
    timers.forEach((t) => window.clearTimeout(t));
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("keydown", onKey);
    root.classList.remove("soon-halt");
    lenis.start();
    if (current === slot) current = null;
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
    window.dispatchEvent(new CustomEvent("soon:hold", { detail: { key, held: true, ms } }));
    opts.onHeld?.();
    timers.push(window.setTimeout(release, ms));
  };
  if (opts.to !== undefined) {
    const to = opts.to;
    // once the halt has taken, ease to the spot
    twoFrames(() => {
      if (released) return;
      lenis.scrollTo(to, {
        offset: opts.offset ?? 0,
        duration: opts.glide ?? 0.6,
        easing: (x: number) => 1 - Math.pow(1 - x, 3),
        force: true,
        lock: true,
        onComplete: still,
      });
    });
    // if the ease never reports back, hold from where we are
    timers.push(window.setTimeout(still, (opts.glide ?? 0.6) * 1000 + 400));
  } else {
    still();
  }
  timers.push(window.setTimeout(release, ms + (opts.glide ?? 0.6) * 1000 + 6000));
  slot.release = release;
  return true;
}

/** let go early — when the moment has finished before its time */
export function letGo(key?: string) {
  if (current && (!key || current.key === key)) current.release();
}

export const holding = () => current !== null;
