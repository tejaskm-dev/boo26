"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { getLenis } from "@/lib/lenis";
import { MD, prefersReducedMotion } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { onTierDrop, rich } from "@/lib/tier";

type Edge = {
  box: HTMLElement;
  paths: { el: SVGPathElement; tokens: (string | number)[]; moving: boolean[] }[];
  minX: number;
  maxX: number;
  minY: number;
  phase: number;
  on: boolean;
};

/**
 * The edges between the cream and the ink, alive: every join a section's
 * field arrives as (Field.tsx, marked `data-edge`) moves gently, like the
 * hero's ink, while it's on screen.
 *
 * Only the curve does. The form's frame — its top, and its sides where they
 * run along the edge of the screen — never moves, so the join can't open a
 * gap against the section above it; and the lime hairline riding the edge
 * moves with it, because both are bent by the same function of where each
 * point sits.
 *
 * One ticker for the page, doing nothing at all unless a join is on screen:
 * a handful of paths rewritten a frame, from numbers parsed once. On a phone
 * it rests while you scroll and moves every other frame; a device that can't
 * take it (src/lib/tier.ts) gets the joins as they always were, still.
 */
export default function LivingEdges() {
  useEffect(() => {
    if (prefersReducedMotion() || !rich()) return;
    const mobile = !window.matchMedia(MD).matches;
    const root = document.documentElement;

    const edges: Edge[] = [...document.querySelectorAll<HTMLElement>("[data-edge]")].map((box, i) => {
      const [minX, minY, w] = (box.dataset.edge ?? "0 0 1000 300").split(" ").map(Number);
      const paths = [...box.querySelectorAll<SVGPathElement>("path")].map((el) => {
        const d = el.getAttribute("d") ?? "";
        const tokens: (string | number)[] = (d.match(/[MLHVCZ]|-?\d*\.?\d+/g) ?? []).map((t) => (/[A-Z]/.test(t) ? t : Number(t)));
        // which numbers are curve points: the pairs of a C, and nothing else
        const moving = tokens.map(() => false);
        let cmd = "";
        tokens.forEach((t, k) => {
          if (typeof t === "string") cmd = t;
          else if (cmd === "C") moving[k] = true;
        });
        return { el, tokens, moving };
      });
      return { box, paths, minX, maxX: minX + w, minY, phase: i * 1.7, on: false };
    });
    if (!edges.length) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const edge = edges.find((x) => x.box === e.target);
        if (edge) edge.on = e.isIntersecting;
      }
    });
    edges.forEach((e) => io.observe(e.box));

    const amp = mobile ? 6 : 9;
    let t = 0;
    let skip = 0;
    const tick = (_time: number, dms: number) => {
      if (document.hidden || root.dataset.idle === "true" || isNavActive() || root.dataset.wipe || root.dataset.wiping) return;
      if (mobile && (getLenis()?.isScrolling || ++skip % 2)) return;
      const any = edges.some((e) => e.on);
      if (!any) return;
      t += Math.min(0.064, (dms || 16.7) / 1000) * (mobile ? 2 : 1);
      for (const edge of edges) {
        if (!edge.on) continue;
        for (const p of edge.paths) {
          let out = "";
          let x = 0;
          let k = 0;
          while (k < p.tokens.length) {
            const tok = p.tokens[k];
            if (typeof tok === "string") {
              out += tok;
              k += 1;
              continue;
            }
            if (!p.moving[k]) {
              out += `${tok} `;
              k += 1;
              continue;
            }
            // a curve point: x then y
            x = tok;
            const y = p.tokens[k + 1] as number;
            const onSide = x <= edge.minX + 0.5 || x >= edge.maxX - 0.5;
            const onTop = y <= edge.minY + 0.5;
            const dx = onSide ? 0 : amp * 0.5 * Math.sin(y * 0.021 + t * 0.7 + edge.phase);
            const dy = onTop ? 0 : amp * (0.6 * Math.sin(x * 0.012 + t * 0.9 + edge.phase) + 0.4 * Math.sin(x * 0.027 - t * 1.3));
            out += `${Math.round((x + dx) * 10) / 10} ${Math.round((y + dy) * 10) / 10} `;
            k += 2;
          }
          p.el.setAttribute("d", out.trim());
        }
      }
    };
    gsap.ticker.add(tick);
    // the device stepped down: the joins go still where they are
    const stopDrop = onTierDrop(() => gsap.ticker.remove(tick));
    return () => {
      gsap.ticker.remove(tick);
      stopDrop();
      io.disconnect();
    };
  }, []);

  return null;
}
