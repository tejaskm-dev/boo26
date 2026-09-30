"use client";

import { useRef, useState } from "react";
import Sprite from "@/components/ui/Sprite";
import { SOON } from "@/lib/soon";
import { answer, shiver } from "./troll";

/**
 * The file, with the facts blacked out.
 *
 * Nothing says the bars can be tapped. Those who do get told off, a little
 * more each time; whoever keeps at WHEN long enough gets it opened — and
 * what's under it is no help at all. The words hidden under each bar are
 * really there, ink on ink: select one and it reads "nice try".
 */
export default function RedactedCard() {
  const t = SOON.heard;
  const taps = useRef(0);
  const whenTaps = useRef(0);
  const [whenOpen, setWhenOpen] = useState(false);

  const poke = (el: HTMLElement, k: string) => {
    shiver(el, 5);
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
    <div className="relative mx-auto w-full max-w-[25rem] rotate-[1.6deg] lg:ml-0">
      {/* clipped to the board */}
      <Sprite name="clip" scale={0.32} className="absolute -top-[2.2rem] left-1/2 z-10 -translate-x-1/2 -rotate-[4deg]" />

      <div className="bg-paper px-[clamp(1.25rem,3vw,2rem)] pb-[clamp(1.25rem,3vw,1.75rem)] pt-[clamp(2.25rem,5vw,2.75rem)] text-ink shadow-[0_14px_40px_rgba(8,8,8,0.16)]">
        <p className="label flex items-center justify-between text-ink/45">
          <span>{t.card.title}</span>
          <span className="text-lime [text-shadow:0_0_1px_rgba(8,8,8,0.6)]">{"●"}</span>
        </p>

        <dl className="mt-5">
          {t.card.rows.map((row, i) => {
            const opens = "opens" in row && row.k === "When" && whenOpen;
            return (
              <div key={row.k} className="grid grid-cols-[5.25rem_minmax(0,1fr)] items-center border-t border-ink/12 py-[0.85rem]">
                <dt className="label text-ink/45">{row.k}</dt>
                <dd className="relative min-h-[1.6em]">
                  {"opens" in row ? (
                    <span
                      className={`hand absolute inset-y-0 left-0 flex items-center text-[1.15rem] leading-none text-ink/80 transition-opacity delay-300 duration-500 ${
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
                    className="soon-bar label text-[0.8rem]"
                    style={{ minWidth: ["9.5rem", "6.5rem", "11rem"][i] }}
                  >
                    {row.hidden}
                  </span>
                </dd>
              </div>
            );
          })}
          <div className="grid grid-cols-[5.25rem_minmax(0,1fr)] items-center border-y border-ink/12 py-[0.85rem]">
            <dt className="label text-ink/45">Where</dt>
            <dd className="display text-[clamp(1rem,1.6vw,1.2rem)] leading-none">{t.card.where}</dd>
          </div>
        </dl>

        <a
          href={t.card.leak.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group label mt-5 inline-flex items-center gap-1.5 text-[0.62rem] text-ink/40 outline-none transition-colors duration-300 hover:text-ink focus-visible:text-ink"
        >
          <span className="underline decoration-ink/25 underline-offset-4 group-hover:decoration-lime">{t.card.leak.label}</span>
          <span aria-hidden="true">{"↗"}</span>
        </a>
      </div>
    </div>
  );
}
