"use client";

import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { isNavActive, subscribeNavActive } from "@/lib/navState";

/**
 * Holds the page still for a moment a scene needs to be seen — a title card,
 * the count, the cat waking up — so a quick flick can't carry you straight
 * past it.
 *
 * Each moment holds once a visit, only on the way it's set for — down, or
 * (`way: "up"`) back up, where the scenes have changed — and never while
 * another is holding. Never on a jump, either: a link to the top or a
 * section moves the page screens at once, and that's somewhere to go, not
 * a scroll through. It can ease the page to the right spot first. It
 * always lets go: after its time, the moment the tab is hidden, and — if
 * anything ever went wrong — a few seconds after that. With motion turned
 * down nothing is ever held.
 *
 * Every hold says so on window as "soon:hold" — `{ key, held: true, ms,
 * way }` once it's still, `{ key, held: false, way }` as it lets go — which
 * is how the eyes in the corner (Waiting.tsx) know how long you're waiting,
 * and which way you were going.
 *
 * Nor while the visitor's flicking back and forth: within a moment of them
 * turning round, nothing catches them (it can on the next pass).
 *
 * And the menu always wins. Opening it, or jumping the page anywhere (a
 * link, the scrollbar's rail), lets go of any hold there and then — without
 * starting the scroll again under the open menu, which does that itself as
 * it shuts — and says so on window as "soon:away", so whatever was playing
 * out on its own clock (and whatever was being said) can stop, and leave
 * itself finished rather than half done. Nothing's held while it's open.
 *
 * Held means Lenis stopped (wheel and touch swallowed) and the scrolling
 * keys ignored. Whatever was already moving the page — a fling's momentum on
 * a phone — is stopped dead first, for two frames, so the ease to the right
 * spot never has to fight it. A wheel, a trackpad or the keys move the page
 * on Lenis's own glide instead, which a hold can simply take over: the page
 * carries on as it was going and comes to rest, rather than stopping dead
 * and lurching on into place.
 */

/** the keys that scroll a page */
const KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);
const twoFrames = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));

let current: { key: string; release: () => void } | null = null;
const done = new Set<string>();

// how far the page moved at its last step. A jump — a link, a script, the
// scrollbar's rail — moves screens at once; a scroll, however hard, is a
// fraction of one a frame. Measured here rather than asked of Lenis, which
// can skip a native scroll event and report no movement at all.
let stepFrom = 0;
let stepTo = 0;
let stepAt = 0;
let stepMs = 16;
// and when the visitor last changed direction (their scrolling, not a hold's
// own easing): flicking back and forth isn't someone to catch
let lastWay = 0;
let turnedAt = -Infinity;
if (typeof window !== "undefined") {
  stepFrom = stepTo = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      stepFrom = stepTo;
      stepTo = window.scrollY;
      const now = performance.now();
      stepMs = Math.min(50, Math.max(4, now - stepAt));
      stepAt = now;
      const way = Math.sign(stepTo - stepFrom);
      if (way && !current) {
        if (lastWay && way !== lastWay) turnedAt = performance.now();
        lastWay = way;
      }
    },
    { passive: true },
  );
}
// (the page may have moved since this last heard of it: whatever asks for a
// hold can be answering the same scroll event, ahead of this listener)
const jumped = () => Math.max(Math.abs(stepTo - stepFrom), Math.abs(window.scrollY - stepTo)) > window.innerHeight * 1.6;
/** how fast the page was going at its last step, in px a second (still, if that was a while ago) */
const speed = () => (performance.now() - stepAt < 100 ? (Math.abs(stepTo - stepFrom) / stepMs) * 1000 : 0);

/** the visitor's taken the page somewhere else: let go, and say so */
function away() {
  current?.release();
  window.dispatchEvent(new Event("soon:away"));
}
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => Math.abs(stepTo - stepFrom) > window.innerHeight * 1.6 && away(), { passive: true });
  subscribeNavActive((active) => active && away());
}

// fingers on the glass. A drag already under way when a hold starts can't be
// cancelled, and some phones go on scrolling under it until it lifts — so
// anything that moves the page itself waits for the finger to come off,
// rather than fighting it.
let fingers = 0;
// and whether the page was last moved by one, or by a wheel, a trackpad or
// the keys (Lenis's glide, not the phone's own momentum)
let touched = false;
if (typeof window !== "undefined") {
  const count = (e: TouchEvent) => (fingers = e.touches.length);
  window.addEventListener("touchstart", (e) => ((touched = true), count(e)), { passive: true });
  window.addEventListener("touchend", count, { passive: true });
  window.addEventListener("touchcancel", count, { passive: true });
  window.addEventListener("wheel", () => (touched = false), { passive: true });
  window.addEventListener("keydown", () => (touched = false), { passive: true });
}

export type HoldOptions = {
  /** ease here first: a scroll position, or an element to bring to the top */
  to?: number | HTMLElement;
  offset?: number;
  /**
   * Or, instead of a spot: the stretch of page it's fine to be held anywhere
   * in. Only if the page comes to rest outside it is it eased back — and
   * only as far as the nearer end.
   */
  range?: [number, number];
  /** how long the ease takes, in seconds */
  glide?: number;
  /** once it's still */
  onHeld?: () => void;
  /** as it lets go */
  onRelease?: () => void;
  /** the way you have to be going for it to catch you: down, unless it says */
  way?: "down" | "up";
};

