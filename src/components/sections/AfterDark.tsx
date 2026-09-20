"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import EdgeLabel from "@/components/ui/EdgeLabel";
import Words from "@/components/fx/Words";
import { AFTER_DARK, NOTES } from "@/lib/site";

/**
 * 04 — the night's non-coding half, told as three scenes rather than three
 * cards. Each is a field flip with its own props: a doorway you can push open,
 * a trail that crosses the page, and a tabletop at midnight.
 */
export default function AfterDark() {
  return (
    <>
      <Section
        id="after-dark"
        field="bone"
        className="pb-[clamp(2.5rem,6vh,4rem)] pt-[clamp(5.5rem,16vh,13rem)] md:pt-[clamp(5.5rem,25vh,13rem)]"
      >
        <div className="px-[var(--edge)]">
          <SectionLabel index="04">After Dark</SectionLabel>
        </div>

        <div className="mt-[clamp(1.5rem,4vh,3rem)] grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <Words
            as="h2"
            className="brush lean -rotate-[1.8deg] select-none pl-[var(--edge)] text-[clamp(3.6rem,13vw,11.5rem)] leading-[0.84]"
          >
            {"After\nDark"}
          </Words>

          <div className="relative px-[var(--edge)] lg:pl-0">
            {/* the eyes only read as eyes when there is dark around them, so
                they sit inside an ink blob rather than on the cream */}
            <div className="relative mx-auto grid w-fit place-items-center lg:mx-0">
              <span
                aria-hidden="true"
                className="absolute h-[clamp(13rem,20vw,17rem)] w-[clamp(15rem,24vw,21rem)] bg-ink [border-radius:58%_42%_46%_54%/52%_58%_42%_48%]"
              />
              <Sprite name="eyes-glow" scale={0.69} drift={26} idle={6} className="relative" />
            </div>
            <p className="hand mt-6 max-w-[12ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.5rem)] text-ink/60">
              {NOTES.afterDark}
            </p>
          </div>
        </div>

        <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-end justify-between gap-6 px-[var(--edge)]">
          <p className="label label-loose whitespace-pre-line text-ink/45">
            Same people.{"\n"}Different kind of chaos.
          </p>
        </div>
      </Section>

      <HauntedHouse />
      <TreasureHunt />
      <MidnightGames />
    </>
  );
}

/** 01 — the doorway. Hovering pushes it open and the cat inside looks up. */
function HauntedHouse() {
  const [open, setOpen] = useState(false);
  const item = AFTER_DARK[0];

  return (
    <Section
      field="ink"
      forms={[{ shape: "spillRight", tone: "bone", at: "inset-x-0 top-0 w-full h-[15vh] md:h-[24vh]" }]}
      className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(5.5rem,18vh,14rem)] md:pt-[clamp(5.5rem,27vh,14rem)]"
    >
      <GhostIndex className="hidden left-[52%] top-[14%] text-[clamp(9rem,21vw,19rem)] lg:block">01</GhostIndex>
      <EdgeLabel side="right" className="top-1/2 -translate-y-1/2">Haunted House</EdgeLabel>

      <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Scene
          index={item.index}
          title={item.title}
          note={item.note}
          cta={item.cta}
          tone="ink"
          onActive={setOpen}
        />

        <div data-scrub="up" data-scrub-amount="16" className="relative mx-auto flex w-full max-w-[26rem] items-center justify-center">
          {/* the door itself — the cat inside comes forward as it opens */}
          <div
            className="relative"
            onPointerEnter={() => setOpen(true)}
            onPointerLeave={() => setOpen(false)}
          >
            <Sprite
              name="door-haunted"
              scale={0.95}
              drift={10}
              className="relative z-10 drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-700 ease-[var(--ease-out-soft)]"
              style={{ opacity: open ? 1 : 0, transform: `translate(-50%,-50%) scale(${open ? 1 : 0.82})` }}
            >
              <Sprite name="eyes-glow" scale={0.41} />
            </div>
          </div>

          <Sprite name="cat-scared" scale={0.6} drift={14} idle={5} className="absolute -bottom-[6%] right-[2%] z-20" />
        </div>
      </div>

      <p className="hand mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[14ch] whitespace-pre-line px-[var(--edge)] text-[clamp(1rem,1.5vw,1.4rem)] text-bone/55">
        {item.aside}
      </p>
    </Section>
  );
}

/** 02 — the trail. Props sit along a dashed lime route across the field. */
function TreasureHunt() {
  const item = AFTER_DARK[1];
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // the route assembles in reading order — note, trail, pin, trail, X
      gsap.from(scene.current!.children, {
        scale: 0.7,
        autoAlpha: 0,
        rotate: -10,
        duration: 0.75,
        stagger: 0.09,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: scene.current, start: "top 82%", once: true },
      });
    }, scene);
    return () => ctx.revert();
  }, []);

  return (
    <Section
      field="bone"
      forms={[{ shape: "shelf", tone: "ink", at: "inset-x-0 top-0 w-full h-[9vh] md:h-[13vh]" }]}
      className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(5rem,12vh,10rem)] md:pt-[clamp(5rem,18vh,10rem)]"
    >
      <GhostIndex className="hidden right-[6%] top-[10%] text-[clamp(9rem,21vw,19rem)] lg:block">02</GhostIndex>
      <EdgeLabel side="left" className="top-1/2 -translate-y-1/2">Treasure Hunt</EdgeLabel>

      <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        {/* the route reads left to right, so the scene leads on desktop */}
        <div ref={scene} data-scrub="up" data-scrub-amount="12" className="relative order-2 min-h-[clamp(16rem,26vw,22rem)] lg:order-1">
          <Sprite name="trail-dash" scale={0.42} drift={22} className="absolute left-[30%] top-[22%]" />
          <Sprite name="trail-dash" scale={0.5} drift={26} className="absolute left-[44%] top-[50%]" />
          <Sprite name="treasure-x" scale={0.4} drift={18} className="absolute right-[10%] top-[30%]" />
          <Sprite name="map-pin" scale={0.2} drift={12} className="absolute right-[4%] bottom-[14%] opacity-70" />
          <Sprite
            name="cat-treasure"
            scale={1.12}
            drift={16}
            idle={5}
            className="absolute -bottom-[6%] left-[38%] z-10"
          />
        </div>

        <div className="order-1 lg:order-2">
          <Scene index={item.index} title={item.title} note={item.note} cta={item.cta} tone="bone" />
          <p className="hand mt-[clamp(1.5rem,4vh,2.25rem)] max-w-[14ch] whitespace-pre-line text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55">
            {item.aside}
          </p>
        </div>
      </div>
    </Section>
  );
}

