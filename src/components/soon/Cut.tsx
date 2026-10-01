"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import InkEyes from "./InkEyes";
import { cue } from "./sound";

/** where eyes open in the dark while the card is up */
const DARK_EYES: { at: string; tilt: number }[] = [
  { at: "left-[8%] top-[18%] w-[3rem] md:w-[4.6rem]", tilt: -8 },
  { at: "left-[80%] top-[24%] w-[2.2rem] md:w-[3.4rem]", tilt: 7 },
  { at: "left-[14%] top-[72%] w-[2.4rem] md:w-[3.6rem]", tilt: 5 },
  { at: "left-[74%] top-[78%] w-[2.8rem] md:w-[4.2rem]", tilt: -6 },
  { at: "left-[46%] top-[88%] hidden w-[2rem] md:block", tilt: 3 },
];

/** the goo off a line: which letters it runs from, how long it hangs, when it lets go */
function drips(line: string, i: number) {
  const letters = [...line].map((ch, k) => ({ ch, k })).filter(({ ch }) => /[A-Z]/i.test(ch));
  if (!letters.length) return [];
  const picks = [0.18, 0.55, 0.86].slice(0, line.length > 8 ? 3 : 2);
  return picks.map((at, j) => ({
    k: letters[Math.min(letters.length - 1, Math.floor(at * letters.length) + ((i + j) % 2))].k,
    long: 0.6 + ((i * 7 + j * 5) % 5) * 0.16,
    delay: 0.35 + j * 0.28 + (i % 2) * 0.1,
  }));
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
 * of the frame; and one line at a time comes up in the dark, in the BOO!
 * brush — each letter dropping in like a blob of the lockup's goo, landing
 * soft, and a few drips running off the line after it, the last one in lime.
 * The next act fades in behind it all.
 *
 * The scroll decides which line you're on; the line itself plays on its own
 * clock, so a quick flick never makes it stutter, and stopping holds it. Its
 * own stretch of page, so nothing underneath is missed while it's dark.
 * With motion turned down there's no cut at all.
 */
export default function Cut({ lines }: { lines: readonly string[] }) {
  const room = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const eyes = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = room.current;
    const veilEl = veil.current;
    const cardEl = card.current;
    if (!el || !veilEl || !cardEl || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const rows = [...cardEl.querySelectorAll<HTMLElement>("[data-row]")];
    let rose = false;
    let landed = false;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      // gone before the next act's words come up
      end: "bottom 55%",
      onToggle: ({ isActive }) => {
        veilEl.style.visibility = isActive ? "visible" : "hidden";
      },
      onUpdate: ({ progress: p }) => {
        // dark in, hold, dark out
        veilEl.style.opacity = String(Math.max(0, Math.min(1, p / 0.18, (1 - p) / 0.22)));
        if (eyes.current) eyes.current.dataset.look = p > 0.3 && p < 0.76 ? "true" : "false";
        // which line you're on — the line plays itself from there
        const span = 0.5 / lines.length;
        rows.forEach((row, i) => {
          const start = 0.2 + i * span;
          const on = p > start ? "true" : "false";
          const past = i < lines.length - 1 && p > start + span ? "true" : "false";
          if (row.dataset.on !== on) row.dataset.on = on;
          if (row.dataset.past !== past) row.dataset.past = past;
        });
        if (!rose && p > 0.06) {
          rose = true;
          cue("inhale");
        }
        if (!landed && p > 0.21) {
          landed = true;
          cue("toll");
        }
        if (p < 0.03) rose = landed = false;
      },
    });
    return () => st.kill();
  }, [lines]);

  return (
    <div ref={room} className="soon-cut-room" aria-hidden="true">
      <div ref={veil} className="soon-cut">
        <span className="soon-cut-grain" />
        <span className="soon-cut-flicker" />
        <div ref={eyes} data-look="false" className="absolute inset-0">
          {DARK_EYES.map((e, i) => (
            <InkEyes key={i} className={e.at} tilt={e.tilt} blink={4 + i} delay={i * 0.12} />
          ))}
        </div>
        <div ref={card} className="soon-cut-card">
          {lines.map((line, i) => {
            const goo = drips(line, i);
            return (
              <p key={line} data-row data-on="false" className="soon-goo brush">
                {words(line).map((w, wi) => (
                  <span key={wi}>
                    {wi > 0 ? " " : null}
                    <span className="soon-goo-w">
                      {[...w.text].map((ch, n) => {
                        const k = w.at + n;
                        return (
                          <span key={k} className="soon-goo-l" style={{ "--i": k, "--r": `${((k * 37) % 9) - 4}deg` } as React.CSSProperties}>
                            {ch}
                            {goo
                              .filter((d) => d.k === k)
                              .map((d, j) => (
                                <span
                                  key={j}
                                  className="soon-drip"
                                  style={{ "--long": d.long, "--d": `${d.delay + k * 0.035}s` } as React.CSSProperties}
                                >
                                  <i />
                                </span>
                              ))}
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
