"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "@/lib/motion";
import { TROLL } from "@/lib/soon";
import { answer, buzz } from "./troll";
import { cue } from "./sound";

export type Scare = "face" | "eyes";
const listeners = new Set<(kind: Scare) => void>();
const done = new Set<Scare>();

/**
 * Sets one off — each kind at most once a visit; ask for one that's been
 * used and you get the other. Whatever's mounted <JumpScareHost /> does the rest.
 */
export function jumpscare(kind: Scare = "face") {
  const pick = done.has(kind) ? (kind === "face" ? "eyes" : "face") : kind;
  if (done.has(pick)) return false;
  done.add(pick);
  for (const fn of listeners) fn(pick);
  return true;
}

/** The hero's narrowed eyes, in their 134x68 box. */
const EYES = [
  "M7 5 57 47C45 63 19 61 9 47 2 38 4 15 7 5Z",
  "M127 27 77 63C87 79 113 77 123 63 130 54 129 37 127 27Z",
];
/** a cat's head, ears and all, too big for the screen */
const HEAD =
  "M80 1040C30 860 20 640 90 470C110 420 120 330 140 230C150 170 160 120 175 80C230 150 290 220 340 280C420 255 580 255 660 280C710 220 770 150 825 80C840 120 850 170 860 230C880 330 890 420 910 470C980 640 970 860 920 1040Z";
/** the grin: lit from inside, with the teeth left standing */
const GRIN =
  "M300 690L340 735L370 700L405 750L440 705L475 755L500 708L525 755L560 705L595 750L630 700L660 735L700 690C660 800 580 850 500 852C420 850 340 800 300 690Z";

/**
 * The one real scare on the teaser: the cream flashes up and the thing in
 * the ink is right there — the hero's eyes, three times the size, and a grin
 * lit from inside like something carved. Under a second and a half, once a
 * visit at most (whoever calls it decides), and no sound.
 *
 * It's one picture, drawn once, and everything that moves it moves the whole
 * picture on the compositor — the lunge, the shake — so it costs a frame to
 * appear and nothing after. One flash, never a strobe. With motion turned
 * down it doesn't happen; a toast says "boo." instead.
 */
export default function JumpScareHost() {
  const [on, setOn] = useState(0);
  const [kind, setKind] = useState<Scare>("face");

  useEffect(() => {
    const fire = (k: Scare) => {
      if (prefersReducedMotion()) {
        answer(TROLL.boo);
        return;
      }
      buzz(280);
      cue("scare", true);
      // the face is a cat's, and it's furious
      if (k === "face") cue("meow", true);
      setKind(k);
      setOn(Date.now());
    };
    listeners.add(fire);
    return () => {
      listeners.delete(fire);
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setOn(0), 1350);
    return () => window.clearTimeout(t);
  }, [on]);

  if (!on || typeof document === "undefined") return null;
  return createPortal(
    <div key={on} className="soon-scare" data-kind={kind} aria-hidden="true">
      {kind === "eyes" ? (
        // the other one: the dark, and its eyes, coming at you
        <div className="soon-scare-face soon-scare-rush">
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <rect x="-500" y="-500" width="2000" height="2000" fill="#030303" />
            <g filter="url(#soon-scare-glow)" fill="var(--color-lime)" opacity="0.9">
              <g transform="translate(232 400) scale(4)">
                {EYES.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
            </g>
            <g className="soon-scare-eyes" fill="var(--color-lime)">
              <g transform="translate(232 400) scale(4)">
                {EYES.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
            </g>
            <defs>
              <filter id="soon-scare-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="18" />
              </filter>
            </defs>
          </svg>
        </div>
      ) : (
      <div className="soon-scare-face">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="soon-scare-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>
          <path d={HEAD} fill="var(--color-lime)" transform="translate(-14 12)" opacity="0.9" />
          <path d={HEAD} fill="#050505" />
          <g filter="url(#soon-scare-glow)" fill="var(--color-lime)" opacity="0.85">
            <g transform="translate(299 380) scale(3)">
              {EYES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <path d={GRIN} />
          </g>
          <g className="soon-scare-eyes" fill="var(--color-lime)">
            <g transform="translate(299 380) scale(3)">
              {EYES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </g>
          <path d={GRIN} fill="var(--color-lime)" />
        </svg>
      </div>
      )}
    </div>,
    document.body,
  );
}
