"use client";

import { useEffect } from "react";

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
type Form = { path: SVGPathElement; svg: SVGSVGElement; tone: "ink" | "bone" };
type Band = { top: number; bottom: number; field: "ink" | "bone"; forms: Form[] };

export default function FieldTone() {
  useEffect(() => {
    const root = document.documentElement;
    let bands: Band[] = [];
    let queued = false;

    const measure = () => {
      bands = Array.from(document.querySelectorAll<HTMLElement>("[data-field]")).map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const forms: Form[] = Array.from(
          el.querySelectorAll<SVGPathElement>(":scope > span svg > path:first-of-type"),
        ).map((path) => ({
          path,
          svg: path.ownerSVGElement as SVGSVGElement,
          tone: (path.getAttribute("fill") ?? "").includes("ink") ? "ink" : "bone",
        }));
        return {
          top,
          bottom: top + el.offsetHeight,
          field: (el.dataset.field as "ink" | "bone") ?? "bone",
          forms,
        };
      });
      apply();
    };

    /** what is painted at this viewport point */
    const toneAt = (x: number, y: number): "ink" | "bone" => {
      const line = window.scrollY + y;
      const band = bands.find((b) => line >= b.top && line < b.bottom);
      if (!band) return "bone";

      let tone = band.field;
      for (const { path, svg, tone: formTone } of band.forms) {
        const box = svg.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) continue;
        if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
        const vb = svg.viewBox.baseVal;
        // preserveAspectRatio is "none" on every form, so the mapping is a
        // straight scale on each axis
        const vx = ((x - box.left) / box.width) * vb.width;
        const vy = ((y - box.top) / box.height) * vb.height;
        try {
          if (path.isPointInFill(new DOMPoint(vx, vy))) tone = formTone;
        } catch {
          /* isPointInFill needs a rendered path; skip if it is not */
        }
      }
      return tone;
    };

    const apply = () => {
      queued = false;
      const header = document.querySelector("header");
      const h = (header?.offsetHeight ?? 72) * 0.55;
      const edge = Math.max(24, window.innerWidth * 0.06);

      const left = toneAt(edge, h);
      const right = toneAt(window.innerWidth - edge, h);
      if (root.dataset.tone !== left) root.dataset.tone = left;
      if (root.dataset.toneRight !== right) root.dataset.toneRight = right;
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
