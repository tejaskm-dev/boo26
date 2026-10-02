"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { subscribePointer } from "@/lib/pointer";
import { isTouch } from "@/lib/tier";
import { MU, SECRETS } from "@/lib/soon";
import { buzz, shiver } from "./troll";

/**
 * The logo's own holes, as percentages of its box — the eye of the e and
 * the bowl of the a (measured off public/assets/mulearn.svg). That's where
 * its eyes are.
 */
const HOLES = {
  e: { x: 37.89, y: 14.31, w: 8.59, h: 11.84 },
  a: { x: 55.84, y: 14.89, w: 9.82, h: 36.45 },
};

/**
 * A cat's eye for each hole, drawn to its shape: a long squint for the e's
 * slot (100x37, the slot's own proportions) and a rounder one for the a's
 * bowl (100x100) — lime, with a slit of a pupil that looks about.
 */
const EYE = {
  e: { box: "0 0 100 37", lid: "M3 18.5C25 1 75 1 97 18.5 75 36 25 36 3 18.5Z", cx: 50, cy: 18.5, rx: 5, ry: 14, reach: [30, 4] },
  a: { box: "0 0 100 100", lid: "M6 50C20 13 80 13 94 50 80 87 20 87 6 50Z", cx: 50, cy: 50, rx: 8, ry: 29, reach: [24, 14] },
} as const;

/** taps on any of the logos on the page: the third sends the banner over */
let taps = 0;

/**
 * µLearn ASIET's logo — the club whose banner this is under — drawn the
 * BOO! way: the hero's lime eyes sit in the holes of its own letters, a
 * narrow one in the e and a wide one in the a, shut until it sees you.
 *
 * Alive (the default), it opens its eyes once it's on screen, follows the
 * cursor round (on a phone it glances about by itself), widens them when
 * you come close, and screws them shut when you poke it; the third poke on
 * the page sends the banner over (Banner.tsx). Hover or long-press the µ
 * for what it means. Not alive, whatever holds it opens its eyes, by
 * setting `data-mu-open` on itself (the first title card does).
 *
 * The logo is one small file, used as a mask, so it's any colour and costs
 * one request however many times it's on the page.
 */
export default function MuLearn({
  className = "",
  tone = "bone",
  alive = true,
}: {
  className?: string;
  /** the colour of the letters: bone on the dark, ink on the cream or the lime */
  tone?: "bone" | "ink" | "lime";
  alive?: boolean;
}) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !alive) return;
    const pupils = [...el.querySelectorAll<SVGGElement>("[data-pupil]")];
    if (prefersReducedMotion()) {
      el.dataset.open = "true";
      return;
    }
    const timers: number[] = [];

    // it opens its eyes a moment after it comes into view, and shuts them when it's gone
    let seen = false;
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting;
        timers.forEach((id) => window.clearTimeout(id));
        if (seen) timers.push(window.setTimeout(() => (el.dataset.open = "true"), 450 + Math.random() * 500));
        else el.dataset.open = "false";
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    // a cursor: it watches it. (A phone glances about on its own, in CSS.)
    let rect: DOMRect | null = null;
    const stale = () => (rect = null);
    let stop = () => {};
    if (!isTouch()) {
      window.addEventListener("scroll", stale, { passive: true });
      window.addEventListener("resize", stale, { passive: true });
      stop = subscribePointer((nx, ny) => {
        if (!seen) return;
        rect ??= el.getBoundingClientRect();
        const dx = ((nx + 1) / 2) * window.innerWidth - (rect.left + rect.width / 2);
        const dy = ((ny + 1) / 2) * window.innerHeight - (rect.top + rect.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, d / (rect.width * 0.9));
        // close enough, and it's all eyes
        el.dataset.near = d < rect.width * 0.75 ? "true" : "false";
        pupils.forEach((p) => {
          const [rx, ry] = EYE[p.dataset.pupil as "e" | "a"].reach;
          // (in the eye's own units: px is a user unit inside an svg)
          p.style.transform = `translate(${((dx / d) * pull * rx).toFixed(1)}px, ${((dy / d) * pull * ry).toFixed(1)}px)`;
        });
      });
    }

    // poke it, and it screws its eyes shut — and the third poke sends the banner over
    const onPoke = () => {
      el.dataset.squint = "true";
      timers.push(window.setTimeout(() => delete el.dataset.squint, 650));
      shiver(el, 5);
      buzz(12);
      taps += 1;
      if (taps === 3) window.dispatchEvent(new Event("soon:banner"));
    };
    el.addEventListener("pointerdown", onPoke);

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("scroll", stale);
      window.removeEventListener("resize", stale);
      el.removeEventListener("pointerdown", onPoke);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [alive]);

  return (
    <span
      ref={root}
      role="img"
      aria-label={MU.name}
      data-tone={tone}
      data-alive={alive ? "true" : "false"}
      data-open="false"
      className={`soon-mu ${className}`}
    >
      <span className="soon-mu-ink" aria-hidden="true" />
      {(["e", "a"] as const).map((k) => (
        <span
          key={k}
          data-hole={k}
          aria-hidden="true"
          className="soon-mu-hole"
          style={{ left: `${HOLES[k].x}%`, top: `${HOLES[k].y}%`, width: `${HOLES[k].w}%`, height: `${HOLES[k].h}%` }}
        >
          <svg viewBox={EYE[k].box} className={`soon-mu-eye soon-mu-eye-${k}`}>
            <path className="soon-mu-lid" d={EYE[k].lid} filter={tone === "bone" ? "url(#soon-eye-glow)" : undefined} />
            <g data-pupil={k}>
              <ellipse className="soon-mu-pupil" cx={EYE[k].cx} cy={EYE[k].cy} rx={EYE[k].rx} ry={EYE[k].ry} />
            </g>
          </svg>
        </span>
      ))}
      {alive ? <span className="soon-mu-mu" data-secret={SECRETS.mu} aria-hidden="true" /> : null}
    </span>
  );
}
