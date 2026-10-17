"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The teaser's goo (soon/Cut.tsx), for a heading on the full site: each
 * letter drops in like a blob of the lockup's goo and lands soft, then drips
 * run off the feet of its strokes — one or two long enough to let a drop go.
 * Written out the same way, every transform and opacity, so all of it runs
 * on the compositor (fx.css).
 *
 * Where the brush's strokes come down onto the baseline — in em from the
 * letter's left edge, and how wide the stroke is there (measured off Bagel
 * Fat One). Round-bottomed letters (O, S, C, G, U, J, Q) aren't here: hung
 * under a bowl, a drip reads as a Q's tail, not goo.
 */
const FEET: Record<string, readonly (readonly [number, number])[]> = {
  A: [[0.138, 0.2], [0.573, 0.2]],
  B: [[0.2, 0.17]],
  D: [[0.2, 0.17]],
  E: [[0.19, 0.17], [0.44, 0.14]],
  F: [[0.135, 0.17]],
  H: [[0.138, 0.165], [0.535, 0.165]],
  I: [[0.138, 0.175]],
  K: [[0.138, 0.175], [0.525, 0.18]],
  L: [[0.19, 0.17], [0.42, 0.14]],
  M: [[0.134, 0.163], [0.695, 0.165]],
  N: [[0.134, 0.163], [0.51, 0.2]],
  P: [[0.135, 0.17]],
  R: [[0.14, 0.17], [0.521, 0.177]],
  T: [[0.338, 0.17]],
  W: [[0.309, 0.2], [0.637, 0.2]],
  X: [[0.134, 0.177], [0.545, 0.18]],
  Y: [[0.35, 0.17]],
  Z: [[0.2, 0.17], [0.42, 0.17]],
};

type Drip = { x: number; foot: number; long: number; neck: number; delay: number; drop: boolean };

/** steady noise: the same every render, so the server and the browser agree */
const noise = (a: number, b: number) => (((a + 1) * 7919 + (b + 3) * 104729) % 997) / 997;

/**
 * Which feet run, how far, and when: about one every three letters, one long
 * one that lets go — or, `short`, only sags and short runs, for a word with
 * something just under it.
 */
function drips(word: string, short = false) {
  const at = new Map<number, Drip[]>();
  const spots = [...word.toUpperCase()].flatMap((ch, k) => (FEET[ch] ?? []).map(([x, foot]) => ({ k, x, foot })));
  if (!spots.length) return at;
  const letters = [...word].filter((ch) => /[a-z0-9]/i.test(ch)).length;
  const n = Math.min(spots.length, Math.max(2, Math.round(letters / 2.2)));
  let last = -1;
  for (let j = 0; j < n; j++) {
    let s = Math.floor(((j + 0.5) * spots.length) / n + (noise(3, j) - 0.5) * 1.2);
    s = Math.max(last + 1, Math.min(spots.length - (n - j), s));
    last = s;
    const { k, x, foot } = spots[s];
    const r = noise(j * 13 + 3, k);
    const drop = !short && (j === 1 || (n < 2 && j === 0));
    at.set(k, [
      ...(at.get(k) ?? []),
      {
        x,
        foot,
        long: drop ? 0.72 + r * 0.32 : short ? 0.08 + r * 0.22 : r < 0.5 ? 0.1 + r * 0.24 : 0.3 + (r - 0.5) * 0.6,
        neck: drop ? 0.088 : 0.09 + r * 0.02,
        delay: +(k * 0.045 + 0.4 + noise(j, 15 + k) * 0.2).toFixed(3),
        drop,
      },
    ]);
  }
  return at;
}

/**
 * The goo itself, once for the page: blurred, then cut back to a hard edge,
 * so whatever touches melts into one shape. The blur is a share of the
 * drip's own box (sized in em), so it's the same goo at any size.
 */
export function GooFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="pointer-events-none absolute">
      <defs>
        <filter id="fx-goo" x="-25%" y="-4%" width="150%" height="108%" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.06 0.009" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5.4" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * One word in the goo: the letters fall in and drip once it's well on
 * screen. The word itself is read out whole (the letters are only a picture
 * of it). With motion turned down it's there from the start, drips and all.
 */
export default function GooWord({ text, short = false, className = "" }: { text: string; /** sags and short runs only */ short?: boolean; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const goo = drips(text, short);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (prefersReducedMotion()) {
      node.dataset.on = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        node.dataset.on = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={el} className={`fx-goo ${className}`} data-on="false" aria-label={text} role="text">
      <span className="fx-goo-w" aria-hidden="true">
        {[...text].map((ch, k) => (
          <span key={k} className="fx-goo-l" data-tilt={(k * 37) % 5} style={{ "--i": k } as React.CSSProperties}>
            {ch}
            {goo.get(k)?.map((d, q) => (
              <span
                key={q}
                className="fx-drip"
                data-drop={d.drop ? "" : undefined}
                style={{ left: `${d.x}em`, "--foot": d.foot, "--long": d.long, "--neck": d.neck, "--d": `${d.delay}s` } as React.CSSProperties}
              >
                <span className="fx-drip-foot" />
                <span className="fx-drip-stem" />
                <span className="fx-drip-run">
                  <span className="fx-drip-bead" />
                  {d.drop ? <span className="fx-drip-drop" /> : null}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
