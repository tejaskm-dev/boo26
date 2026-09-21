"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import { EXPERIENCE, NOTES } from "@/lib/site";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * 02 — black field. The heading fills the left half at billboard scale and the
 * curious cat crawls over the top of it, which is the composition the comp
 * uses. The three beats are a hairline-ruled list, not cards.
 *
 * This is the section that takes the screen: it pins, and the three beats are
 * handed over one at a time while the heading holds. The scroll is spent on
 * the list rather than on moving the page, so the reader arrives at each beat
 * instead of passing it.
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
    mm.add("(min-width: 1024px)", () => {
      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", el);
      if (beats.length < 2) return;

      // one screen of scroll per beat after the first
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${window.innerHeight * (beats.length - 1)}`,
          pin: sec,
          pinSpacing: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      // Each beat holds for most of its screen and then hands over quickly.
      // Fading the first one out the moment the pin engages means the reader
      // never gets to rest on it; and because the beats share a grid cell, the
      // out and the in must not overlap or one set of words prints through the
      // other.
      const OUT = 0.22;
      beats.forEach((beat, i) => {
        if (i === 0) return;
        tl.to(beats[i - 1], { autoAlpha: 0, yPercent: -22, duration: OUT }, i - 2 * OUT)
          .fromTo(
            beat,
            { autoAlpha: 0, yPercent: 26 },
            { autoAlpha: 1, yPercent: 0, duration: OUT },
            i - OUT,
          );
      });

      gsap.set(beats.slice(1), { autoAlpha: 0, yPercent: 26 });
      return () => tl.scrollTrigger?.kill();
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

        {/* the beats are laid on top of one another and handed over in turn */}
        <ul className="relative grid gap-2 px-[var(--edge)] lg:gap-0 lg:pl-0 lg:pr-[var(--edge)]">
          {EXPERIENCE.map((e, i) => (
            <li
              key={e.label}
              data-beat
              style={{ marginLeft: `${[0, 3.5, 1.5][i] ?? 0}vw`, rotate: `${[-0.6, 0.8, -0.4][i] ?? 0}deg` }}
              className="border-l-2 border-lime/70 py-[clamp(1.5rem,4vh,2.5rem)] pl-[clamp(1.25rem,2.5vw,2.25rem)] lg:col-start-1 lg:row-start-1 lg:self-center"
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
