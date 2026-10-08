"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";
import { BACK, SOON } from "@/lib/soon";
import InkEyes from "./InkEyes";
import { useBacktrack } from "./backtrack";
import { hold, inView } from "./hold";
import { cue, heart } from "./sound";
import { buzz } from "./troll";

/** what's watching from the dark while it counts — more of them each count */
const COUNT_EYES: { at: string; from: number; tilt: number }[] = [
  { at: "left-[6%] top-[14%] w-[4.2rem] md:w-[6rem]", from: 0, tilt: -8 },
  { at: "right-[7%] top-[70%] w-[3.4rem] md:w-[5rem]", from: 0, tilt: 9 },
  { at: "right-[10%] top-[16%] w-[2.6rem] md:w-[3.6rem]", from: 1, tilt: 6 },
  { at: "left-[9%] top-[74%] w-[2.8rem] md:w-[4rem]", from: 1, tilt: -4 },
  { at: "left-[24%] top-[6%] w-[2rem] md:w-[2.6rem]", from: 2, tilt: 4 },
  { at: "right-[26%] top-[86%] w-[2.2rem] md:w-[3rem]", from: 2, tilt: -10 },
  { at: "left-[3%] top-[44%] w-[2.4rem] md:w-[3.2rem]", from: 2, tilt: 12 },
];

/** a beat of the count, in ms */
const BEAT = 950;

/**
 * "jump scare in 3… 2… 1…" — a whole screen, held still while it counts.
 * The edges darken a step each number, more eyes open in the dark, a heart
 * underneath gets quicker; then nothing. "relax." And while you're relaxing,
 * `onCarry` takes you on — down to "lean in", and the one that's real.
 *
 * Its own component so a tick of the count redraws the count and nothing
 * else. Come back up to it later and it isn't counting any more — and it
 * holds you there a moment to make sure you notice.
 */
export default function Countdown({ onCarry }: { onCarry: () => void }) {
  const t = SOON.point;
  const room = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [counting, setCounting] = useState(false);
  const [relaxed, setRelaxed] = useState(false);
  const [back, setBack] = useState(false);
  const carry = useRef(onCarry);
  // the still version tells the same story, all at once
  const still = useReducedMotion();

  useEffect(() => {
    carry.current = onCarry;
  });

  // came back up to it from well past it: it's stopped counting, and it holds you there
  const returned = useRef(false);
  useBacktrack(room, () => {
    returned.current = true;
    setBack(true);
  });

  useEffect(() => {
    const el = room.current;
    if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const timers: number[] = [];
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      once: true,
      onEnter: () => {
        // gone straight past (the menu, a link): it counts, but not out loud
        const seen = inView(el);
        setCounting(true);
        if (seen) buzz(14);
        // a heart under the count, quicker each number — then nothing at all
        if (seen) heart(1.1);
        t.fakeout.forEach((_, i) => {
          if (!i) return;
          timers.push(
            window.setTimeout(() => {
              setStep(i);
              if (!seen) return;
              buzz(14);
              heart(1.1 + i * 0.55);
              if (i === t.fakeout.length - 1) timers.push(window.setTimeout(() => cue("inhale", true), 300));
            }, i * BEAT),
          );
        });
        const calm = t.fakeout.length * BEAT + 700;
        timers.push(
          window.setTimeout(() => {
            setRelaxed(true);
            heart(0);
          }, calm),
        );
        // held while it counts — then carried on, to the one that's real. The
        // screen's sticky for a while, so a fling that ran on a little is
        // held right where it is; only a long overshoot is eased back.
        const over = window.scrollY - (el.getBoundingClientRect().top + window.scrollY);
        const back = over > window.innerHeight * 0.2 ? { to: el, glide: 0.35 } : {};
        // (once "relax." is up, the rest of it is for reading it: move on in it and you're carried on)
        if (!hold("countdown", calm + 1300, { ...back, tail: 1300, onRelease: () => carry.current() })) {
          // not held (you were going the other way): carry you on only if you're still watching
          timers.push(
            window.setTimeout(() => {
              const r = el.getBoundingClientRect();
              if (r.bottom > window.innerHeight * 0.5 && r.top < window.innerHeight * 0.25) carry.current();
            }, calm + 1500),
          );
        }
      },
    });
    // back up into it, and it's stopped counting — "0. you sure about
    // that?" — held there a moment, a heart going under it. Flung past it
    // on the way up, and it brings you back for it.
    const again = () =>
      returned.current &&
      hold("countdown:up", 2000, {
        to: el,
        glide: 0.4,
        way: "up",
        tail: 1100,
        onHeld: () => {
          buzz(14);
          heart(1.5);
        },
        onRelease: () => heart(0),
      });
    const up = ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", onEnterBack: again, onLeaveBack: again });
    return () => {
      st.kill();
      up.kill();
      timers.forEach((id) => window.clearTimeout(id));
      heart(0);
    };
  }, [t.fakeout]);

  const shown = still ? t.fakeout.length - 1 : step;
  const count = back ? 0 : t.fakeout.length - shown;
  const done = relaxed || still || back;

  // The screen it holds is the whole screen with the toolbars away (100vh, on
  // a phone): the edges darken right to the bottom whatever the toolbar's
  // doing. A screen with them out (svh) left a pale strip under the dark
  // while they were away.
  return (
    <div ref={room} data-countdown className="relative h-[calc(100vh+25svh)]">
      <div
        className="soon-countdown sticky top-0 grid h-screen place-items-center overflow-hidden px-[var(--edge)] text-center"
        data-step={still ? t.fakeout.length - 1 : counting && !back ? step : -1}
        data-relaxed={done ? "true" : "false"}
      >
        <span aria-hidden="true" className="soon-vignette" />
        {COUNT_EYES.map((e, i) => (
          <span key={i} data-look={!still && counting && !done && step >= e.from ? "true" : "false"} className="contents">
            <InkEyes className={e.at} tilt={e.tilt} blink={4 + (i % 3)} delay={i * 0.08} />
          </span>
        ))}
        <div className="relative flex flex-col items-center gap-3">
          <span
            key={count}
            aria-hidden="true"
            className={`soon-count ghost-index pointer-events-none select-none text-[clamp(13rem,42vw,30rem)] leading-[0.8] transition-opacity duration-700 ${
              done && !back ? "!opacity-0" : ""
            }`}
          >
            {count}
          </span>
          <p className="label label-loose flex items-center gap-3 text-ink/70" aria-live="off">
            <span aria-hidden="true" className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime [box-shadow:0_0_0_1px_rgba(8,8,8,0.35)]" />
            {back ? BACK.count : t.fakeout[shown]}
          </p>
          <p className={`flex items-center gap-2 transition-opacity duration-700 ${done && !back ? "opacity-100" : "opacity-0"}`}>
            <span className="hand -rotate-[3deg] text-[clamp(1.3rem,2vw,1.8rem)] text-ink/60">{t.relax}</span>
            <Sprite name="zzz" scale={0.18} className="-mt-4 rotate-[8deg]" />
          </p>
          <p className={`label text-[0.62rem] tracking-[0.24em] text-ink/40 transition-opacity delay-700 duration-700 ${done && !back ? "opacity-100" : "opacity-0"}`}>
            {t.promise}
          </p>
        </div>
      </div>
    </div>
  );
}
