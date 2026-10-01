"use client";

import { useRef, useState } from "react";
import { SOON } from "@/lib/soon";
import { answer, shiver } from "./troll";

/**
 * What we know, blacked out — set big, like a file someone took a marker to.
 *
 * Nothing says the bars can be touched. Touch one and it glitches and tells
 * you off, a little more each time; keep at WHEN long enough and it opens,
 * and what's under it is no help at all. The words are really there, ink on
 * ink: select a bar and it reads "nice try".
 */
export default function Classified() {
  const t = SOON.heard;
  const taps = useRef(0);
  const whenTaps = useRef(0);
  const [whenOpen, setWhenOpen] = useState(false);

  const poke = (el: HTMLElement, k: string) => {
    shiver(el, 7);
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
    answer(t.taps[Math.min(taps.current, t.taps.length - 1)], k);
    taps.current += 1;
  };

  return (
    <div className="relative w-full max-w-[38rem]">
      <p className="label label-loose flex items-center gap-3 text-ink/45">
        <span aria-hidden="true" className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
        {t.card.title}
      </p>

      <dl className="mt-[clamp(1rem,2.5vh,1.5rem)] border-t border-ink/15">
        {t.card.rows.map((row, i) => {
          const opens = "opens" in row && whenOpen;
          return (
            <div key={row.k} className="grid grid-cols-[clamp(5rem,12vw,8rem)_minmax(0,1fr)] items-center gap-4 border-b border-ink/15 py-[clamp(0.8rem,2vh,1.2rem)]">
              <dt className="display text-[clamp(1.05rem,2.2vw,1.7rem)] text-ink/55">{row.k}</dt>
              <dd className="relative">
                {"opens" in row ? (
                  <span
                    className={`hand absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-[clamp(1.1rem,1.8vw,1.45rem)] leading-none text-ink transition-opacity delay-300 duration-500 ${
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
                  className="soon-bar soon-bar-big label text-[clamp(0.8rem,1.3vw,1rem)]"
                  style={{ width: ["min(100%,22rem)", "min(72%,13rem)", "min(100%,26rem)"][i] }}
                >
                  {row.hidden}
                </span>
              </dd>
            </div>
          );
        })}
        <div className="grid grid-cols-[clamp(5rem,12vw,8rem)_minmax(0,1fr)] items-center gap-4 border-b border-ink/15 py-[clamp(0.8rem,2vh,1.2rem)]">
          <dt className="display text-[clamp(1.05rem,2.2vw,1.7rem)] text-ink/55">Where</dt>
          <dd className="display text-[clamp(1.05rem,2.2vw,1.7rem)]">
            <span className="soon-marker">{t.card.where}</span>
          </dd>
        </div>
      </dl>

      <a
        href={t.card.leak.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group label mt-4 inline-flex items-center gap-1.5 text-[0.62rem] text-ink/40 outline-none transition-colors duration-300 hover:text-ink focus-visible:text-ink"
      >
        <span className="underline decoration-ink/25 underline-offset-4 group-hover:decoration-lime">{t.card.leak.label}</span>
        <span aria-hidden="true">{"↗"}</span>
      </a>
    </div>
  );
}