export function hold(key: string, ms: number, opts: HoldOptions = {}): boolean {
  if (done.has(key) || current || prefersReducedMotion() || isNavActive()) return false;
  // just turned round: they're scrubbing back and forth, not arriving
  if (performance.now() - turnedAt < 450) return false;
  const lenis = getLenis();
  const way = opts.way ?? "down";
  if (!lenis || (way === "down" ? lenis.direction < 0 : lenis.direction >= 0)) return false;
  if (jumped()) return false;
  done.add(key);
  // claim the slot before anything else: stopping the scroll fires a scroll
  // event right away, and whatever's listening mustn't start a second hold
  const slot = { key, release: () => {} };
  current = slot;
  let released = false;
  const timers: number[] = [];
  const root = document.documentElement;
  // where a wheel's glide was taking the page, and how fast it was going
  // (stopping forgets both)
  const headed = lenis.targetScroll;
  const going = speed();
  const wheel = !touched;
  // stop whatever's moving the page, momentum and all
  lenis.stop();
  root.classList.add("soon-halt");
  // where it caught you: stopping just synced Lenis with the page (a phone's
  // own scrolling can leave it behind), so this is the real position
  const at = lenis.scroll;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const slack = Math.min(window.innerHeight * 0.18, 160);
  if (wheel && opts.to === undefined) {
    // The page carries on the way it was going, as fast, and comes to rest
    // where the glide was taking it — but no further than the stretch it's
    // held in (or a little past where it caught you), and at least into it.
    // An ease out starts at three times its average speed, so the length of
    // the ease is what makes it pick up at the page's own speed.
    const [lo, hi] = opts.range ?? [at - slack, at + slack];
    const rest = Math.min(hi, Math.max(lo, headed));
    const d = rest - at;
    if (Math.abs(d) > 2) {
      const on = going > 0 && Math.sign(d) === Math.sign(stepTo - stepFrom);
      const duration = on ? Math.min(1.1, Math.max(0.3, (3 * Math.abs(d)) / going)) : 0.45;
      lenis.scrollTo(rest, { duration, easing: ease, force: true, lock: true });
    }
  }
  let lifted = () => {};
  /** once the finger's off the glass (straight away, if it isn't on it) */
  const afterLift = (fn: () => void) => {
    if (!fingers) return fn();
    const up = () => {
      if (fingers) return;
      lifted();
      fn();
    };
    lifted = () => {
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
    };
    window.addEventListener("touchend", up, { passive: true });
    window.addEventListener("touchcancel", up, { passive: true });
  };
  twoFrames(() => {
    root.classList.remove("soon-halt");
    // On a phone the fling runs on the compositor, which only learns the
    // page has stopped once this frame is drawn — and the frame a scene
    // starts in is a busy one (a slam, a sound, a heading), so a fast
    // fling can carry on a few hundred pixels before it does. Where it came
    // to rest is fine if the moment's still well on screen: a little past
    // where it caught you (or anywhere in the stretch it was given). Only
    // further than that is it eased back, and only as far as it has to be —
    // easing it all the way back every time was the lock looking jittery.
    if (released || opts.to !== undefined || wheel) return;
    afterLift(() => {
      if (released) return;
      const y = window.scrollY;
      const [lo, hi] = opts.range ?? [at - slack, at + slack];
      const rest = Math.min(hi, Math.max(lo, y));
      if (Math.abs(rest - y) > 4) lenis.scrollTo(rest, { duration: 0.35, easing: ease, force: true, lock: true });
    });
  });
  const onKey = (e: KeyboardEvent) => {
    if (KEYS.has(e.key) && !(e.target as Element)?.closest?.("input,textarea,select,[contenteditable]")) e.preventDefault();
  };
  window.addEventListener("keydown", onKey);
  const release = () => {
    if (released) return;
    released = true;
    lifted();
    timers.forEach((t) => window.clearTimeout(t));
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("keydown", onKey);
    root.classList.remove("soon-halt");
    // (the menu's open: it starts the scroll again itself, as it shuts)
    if (!isNavActive()) lenis.start();
    if (current === slot) current = null;
    window.dispatchEvent(new CustomEvent("soon:hold", { detail: { key, held: false, way } }));
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
    window.dispatchEvent(new CustomEvent("soon:hold", { detail: { key, held: true, ms, way } }));
    opts.onHeld?.();
    timers.push(window.setTimeout(release, ms));
  };
  if (opts.to !== undefined) {
    const to = opts.to;
    const glide = () => {
      if (released) return;
      lenis.scrollTo(to, { offset: opts.offset ?? 0, duration: opts.glide ?? 0.6, easing: ease, force: true, lock: true, onComplete: still });
      // if the ease never reports back, hold from where we are
      timers.push(window.setTimeout(still, (opts.glide ?? 0.6) * 1000 + 400));
    };
    // once the halt has taken (and the finger's off), ease to the spot — on
    // a wheel there's no momentum to wait out, so straight away
    if (wheel) glide();
    else twoFrames(() => afterLift(glide));
  } else {
    still();
  }
  timers.push(window.setTimeout(release, ms + (opts.glide ?? 0.6) * 1000 + 6000));
  slot.release = release;
  return true;
}

/**
 * Whether it's actually on screen. A moment the page went straight past (a
 * link, the menu) still fires, but it isn't for there: it plays out quietly.
 */
export function inView(el: Element | null | undefined) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

/** let go early — when the moment has finished before its time */
export function letGo(key?: string) {
  if (current && (!key || current.key === key)) current.release();
}

export const holding = () => current !== null;
