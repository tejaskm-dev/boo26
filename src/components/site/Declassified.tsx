"use client";

import { useEffect, useRef } from "react";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion } from "@/lib/motion";
import { FILE } from "@/lib/site";
import { answer, buzz, shiver } from "@/components/soon/troll";

/** three marker strokes, none quite straight, drawn in a 400x60 box (as the teaser's Classified) */
const STROKE = [
  "M9 15C70 8 150 13 228 9C296 6 352 10 391 14C398 24 397 41 390 50C330 54 250 50 168 53C108 55 48 52 11 48C3 38 4 25 9 15Z",
  "M7 12C58 10 132 15 214 11C286 8 348 12 393 9C399 21 398 40 392 51C334 50 262 54 182 51C116 49 52 54 8 50C2 39 2 23 7 12Z",
  "M10 13C80 10 160 9 240 12C300 14 356 9 389 13C397 26 395 42 389 49C320 52 246 49 170 52C104 55 46 50 12 51C4 41 5 24 10 13Z",
];

/**
 * The teaser's file — WHAT, WHEN, WHERE, blacked out with a marker — now
 * that it can be told: as it comes into view the bars are torn off one at
 * a time, each leaving a scrap at its end, and a lime DECLASSIFIED stamp
 * comes down on it. WHERE is gone over in lime, as it always was.
 *
 * WHY stays redacted. That's the prompt's to say; poke it and it says so.
 *
 * Without the script, or with motion turned down, the file is simply open.
 */
export default function Declassified() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.dataset.open = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.open = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -22% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const poke = (target: HTMLElement) => {
    shiver(target, 7);
    buzz(12);
    answer(FILE.why.poke);
  };

  return (
    <div ref={root} className="fx-file relative w-full max-w-[34rem]" data-open="false" style={{ "--rows": FILE.rows.length } as React.CSSProperties}>
      <span aria-hidden="true" className="fx-file-stamp label">
        {FILE.stamp}
      </span>

      <dl>
        {FILE.rows.map((row, i) => (
          <div key={row.k} className="grid grid-cols-[clamp(3.6rem,8vw,5rem)_minmax(0,1fr)] items-center gap-3 py-[clamp(0.5rem,1.4vh,0.8rem)]">
            <dt className="label text-[clamp(0.62rem,0.9vw,0.72rem)] text-ink/45">{row.k}</dt>
            <dd>
              <span className="fx-file-line" style={{ "--i": i } as React.CSSProperties}>
                <span className="display text-[clamp(1.02rem,1.7vw,1.32rem)] leading-none">{row.v}</span>
                <span className="fx-file-bar" aria-hidden="true">
                  <svg viewBox="0 0 400 60" preserveAspectRatio="none">
                    <path d={STROKE[i % 3]} />
                  </svg>
                </span>
                <span className="fx-file-scrap" aria-hidden="true">
                  <svg viewBox="0 0 400 60" preserveAspectRatio="none">
                    <path d={STROKE[(i + 1) % 3]} />
                  </svg>
                </span>
              </span>
            </dd>
          </div>
        ))}

        <div className="grid grid-cols-[clamp(3.6rem,8vw,5rem)_minmax(0,1fr)] items-center gap-3 py-[clamp(0.5rem,1.4vh,0.8rem)]">
          <dt className="label text-[clamp(0.62rem,0.9vw,0.72rem)] text-ink/45">{FILE.where.k}</dt>
          <dd className="flex items-center gap-2">
            <span className="fx-highlight display text-[clamp(1.25rem,2.4vw,1.85rem)] leading-none">
              <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                <path d={STROKE[1]} />
              </svg>
              <span className="relative">{FILE.where.v}</span>
            </span>
            <Sprite name="map-pin" scale={0.2} idle={4} className="-mt-3 rotate-[8deg]" />
          </dd>
        </div>

        {/* the one still blacked out */}
        <div className="grid grid-cols-[clamp(3.6rem,8vw,5rem)_minmax(0,1fr)] items-center gap-3 pt-[clamp(0.6rem,1.6vh,1rem)]">
          <dt className="label text-[clamp(0.62rem,0.9vw,0.72rem)] text-ink/45">{FILE.why.k}</dt>
          <dd className="flex items-center gap-[clamp(0.75rem,2vw,1.25rem)]">
            <button
              type="button"
              aria-label={FILE.why.label}
              onClick={(e) => poke(e.currentTarget)}
              className="fx-file-why relative block h-[clamp(2.1rem,3.8vw,2.8rem)] w-[min(52%,13rem)] shrink-0 cursor-pointer"
            >
              <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                <path d={STROKE[2]} />
              </svg>
            </button>
            <span className="hand -rotate-[4deg] whitespace-pre-line text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.05] text-ink/55">{FILE.why.note}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
