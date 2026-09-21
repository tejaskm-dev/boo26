"use client";

import { useEffect } from "react";
import { isNavActive } from "@/lib/navState";

/**
 * Flips the header's ink to whatever is actually painted behind it.
 *
 * Asking which *section* the header is over is the wrong question. A section
 * is not one colour — the join forms carry the neighbouring field down into
 * it and the 20 Hours cove holds half the screen — so "this section is ink"
 * puts black on black wherever a cream form happens to be under the wordmark.
 *
 * So the question asked here is the literal one: at this point on the screen,
 * is the thing underneath ink or bone? The section supplies the base tone, and
 * then every field form in it is tested with `isPointInFill` — real geometry,
 * the same path the browser is painting. The topmost form whose filled area
 * contains the point wins.
 *
 * Both ends of the header are sampled independently, because the composition
 * regularly puts a different field under each one.
 */
type Form = {
  path: SVGPathElement;
  svg: SVGSVGElement;
  tone: "ink" | "bone";
  pageTop: number;
  pageBottom: number;
  pageLeft: number;
  pageRight: number;
  width: number;
  height: number;
  vbWidth: number;
  vbHeight: number;
};
type Band = {
  top: number;
  bottom: number;
  field: "ink" | "bone";
  fieldRight?: "ink" | "bone";
  forms: Form[];
};

export default function FieldTone() {
  useEffect(() => {
    const root = document.documentElement;
    let bands: Band[] = [];
    let queued = false;
    let cachedHeaderH = 40;
    let cachedEdge = 24;

    const measure = () => {
      if (isNavActive()) return;
      const scrollY = window.scrollY;
      const header = document.querySelector("header");
      cachedHeaderH = (header?.offsetHeight ?? 72) * 0.55;
      cachedEdge = Math.max(24, window.innerWidth * 0.06);

      bands = Array.from(document.querySelectorAll<HTMLElement>("[data-field]")).map((el) => {
        const top = el.getBoundingClientRect().top + scrollY;
        const forms: Form[] = Array.from(
          el.querySelectorAll<SVGPathElement>(":scope > span svg > path:first-of-type"),
        ).map((path) => {
          const svg = path.ownerSVGElement as SVGSVGElement;
          const box = svg.getBoundingClientRect();
          const vb = svg.viewBox.baseVal;
          return {
            path,
            svg,
            tone: (path.getAttribute("fill") ?? "").includes("ink") ? "ink" : "bone",
            pageTop: box.top + scrollY,
            pageBottom: box.bottom + scrollY,
            pageLeft: box.left,
            pageRight: box.right,
            width: box.width,
            height: box.height,
            vbWidth: vb?.width || 1000,
            vbHeight: vb?.height || 300,
          };
        });
        return {
          top,
          bottom: top + el.offsetHeight,
          field: (el.dataset.field as "ink" | "bone") ?? "bone",
          fieldRight: (el.dataset.fieldRight as "ink" | "bone") || undefined,
          forms,
        };
      });
      apply();
    };

    /** what is painted at this viewport point */
    const toneAt = (x: number, y: number, isRight = false): "ink" | "bone" => {
      const line = window.scrollY + y;
      const band = bands.find((b) => line >= b.top && line < b.bottom);
      if (!band) return "bone";

      let tone = isRight && band.fieldRight ? band.fieldRight : band.field;
      if (band.forms.length === 0) return tone;

      for (const form of band.forms) {
        if (form.width < 2 || form.height < 2) continue;
        if (line < form.pageTop || line > form.pageBottom || x < form.pageLeft || x > form.pageRight) continue;
        // preserveAspectRatio is "none" on every form, so the mapping is a
        // straight scale on each axis
        const vx = ((x - form.pageLeft) / form.width) * form.vbWidth;
        const vy = ((line - form.pageTop) / form.height) * form.vbHeight;
        try {
          if (form.path.isPointInFill(new DOMPoint(vx, vy))) tone = form.tone;
        } catch {
          /* isPointInFill needs a rendered path; skip if it is not */
        }
      }
      return tone;
    };

    const apply = () => {
      queued = false;
      const h = cachedHeaderH;
      const edge = cachedEdge;

      const left = toneAt(edge, h, false);
      const right = toneAt(window.innerWidth - edge, h, true);
      if (root.dataset.tone !== left) root.dataset.tone = left;
      if (root.dataset.toneRight !== right) root.dataset.toneRight = right;
    };

    const onScroll = () => {
      if (queued || isNavActive()) return;
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
