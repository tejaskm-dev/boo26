"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import Awake from "./Awake";
import Countdown from "./Countdown";
import { useBacktrack } from "./backtrack";
import InkEyes from "./InkEyes";
import InkField from "./InkField";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";
import { isNavActive } from "@/lib/navState";
import { BACK, SECRETS, SOON, TROLL } from "@/lib/soon";
import { shiver, troll } from "./troll";
import { audioLag, cue, heart, say } from "./sound";
import { jumpscare } from "./JumpScare";
import { hold, inView, letGo } from "./hold";

/** the mass that closes in on "lean in" — the right one is the same, mirrored */
const CLOSE = {
  view: "0 0 600 1000",
  d: "M-200 120C-100 60 40 40 140 70C240 100 260 160 330 210C400 260 520 300 540 400C560 500 430 540 440 620C450 700 560 760 500 840C440 920 300 900 200 930C100 960 0 990 -200 960Z",
};

/**
 * 03 — the only thing the teaser explains, and it explains it by doing it.
 *
 * The countdown to a jump scare that doesn't come — "relax. no jump scares
 * on this site. promise." — and then, carried straight on, the one that
 * does: "lean in" is too small to read, the dark closes in on it while you
 * try, and then. The face carries you to WHAT THE—, which gets said, and
 * cut off. Then the bar comes off the one line the file in 01 was hiding:
 * why.
 */
