"use client";

/**
 * Leaving for another page of the site from code, rather than from a link:
 * once a form has been sent, say. It goes the way a link does — through the
 * page wipe, grown out of `from` — because PageWipe registers its exit here.
 * Without it (reduced motion, or before it has mounted) it's an ordinary page
 * load.
 */
type Leave = (href: string, from: Element) => void;

let exit: Leave | null = null;

export function setLeave(fn: Leave | null) {
  exit = fn;
}

export function leaveTo(href: string, from: Element) {
  if (exit) exit(href, from);
  else window.location.assign(href);
}