/** 03 — the tabletop. Moon up, pieces scattered, cat on the controller. */
function MidnightGames() {
  const item = AFTER_DARK[2];
  const table = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(table.current!.children, {
        y: -26,
        rotate: 14,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "back.out(2)",
        scrollTrigger: { trigger: table.current, start: "top 84%", once: true },
      });
    }, table);
    return () => ctx.revert();
  }, []);

  return (
    <Section
      field="ink"
      forms={[{ shape: "notch", tone: "bone", at: "inset-x-0 top-0 w-full h-[12vh] md:h-[20vh]" }]}
      className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(5.5rem,16vh,13rem)] md:pt-[clamp(5.5rem,24vh,13rem)]"
    >
      <GhostIndex className="hidden left-[46%] bottom-[12%] text-[clamp(9rem,21vw,19rem)] lg:block">03</GhostIndex>
      <EdgeLabel side="right" className="top-1/2 -translate-y-1/2">Midnight Games</EdgeLabel>

      <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Scene index={item.index} title={item.title} note={item.note} cta={item.cta} tone="ink" />
          <p className="hand mt-[clamp(1.5rem,4vh,2.25rem)] max-w-[14ch] whitespace-pre-line text-[clamp(1rem,1.5vw,1.4rem)] text-bone/55">
            {item.aside}
          </p>
        </div>

        <div ref={table} data-scrub="down" data-scrub-amount="10" className="relative min-h-[clamp(15rem,24vw,20rem)]">
          <Sprite name="moon" scale={0.44} drift={30} idle={7} className="absolute right-[12%] top-0" />
          <Sprite name="dice" scale={0.5} drift={16} idle={4} className="absolute left-[30%] bottom-[6%] rotate-12" />
          <Sprite
            name="cat-controller"
            scale={1.02}
            drift={12}
            idle={5}
            className="absolute right-[4%] bottom-[8%] z-10"
          />
        </div>
      </div>

      <p className="label label-loose mt-[clamp(2.5rem,6vh,4rem)] px-[var(--edge)] text-bone/40">
        Night fuels better ideas.
      </p>
    </Section>
  );
}

/** The shared wording block for one After Dark scene. */
function Scene({
  index,
  title,
  note,
  cta,
  tone,
  onActive,
}: {
  index: string;
  title: readonly string[];
  note: string;
  cta: string;
  tone: "ink" | "bone";
  onActive?: (v: boolean) => void;
}) {
  const link = useRef<HTMLAnchorElement>(null);
  const muted = tone === "ink" ? "text-bone/60" : "text-ink/60";
  const rule = tone === "ink" ? "bg-bone/40" : "bg-ink/40";

  return (
    <div>
      <span className="label text-lime">{index}</span>
      <Words as="h3" className="brush mt-3 -rotate-[1.2deg] text-[clamp(2.4rem,6.4vw,5rem)] leading-[0.88]">
        {`${title[0]}\n${title[1]}`}
      </Words>
      {/* The note is already written as separate lines, so it is set as
          separate lines — each one its own rule-separated beat at display
          size. These scenes carry two or three sentences between them and
          reading them as a caption is what left the frame looking empty;
          reading them as a list is what the writing was always doing. */}
      <ul
        data-stagger
        className={`mt-[clamp(1.25rem,3.5vh,2.25rem)] max-w-[22ch] ${muted}`}
      >
        {note.split("\n").map((line, i) => (
          <li
            key={line}
            className={`display py-[clamp(0.5rem,1.4vh,0.85rem)] text-[clamp(1.25rem,2.6vw,2.1rem)] leading-[1.08] tracking-[-0.015em] ${
              i > 0 ? (tone === "ink" ? "border-t border-bone/15" : "border-t border-ink/15") : ""
            }`}
          >
            {line}
          </li>
        ))}
      </ul>

      <a
        ref={link}
        href="#register"
        onPointerEnter={() => onActive?.(true)}
        onPointerLeave={() => onActive?.(false)}
        onFocus={() => onActive?.(true)}
        onBlur={() => onActive?.(false)}
        className="group label mt-[clamp(1.25rem,3vh,2rem)] inline-flex items-center gap-3 outline-none"
      >
        <span className="relative">
          {cta}
          <span
            aria-hidden="true"
            className={`absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-0 ${rule}`}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-lime transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
        </span>
        <svg
          viewBox="0 0 16 10"
          className="h-[0.7em] w-[1.1em] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 5h13M10 1l4 4-4 4" />
        </svg>
      </a>
    </div>
  );
}
