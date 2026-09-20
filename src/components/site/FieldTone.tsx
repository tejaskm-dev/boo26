"use client";

import { useEffect } from "react";

/**
 * Reads which colour field currently sits under the header and flips the
 * header's ink accordingly. Sections opt in with data-field="ink" | "bone".
 */
export default function FieldTone() {
  useEffect(() => {
    const root = document.documentElement;
    let bands: { top: number; bottom: number; field: string; right: string }[] = [];
    let queued = false;

    const measure = () => {
      bands = Array.from(document.querySelectorAll<HTMLElement>("[data-field]")).map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const field = el.dataset.field ?? "bone";
        return {
          top,
          bottom: top + el.offsetHeight,
          field,
          // a composition can put a different field under each end of the header
          right: el.dataset.fieldRight ?? field,
        };
      });
      apply();
    };

    const apply = () => {
      queued = false;
      const header = document.querySelector("header");
      const line = window.scrollY + (header?.offsetHeight ?? 72) * 0.55;
      const band = bands.find((b) => line >= b.top && line < b.bottom);
      const next = band?.field ?? "bone";
      const nextRight = band?.right ?? "bone";
      if (root.dataset.tone !== next) root.dataset.tone = next;
      if (root.dataset.toneRight !== nextRight) root.dataset.toneRight = nextRight;
      // the scrim behind the header only earns its place once something has
      // actually scrolled under it
      const scrolled = window.scrollY > (header?.offsetHeight ?? 72) * 0.9 ? "true" : "false";
      if (root.dataset.scrolled !== scrolled) root.dataset.scrolled = scrolled;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
