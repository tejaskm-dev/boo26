"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import { EVENT, NOTES, TIMELINE } from "@/lib/site";
import { prefersReducedMotion } from "@/lib/motion";
import type { SpriteName } from "@/lib/sprites";

/**
 * 03 — an oversized "20" holding the left, and the night running down the right
 * on a lime thread that draws itself as you scroll. Each stop has its own cat,
 * sitting on the thread rather than beside it: excited at the doors, playful
 * when it gets weird, confused at 2am, asleep at 6, boxed up at ship.
 */
export default function TwentyHours() {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const numeral = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // the numeral is pinned while the night runs past it — the one place on
      // the page where the scroll is held, so it has to earn it
      const pin = ScrollTrigger.create({
        trigger: root.current,
        start: "top 12%",
        end: () => `+=${Math.max(0, (list.current?.offsetHeight ?? 0) - window.innerHeight * 0.62)}`,
        pin: numeral.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });

      // the thread draws itself over the same stretch
      const line = path.current;
      if (line) {
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top 78%", end: "bottom 82%", scrub: 0.5 },
        });
      }

      // each stop arrives from behind the thread, and its cat a beat later
      gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
        tl.from(el.querySelector("[data-stop-copy]"), {
          xPercent: 9,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
        }).from(
          el.querySelector("[data-stop-cat]"),
          { xPercent: 26, autoAlpha: 0, rotate: 6, duration: 0.8, ease: "back.out(1.5)" },
          0.12,
        );
      });

      // the numeral keeps drifting while it is held
      gsap.to("[data-numeral-art]", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.7 },
      });

      return () => pin.kill();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Section
      id="hours"
      field="bone"
      edge={{ from: "ink", shape: "swell" }}
      className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(4rem,11vh,7.5rem)]"
    >
      <div ref={root} className="px-[var(--edge)]">
        <div className="flex items-start justify-between gap-6">
          <SectionLabel index="03">The 20 Hours</SectionLabel>
          <p className="hand hidden max-w-[10ch] whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55 md:block">
            {NOTES.night}
          </p>
        </div>

        <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* the numeral */}
          <div ref={numeral} data-numeral className="relative">
            <p
              data-anim="rise"
              aria-hidden="true"
              data-numeral-art
              className="brush select-none text-[clamp(8rem,26vw,22rem)] leading-[0.74] tracking-[-0.04em]"
            >
              20
            </p>
            <p className="brush -mt-[0.12em] ml-[0.12em] text-[clamp(2.2rem,6vw,4.5rem)] leading-none">
              Hours
            </p>
            <Sprite name="squiggle-lime" scale={1.1} className="ml-[0.5em] mt-2" />

            {/* draped over the top of the numeral rather than parked next to it */}
            <Sprite
              name="cat-sneak"
              scale={1.15}
              drift={14}
              idle={5}
              className="absolute -top-[clamp(0.5rem,2.5vw,2rem)] left-[32%] z-10 w-[46%] md:w-auto"
            />

            <p className="body-copy mt-[clamp(1.25rem,3.5vh,2rem)] max-w-[22ch] whitespace-pre-line text-[clamp(0.95rem,1.3vw,1.1rem)] text-ink/60">
              {NOTES.hours}
            </p>

            {/* the empty half of the column earns its keep */}
            <Sprite name="moon" scale={1.2} drift={26} idle={7} className="absolute bottom-[6%] right-[14%] hidden lg:block" />
            <Sprite name="star-small" scale={0.7} drift={32} className="absolute bottom-[26%] right-[34%] hidden lg:block" />
          </div>

          {/* the night */}
          <ol ref={list} className="relative pl-[clamp(2.5rem,5vw,4.5rem)]">
            {/* the thread every stop hangs from */}
            <svg
              viewBox="0 0 120 900"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-[clamp(2.5rem,5vw,4.5rem)]"
            >
              <path
                ref={path}
                d="M96 8C62 96 30 150 34 236C38 322 96 350 94 436C92 522 26 548 30 634C34 720 92 748 88 892"
                fill="none"
                stroke="var(--color-lime)"
                strokeWidth={4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {TIMELINE.map((stop, i) => (
              <li
                key={stop.time}
                data-stop
                style={{ marginLeft: `${[0, 2.4, 0.8, 3.2, 1.2][i] ?? 0}vw` }}
                className={`relative py-[clamp(1.5rem,4.2vh,2.75rem)] pr-[clamp(5.25rem,11vw,9.5rem)] ${
                  i > 0 ? "border-t border-ink/12" : ""
                }`}
              >
                {/* the bead the thread threads through */}
                <span
                  aria-hidden="true"
                  className="absolute top-[calc(clamp(1.5rem,4.2vh,2.75rem)+0.5em)] h-[0.62rem] w-[0.62rem] -translate-x-1/2 rounded-full bg-lime ring-[3px] ring-bone"
                  style={{ left: `calc(clamp(2.5rem,5vw,4.5rem) * ${i % 2 === 0 ? -0.22 : -0.74})` }}
                />
                <div data-stop-copy>
                  <p className="display text-[clamp(1.05rem,1.6vw,1.35rem)] leading-none">{stop.time}</p>
                <Words as="h3" className="brush mt-2 text-[clamp(1.5rem,3.1vw,2.5rem)] leading-none" stagger={0.06}>
                  {stop.label}
                  </Words>
                </div>

                <Sprite
                  data-stop-cat
                  name={stop.cat as SpriteName}
                  scale={0.8}
                  drift={8}
                  idle={5}
                  className={`absolute top-1/2 w-[4.25rem] -translate-y-1/2 sm:w-auto ${
                    i % 2 === 0 ? "right-0" : "right-[7%]"
                  }`}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-[clamp(2rem,5vh,3rem)] flex items-end justify-between gap-6">
          <p className="label label-loose text-ink/45">{EVENT.format}</p>
          <p className="hand whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55">
            {NOTES.survive}
          </p>
        </div>
      </div>
    </Section>
  );
}
