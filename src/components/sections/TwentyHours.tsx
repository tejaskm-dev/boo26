"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import { EVENT, NOTES, TIMELINE } from "@/lib/site";
import { LG, prefersReducedMotion } from "@/lib/motion";
import type { SpriteName } from "@/lib/sprites";

/**
 * 03 — an oversized "20" holding the left, and the night running down the right
 * on a lime thread that draws itself as you scroll. Each stop has its own cat,
 * sitting on the thread rather than beside it: excited at the doors, playful
 * at midnight, confused at 3am, asleep at 6, popping out of a box at the end.
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
      // The numeral is held while the night runs past it — but only where the
      // numeral and the night are side by side. `pinSpacing: false` holds the
      // numeral without reserving its space, so in the stacked single-column
      // layout the timeline scrolls straight up underneath it and lands on the
      // note. It is a two-column device and it stays in the two-column layout.
      //
      // How far it can be held depends on how much taller the list is than the
      // screen, and on a short viewport that can come out at nothing — a pin
      // whose end equals its start throws rather than doing nothing.
      const wide = window.matchMedia(LG).matches;
      const runway = () =>
        (list.current?.offsetHeight ?? 0) - window.innerHeight * 0.62;
      const pin =
        wide && runway() > 120
          ? ScrollTrigger.create({
              trigger: root.current,
              start: "top 12%",
              end: () => `+=${Math.max(140, runway())}`,
              pin: numeral.current,
              pinSpacing: false,
              invalidateOnRefresh: true,
            })
          : null;

      // The thread draws itself as the night is travelled. The path declares
      // pathLength={1}, so the whole reveal is 1 -> 0 and needs no measuring.
      //
      // The range is set in pixels rather than from the list's own top and
      // bottom. Anchoring it to the element gave a window of about 740px —
      // less than one screen — so a single flick on a phone crossed the entire
      // draw and it only ever looked finished. This spans the list plus most of
      // a viewport, which is long enough to watch.
      const line = path.current;
      if (line) {
        // Both values in the path's own user units. That only works because
        // the stroke is no longer non-scaling: with it, dashes were measured
        // in screen units while getTotalLength() reported user units, and the
        // pathLength workaround for that produced a unitless dasharray against
        // a px dashoffset — two different unit systems, so the offset barely
        // shifted the pattern and the line read as all-or-nothing.
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: list.current,
            start: "top 90%",
            end: () =>
              `+=${Math.round((list.current?.offsetHeight ?? 0) + window.innerHeight * 0.75)}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      }

      // Each stop arrives from behind the thread, and its cat a beat later.
      //
      // It also holds the hour it is on. Only one stop is `current` at a time,
      // so scrolling the section reads as moving through the night rather than
      // past a list: the bead fills, the time goes lime, the cat sits up. The
      // state is an attribute and the look is CSS, so the scroll handler does
      // no style work of its own.
      //
      // Deliberately not `once: true`. A trigger on a timeline waits a tick
      // before measuring itself, and any trigger created in that tick forces it
      // to measure early. Reloaded from lower down the page, these five are
      // already past, and with `once` they killed themselves inside that forced
      // refresh — several at a time, while GSAP's loop over its triggers only
      // allows for one removal. It read past the end of its own list and threw
      // ("reading 'end'"), taking the page down. The default toggleActions
      // ("play none none none") already play once and never reverse.
      const stops = gsap.utils.toArray<HTMLElement>("[data-stop]");
      stops.forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 88%" },
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

      // Exactly one stop is current, always. A trigger per stop leaves gaps
      // between short rows and marks two at once where they overlap, so the
      // choice is made in one place.
      //
      // The measuring happens on refresh, not on scroll. Reading
      // getBoundingClientRect for every stop on every scroll frame forces the
      // browser to flush layout sixty times a second for information that only
      // changes when the page is re-laid out — which is what made this section
      // drag. Per frame this is now arithmetic on cached numbers, and one
      // attribute write when the answer actually changes.
      let centres: number[] = [];
      let current = -1;

      const measure = () => {
        const top = window.scrollY;
        centres = stops.map((el) => {
          const r = el.getBoundingClientRect();
          return top + r.top + r.height / 2;
        });
      };

      const markCurrent = () => {
        if (!centres.length) return;
        const line = window.scrollY + window.innerHeight * 0.44;
        let best = 0;
        let bestDist = Infinity;
        for (let i = 0; i < centres.length; i++) {
          const d = Math.abs(centres[i] - line);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        if (best === current) return;
        if (current >= 0) stops[current].dataset.current = "false";
        stops[best].dataset.current = "true";
        current = best;
      };

      ScrollTrigger.create({
        trigger: list.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: markCurrent,
        onRefresh: () => { measure(); current = -1; markCurrent(); },
      });

      // The numeral used to carry its own scrubbed drift on top of the pin and
      // the list's parallax — three scrubbed things fighting over one section.
      // It is held by the pin already, which is the effect that matters.

      return () => pin?.kill();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Section
      id="hours"
      field="bone"
      forms={[
        { shape: "notch", tone: "ink", at: "inset-x-0 top-0 w-full h-[11vh] md:h-[18vh]" },
        { shape: "coveLeft", tone: "ink", at: "left-0 top-0 hidden h-full w-[54%] lg:block" },
      ]}
      className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(5rem,15vh,12rem)] md:pt-[clamp(5rem,22vh,12rem)]"
    >
      <div ref={root} className="px-[var(--edge)]">
        <div className="flex items-start justify-between gap-6">
          <SectionLabel index="03" className="lg:text-bone">The 20 Hours</SectionLabel>
          <p className="hand hidden max-w-[10ch] whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55 md:block">
            {NOTES.hoursAside}
          </p>
        </div>

        <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* The numeral column lives on the ink cove, so it is set in cream
              and knocked out of the black rather than printed on top of it. */}
          <div ref={numeral} data-numeral className="relative lg:text-bone">
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
            <Sprite name="squiggle-lime" scale={0.39} className="ml-[0.5em] mt-2" />

            {/* draped over the top of the numeral rather than parked next to it */}
            <Sprite
              name="cat-tired"
              scale={0.85}
              drift={14}
              idle={5}
              className="absolute -top-[clamp(0.5rem,2.5vw,2rem)] left-[32%] z-10 w-[46%] md:w-auto"
            />

            <p className="body-copy mt-[clamp(1.25rem,3.5vh,2rem)] max-w-[22ch] whitespace-pre-line text-[clamp(0.95rem,1.3vw,1.1rem)] text-ink/60 lg:text-bone/65">
              {NOTES.hours}
            </p>

            {/* the empty half of the column earns its keep */}
          </div>

          {/* the night */}
          <ol ref={list} data-scrub="up" data-scrub-amount="7" className="relative pl-[clamp(2.5rem,5vw,4.5rem)]">
            {/* the thread every stop hangs from */}
            <svg
              viewBox="0 0 120 900"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-[clamp(2.5rem,5vw,4.5rem)]"
            >
              <path
                ref={path}
                /* No non-scaling-stroke: it forces the dash pattern into screen
                   units while getTotalLength() reports user units, which is
                   what stopped this drawing. The stroke scales with the viewBox
                   instead, so the width is set in user units to land at about
                   4px once the clamped column compresses x by a third. */
                d="M96 8C62 96 30 150 34 236C38 322 96 350 94 436C92 522 26 548 30 634C34 720 92 748 88 892"
                fill="none"
                stroke="var(--color-lime)"
                strokeWidth={11}
                strokeLinecap="round"
              />
            </svg>

            {TIMELINE.map((stop, i) => (
              <li
                key={stop.time}
                data-stop
                style={{ marginLeft: `${[0, 2.4, 0.8, 3.2, 1.2][i] ?? 0}vw` }}
                /* the right lane is reserved for the cat, so a long label
                   never runs under it */
                className={`relative py-[clamp(1.5rem,4.2vh,2.75rem)] pr-[clamp(7rem,16vw,13.5rem)] ${
                  i > 0 ? "border-t border-ink/12" : ""
                }`}
              >
                {/* the bead the thread threads through — it swells and throws
                    a halo while its hour is the one being read */}
                <span
                  aria-hidden="true"
                  className="stop-bead"
                  style={{ left: `calc(clamp(2.5rem,5vw,4.5rem) * ${i % 2 === 0 ? -0.22 : -0.74})` }}
                />
                <div data-stop-copy>
                  <p className="stop-time display text-[clamp(1.05rem,1.6vw,1.35rem)] leading-none">{stop.time}</p>
                <Words as="h3" className="brush mt-2 text-[clamp(1.5rem,3.1vw,2.5rem)] leading-none" stagger={0.06}>
                  {stop.label}
                  </Words>
                </div>

                <Sprite
                  data-stop-cat
                  name={stop.cat as SpriteName}
                  scale={0.48}
                  drift={8}
                  idle={5}
                  className={`absolute top-1/2 w-[4.25rem] -translate-y-1/2 sm:w-auto ${
                    i % 2 === 0 ? "right-0" : "right-[3.5%]"
                  }`}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-[clamp(2rem,5vh,3rem)] flex items-end justify-between gap-6">
          <p className="label label-loose text-ink/45 lg:text-bone/45">{EVENT.format}</p>
          <p className="hand whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55">
            {NOTES.survive}
          </p>
        </div>
      </div>
    </Section>
  );
}
