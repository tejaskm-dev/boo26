"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import InkEyes from "./InkEyes";
import { cue } from "./sound";

/** what an unresolved letter flickers through */
const GLYPHS = "#%&@$?!<>/*+=0123456789";

/** where eyes open in the dark while the card is up */
const DARK_EYES: { at: string; tilt: number }[] = [
  { at: "left-[8%] top-[18%] w-[3rem] md:w-[4.6rem]", tilt: -8 },
  { at: "left-[80%] top-[24%] w-[2.2rem] md:w-[3.4rem]", tilt: 7 },
  { at: "left-[14%] top-[72%] w-[2.4rem] md:w-[3.6rem]", tilt: 5 },
  { at: "left-[74%] top-[78%] w-[2.8rem] md:w-[4.2rem]", tilt: -6 },
  { at: "left-[46%] top-[88%] hidden w-[2rem] md:block", tilt: 3 },
];

/**
 * A cut between acts — a scene of its own, a screen and a bit long.
 *
 * The picture fades to black; the film flickers; one line at a time comes
 * up in the dark, each one decoding out of noise as you scroll, a lime rule
 * drawing in under it; eyes open around the edge of the frame; and the next
 * act fades in behind it all. With the sound on, a riser pulls in as it goes
 * dark and the first line lands on the trailer "braam".
 *
 * Tied to the scroll rather than a clock — stop and it waits with you, the
 * line still up. Its own stretch of page, so nothing underneath is missed
 * while it's dark. One fixed layer for the dark, moved and faded on the
 * compositor; the only thing that redraws is the line that's decoding. With
 * motion turned down there's no cut at all.
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
    const rows = [...cardEl.querySelectorAll<HTMLElement>("[data-line]")];
    const rules = [...cardEl.querySelectorAll<HTMLElement>("[data-rule]")];
    let visible = false;
    let raf = 0;
    let rose = false;
    let landed = false;
    // how much of each line is resolved, 0..1
    const resolved = lines.map(() => 0);

    const paint = () => {
      raf = 0;
      let pending = false;
      rows.forEach((row, i) => {
        const text = lines[i];
        const n = Math.floor(resolved[i] * text.length);
        if (resolved[i] <= 0) {
          if (row.textContent !== "") row.textContent = "";
          return;
        }
        let out = text.slice(0, n);
        for (let k = n; k < text.length; k++) out += text[k] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        row.textContent = out;
        if (n < text.length) pending = true;
      });
      // the unresolved letters keep flickering while the line is still coming
      if (pending && visible) raf = window.setTimeout(paint, 55) as unknown as number;
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      // gone before the next act's words come up
      end: "bottom 55%",
      onToggle: ({ isActive }) => {
        visible = isActive;
        veilEl.style.visibility = isActive ? "visible" : "hidden";
      },
      onUpdate: ({ progress: p }) => {
        // dark in, hold, dark out
        const dark = Math.min(1, p / 0.18, (1 - p) / 0.22);
        veilEl.style.opacity = String(Math.max(0, dark));
        if (eyes.current) eyes.current.dataset.look = p > 0.3 && p < 0.76 ? "true" : "false";
        // each line gets its share of the middle, and decodes in the first half of it
        const span = 0.54 / lines.length;
        lines.forEach((_, i) => {
          const local = (p - 0.19 - i * span) / (span * 0.6);
          resolved[i] = Math.max(0, Math.min(1, local));
          const row = rows[i];
          const on = local > 0;
          row.parentElement!.dataset.on = on ? "true" : "false";
          row.parentElement!.dataset.past = p - 0.19 - (i + 1) * span > 0 && i < lines.length - 1 ? "true" : "false";
          rules[i].style.scale = `${Math.max(0, Math.min(1, local))} 1`;
        });
        if (!rose && p > 0.06) {
          rose = true;
          cue("riser");
        }
        if (!landed && p > 0.21) {
          landed = true;
          cue("braam");
        }
        if (p < 0.03) rose = landed = false;
        if (!raf) paint();
      },
    });
    return () => {
      st.kill();
      window.clearTimeout(raf);
    };
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
          {lines.map((l) => (
            <p key={l} className="soon-cut-line label" data-on="false">
              <span data-line />
              <span data-rule className="soon-cut-rule" />
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
