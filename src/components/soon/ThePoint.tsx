"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import Awake from "./Awake";
import InkEyes from "./InkEyes";
import InkField from "./InkField";
import { HERO_FIELD } from "@/lib/shapes";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";
import { SOON, TROLL } from "@/lib/soon";
import { buzz, shiver, troll } from "./troll";

/** the ink JUMP lands on */
const SPLASH = {
  view: "0 0 1000 700",
  d: "M500 40C600 30 640 110 720 100C820 88 900 60 940 140C980 220 880 270 900 340C920 410 990 450 960 530C930 610 820 590 760 640C700 690 600 680 520 660C440 640 380 690 300 670C200 646 160 590 100 560C30 526 10 450 50 390C90 330 40 270 70 200C100 120 200 140 260 100C330 54 400 50 500 40Z",
};
/** the lime LAUGH can't keep still on */
const GIGGLE = {
  view: "0 0 1000 700",
  d: "M120 120C220 40 360 90 470 70C600 46 700 20 820 70C930 116 990 220 960 330C930 430 980 520 900 590C800 676 660 620 540 650C420 680 300 690 200 640C90 584 30 500 50 400C70 300 20 200 120 120Z",
};
/** the hero's cat-head field, out of its corner */
const HEAD = { view: "-180 540 620 480", d: HERO_FIELD.shapes[1] };
/** the two masses that close in on "lean in" */
const CLOSE_L = {
  view: "0 0 600 1000",
  d: "M-200 120C-100 60 40 40 140 70C240 100 260 160 330 210C400 260 520 300 540 400C560 500 430 540 440 620C450 700 560 760 500 840C440 920 300 900 200 930C100 960 0 990 -200 960Z",
};
const CLOSE_R = {
  view: "0 0 600 1000",
  d: "M800 80C700 40 560 60 480 110C400 160 410 230 330 280C250 330 90 330 70 430C50 530 200 560 180 650C160 740 60 780 110 860C160 940 330 930 430 950C530 970 660 990 800 960Z",
};
/** where each "ha" is scrawled round LAUGH */
const HA_AT = [
  "left-[6%] top-[16%] -rotate-[12deg] text-[clamp(1.6rem,3vw,2.6rem)]",
  "right-[8%] top-[12%] rotate-[8deg] text-[clamp(1.3rem,2.4vw,2rem)]",
  "left-[10%] bottom-[24%] rotate-[6deg] text-[clamp(1.8rem,3.4vw,3rem)]",
  "right-[5%] bottom-[30%] -rotate-[10deg] text-[clamp(1.2rem,2.2vw,1.8rem)]",
  "left-[42%] top-[5%] -rotate-[4deg] text-[clamp(1.1rem,2vw,1.6rem)]",
  "left-[56%] bottom-[8%] rotate-[14deg] text-[clamp(1.5rem,2.8vw,2.4rem)]",
];

/**
 * 03 — the only thing the teaser explains, and it explains it by doing it.
 *
 * A reaction test, one word to a screen, each one acting itself out in the
 * site's own ink. JUMP lands on a splash of it, with something in there
 * looking back. FREEZE holds still while the page goes past (position:
 * sticky — the scroll itself never stops, because a page that stops
 * scrolling feels broken, not scary), and so does everything alive on the
 * page, except the hero's cat-head down in the corner, which only sees you
 * while you're moving. LAUGH can't keep still, on a lime splash with the ha's
 * scrawled round it. "lean in" is too small to read, and the dark closes in
 * on it while you try. WHAT THE— gets cut off. Then the bar comes off the one
 * line the file in 01 was hiding: why.
 */
