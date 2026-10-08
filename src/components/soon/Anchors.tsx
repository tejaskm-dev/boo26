"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * The teaser's own links to its parts — the menu, the footer, the wordmark —
 * take the page there and leave the address alone.
 *
 * Followed the browser's way, each wrote its section into the address
 * ("/#dark"), and a reload opened down there, in the middle of the show
 * (top.ts). It's still the jump the browser would make — screens at once,
 * so nothing on the way catches it (hold.ts) — made through the smooth
 * scroll, which would otherwise carry on with a glide it was in the middle
 * of and take the page straight back. A link something else has already
 * taken ("Come closer" glides there, Eggs.tsx) is left to it.
 */
export default function Anchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self")) return;
      let to: HTMLElement | null = null;
      try {
        to = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      } catch {
        // a malformed hash names nothing
      }
      if (!to) return;
      e.preventDefault();
      const lenis = getLenis();
      // (forced: the menu holds the scroll still while it's open)
      if (lenis) lenis.scrollTo(to, { immediate: true, force: true });
      else to.scrollIntoView();
    };
    // on window, so it hears a click last: whatever takes a link of its own goes first
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
  return null;
}
