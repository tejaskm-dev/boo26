"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import { EXPERIENCE, NOTES } from "@/lib/site";
import { LG, prefersReducedMotion } from "@/lib/motion";

/** Hand-placed: each beat sits a little off the one before it. */
const OFFSET = [0, 3.5, 1.5]; // vw
const TILT = [-0.6, 0.8, -0.4]; // deg

/** Share of each handover's scroll spent filling the next title. */
const FILL = 0.58;
/** How long a reader can stand still mid-stack before the note offers a way on. */
const NUDGE_AFTER = 1600;

/**
 * Scroll per handover. Most of a screen, but capped: it is wheel clicks the
 * reader pays in, and a tall monitor shouldn't make the wait longer.
 */
const step = () => Math.min(window.innerHeight * 0.8, 720);

/**
 * 02 — black field. The heading fills the left half at billboard scale and the
 * curious cat crawls over the top of it, which is the composition the comp
 * uses. The three beats are a hairline-ruled list, not cards.
 *
 * On a wide screen this is the section that takes the screen: it pins, and the
 * beats are handed over one at a time while the heading holds. A pin on its
 * own reads as the page stopping — a visitor scrolled into it, saw nothing
 * move, and took it for the end of the site. So the stack shows its hand. The
 * beats still to come wait underneath as hollow titles, and scrolling fills
 * the next one with lime from the bottom — the fill the preloader counts up
 * with — until it takes over. No stretch of the pin is dead scroll, and anyone
 * who stops anyway is told to keep going.
 */