export default function ThePoint() {
  const t = SOON.point;
  const fake = useRef<HTMLDivElement>(null);
  const jump = useRef<HTMLDivElement>(null);
  const splash = useRef<HTMLDivElement>(null);
  const jumpWord = useRef<HTMLHeadingElement>(null);
  const jumpCat = useRef<HTMLSpanElement>(null);
  const jumpBang = useRef<HTMLSpanElement>(null);
  const freeze = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const laugh = useRef<HTMLDivElement>(null);
  const laughCat = useRef<HTMLSpanElement>(null);
  const lean = useRef<HTMLDivElement>(null);
  const closeL = useRef<HTMLDivElement>(null);
  const closeR = useRef<HTMLDivElement>(null);
  const what = useRef<HTMLDivElement>(null);
  const why = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [relaxed, setRelaxed] = useState(false);
  // the still version tells the same story, all at once
  const still = useReducedMotion();

  useEffect(() => {
    const section = jump.current?.closest("section");
    if (!section) return;
    // how far apart the dark stops on "lean in", either side of the words
    const gap = () => (window.innerWidth < 768 ? 22 : 12);
    if (prefersReducedMotion()) {
      gsap.set(closeL.current, { xPercent: -gap() });
      gsap.set(closeR.current, { xPercent: gap() });
      jump.current!.dataset.look = "true";
      head.current!.dataset.look = "true";
      lean.current!.dataset.close = "true";
      lean.current!.dataset.look = "true";
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

      // …then the real one, a screen later, once you've relaxed: the ink
      // lands, the word lunges out of it, the cat leaps, and whatever's in
      // the ink opens its eyes
      gsap.set([jumpWord.current, jumpCat.current, jumpBang.current], { autoAlpha: 0 });
      gsap.set(splash.current, { scale: 0, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: jump.current,
        start: "top 58%",
        once: true,
        onEnter: () => {
          gsap
            .timeline()
            .fromTo(splash.current, { scale: 0.2, rotation: -10, autoAlpha: 1 }, { scale: 1.1, rotation: 0, duration: 0.22, ease: "power4.out" }, 0)
            .to(splash.current, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.38)" }, 0.22)
            .fromTo(
              jumpWord.current,
              { scale: 0.3, yPercent: 40, autoAlpha: 0 },
              { scale: 1.16, yPercent: 0, autoAlpha: 1, duration: 0.24, ease: "power4.out" },
              0.02,
            )
            .to(jumpWord.current, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.42)" }, 0.26)
            .fromTo(
              jumpCat.current,
              { yPercent: 170, rotation: -28, autoAlpha: 0 },
              { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.9)" },
              0.06,
            )
            .fromTo(
              jumpBang.current,
              { scale: 0, rotation: -40, autoAlpha: 0 },
              { scale: 1, rotation: 12, autoAlpha: 1, duration: 0.45, ease: "back.out(2.6)" },
              0.16,
            )
            .call(() => {
              jump.current!.dataset.look = "true";
              jump.current!.dataset.hopping = "true";
            }, [], 0.55);
          shiver(jump.current, 10);
          buzz(70);
          troll("jump", TROLL.jump);
        },
      });
      // and it won't stop hopping while it's on screen
      ScrollTrigger.create({
        trigger: jump.current,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: ({ isActive }) => {
          if (jump.current!.dataset.look === "true") jump.current!.dataset.hopping = isActive ? "true" : "false";
        },
      });

      // FREEZE: it holds, and so does everything alive on the page — except
      // the thing in the corner, which can only see you while you move
      let moving = 0;
      let seenOnce = false;
      let held = false;
      const seen = () => {
        if (!held) return;
        head.current!.dataset.look = "true";
        window.clearTimeout(moving);
        moving = window.setTimeout(() => {
          if (head.current) head.current.dataset.look = "false";
        }, 520);
        if (!seenOnce) {
          seenOnce = true;
          timers.push(window.setTimeout(() => troll("seen", TROLL.seen), 700));
        }
      };
      ScrollTrigger.create({
        trigger: freeze.current,
        start: "top top",
        end: "bottom bottom",
        onToggle: ({ isActive }) => {
          held = isActive;
          section.dataset.frozen = isActive ? "true" : "false";
          if (grain) grain.dataset.frozen = isActive ? "true" : "false";
          if (!isActive) head.current!.dataset.look = "false";
        },
        onUpdate: (self) => {
          if (Math.abs(self.getVelocity()) > 40) seen();
        },
      });
      const onMouse = (e: PointerEvent) => {
        if (e.pointerType === "mouse") seen();
      };
      freeze.current!.addEventListener("pointermove", onMouse, { passive: true });

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

      // lean in: the dark leans in with you, and it knows when you're close
      gsap
        .timeline({
          scrollTrigger: { trigger: lean.current, start: "top 85%", end: "bottom 15%", scrub: 0.7, invalidateOnRefresh: true },
        })
        .fromTo(closeL.current, { xPercent: -105 }, { xPercent: () => -gap(), ease: "power2.out", duration: 0.42 }, 0)
        .fromTo(closeR.current, { xPercent: 105 }, { xPercent: () => gap(), ease: "power2.out", duration: 0.42 }, 0)
        .to({}, { duration: 0.16 })
        .to(closeL.current, { xPercent: -105, ease: "power2.in", duration: 0.42 })
        .to(closeR.current, { xPercent: 105, ease: "power2.in", duration: 0.42 }, "<");
      ScrollTrigger.create({
        trigger: lean.current,
        start: "top 40%",
        end: "bottom 60%",
        onToggle: ({ isActive }) => {
          lean.current!.dataset.close = isActive ? "true" : "false";
          lean.current!.dataset.look = isActive ? "true" : "false";
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

      return () => {
        window.clearTimeout(moving);
        freeze.current?.removeEventListener("pointermove", onMouse);
      };
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
  const count = t.fakeout.length - (still ? t.fakeout.length - 1 : step);

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

      {/* the warning, counting down in the site's hollow numerals */}
      <div ref={fake} className="relative mt-[clamp(2.5rem,7vh,4.5rem)] flex min-h-[clamp(11rem,30vw,20rem)] flex-col items-center justify-center gap-3 px-[var(--edge)] text-center">
        <span
          key={count}
          aria-hidden="true"
          className={`soon-count ghost-index pointer-events-none absolute left-1/2 select-none top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(10rem,30vw,22rem)] transition-opacity duration-700 ${
            relaxed || still ? "!opacity-0" : ""
          }`}
        >
          {count}
        </span>
        <p className="label label-loose relative flex items-center gap-3 text-ink/70" aria-live="off">
          <span aria-hidden="true" className="h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime [box-shadow:0_0_0_1px_rgba(8,8,8,0.35)]" />
          {t.fakeout[still ? t.fakeout.length - 1 : step]}
        </p>
        <p
          className={`relative flex items-center gap-2 transition-opacity duration-700 ${relaxed || still ? "opacity-100" : "opacity-0"}`}
        >
          <span className="hand -rotate-[3deg] text-[clamp(1.1rem,1.6vw,1.45rem)] text-ink/55">{t.relax}</span>
          <Sprite name="zzz" scale={0.16} className="-mt-4 rotate-[8deg]" />
        </p>
      </div>

      {/* room to relax in */}
      <div aria-hidden="true" className="h-[30svh]" />

      {/* JUMP — onto a splash of ink, with something in it */}
      <div ref={jump} data-look="false" className="relative grid min-h-[86svh] place-items-center px-[var(--edge)]">
        <div ref={splash} className="pointer-events-none absolute left-1/2 top-1/2 aspect-[10/7] w-[min(100vw,72rem)] -translate-x-1/2 -translate-y-1/2">
          <InkField ns="jump-splash" view={SPLASH.view} shape={SPLASH.d} className="inset-0" />
          <InkEyes className="left-[13%] top-[17%] w-[11%]" tilt={-12} blink={5.4} />
          <InkEyes className="left-[76%] top-[73%] w-[7.5%]" tilt={9} blink={7.1} delay={0.3} />
        </div>
        <h3 ref={jumpWord} className={`${word} relative -rotate-[2.5deg] text-[clamp(5rem,22vw,17rem)] text-bone`} aria-label={t.words.jump}>
          {[...t.words.jump].map((ch, i) => (
            <span key={i} aria-hidden="true" className="soon-hop soon-loop" style={{ "--i": i } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </h3>
        <span ref={jumpBang} aria-hidden="true" className="absolute right-[4%] top-[8%] block md:right-[12%] md:top-[6%]">
          <Sprite name="mark-bang" scale={0.4} />
        </span>
        <span ref={jumpCat} className="absolute bottom-[2%] left-[2%] block md:bottom-[6%] md:left-[8%]">
          <span className="soon-float soon-loop block">
            <Sprite name="cat-pop-jump" scale={0.62} />
          </span>
        </span>
      </div>

      {/* FREEZE — held while the page goes past */}
      <div ref={freeze} className="relative mt-[8svh] h-[200svh] overflow-clip">
        <div className="sticky top-0 grid h-[100svh] place-items-center px-[var(--edge)]">
          <div className="relative">
            <h3 className={`${word} rotate-[1.5deg] text-[clamp(4.6rem,20vw,16rem)]`}>{t.words.freeze}</h3>
            {/* the cat from JUMP, stopped mid-air */}
            <Sprite name="cat-pop-jump" scale={0.4} className="absolute -right-[6%] -top-[62%] -rotate-[16deg] md:-right-[10%] md:-top-[48%]" />
            <p className="hand mt-[clamp(1rem,3vh,2rem)] -rotate-[2deg] whitespace-pre-line text-center text-[clamp(1.1rem,1.7vw,1.5rem)] leading-[1.15] text-ink/60">
              {t.still}
            </p>
          </div>
          {/* the hero's cat-head, up out of the corner */}
          <div ref={head} data-look="false" className="pointer-events-none absolute bottom-0 left-0 aspect-[620/480] w-[min(66vw,30rem)] -translate-x-[10%] translate-y-[14%]">
            <InkField ns="freeze-head" view={HEAD.view} shape={HEAD.d} className="inset-0" />
            <InkEyes className="left-[63.5%] top-[54%] w-[22.4%]" tilt={-3} blink={4.6} />
          </div>
        </div>
      </div>

      {/* LAUGH — on a lime splash, with the ha's scrawled round it */}
      <div ref={laugh} className="relative grid min-h-[92svh] place-items-center overflow-x-clip px-[var(--edge)]">
        <InkField
          ns="laugh-blob"
          tone="lime"
          view={GIGGLE.view}
          shape={GIGGLE.d}
          className="left-1/2 top-1/2 aspect-[10/7] w-[min(94vw,60rem)] -translate-x-1/2 -translate-y-1/2"
        />
        <h3 className={`${word} relative -rotate-[1.5deg] text-[clamp(4.6rem,20vw,16rem)]`} aria-label={t.words.laugh}>
          {[...t.words.laugh].map((ch, i) => (
            <span key={i} aria-hidden="true" className="soon-letter soon-loop" style={{ "--i": i } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </h3>
        {t.ha.map((h, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`soon-ha soon-loop hand absolute leading-none ${HA_AT[i]}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {h}
          </span>
        ))}
        <span ref={laughCat} className="absolute bottom-[4%] left-[4%] block md:left-[16%]">
          <span className="soon-float soon-loop block [animation-delay:-1.2s]">
            <Sprite name="cat-playful" scale={0.5} />
          </span>
        </span>
      </div>

      {/* lean in — and the dark leans in with you */}
      <div ref={lean} data-look="false" className="relative grid min-h-[112svh] place-items-center overflow-x-clip px-[var(--edge)] text-center">
        <div ref={closeL} className="pointer-events-none absolute inset-y-[4%] left-0 w-[52%]">
          <InkField ns="lean-l" view={CLOSE_L.view} shape={CLOSE_L.d} className="inset-0" />
          <InkEyes className="left-[56%] top-[38%] w-[18%]" tilt={-6} blink={5} />
        </div>
        <div ref={closeR} className="pointer-events-none absolute inset-y-[7%] right-0 w-[52%]">
          <InkField ns="lean-r" view={CLOSE_R.view} shape={CLOSE_R.d} className="inset-0" />
          <InkEyes className="left-[26%] top-[56%] w-[14%]" tilt={8} blink={6.2} delay={0.3} />
        </div>
        <div className="relative">
          <p className="label text-[0.6rem] tracking-[0.34em] text-ink/75">{t.words.lean}</p>
          <p className="soon-lean-up label mt-2 text-[0.44rem] tracking-[0.3em] text-ink/45">{t.leanUp}</p>
        </div>
      </div>

      {/* WHAT THE— */}
      <div ref={what} className="relative grid min-h-[78svh] place-items-center px-[var(--edge)]">
        <h3 className={`${word} flex flex-wrap items-center justify-center gap-x-[0.28em] -rotate-[1deg] text-[clamp(3.6rem,12vw,10rem)]`} aria-label={t.words.what}>
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
                <span className="soon-bar soon-cutbar label ml-[0.08em]">{t.language}</span>
              ) : null}
            </span>
          ))}
        </h3>
        {/* it heard that */}
        <span aria-hidden="true" className="soon-slam-pop absolute right-[6%] top-[14%] block md:right-[14%]">
          <Sprite name="mark-bang" scale={0.36} />
        </span>
        <span aria-hidden="true" className="soon-slam-rise absolute bottom-[4%] left-[6%] block md:left-[16%]">
          <Sprite name="cat-scared" scale={0.5} />
        </span>
      </div>

      {/* why — and the line looks twice */}
      <div className="mt-[clamp(1rem,4vh,3rem)] flex flex-col items-center px-[var(--edge)] text-center">
        <p className="label label-loose flex items-center gap-3 text-ink/50">
          <span className="text-lime [text-shadow:0_0_1px_rgba(8,8,8,0.7)]">{"●"}</span>
          {t.why}
        </p>
        <div ref={why} className="relative mt-[clamp(1rem,3vh,1.75rem)] inline-block">
          <p aria-hidden="true" className="soon-echo brush absolute inset-0 -rotate-[1.2deg] whitespace-pre-line text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.86]">
            {t.reveal}
          </p>
          <h2 className="brush relative -rotate-[1.2deg] whitespace-pre-line text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.86]">{t.reveal}</h2>
          <span aria-hidden="true" className="soon-whybar absolute inset-[-6%_-4%] block rounded-[3px_9px_4px_8px] bg-ink" />
        </div>
        <Sprite name="squiggle-lime" scale={0.36} className="mt-4 rotate-[10deg]" />
        <p className="hand mt-4 max-w-[18ch] -rotate-[2deg] whitespace-pre-line text-[clamp(1.1rem,1.7vw,1.5rem)] text-ink/60">{t.note}</p>
      </div>
    </Section>
  );
}
