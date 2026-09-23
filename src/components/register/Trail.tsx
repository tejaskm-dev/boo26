"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import LiveGhost, { type GhostHandle } from "./LiveGhost";
import { onGhost } from "@/lib/register/ghost";
import { LG, prefersReducedMotion } from "@/lib/motion";

/**
 * How far along a sign-up is, as stops on a trail: the 20 Hours thread and
 * its beads, laid on their side. Stops behind you are filled, the one you're
 * on glows, the rest wait as outlines — the whole way, and how much is left,
 * always in view.
 *
 * The ghost walks it with you. It hops from stop to stop — crouch, stretch
 * in the air, squash on landing, its shadow shrinking under it — once per
 * stop when it has several to cover, and it cheers when it reaches the last.
 * In between it answers the form: bobbing as you type, looking over at the
 * field you're in, shivering when something's wrong (src/lib/register/ghost.ts).
 */
export default function Trail({ steps, at }: { steps: readonly string[]; at: number }) {
  const n = steps.length;
  // the trail runs from the centre of the first stop to the centre of the last
  const inset = `${50 / n}%`;
  const done = n > 1 ? at / (n - 1) : 1;

  const track = useRef<HTMLDivElement>(null);
  const runner = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const ghost = useRef<GhostHandle>(null);
  /** the stop it's standing on, or on its way to */
  const stop = useRef(at);

  // stood on its stop, and kept there as the trail changes width
  useEffect(() => {
    const t = track.current;
    const r = runner.current;
    if (!t || !r) return;
    const place = () => gsap.set(r, { x: (stop.current * t.clientWidth) / n });
    place();
    const watch = new ResizeObserver(place);
    watch.observe(t);
    return () => watch.disconnect();
  }, [n]);

  // a hop for every stop between here and there
  useEffect(() => {
    const from = stop.current;
    const t = track.current;
    const r = runner.current;
    const sh = shadow.current;
    const b = ghost.current?.body;
    if (from === at || !t || !r || !sh || !b) return;
    stop.current = at;
    const unit = t.clientWidth / n;
    if (prefersReducedMotion()) {
      gsap.set(r, { x: at * unit });
      return;
    }

    const dir = Math.sign(at - from);
    const hops = Math.abs(at - from);
    const d = hops > 1 ? 0.34 : 0.46;
    ghost.current?.look(dir, -0.3);

    const tl = gsap.timeline({
      onComplete: () => {
        ghost.current?.look(Number.NaN, Number.NaN);
        if (at === n - 1 && dir > 0) ghost.current?.cheer();
      },
    });
    // crouch
    tl.to(b, { scaleY: 0.74, scaleX: 1.18, duration: 0.14, ease: "power2.out", transformOrigin: "50% 100%" });
    for (let k = 1; k <= hops; k++) {
      const up = `hop${k}`;
      tl.addLabel(up)
        .to(r, { x: (from + dir * k) * unit, duration: d, ease: "sine.inOut" }, up)
        .to(b, { y: -20, scaleY: 1.14, scaleX: 0.88, rotation: dir * 9, duration: d / 2, ease: "power2.out" }, up)
        .to(b, { y: 0, rotation: 0, duration: d / 2, ease: "power2.in" }, `${up}+=${d / 2}`)
        .to(sh, { scale: 0.45, opacity: 0.12, duration: d / 2, ease: "power2.out" }, up)
        .to(sh, { scale: 1, opacity: 0.45, duration: d / 2, ease: "power2.in" }, `${up}+=${d / 2}`)
        // and a squash on every landing
        .to(b, { scaleY: 0.78, scaleX: 1.16, duration: 0.07, ease: "power2.out" });
    }
    tl.to(b, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1, 0.32)" });

    return () => {
      tl.kill();
    };
  }, [at, n]);

  // what the form tells it
  useEffect(
    () =>
      onGhost((mood) => {
        const g = ghost.current;
        if (!g) return;
        if (mood === "nod") g.nod();
        else if (mood === "scared") g.scare();
        else if (mood === "cheer") g.cheer();
        else if (mood === "fly") g.fly();
        // the form is to its right on a wide screen, and below it on a phone
        else if (mood === "watch") g.look(window.matchMedia(LG).matches ? 1 : 0.2, window.matchMedia(LG).matches ? 0.1 : 1);
        else if (mood === "away") g.look(Number.NaN, Number.NaN);
      }),
    [],
  );

  return (
    <div ref={track} className="relative w-full max-w-[26rem] pt-[2.1rem]">
      <span
        aria-hidden="true"
        className="absolute top-[calc(2.1rem+0.3rem)] h-0 border-t-[1.5px] border-dashed border-bone/25"
        style={{ left: inset, right: inset }}
      />
      <span
        aria-hidden="true"
        className="absolute top-[calc(2.1rem+0.3rem)] h-0 border-t-[1.5px] border-dashed border-lime transition-[width] duration-700 ease-[var(--ease-out-soft)]"
        style={{ left: inset, width: `calc((100% - 2 * ${inset}) * ${done})` }}
      />

      {/* the ghost, on the stop you're at */}
      <span ref={runner} aria-hidden="true" className="absolute top-0 block w-[1.6rem] -translate-x-1/2" style={{ left: inset }}>
        <span
          ref={shadow}
          className="absolute left-1/2 top-[1.72rem] block h-[0.28rem] w-[1.05rem] -translate-x-1/2 rounded-[50%] bg-lime opacity-45 blur-[2px]"
        />
        <LiveGhost ref={ghost} className="relative w-full" />
      </span>

      <ol aria-label="Progress" className="relative flex">
        {steps.map((step, i) => {
          const state = i < at ? "done" : i === at ? "current" : "ahead";
          return (
            <li
              key={step}
              aria-current={state === "current" ? "step" : undefined}
              className="flex flex-1 flex-col items-center gap-[0.65rem]"
            >
              <span
                aria-hidden="true"
                className={`block h-[0.62rem] w-[0.62rem] rounded-full transition-[background-color,box-shadow,transform] duration-500 ease-[var(--ease-out-soft)] ${
                  state === "ahead"
                    ? "bg-ink shadow-[inset_0_0_0_1.5px_rgba(243,240,231,0.35)]"
                    : state === "current"
                      ? "bead-ping scale-[1.35] bg-lime"
                      : "bg-lime"
                }`}
              />
              <span
                className={`label text-[0.58rem] transition-colors duration-500 md:text-[0.62rem] ${
                  state === "current" ? "text-lime" : state === "done" ? "text-bone/70" : "text-bone/35"
                }`}
              >
                {step}
                <span className="sr-only">{state === "done" ? " (done)" : state === "current" ? " (you're here)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