export default function TheExperience() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current;
    // the wrapper is display:contents so it has no box of its own; the section
    // is what holds the viewport
    const sec = el?.closest("section");
    if (!el || !sec) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Only on a screen wide enough for the heading and the beats to sit side by
    // side. On a phone the column is nearly empty, so holding the viewport for
    // two extra screens buys nothing and costs the reader two screens.
    mm.add(LG, () => {
      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", el);
      const box = el.querySelector<HTMLElement>("[data-queue-box]");
      const queue = gsap.utils.toArray<HTMLElement>("[data-queue]", el);
      const fills = gsap.utils.toArray<HTMLElement>("[data-fill]", el);
      const nudge = el.querySelector<HTMLElement>("[data-nudge]");
      const handovers = beats.length - 1;
      if (!box || handovers < 1 || queue.length !== handovers || fills.length !== handovers) return;

      // Someone who stops mid-stack anyway gets a note beside the filling
      // title. It waits until they are still, goes the moment they scroll, and
      // retires once they have been through to the end.
      let st: ScrollTrigger | undefined;
      let idle = 0;
      let seen = false;
      const hush = () => {
        window.clearTimeout(idle);
        if (nudge?.dataset.show) delete nudge.dataset.show;
      };
      const watch = () => {
        hush();
        if (!nudge || !st || seen || st.end <= st.start) return;
        const y = st.scroll();
        const t = ((y - st.start) / (st.end - st.start)) * handovers;
        if (t >= handovers) {
          seen = true;
          return;
        }
        // only inside the pin, and only while a title is still waiting
        if (y < st.start - 2 || t > handovers - 1 + FILL) return;
        idle = window.setTimeout(() => {
          // it sits just after whichever title is at the front of the queue
          const front = queue[Math.min(handovers - 1, Math.max(0, Math.floor(t + 1 - FILL)))];
          nudge.style.left = `${front.offsetLeft + front.offsetWidth}px`;
          nudge.dataset.show = "true";
        }, NUDGE_AFTER);
      };

      // Every row of the queue is one line of the same type, so a slot is a
      // row plus the gap. Read from layout, which the transforms don't touch.
      const slot = () =>
        queue.length > 1 ? queue[1].offsetTop - queue[0].offsetTop : queue[0].offsetHeight;
      // The beats are hand-placed at different indents; the queue follows the
      // one on screen, so it always reads as the rest of that list.
      const indent = (i: number) => parseFloat(getComputedStyle(beats[i]).marginLeft) || 0;

      // Every tween says where it starts rather than reading the page, so a
      // refresh from halfway down the pin lands in the same place.
      //
      // Only the first tween on each element draws its start straight away,
      // and that is what sets the opening frame. It is also what GSAP writes
      // down as the element's own styles, so when the screen drops below lg
      // everything goes back to the plain list. Starting the elements with
      // gsap.set instead let GSAP's revert settle on the opening frame — the
      // later beats hidden — and a window narrowed past lg, or a tablet turned
      // upright, showed one beat and nothing after it. The rest wait for the
      // playhead: two tweens on one element both drawing their start at once
      // would leave the later one's showing.
      const started = new Set<Element>();
      const first = (target: Element) => {
        const isFirst = !started.has(target);
        started.add(target);
        return isFirst;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${step() * handovers}`,
          pin: sec,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            st = self;
            watch();
          },
        },
      });
      st = tl.scrollTrigger;

      for (let s = 1; s <= handovers; s++) {
        const at = s - 1;
        const out = at + FILL;

        // The next title fills as the reader scrolls, from the moment the pin
        // takes hold. Linear, so the level is the scroll.
        tl.fromTo(
          fills[s - 1],
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: FILL, immediateRender: first(fills[s - 1]) },
          at,
        );

        // Full, it takes over. The beat on screen lifts away, and the filled
        // title goes up after it...
        tl.fromTo(
          beats[s - 1],
          { autoAlpha: 1, yPercent: 0 },
          { autoAlpha: 0, yPercent: -18, ease: "power1.in", duration: 0.2, immediateRender: first(beats[s - 1]) },
          out,
        ).fromTo(
          queue[s - 1],
          { y: () => -at * slot(), autoAlpha: 1 },
          {
            y: () => -(at + 0.6) * slot(),
            autoAlpha: 0,
            ease: "power1.in",
            duration: 0.2,
            immediateRender: first(queue[s - 1]),
          },
          out,
        );

        // ...the rest of the queue moves up a place, under the new beat...
        queue.slice(s).forEach((row, j) => {
          tl.fromTo(
            row,
            { y: () => -at * slot(), autoAlpha: 0.4 },
            {
              y: () => -s * slot(),
              autoAlpha: j === 0 ? 1 : 0.4,
              ease: "power2.inOut",
              duration: 0.3,
              immediateRender: first(row),
            },
            out + 0.06,
          );
        });
        tl.fromTo(
          box,
          { x: () => indent(at) },
          { x: () => indent(s), ease: "power2.inOut", duration: 0.3, immediateRender: first(box) },
          out + 0.06,
        );

        // ...and the new beat rises in. It waits for the last one to be gone:
        // they share a grid cell, and any overlap prints one set of words
        // through the other. The rise is short, so it never dips into the
        // queue below it.
        tl.fromTo(
          beats[s],
          { autoAlpha: 0, yPercent: 12 },
          {
            autoAlpha: 1,
            yPercent: 0,
            ease: "power3.out",
            duration: 1 - FILL - 0.2,
            immediateRender: first(beats[s]),
          },
          out + 0.2,
        );
      }

      window.addEventListener("scroll", watch, { passive: true });

      return () => {
        window.removeEventListener("scroll", watch);
        hush();
        tl.scrollTrigger?.kill();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <Section
      id="experience"
      field="ink"
      forms={[{ shape: "shelf", tone: "bone", at: "inset-x-0 top-0 w-full h-[9vh] md:h-[13vh]" }]}
      className="flex flex-col justify-center pb-[clamp(3rem,8vh,5.5rem)] pt-[clamp(5rem,13vh,11rem)] md:pt-[clamp(5rem,20vh,11rem)] lg:min-h-screen"
    >
      <div ref={root} className="contents">
      <div className="flex items-start justify-between gap-6 px-[var(--edge)]">
        <SectionLabel index="02" className="text-bone">
          The Experience
        </SectionLabel>
        <p className="label hidden max-w-[10ch] text-right text-bone/45 md:block">More than just code.</p>
      </div>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-x-[clamp(2rem,4vw,4rem)] gap-y-[clamp(2rem,5vh,3.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="relative min-w-0">
          {/* sized to its own column so it can never run into the list */}
          <Words
            as="h2"
            className="brush lean rotate-[1.2deg] select-none pl-[var(--edge)] text-[clamp(3.7rem,9.2vw,7.5rem)] leading-[0.86] text-bone"
          >
            {"The\nExperience"}
          </Words>

          <RiseIn className="absolute -top-[clamp(5.5rem,13vw,11rem)] -right-[4%] z-10 md:right-[1%]" start="top 94%">
            <Sprite name="cat-curious" scale={0.66} drift={20} idle={6} />
          </RiseIn>

          <p className="mt-[clamp(1.75rem,4.5vh,2.75rem)] flex items-center gap-3 px-[var(--edge)]">
            <span className="label label-loose whitespace-pre-line text-bone/70">
              Part hackathon.{"\n"}Part Halloween night.
            </span>
          </p>
        </div>

        {/* The beats are laid on top of one another and handed over in turn,
            with the ones still to come queued underneath — but only while the
            script doing the handing over is running. The stacking and the
            queue live in globals.css under the same conditions; without them
            this is an ordinary list. */}
        <div className="relative grid min-w-0">
          <ul className="relative grid gap-2 px-[var(--edge)] lg:gap-0 lg:pl-0 lg:pr-[var(--edge)]">
            {EXPERIENCE.map((e, i) => (
              <li
                key={e.label}
                data-beat
                style={{ marginLeft: `${OFFSET[i] ?? 0}vw`, rotate: `${TILT[i] ?? 0}deg` }}
                className="border-l-2 border-lime/70 py-[clamp(1.5rem,4vh,2.5rem)] pl-[clamp(1.25rem,2.5vw,2.25rem)]"
              >
                <span className="label text-lime">{e.index}</span>
                <h3 className="brush mt-3 text-[clamp(2.6rem,6.4vw,5rem)] leading-[0.92] text-bone">
                  {e.label}
                </h3>
                <p className="body-copy mt-4 max-w-[30ch] text-[clamp(1rem,1.5vw,1.3rem)] text-bone/65">
                  {e.note}
                </p>
              </li>
            ))}
          </ul>

          {/* the queue is a picture of what's coming — the list above is the
              content, so this is kept from assistive tech */}
          <div
            aria-hidden="true"
            data-queue-box
            className="beat-queue pointer-events-none absolute left-0 top-full mt-[clamp(0.35rem,1.4vh,0.9rem)] flex-col items-start gap-[clamp(0.35rem,1.1vh,0.7rem)] pl-[calc(clamp(1.25rem,2.5vw,2.25rem)+2px)]"
          >
            {EXPERIENCE.slice(1).map((e, i) => (
              <div
                key={e.label}
                data-queue
                style={{ rotate: `${TILT[i + 1] ?? 0}deg` }}
                className="flex items-baseline gap-[0.9rem]"
              >
                <span className="label text-lime/80">{e.index}</span>
                <span className="brush relative text-[clamp(1.5rem,2.5vw,2.4rem)] leading-[0.92]">
                  <span className="beat-hollow">{e.label}</span>
                  <span data-fill className="beat-fill absolute inset-0 text-lime">
                    {e.label}
                  </span>
                </span>
              </div>
            ))}

            <p
              data-nudge
              className="beat-nudge hand absolute left-0 top-0 ml-[clamp(1rem,2vw,1.75rem)] flex -rotate-[2deg] items-center gap-2 whitespace-nowrap text-[clamp(1rem,1.4vw,1.3rem)] text-bone/60"
            >
              {NOTES.more}
              <svg
                viewBox="0 0 16 30"
                className="h-[1.2em] w-[0.65em]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
              >
                <path d="M8 1v26M2.5 21.5 8 28l5.5-6.5" />
              </svg>
            </p>
          </div>
        </div>
      </div>

      <div data-scrub="up" data-scrub-amount="8" className="mt-[clamp(2.5rem,6vh,4rem)] flex items-end justify-between gap-6 px-[var(--edge)]">
        <p className="label label-loose whitespace-pre-line text-bone/45">
          Build. Wander off.{"\n"}Get spooked. Come back.
        </p>
        <p className="hand whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-bone/55">
          {NOTES.survive}
        </p>
      </div>
      </div>
    </Section>
  );
}
