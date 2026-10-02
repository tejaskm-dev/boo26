"use client";

import { toast } from "@/lib/toast";

/**
 * The teaser's jokes go through here, so they stay jokes.
 *
 * `troll` is for the ones nobody asked for — noticing you left, noticing you
 * went quiet. Each fires at most once a page load, and never on top of another:
 * if a toast went out a few seconds ago, this one simply doesn't happen.
 *
 * `answer` is for the ones the visitor asked for by tapping something. Those
 * always answer, and hold the unasked-for ones back for a moment after.
 */
const said = new Set<string>();
let quietUntil = 0;

export function troll(key: string, message: string, label?: string): boolean {
  const now = Date.now();
  if (said.has(key) || now < quietUntil) return false;
  said.add(key);
  quietUntil = now + 6500;
  toast(message, label);
  return true;
}

export function answer(message: string, label?: string) {
  quietUntil = Math.max(quietUntil, Date.now() + 3500);
  toast(message, label);
}

/** Once per page load, for things that aren't toasts. */
export function once(key: string): boolean {
  if (said.has(key)) return false;
  said.add(key);
  return true;
}

/**
 * One short buzz, on phones that let a website do that (Android; iPhones
 * don't), and only once the visitor has touched the page — a buzz out of
 * nowhere is how a site gets its tab closed.
 */
export function buzz(ms = 40) {
  try {
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (nav.userActivation && !nav.userActivation.hasBeenActive) return;
    nav.vibrate?.(ms);
  } catch {
    /* not supported */
  }
}

/** A quick shiver on an element, on the compositor, without touching its classes. */
export function shiver(el: Element | null, amount = 6) {
  if (!el || typeof (el as HTMLElement).animate !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  (el as HTMLElement).animate(
    [
      { translate: "0 0" },
      { translate: `${-amount}px 0` },
      { translate: `${amount * 0.8}px 0` },
      { translate: `${-amount * 0.5}px 0` },
      { translate: `${amount * 0.3}px 0` },
      { translate: "0 0" },
    ],
    { duration: 320, easing: "ease-out" },
  );
}
