"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import InkEyes from "./InkEyes";
import { hold } from "./hold";
import { cue } from "./sound";

/** where eyes open in the dark while the card is up */
const DARK_EYES: { at: string; tilt: number }[] = [
  { at: "left-[8%] top-[18%] w-[3rem] md:w-[4.6rem]", tilt: -8 },
  { at: "left-[80%] top-[24%] w-[2.2rem] md:w-[3.4rem]", tilt: 7 },
  { at: "left-[14%] top-[72%] w-[2.4rem] md:w-[3.6rem]", tilt: 5 },
  { at: "left-[74%] top-[78%] w-[2.8rem] md:w-[4.2rem]", tilt: -6 },
  { at: "left-[46%] top-[88%] hidden w-[2rem] md:block", tilt: 3 },
];

/** how long each line has before the next comes up, in ms */
const STEP = 950;

/** which letters of a line run, how far, and when */
function drips(line: string, i: number) {
  const letters = [...line].map((ch, k) => ({ ch, k })).filter(({ ch }) => /[A-Z]/i.test(ch));
  if (!letters.length) return new Map<number, { long: number; delay: number; x: number }>();
  const picks = [0.2, 0.58, 0.88].slice(0, line.length > 8 ? 3 : 2);
  return new Map(
    picks.map((at, j) => {
      const k = letters[Math.min(letters.length - 1, Math.floor(at * letters.length) + ((i + j) % 2))].k;
      return [k, { long: 0.55 + ((i * 7 + j * 5) % 5) * 0.14, delay: 0.32 + j * 0.24, x: ((i + j * 3) % 5) * 0.03 - 0.06 }] as const;
    }),
  );
}

/** a line's words, each knowing where its first letter sits in the line */
function words(line: string) {
  let at = 0;
  return line.split(" ").map((text) => {
    const w = { text, at };
    at += text.length + 1;
    return w;
  });
}

/**
 * A cut between acts — a scene of its own, a screen and a bit long.
 *
 * The picture fades to black; the film flickers; eyes open round the edge
 * of the frame; and the lines come up one at a time in the BOO! brush, each
 * letter dropping in like a blob of the lockup's goo and landing soft, and
 * then running — drips sliding off the bottom of the letters, in their own
 * colour, the last line in lime. The next act fades in behind it.
 *
 * Once the card is up, the page holds still for as long as the lines take
 * (hold.ts), so a quick flick can't skip it. The lines play on their own
 * clock either way, so the scroll never makes them stutter. Come back up
 * through it and it says something else (`back`) — held for that too. Leave
 * it either way and it resets, ready to play again. With motion turned down
 * there's no cut.
 */