export default function ThePoint() {
  const t = SOON.point;
  const lean = useRef<HTMLDivElement>(null);
  const closeL = useRef<HTMLDivElement>(null);
  const closeR = useRef<HTMLDivElement>(null);
  const what = useRef<HTMLDivElement>(null);
  const why = useRef<HTMLDivElement>(null);
  const carryTo = useRef<() => void>(() => {});
  // what the words say if you come back up to them
  const [back, setBack] = useState<Partial<Record<"lean" | "what", true>>>({});
  // the same, for the scroll's callbacks: only what's changed holds you on the way back up
  const flipped = useRef<typeof back>({});
  const flip = (k: keyof typeof back) => () => {
    flipped.current[k] = true;
    setBack((b) => (b[k] ? b : { ...b, [k]: true }));
  };
  useBacktrack(lean, flip("lean"));
  useBacktrack(what, flip("what"));

  useEffect(() => {
    const section = lean.current?.closest("section");
    if (!section) return;
    // how far apart the dark stops on "lean in", either side of the words
    const gap = () => (window.innerWidth < 768 ? 22 : 12);
    if (prefersReducedMotion()) {
      gsap.set(closeL.current, { xPercent: -gap() });
      gsap.set(closeR.current, { xPercent: gap() });
      lean.current!.dataset.close = "true";
      lean.current!.dataset.look = "true";
      what.current!.dataset.slammed = "true";
      why.current!.dataset.open = "true";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const timers: number[] = [];

    const ctx = gsap.context(() => {
      let leaning = 0;

      // lean in: the dark leans in with you, and it knows when you're close
      gsap
        .timeline({
          scrollTrigger: { trigger: lean.current, start: "top 85%", end: "bottom 15%", scrub: 0.7, invalidateOnRefresh: true },
        })
        // (evenly: it's still closing as the words reach the middle, which
        // is where the page leans in by itself — the build-up is the dark)
        .fromTo(closeL.current, { xPercent: -105 }, { xPercent: () => -gap(), ease: "sine.inOut", duration: 0.42 }, 0)
        .fromTo(closeR.current, { xPercent: 105 }, { xPercent: () => gap(), ease: "sine.inOut", duration: 0.42 }, 0)
        .to({}, { duration: 0.16 })
        .to(closeL.current, { xPercent: -105, ease: "power2.in", duration: 0.42 })
        .to(closeR.current, { xPercent: 105, ease: "power2.in", duration: 0.42 }, "<");
      // the page, with "lean in" in the middle of the screen
      const leanAt = () => {
        const r = lean.current!.getBoundingClientRect();
        return r.top + window.scrollY + r.height * 0.41 - window.innerHeight * 0.5;
      };
      /**
       * The build-up, once a visit, on the way down: held, the page leans in
       * by itself — slowly, the dark closing in with it, the eyes in it
       * opening — over a heart that quickens as it goes. It stops; nothing,
       * for a beat; and then. (Held there already, a moment after turning
       * round: it's quicker, and no less of a shock.)
       */
      let crept = false;
      let carrying = false;
      let quicken = 0;
      const creep = () => {
        if (crept || !lean.current) return;
        crept = true;
        const face = () => {
          if (lean.current?.dataset.close !== "true") return;
          if (!jumpscare("face")) return;
          // and you say it: carried down to WHAT THE—, behind the face
          timers.push(window.setTimeout(sayIt, 350));
        };
        // (the face comes a moment after it's leaned in: past that, it's only waiting)
        const leaned = hold("lean", 2500, {
          tail: 1400,
          to: leanAt(),
          glide: 2.6,
          easing: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
          onHeld: () => {
            window.clearTimeout(quicken);
            heart(0);
            leaning = window.setTimeout(face, 700);
          },
        });
        if (!leaned) {
          // not held (it had just turned round): there already, the quick
          // way; not there yet, it waits for them to get there
          if (lean.current.dataset.close === "true") leaning = window.setTimeout(face, 900);
          else crept = false;
          return;
        }
        cue("inhale", true);
        heart(1.15);
        quicken = window.setTimeout(() => heart(1.7), 1300);
      };
      // the countdown's carry: "relax." — and on, to just short of "lean in",
      // which does the rest
      carryTo.current = () => {
        const lenis = getLenis();
        if (!lenis) return;
        carrying = true;
        const landed = () => {
          if (!carrying) return;
          carrying = false;
          creep();
        };
        lenis.scrollTo(leanAt() - window.innerHeight * 0.42, {
          duration: 1.6,
          easing: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
          force: true,
          lock: true,
          onComplete: landed,
        });
        // in case the glide never reports back
        timers.push(window.setTimeout(landed, 2300));
      };
      ScrollTrigger.create({
        trigger: lean.current,
        start: "top 40%",
        end: "bottom 60%",
        // flung clean past it in one frame: brought back to lean in after all
        onLeave: () => hold("lean", 2500, { to: leanAt(), glide: 0.6, tail: 1400 }),
        // back up to it, and it says "lean out." — held for that, and brought
        // back for it if the way up went straight past
        onEnterBack: () => flipped.current.lean && hold("lean:up", 1600, { to: leanAt(), glide: 0.5, way: "up", tail: 900 }),
        onLeaveBack: () => flipped.current.lean && hold("lean:up", 1600, { to: leanAt(), glide: 0.6, way: "up", tail: 900 }),
        onToggle: ({ isActive, direction }) => {
          lean.current!.dataset.close = isActive ? "true" : "false";
          lean.current!.dataset.look = isActive ? "true" : "false";
          // the oldest trick there is: get them to lean in to read something
          // small — and then. Once a visit, on the way down (the countdown's
          // carry sets it off as it lands): held here again on the way back
          // up, it would take the scare that's waiting for them in the room.
          if (!isActive) {
            window.clearTimeout(leaning);
            window.clearTimeout(quicken);
            heart(0);
          }
          if (isActive && direction > 0 && !carrying) creep();
        },
      });

      // WHAT THE— types itself out as you scroll, and gets cut off
      const letters = what.current!.querySelectorAll("[data-letter]");
      const typing = gsap.fromTo(
        letters,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: what.current, start: "top 82%", end: "top 38%", scrub: 0.3 },
        },
      );
      let cut = false;
      const cutOff = (bleep = true) => {
        if (cut) return;
        cut = true;
        what.current!.dataset.slammed = "true";
        if (bleep) cue("beep", true);
        timers.push(window.setTimeout(() => shiver(what.current, 7), 150));
      };
      /** the face scare brought you here, and it's being said for you */
      let carried = false;
      ScrollTrigger.create({
        trigger: what.current,
        start: "top 36%",
        once: true,
        onEnter: () => {
          if (carried) return;
          // gone straight past it (the menu, a link): cut off, but not out loud
          if (!inView(what.current)) {
            cut = true;
            what.current!.dataset.slammed = "true";
            return;
          }
          cutOff();
          // a fling that ran on well past it is brought back to it
          const top = what.current!.getBoundingClientRect().top;
          hold("what", 1500, { tail: 800, ...(top < window.innerHeight * 0.05 ? { to: top + window.scrollY - window.innerHeight * 0.36, glide: 0.35 } : {}) });
        },
      });
      // and back up past it, it's "Language!" — bleeped, and held a moment
      const whatAt = () => {
        const r = what.current!.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
      };
      /**
       * The face scare at "lean in" makes you say it. Behind the face, the
       * page is carried down to WHAT THE—, and as the face goes, it types
       * itself out a letter at a time as it's said (with the sound on), and
       * the bar comes down on "the", bleep and all. Then it laughs at you.
       * If it can't carry you, it's just said — bleeped — and laughed at.
       * Opening the menu (or jumping off somewhere) part-way calls the rest
       * off, and leaves WHAT THE— as it ends, bar and all.
       */
      let saying: number[] = [];
      const sayIt = () => {
        // (the menu's opened since the face went up: it's not for there)
        if (isNavActive()) return;
        letGo("lean");
        if (!hold("what", 3000, { to: whatAt(), glide: 0.7, tail: 700 })) {
          const r = lean.current!.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          const said = say("what");
          cue("beep", true);
          const laugh = said ? said + 0.4 : 0.9;
          say("safe", laugh);
          timers.push(window.setTimeout(() => troll("safe", TROLL.safe), (laugh + 1) * 1000));
          return;
        }
        carried = true;
        typing.scrollTrigger?.kill();
        typing.kill();
        gsap.set(letters, { autoAlpha: 0 });
        // as the face goes (it's up for 1.35s, and this is 0.35s in)
        saying.push(
          window.setTimeout(() => {
            const said = say("what");
            // (heard a touch after it's played, where the sound's buffer is
            // bigger: what's seen waits for what's heard)
            const lag = said ? audioLag() : 0;
            // "What", then "the—", a letter at a time, as they're said
            [...what.current!.querySelectorAll("h3 > span")].forEach((word, i) =>
              gsap.to(word.querySelectorAll("[data-letter]"), { autoAlpha: 1, duration: 0.04, stagger: 0.065, delay: (i ? 0.35 : 0.04) + lag }),
            );
            const end = said ? said - 0.02 : 0.6;
            // the bleep on the end of the line, in the sound's own time; the bar as it's heard
            if (said) saying.push(window.setTimeout(() => cue("beep", true), end * 1000));
            saying.push(window.setTimeout(() => cutOff(!said), (end + lag) * 1000));
            // and then it laughs at you, and says it as the toast does
            const laughs = say("safe", end + 0.5);
            saying.push(
              window.setTimeout(() => {
                saying = [];
                troll("safe", TROLL.safe);
              }, (end + (laughs ? 1.5 : 0.8)) * 1000),
            );
          }, 1100),
        );
      };
      const leave = () => {
        window.clearTimeout(leaning);
        window.clearTimeout(quicken);
        if (crept) heart(0);
        if (!saying.length) return;
        saying.forEach((id) => window.clearTimeout(id));
        saying = [];
        gsap.killTweensOf(letters);
        gsap.set(letters, { autoAlpha: 1 });
        if (!cut) {
          cut = true;
          what.current!.dataset.slammed = "true";
        }
      };
      window.addEventListener("soon:away", leave);
      const tellOff = () =>
        flipped.current.what &&
        hold("what:up", 1500, {
          tail: 800,
          to: whatAt(),
          glide: 0.4,
          way: "up",
          onHeld: () => {
            cue("beep", true);
            shiver(what.current, 6);
          },
        });
      ScrollTrigger.create({ trigger: what.current, start: "top 70%", end: "bottom 30%", onEnterBack: tellOff, onLeaveBack: tellOff });

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
        window.removeEventListener("soon:away", leave);
        saying.forEach((id) => window.clearTimeout(id));
        window.clearTimeout(leaning);
        window.clearTimeout(quicken);
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
      ctx.revert();
    };
  }, [t.fakeout]);

  const word = "brush select-none text-center leading-[0.84]";

  return (
    <Section
      id="point"
      field="bone"
      className="pb-[clamp(4rem,11vh,8rem)] pt-[clamp(3rem,8vh,6rem)]"
    >
      <Awake />

      <div className="px-[var(--edge)]">
        <SectionLabel index="03">{t.label}</SectionLabel>
      </div>

      {/* the warning: a whole screen, held while it counts, getting darker */}
      <Countdown onCarry={() => carryTo.current()} />

      {/* lean in — and the dark leans in with you */}
      <div ref={lean} data-look="false" className="relative grid min-h-[112svh] place-items-center overflow-x-clip px-[var(--edge)] text-center">
        <div ref={closeL} className="pointer-events-none absolute inset-y-[6%] left-0 w-[52%]">
          <InkField ns="lean-l" view={CLOSE.view} shape={CLOSE.d} className="inset-0" />
          <InkEyes className="left-[24%] top-[36%] w-[20%]" tilt={-6} blink={5} />
        </div>
        <div ref={closeR} className="pointer-events-none absolute inset-y-[6%] right-0 w-[52%]">
          <InkField ns="lean-r" view={CLOSE.view} shape={CLOSE.d} className="inset-0 -scale-x-100" />
          <InkEyes className="left-[56%] top-[36%] w-[20%]" tilt={6} blink={6.2} delay={0.3} />
        </div>
        <div data-secret={SECRETS.lean} className="absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2 p-6">
          <p className="label text-[0.6rem] tracking-[0.34em] text-ink/75">{back.lean ? BACK.words.lean : t.words.lean}</p>
          <p className="soon-lean-up label mt-2 text-[0.44rem] tracking-[0.3em] text-ink/45">{t.leanUp}</p>
        </div>
      </div>

      {/* WHAT THE— */}
      <div ref={what} className="relative grid min-h-[78svh] place-items-center px-[var(--edge)]">
        <h3 data-secret={SECRETS.what} className={`${word} flex flex-wrap items-center justify-center gap-x-[0.28em] -rotate-[1deg] text-[clamp(3.6rem,12vw,10rem)]`} aria-label={t.words.what}>
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
                <span className="soon-bar soon-cutbar label ml-[0.08em]" data-back={back.what ? "true" : undefined}>
                  {back.what ? BACK.words.what : t.language}
                </span>
              ) : null}
            </span>
          ))}
        </h3>
        {/* the slam, going out in rings */}
        <span aria-hidden="true" className="soon-shock" />
        <span aria-hidden="true" className="soon-shock soon-shock-late" />
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
          <h2 data-secret={SECRETS.why} className="brush relative -rotate-[1.2deg] whitespace-pre-line text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.86]">{t.reveal}</h2>
          <span aria-hidden="true" className="soon-whybar absolute inset-[-6%_-4%] block rounded-[3px_9px_4px_8px] bg-ink" />
        </div>
        <Sprite name="squiggle-lime" scale={0.36} className="mt-4 rotate-[10deg]" />
        <p className="hand mt-4 max-w-[18ch] -rotate-[2deg] whitespace-pre-line text-[clamp(1.1rem,1.7vw,1.5rem)] text-ink/60">{t.note}</p>
      </div>
    </Section>
  );
}
