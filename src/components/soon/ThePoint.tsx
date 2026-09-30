"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import Awake from "./Awake";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";
import { SOON, TROLL } from "@/lib/soon";
import { buzz, shiver, troll } from "./troll";

/**
 * 03 — the only thing the teaser explains, and it explains it by doing it.
 *
 * A reaction test, one word to a screen: JUMP lunges at you, FREEZE won't
 * move while everything else does (it holds on position: sticky, so your
 * scroll never stops — a page that stops scrolling feels broken, not scary),
 * LAUGH can't keep still, "lean in" is too small to read from where you're
 * sitting, and WHAT THE— gets cut off. Then the bar comes off the one line
 * the file in 01 was hiding: why.
 */
export default function ThePoint() {
  const t = SOON.point;
  const fake = useRef<HTMLDivElement>(null);
  const jump = useRef<HTMLDivElement>(null);
  const jumpWord = useRef<HTMLHeadingElement>(null);
  const jumpCat = useRef<HTMLSpanElement>(null);
  const freeze = useRef<HTMLDivElement>(null);
  const laugh = useRef<HTMLDivElement>(null);
  const laughCat = useRef<HTMLSpanElement>(null);
  const lean = useRef<HTMLDivElement>(null);
  const what = useRef<HTMLDivElement>(null);
  const why = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [relaxed, setRelaxed] = useState(false);
  // the still version tells the same story, all at once
  const still = useReducedMotion();

  useEffect(() => {
    const section = jump.current?.closest("section");
    if (!section) return;
    if (prefersReducedMotion()) {
      lean.current!.dataset.close = "true";
      what.current!.dataset.slammed = "true";
      why.current!.dataset.open = "true";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const timers: number[] = [];
    const grain = document.querySelector<HTMLElement>(".grain");

    const ctx = gsap.context(() => {
      // jump scare in 3… 2… 1… — and then nothing
      ScrollTrigger.create({
        trigger: fake.current,
        start: "top 78%",
        once: true,
        onEnter: () => {
          t.fakeout.forEach((_, i) => {
            if (i) timers.push(window.setTimeout(() => setStep(i), i * 800));
          });
          timers.push(
            window.setTimeout(() => {
              setRelaxed(true);
              troll("fakeout", TROLL.justKidding);
            }, t.fakeout.length * 800 + 900),
          );
        },
      });

      // …then the real one, a screen later, once you've relaxed
      gsap.set([jumpWord.current, jumpCat.current], { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: jump.current,
        start: "top 58%",
        once: true,
        onEnter: () => {
          gsap
            .timeline()
            .fromTo(
              jumpWord.current,
              { scale: 0.3, yPercent: 40, autoAlpha: 0 },
              { scale: 1.16, yPercent: 0, autoAlpha: 1, duration: 0.24, ease: "power4.out" },
            )
            .to(jumpWord.current, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.42)" })
            .fromTo(
              jumpCat.current,
              { yPercent: 170, rotation: -28, autoAlpha: 0 },
              { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.9)" },
              0.04,
            );
          shiver(jump.current, 10);
          buzz(70);
          troll("jump", TROLL.jump);
        },
      });

      // FREEZE: it holds, and so does everything alive on the page
      ScrollTrigger.create({
        trigger: freeze.current,
        start: "top 30%",
        end: "bottom 72%",
        onToggle: ({ isActive }) => {
          section.dataset.frozen = isActive ? "true" : "false";
          if (grain) grain.dataset.frozen = isActive ? "true" : "false";
        },
      });

      // LAUGH: can't keep a straight face
      ScrollTrigger.create({
        trigger: laugh.current,
        start: "top 78%",
        end: "bottom 22%",
        onToggle: ({ isActive }) => {
          laugh.current!.dataset.laughing = isActive ? "true" : "false";
        },
      });
      gsap.from(laughCat.current, {
        xPercent: 140,
        rotation: 200,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: laugh.current, start: "top 62%", once: true },
      });

      // lean in: close enough, and it knows
      ScrollTrigger.create({
        trigger: lean.current,
        start: "top 42%",
        end: "bottom 58%",
        onToggle: ({ isActive }) => {
          lean.current!.dataset.close = isActive ? "true" : "false";
        },
      });

      // WHAT THE— types itself out as you scroll, and gets cut off
      const letters = what.current!.querySelectorAll("[data-letter]");
      gsap.fromTo(
        letters,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: what.current, start: "top 82%", end: "top 38%", scrub: 0.3 },
        },
      );
      ScrollTrigger.create({
        trigger: what.current,
        start: "top 36%",
        once: true,
        onEnter: () => {
          what.current!.dataset.slammed = "true";
          timers.push(window.setTimeout(() => shiver(what.current, 7), 150));
        },
      });

      // why
      ScrollTrigger.create({
        trigger: why.current,
        start: "top 66%",
        once: true,
        onEnter: () => {
          why.current!.dataset.open = "true";
        },
      });
    }, section);

    // pinch-zooming to read "lean in" is cheating
    const vv = window.visualViewport;
    const onZoom = () => {
      if (!vv || vv.scale < 1.15) return;
      const r = lean.current?.getBoundingClientRect();
      if (r && r.bottom > 0 && r.top < window.innerHeight) troll("cheat", TROLL.cheating);
    };
    vv?.addEventListener("resize", onZoom);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      vv?.removeEventListener("resize", onZoom);
      if (grain) delete grain.dataset.frozen;
      ctx.revert();
    };
  }, [t.fakeout]);

  const word = "brush select-none text-center leading-[0.84]";

  return (
    <Section
      id="point"
      field="bone"
      forms={[{ shape: "notch", tone: "ink", at: "inset-x-0 top-0 w-full h-[11vh] md:h-[18vh]" }]}
      className="pb-[clamp(4rem,11vh,8rem)] pt-[clamp(5rem,14vh,11rem)] md:pt-[clamp(5rem,20vh,11rem)]"
    >
      <Awake />

      <div className="px-[var(--edge)]">
        <SectionLabel index="03">{t.label}</SectionLabel>
      </div>

      {/* the warning */}
      <div ref={fake} className="mt-[clamp(2.5rem,7vh,4.5rem)] flex flex-col items-center gap-3 px-[var(--edge)] text-center">
        <p className="label label-loose flex items-center gap-3 text-ink/70" aria-live="off">
          <span aria-hidden="true" className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime [box-shadow:0_0_0_1px_rgba(8,8,8,0.35)]" />
          {t.fakeout[still ? t.fakeout.length - 1 : step]}
        </p>
        <p
          className={`hand -rotate-[3deg] text-[clamp(1.1rem,1.6vw,1.45rem)] text-ink/55 transition-opacity duration-700 ${
            relaxed || still ? "opacity-100" : "opacity-0"
          }`}
        >
          {t.relax}
        </p>
      </div>

      {/* room to relax in */}
      <div aria-hidden="true" className="h-[40svh]" />

      {/* JUMP */}
      <div ref={jump} className="relative grid min-h-[78svh] place-items-center px-[var(--edge)]">
        <h3 ref={jumpWord} className={`${word} -rotate-[2.5deg] text-[clamp(5rem,22vw,17rem)]`}>
          {t.words.jump}
        </h3>
        <span ref={jumpCat} className="absolute bottom-[12%] right-[8%] block md:right-[20%]">
          <span className="soon-float soon-loop block">
            <Sprite name="cat-pop-jump" scale={0.62} />
          </span>
        </span>
      </div>

      {/* FREEZE — held while the page goes past */}
      <div ref={freeze} className="relative h-[165svh]">
        <div className="sticky top-[30svh] grid place-items-center px-[var(--edge)]">
          <h3 className={`${word} rotate-[1.5deg] text-[clamp(4.6rem,20vw,16rem)]`}>{t.words.freeze}</h3>
          <Sprite name="cat-oneeye" scale={0.55} className="absolute right-[10%] top-[70%] md:right-[22%]" />
        </div>
      </div>

      {/* LAUGH */}
      <div ref={laugh} className="relative grid min-h-[78svh] place-items-center overflow-x-clip px-[var(--edge)]">
        <h3 className={`${word} -rotate-[1.5deg] text-[clamp(4.6rem,20vw,16rem)]`} aria-label={t.words.laugh}>
          {[...t.words.laugh].map((ch, i) => (
            <span key={i} aria-hidden="true" className="soon-letter soon-loop" style={{ "--i": i } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </h3>
        <span ref={laughCat} className="absolute bottom-[8%] left-[10%] block md:left-[22%]">
          <span className="soon-float soon-loop block [animation-delay:-1.2s]">
            <Sprite name="cat-playful" scale={0.5} />
          </span>
        </span>
      </div>

      {/* lean in */}
      <div ref={lean} className="grid min-h-[88svh] place-items-center px-[var(--edge)] text-center">
        <div>
          <p className="label text-[0.6rem] tracking-[0.34em] text-ink/75">{t.words.lean}</p>
          <p className="soon-lean-up label mt-2 text-[0.44rem] tracking-[0.3em] text-ink/45">{t.leanUp}</p>
        </div>
      </div>

      {/* WHAT THE— */}
      <div ref={what} className="relative grid min-h-[78svh] place-items-center px-[var(--edge)]">
        <h3 className={`${word} flex flex-wrap items-center justify-center gap-x-[0.28em] -rotate-[1deg] text-[clamp(3.6rem,14vw,11.5rem)]`} aria-label={t.words.what}>
          {/* letter by letter, but a word never breaks across lines — and the
              bar that cuts it off stays with the last one */}
          {t.words.what.split(" ").map((w, wi, all) => (
            <span key={wi} className="inline-flex items-center whitespace-nowrap">
              {[...w].map((ch, i) => (
                <span key={i} data-letter aria-hidden="true" className="inline-block">
                  {ch}
                </span>
              ))}
              {wi === all.length - 1 ? (
                <span className="soon-bar soon-cutbar label ml-[0.1em] min-w-[3.6em] text-[0.18em] leading-[2.6]">{t.language}</span>
              ) : null}
            </span>
          ))}
        </h3>
      </div>

      {/* why */}
      <div className="mt-[clamp(1rem,4vh,3rem)] flex flex-col items-center px-[var(--edge)] text-center">
        <p className="label label-loose flex items-center gap-3 text-ink/50">
          <span className="text-lime [text-shadow:0_0_1px_rgba(8,8,8,0.7)]">{"●"}</span>
          {t.why}
        </p>
        <div ref={why} className="relative mt-[clamp(1rem,3vh,1.75rem)] inline-block">
          <h2 className="brush -rotate-[1.2deg] whitespace-pre-line text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.86]">{t.reveal}</h2>
          <span aria-hidden="true" className="soon-whybar absolute inset-[-6%_-4%] block rounded-[3px_9px_4px_8px] bg-ink" />
        </div>
        <Sprite name="squiggle-lime" scale={0.36} className="mt-4 rotate-[10deg]" />
        <p className="hand mt-4 max-w-[18ch] -rotate-[2deg] whitespace-pre-line text-[clamp(1.1rem,1.7vw,1.5rem)] text-ink/60">{t.note}</p>
      </div>
    </Section>
  );
}
