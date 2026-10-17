"use client";

import { useEffect, useRef } from "react";
import { EYES } from "@/components/soon/InkEyes";
import { prefersReducedMotion } from "@/lib/motion";
import { PIN_EVENT, type PinDetail } from "./pins";

/** a blob of ink, in a 100x100 box — the line runs round its edge from the top (as the teaser's Waiting) */
const BLOB = "M52 5C77 4 95 21 95 47C95 74 77 95 49 94C23 93 5 76 6 49C7 23 27 6 52 5Z";

/** stopped this long partway through a pinned scene, and it tells you to keep going */
const IDLE = 1600;

/**
 * The eyes in the corner — the teaser's Waiting, for the full site's pinned
 * scenes (The Experience's stack, the No Sleep numeral). There only while a
 * scene holds the screen: a blob of ink with the hero's eyes in it, and a
 * lime line round its edge that fills as you scroll through. It looks the
 * way you're going, back up included, and if you stop partway it says so,
 * in that scene's own words — or says nothing, where the scene already has
 * its own nudge (The Experience's "Keep scrolling").
 *
 * The scenes report in themselves (pins.ts). Nothing here re-renders: one
 * fixed element and a handful of data attributes, and fx.css does the rest.
 */
export default function CornerEyes({ lines }: { /** what each scene says if you stop in it, by its id; null for nothing */ lines: Record<string, string | null> }) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGPathElement>(null);
  const words = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const line = ring.current;
    const text = words.current;
    if (!el || !line || !text || prefersReducedMotion()) return;
    const length = line.getTotalLength() || 300;
    line.style.strokeDasharray = `${length} ${length}`;
    line.style.strokeDashoffset = `${length}`;

    const live = new Map<string, PinDetail>();
    let current: PinDetail | null = null;
    let idle = 0;

    const say = (w: string | null) => {
      if (!w) {
        delete el.dataset.note;
        return;
      }
      text.textContent = w;
      el.dataset.arrow = "true";
      el.dataset.note = "true";
    };
    const draw = (p: number) => {
      line.style.strokeDashoffset = String(length * (1 - Math.min(1, Math.max(0, p))));
    };
    const armIdle = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (!current || current.progress > 0.97) return;
        say(lines[current.id] ?? null);
      }, IDLE);
    };

    const onPin = (e: Event) => {
      const d = (e as CustomEvent<PinDetail>).detail;
      if (d.active) live.set(d.id, d);
      else live.delete(d.id);
      const top = [...live.values()].pop() ?? null;
      if (!top) {
        current = null;
        window.clearTimeout(idle);
        say(null);
        el.dataset.mode = "off";
        return;
      }
      const fresh = current?.id !== top.id;
      current = top;
      el.dataset.mode = "run";
      el.dataset.eyes = "go";
      el.dataset.way = top.direction < 0 ? "up" : "down";
      draw(top.progress);
      if (fresh || el.dataset.note === "true") say(null);
      armIdle();
    };

    window.addEventListener(PIN_EVENT, onPin);
    return () => {
      window.removeEventListener(PIN_EVENT, onPin);
      window.clearTimeout(idle);
    };
  }, [lines]);

  return (
    <div ref={root} className="fx-wait" data-mode="off" data-way="down" aria-hidden="true">
      <p className="fx-wait-note hand">
        <span ref={words} />
        <svg viewBox="0 0 16 30" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <path d="M8 1v26M2.5 21.5 8 28l5.5-6.5" />
        </svg>
      </p>
      <div className="fx-wait-blob">
        <svg viewBox="0 0 100 100">
          <path d={BLOB} className="fx-wait-body" />
          <path ref={ring} d={BLOB} className="fx-wait-ring" />
        </svg>
        <span className="fx-wait-burst" />
        <span className="fx-wait-eyes">
          <svg viewBox="0 0 134 68">
            <g filter="url(#soon-eye-glow)">
              {EYES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
}