export default function Cut({ lines, back = [] }: { lines: readonly string[]; back?: readonly string[] }) {
  const room = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const eyes = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = room.current;
    const veilEl = veil.current;
    const cardEl = card.current;
    const eyesEl = eyes.current;
    if (!el || !veilEl || !cardEl || !eyesEl || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const down = [...cardEl.querySelectorAll<HTMLElement>("[data-row]")];
    const up = [...cardEl.querySelectorAll<HTMLElement>("[data-row-back]")];
    let timers: number[] = [];
    let playing: "down" | "up" | null = null;
    let breathed = false;
    /** held for it this visit — on the way down, and on the way back up */
    let caught = false;
    let caughtUp = false;
    /** one of its holds has the page (easing it back, or holding it) */
    let mine = false;

    const play = (way: "down" | "up") => {
      if (playing) return;
      playing = way;
      cardEl.dataset.way = way;
      const rows = way === "down" ? down : up;
      rows.forEach((row, i) => {
        timers.push(
          window.setTimeout(() => {
            if (!row.isConnected) return;
            row.dataset.on = "true";
            if (i > 0) rows[i - 1].dataset.past = "true";
            if (i === 0) cue("toll");
          }, i * STEP),
        );
      });
    };
    const reset = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      playing = null;
      for (const row of [...down, ...up]) {
        row.dataset.on = "false";
        row.dataset.past = "false";
      }
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      // gone before the next act's words come up
      end: "bottom 55%",
      onToggle: ({ isActive }) => {
        veilEl.style.visibility = isActive ? "visible" : "hidden";
      },
      onUpdate: (self) => {
        const p = self.progress;
        // dark in, hold, dark out
        veilEl.style.opacity = String(Math.max(0, Math.min(1, p / 0.18, (1 - p) / 0.22)));
        eyesEl.dataset.look = p > 0.26 && p < 0.78 ? "true" : "false";
        if (!breathed && p > 0.06) {
          breathed = true;
          cue("inhale");
        }
        // while one of its holds has the page, the card plays on as it is —
        // the ease back can start from past either end, which would otherwise
        // reset it and replay the other way's lines
        if (mine) return;
        const goingUp = self.direction < 0;
        const range = self.end - self.start;
        // the card's up: hold the page while it says its piece — on the way
        // down at a third of the way in, and on the way back up (where it
        // says something else) at a third of the way from the bottom
        const holdFor = (way: "down" | "up") => {
          const ok = hold(way === "up" ? `cut-up:${lines.join("|")}` : `cut:${lines.join("|")}`, way === "up" ? up.length * STEP + 600 : lines.length * STEP + 700, {
            to: self.start + range * (way === "up" ? 0.64 : 0.36),
            glide: 0.7,
            way,
            onRelease: () => (mine = false),
          });
          if (!ok) return false;
          mine = true;
          if (way === "up") caughtUp = true;
          else caught = true;
          return true;
        };
        // a fling that went clean past it in one frame (a slow phone, a busy
        // moment) still gets the card, either way: the hold brings it back
        // for it. A jump (a link) isn't held, and then it's simply left behind.
        if (!playing && (goingUp ? !caughtUp && up.length > 0 && p <= 0.2 : !caught && p >= 0.8)) {
          if (holdFor(goingUp ? "up" : "down")) play(goingUp ? "up" : "down");
          return;
        }
        if (!playing && p > 0.2 && p < 0.8) play(goingUp && up.length ? "up" : "down");
        if (playing === "down" && p > 0.2 && !caught) holdFor("down");
        if (playing === "up" && p < 0.8 && !caughtUp) holdFor("up");
        // left behind, either way: ready to play again
        if (p < 0.08 || p > 0.96) {
          reset();
          breathed = false;
        }
      },
    });
    return () => {
      st.kill();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [lines, back]);

  return (
    <div ref={room} className="soon-cut-room" data-wait="cut" aria-hidden="true">
      <div ref={veil} className="soon-cut">
        <span className="soon-cut-grain" />
        <span className="soon-cut-flicker" />
        <div ref={eyes} data-look="false" className="absolute inset-0">
          {DARK_EYES.map((e, i) => (
            <InkEyes key={i} className={e.at} tilt={e.tilt} blink={4 + i} delay={i * 0.12} />
          ))}
        </div>
        <div ref={card} className="soon-cut-card" data-way="down">
          {[
            ...lines.map((line, k) => ({ line, attr: "data-row", last: k === lines.length - 1 })),
            ...back.map((line, k) => ({ line, attr: "data-row-back", last: k === back.length - 1 })),
          ].map(({ line, attr, last }, i) => {
            const goo = drips(line, i);
            return (
              <p key={line} {...{ [attr]: "" }} data-last={last ? "" : undefined} data-on="false" data-past="false" className="soon-goo brush">
                {words(line).map((w, wi) => (
                  <span key={wi}>
                    {wi > 0 ? " " : null}
                    <span className="soon-goo-w">
                      {[...w.text].map((ch, n) => {
                        const k = w.at + n;
                        const d = goo.get(k);
                        return (
                          <span key={k} className="soon-goo-l" style={{ "--i": k, "--r": `${((k * 37) % 9) - 4}deg` } as React.CSSProperties}>
                            {ch}
                            {d ? (
                              <span className="soon-drip-at">
                                <span
                                  className="soon-drip"
                                  style={{ "--long": d.long, "--d": `${d.delay + k * 0.04}s`, "--x": `${d.x}em` } as React.CSSProperties}
                                >
                                  <b />
                                  <i />
                                </span>
                              </span>
                            ) : null}
                          </span>
                        );
                      })}
                    </span>
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
