"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Lines that won't hold still. Each line of the heading is marked
 * `soon-slice` and carries its own words in `data-text` (and the other
 * words in `data-alt`); the heading is marked `soon-slices`. For a few
 * frames at a time the heading says which way it's torn, in `data-g`, and
 * soon.css draws it: the line cut into bands and pushed sideways with a
 * bone ghost, or a hollow double, or — for a single frame — the other
 * words. Between glitches nothing runs and nothing is drawn twice.
 */

/** one glitch: the states it goes through, and for how long (ms); "" is a clean frame */
type Step = readonly [state: "" | "a" | "b" | "c" | "x", ms: number];

const GLITCHES = {
  twitch: [["a", 70], ["", 60], ["b", 50]],
  tear: [["b", 60], ["a", 50], ["c", 80], ["", 40], ["a", 50]],
  /** with a frame of the other words in it */
  slip: [["c", 50], ["x", 90], ["a", 60]],
} as const satisfies Record<string, readonly Step[]>;

export type Glitch = keyof typeof GLITCHES;

const busy = new WeakSet<HTMLElement>();

/** glitch it now, unless it's already glitching */
export function glitch(el: HTMLElement | null, kind: Glitch = "tear") {
  if (!el || busy.has(el) || prefersReducedMotion()) return;
  busy.add(el);
  const steps: readonly Step[] = GLITCHES[kind];
  let i = 0;
  const next = () => {
    if (i >= steps.length || !el.isConnected) {
      delete el.dataset.g;
      busy.delete(el);
      return;
    }
    const [state, ms] = steps[i++];
    if (state) el.dataset.g = state;
    else delete el.dataset.g;
    window.setTimeout(next, ms);
  };
  next();
}

/**
 * Glitches it every few seconds while it's on screen — once soon after it
 * comes into view, then at odd intervals, every third one slipping into
 * the other words — and whenever it's pointed at or touched.
 */
export function useGlitch(ref: React.RefObject<HTMLElement | null>, min = 2400, max = 5600) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let timer = 0;
    let n = 0;
    const again = () => {
      timer = window.setTimeout(() => {
        n += 1;
        glitch(el, n % 3 === 0 ? "slip" : n % 2 ? "twitch" : "tear");
        again();
      }, min + Math.random() * (max - min));
    };
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (!e.isIntersecting) return;
      timer = window.setTimeout(() => {
        glitch(el, "tear");
        again();
      }, 700);
    });
    io.observe(el);
    const poke = () => glitch(el, "tear");
    el.addEventListener("pointerenter", poke);
    el.addEventListener("pointerdown", poke);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      el.removeEventListener("pointerenter", poke);
      el.removeEventListener("pointerdown", poke);
    };
  }, [ref, min, max]);
}
