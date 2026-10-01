"use client";

import { useRef, useState } from "react";
import Sprite from "@/components/ui/Sprite";
import { SECRETS, SOON, TROLL } from "@/lib/soon";
import InkEyes from "./InkEyes";
import { jumpscare } from "./JumpScare";
import { answer, buzz, once, shiver } from "./troll";
import { cue } from "./sound";

/** three marker strokes, none quite straight, drawn in a 400x60 box */
const STROKE = [
  "M9 15C70 8 150 13 228 9C296 6 352 10 391 14C398 24 397 41 390 50C330 54 250 50 168 53C108 55 48 52 11 48C3 38 4 25 9 15Z",
  "M7 12C58 10 132 15 214 11C286 8 348 12 393 9C399 21 398 40 392 51C334 50 262 54 182 51C116 49 52 54 8 50C2 39 2 23 7 12Z",
  "M10 13C80 10 160 9 240 12C300 14 356 9 389 13C397 26 395 42 389 49C320 52 246 49 170 52C104 55 46 50 12 51C4 41 5 24 10 13Z",
];
/** someone going back over it, harder each time */
const SCRIBBLE = [
  "M14 34L58 6L96 52L138 4L176 54L214 6L256 52L298 8L338 50L384 16",
  "M20 50L62 12L104 56L150 8L190 52L232 4L270 56L318 10L360 54L392 26",
];

/**
 * What we know, blacked out with a marker. Big, black, and nothing says it
 * can be touched.
 *
 * Touch a bar and it glitches and answers you on the bar itself — "nice
 * try", "still no", "stop" — a little shorter with you each time, across all
 * three, and someone goes back over it with the marker. A few taps in,
 * something in there opens its eyes. Ignore the last warning and it comes
 * out (JumpScare). Keep at WHEN long enough and it opens, and what's under
 * it is no help at all.
 *
 * The words are really there, ink on ink: select a bar and it reads "nice
 * try". WHERE is the one fact, gone over in lime.
 */
export default function Classified() {
  const t = SOON.heard;
  const taps = useRef(0);
  const whenTaps = useRef(0);
  const [said, setSaid] = useState<Record<string, string>>({});
  const [level, setLevel] = useState(0);
  const [whenOpen, setWhenOpen] = useState(false);

  const poke = (el: HTMLElement, k: string) => {
    shiver(el, 7);
    buzz(12);
    if (typeof el.animate === "function") {
      el.animate(
        [
          { clipPath: "inset(0 0 0 0)" },
          { clipPath: "inset(18% 0 46% 0)", translate: "6px 0" },
          { clipPath: "inset(52% 0 8% 0)", translate: "-5px 0" },
          { clipPath: "inset(0 0 0 0)", translate: "0 0" },
        ],
        { duration: 260, easing: "steps(4, end)" },
      );
    }
    if (k === "When" && !whenOpen) {
      whenTaps.current += 1;
      if (whenTaps.current >= t.whenOpensAfter) {
        setWhenOpen(true);
        answer("fine.", k);
        return;
      }
    }
    const n = taps.current;
    taps.current += 1;
    setLevel(taps.current);
    cue("tick");
    if (n < t.taps.length) {
      setSaid((s) => ({ ...s, [k]: t.taps[n] }));
      // the last warning: something behind the bars starts coming up
      if (n === t.taps.length - 1) cue("inhale", true);
      return;
    }
    // past the last warning
    if (once("bars-scare")) {
      jumpscare();
      window.setTimeout(() => setSaid({ What: t.after[0], When: t.after[0], Why: t.after[0] }), 900);
      return;
    }
    setSaid((s) => ({ ...s, [k]: t.after[Math.min(1 + ((n - t.taps.length - 1) % (t.after.length - 1)), t.after.length - 1)] }));
  };

  // how far it's gone: scribbles at 3 and 5 taps, eyes from 4, the last warning from 7
  const look = level >= 4;

  return (
    <div className="relative w-full max-w-[38rem]" data-look={look ? "true" : "false"}>
      <dl>
        {t.card.rows.map((row, i) => {
          const opens = "opens" in row && whenOpen;
          const reply = said[row.k];
          return (
            <div key={row.k} className="grid grid-cols-[clamp(3.6rem,8vw,5rem)_minmax(0,1fr)] items-center gap-3 py-[clamp(0.45rem,1.3vh,0.75rem)]">
              <dt className="label text-[clamp(0.62rem,0.9vw,0.72rem)] text-ink/45">{row.k}</dt>
              <dd className="relative">
                {"opens" in row ? (
                  <span
                    className={`hand absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-[clamp(1.15rem,1.9vw,1.5rem)] leading-none text-ink transition-opacity delay-300 duration-500 ${
                      opens ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden={!opens}
                  >
                    {row.opens}
                  </span>
                ) : null}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`${row.k}: redacted`}
                  data-open={opens ? "true" : undefined}
                  onClick={(e) => poke(e.currentTarget, row.k)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      poke(e.currentTarget, row.k);
                    }
                  }}
                  className="soon-marker-bar"
                  style={{ width: ["min(100%,24rem)", "min(74%,15rem)", "min(100%,28rem)"][i], "--level": level } as React.CSSProperties}
                >
                  <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="soon-marker-ink" aria-hidden="true">
                    <path d={STROKE[i]} />
                  </svg>
                  <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="soon-marker-scribble" aria-hidden="true">
                    {SCRIBBLE.map((d, j) => (
                      <path key={d} d={d} pathLength={1} style={{ "--at": j ? 5 : 3 } as React.CSSProperties} />
                    ))}
                  </svg>
                  {/* the words really are under there */}
                  <span className="soon-marker-hidden label">{row.hidden}</span>
                  <InkEyes className="left-[7%] top-[22%] w-[2.6rem]" tilt={i % 2 ? 6 : -6} blink={4 + i} delay={i * 0.25} />
                  <span key={reply} className="soon-marker-reply label" aria-live="polite">
                    {reply ?? ""}
                  </span>
                </span>
              </dd>
            </div>
          );
        })}
        <div className="grid grid-cols-[clamp(3.6rem,8vw,5rem)_minmax(0,1fr)] items-center gap-3 pt-[clamp(0.9rem,2.4vh,1.4rem)]">
          <dt className="label text-[clamp(0.62rem,0.9vw,0.72rem)] text-ink/45">Where</dt>
          <dd className="flex items-center gap-2">
            <span data-secret={SECRETS.where} className="soon-highlight display text-[clamp(1.25rem,2.4vw,1.85rem)] leading-none">
              <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                <path d={STROKE[1]} />
              </svg>
              <span className="relative">{t.card.where}</span>
            </span>
            <Sprite name="map-pin" scale={0.2} idle={4} className="-mt-3 rotate-[8deg]" />
          </dd>
        </div>
      </dl>

      {/* the leak: a torn-out page, taped up, with an arrow nobody can resist */}
      <a
        href={t.leak.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => window.setTimeout(() => answer(TROLL.fell), 1200)}
        data-secret={SECRETS.leak}
        className="soon-leak group relative mt-[clamp(1.75rem,5vh,3rem)] inline-flex items-end gap-1 outline-none"
        aria-label={`${t.leak.label} (opens a new tab)`}
      >
        <span className="relative flex flex-col items-end pb-6">
          <span className="hand -rotate-[6deg] whitespace-nowrap text-[clamp(1.15rem,1.8vw,1.45rem)] leading-none text-ink/75 transition-colors duration-300 group-hover:text-ink">
            {t.leak.label}
          </span>
          <Sprite name="arrow-lime" scale={0.2} className="mr-[-10%] mt-1 rotate-[28deg]" />
        </span>
        <span className="soon-leak-page soon-loop relative block">
          <Sprite name="paper-torn" scale={0.44} />
          <Sprite name="tape-lime" scale={0.18} className="absolute -top-[16%] left-[34%] rotate-[-14deg]" />
        </span>
      </a>
    </div>
  );
}
