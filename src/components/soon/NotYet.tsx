"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import BlobButton from "@/components/ui/BlobButton";
import Marquee from "@/components/fx/Marquee";
import HeroLockup from "@/components/hero/HeroLockup";
import { prefersReducedMotion } from "@/lib/motion";
import { BACK, CHAIN, CUTS, MU, SECRETS, SOON, TROLL } from "@/lib/soon";
import Awake from "./Awake";
import Critters from "./Critters";
import Cut from "./Cut";
import InkEyes from "./InkEyes";
import MuLearn from "./MuLearn";
import { cue, lineLength, say as speak } from "./sound";
import { hold } from "./hold";
import { useBacktrack } from "./backtrack";
import { glitch, useGlitch } from "./glitch";
import { answer, buzz, shiver } from "./troll";
import { afterShare, chainMessage, passOn } from "./chain";

/** what a silenced rumour says instead — block glyphs read as a broken font, not a redaction */
const HUSH = "SHH.";
/** these stay readable: the band still has to say where, and whose */
const KEEP = new Set(["ASIET, KALADY", "BOO! 2026", "µLEARN ASIET"]);
/** with the sound on, the card into the end is said too — and the one on the way back up */
const VOICES = ["made-it", "most-dont"] as const;
const BACK_VOICES = ["back-for-more"] as const;

/** the crowd in the dark, round the edges of the shot — each opens a little further into the scroll */
const CROWD: { at: string; tilt: number }[] = [
  { at: "left-[5%] top-[13%] w-[2.6rem] md:w-[4.4rem]", tilt: -8 },
  { at: "left-[20%] top-[7%] w-[1.8rem] md:w-[2.8rem]", tilt: 6 },
  { at: "left-[74%] top-[9%] w-[2rem] md:w-[3.2rem]", tilt: -5 },
  { at: "left-[88%] top-[17%] w-[2.6rem] md:w-[4rem]", tilt: 9 },
  { at: "left-[3%] top-[38%] w-[2rem] md:w-[3rem]", tilt: 4 },
  { at: "left-[92%] top-[42%] w-[1.8rem] md:w-[3.4rem]", tilt: -7 },
  { at: "left-[9%] top-[62%] w-[2.4rem] md:w-[3.8rem]", tilt: -3 },
  { at: "left-[86%] top-[64%] w-[2.2rem] md:w-[3.6rem]", tilt: 8 },
  { at: "left-[4%] top-[86%] w-[1.8rem] md:w-[2.6rem]", tilt: 6 },
  { at: "left-[22%] top-[92%] w-[2.2rem] md:w-[3.2rem]", tilt: -9 },
  { at: "left-[68%] top-[93%] w-[2rem] md:w-[3rem]", tilt: 5 },
  { at: "left-[90%] top-[86%] w-[2.6rem] md:w-[4rem]", tilt: -4 },
  { at: "left-[48%] top-[4%] hidden w-[2.4rem] md:block", tilt: 2 },
  { at: "left-[33%] top-[90%] hidden w-[2rem] md:block", tilt: 7 },
];

/**
 * 04 — what's next, which is: not yet.
 *
 * The last shot. It cuts in from black (the card's "You made it. Most
 * don't." is a sentence of its own), and from the top of it the shot plays
 * out on its own, held for: "When it drops," comes up alone in the middle
 * of the dark — said, with the sound on — while eyes open one after another
 * all round the edge of the frame, everyone's here; once it's said, it
 * slowly goes. Then the cat from the top of the page slams in, the BOO!
 * lockup and all, and "You'll know." lands under it, said too — and won't
 * hold still: it tears now and then (glitch.ts), and for a frame, once in a
 * while, it says what it says when you come back up. Then the one thing to
 * do: pass it on. What gets passed on is the old chain-message curse.
 * Leave part-way (the menu, a link) and it's all there when you're back.
 *
 * The band runs the rumours, with a different couple hushed on every
 * visit and one that knows what you're holding. That's decided after the page
 * loads, under the loading screen, so the server and the browser never
 * disagree about it.
 */
export default function NotYet() {
  const t = SOON.notYet;
  const [band, setBand] = useState<readonly string[]>(t.band);
  const pokes = useRef(0);
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const crowd = useRef<HTMLDivElement>(null);
  const lock = useRef<HTMLDivElement>(null);
  const kicker = useRef<HTMLParagraphElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const [knows, setKnows] = useState(false);
  // the same, for the scroll's callbacks
  const knew = useRef(false);
  useBacktrack(
    runway,
    () => {
      knew.current = true;
      setKnows(true);
    },
    "bottom 12%",
  );
  // it won't hold still — and now and then, for a frame, it says the other thing
  useGlitch(title);

  // the shot: "When it drops," in the dark, said and gone — then the slam, "You'll know.", the ask
  useEffect(() => {
    const run = runway.current;
    const st = stage.current;
    const wrappers = crowd.current ? ([...crowd.current.children] as HTMLElement[]) : [];
    if (!run || !st) return;
    if (prefersReducedMotion()) {
      wrappers.forEach((w) => (w.dataset.look = "true"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const lines = title.current ? [...title.current.querySelectorAll<HTMLElement>("[data-line]")] : [];
    let leave = () => {};
    const ctx = gsap.context(() => {
      gsap.set(lock.current, { scale: 2.6, rotation: -10, autoAlpha: 0 });
      gsap.set(kicker.current, { y: 14, autoAlpha: 0 });
      gsap.set(lines, { yPercent: 115, rotation: 4, autoAlpha: 0 });
      gsap.set(cta.current, { y: 30, autoAlpha: 0 });
      /** playing out on its own clock, held for — and what's still to come of it */
      let begun = false;
      let steps: gsap.core.Tween[] = [];
      let slammed = false;
      let said = false;
      let asked = false;
      const look = (open: (i: number) => boolean) =>
        wrappers.forEach((w, i) => {
          const v = open(i) ? "true" : "false";
          if (w.dataset.look !== v) w.dataset.look = v;
        });
      // "When it drops," — on its own, in the middle of the dark — said…
      const kick = () => {
        if (kicker.current) gsap.to(kicker.current, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" });
        speak("when-it-drops");
      };
      // …and once it's been said, slowly gone
      const unkick = (slowly = true) => {
        if (kicker.current) gsap.to(kicker.current, { y: -8, autoAlpha: 0, duration: slowly ? 1.1 : 0.25, ease: "power1.inOut", overwrite: true });
      };
      const slam = () => {
        if (slammed) return;
        slammed = true;
        gsap.to(lock.current, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.42, ease: "power4.in" });
        gsap.delayedCall(0.42, () => {
          shiver(st, 12);
          buzz(80);
          cue("slam", true);
          st.dataset.slammed = "true";
        });
      };
      // "You'll know." — said as it lands
      const say = () => {
        if (said) return;
        said = true;
        speak("know");
        gsap.to(lines, {
          yPercent: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.1,
          // and the moment it's landed, it tears
          onComplete: () => glitch(title.current, "tear"),
        });
      };
      const ask = () => {
        if (asked) return;
        asked = true;
        steps = [];
        gsap.to(cta.current, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
      };
      /**
       * From the top of the shot it plays out on its own clock, held for:
       * "When it drops," comes up in the dark and is said, as the eyes open
       * all round; once it's said, it slowly goes; then the cat slams in,
       * and "You'll know." lands under it, said; then the ask.
       */
      const begin = () => {
        const when = lineLength("when-it-drops");
        const gone = 0.5 + (when ? when + 0.3 : 1.7);
        const drop = gone + 1.15;
        const know = drop + 0.75;
        const done = know + 1.2;
        // (once "You'll know." has landed, the rest is for reading it)
        if (!hold("drop", Math.round((done + 0.6) * 1000), { tail: Math.round((done - know + 0.6) * 1000) })) return;
        begun = true;
        steps = [
          ...wrappers.map((w, i) => gsap.delayedCall(0.15 + (i / wrappers.length) * (gone - 0.2), () => (w.dataset.look = "true"))),
          gsap.delayedCall(0.5, kick),
          gsap.delayedCall(gone, unkick),
          gsap.delayedCall(drop, slam),
          gsap.delayedCall(know, say),
          gsap.delayedCall(done, ask),
        ];
      };
      // left part-way (the menu, a link): the rest is called off, and it's
      // all there when you're back
      leave = () => {
        if (!steps.length) return;
        steps.forEach((step) => step.kill());
        steps = [];
        look(() => true);
        if (kicker.current) gsap.set(kicker.current, { autoAlpha: 0 });
        if (!slammed) {
          slammed = true;
          gsap.set(lock.current, { scale: 1, rotation: 0, autoAlpha: 1 });
          st.dataset.slammed = "true";
        }
        if (!said) {
          said = true;
          gsap.set(lines, { yPercent: 0, rotation: 0, autoAlpha: 1 });
        }
        asked = true;
        gsap.set(cta.current, { y: 0, autoAlpha: 1 });
      };
      window.addEventListener("soon:away", leave);
      // back up into it from below, it isn't saying what it said ("It
      // knows."): held on it, and it tears, slipping for a frame into what it
      // used to say. A fling up straight past is brought back for it.
      const knowing = (to?: number) =>
        hold("drop:up", 2400, {
          way: "up",
          tail: 1200,
          ...(to !== undefined ? { to, glide: 0.6 } : {}),
          onHeld: () => {
            glitch(title.current, "tear");
            gsap.delayedCall(0.9, () => glitch(title.current, "slip"));
          },
        });
      ScrollTrigger.create({
        trigger: run,
        start: "top top",
        end: "bottom bottom",
        onLeaveBack: (self) => knew.current && knowing(self.start + (self.end - self.start) * 0.5),
        onUpdate: ({ progress: p, direction }) => {
          if (!begun) {
            // the crowd: one more pair each step into the shot
            look((i) => p > 0.02 + (i / wrappers.length) * 0.36);
            // and from the top of it, the shot plays out on its own
            if (!slammed && direction > 0 && p > 0.02 && p < 0.38) begin();
          }
          if (!begun) {
            // flung on past the top of it (or it couldn't be held): the end of it, at least
            if (!slammed && p > 0.38) {
              slam();
              gsap.delayedCall(0.9, say);
              gsap.delayedCall(1.7, ask);
            }
            if (!said && p > 0.52) say();
            if (!asked && p > 0.64) ask();
          }
          if (direction < 0 && knew.current && p < 0.9) knowing();
        },
      });
    }, st);
    return () => {
      window.removeEventListener("soon:away", leave);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const items: string[] = [...t.band];
    const open = items.map((s, i) => (KEEP.has(s) ? -1 : i)).filter((i) => i >= 0);
    for (let n = 0; n < 2 && open.length; n++) {
      const pick = open.splice(Math.floor(Math.random() * open.length), 1)[0];
      items[pick] = HUSH;
    }
    const ua = navigator.userAgent;
    const hi = /iPhone|iPad|iPod/.test(ua) ? "HI, IPHONE." : /Android/.test(ua) ? "HI, ANDROID." : "HI, LAPTOP.";
    items.splice(3 + Math.floor(Math.random() * (items.length - 3)), 0, hi);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decided once, on the visitor's own device
    setBand(items);
  }, [t.band]);

  // the old chain message, written fresh each time, owning up to what this
  // visitor did here, on a link one further along the chain (chain.ts)
  const share = async () => {
    const url = passOn();
    const text = chainMessage();
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (coarse && navigator.share) {
      try {
        await navigator.share({ title: SOON.meta.title, text, url });
        answer(TROLL.shared);
        afterShare(CHAIN.sent);
      } catch {
        /* closed the share sheet: fair */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      answer(TROLL.copied);
      afterShare(CHAIN.copied);
    } catch {
      answer("copy the address bar. we trust you.");
    }
  };

  const heading = knows ? BACK.heading : t.heading;
  // what it slips into for a frame when it glitches: whichever it isn't saying
  const other = (knows ? t.heading : BACK.heading).split("\n");

  const patience = () => {
    answer(TROLL.patience[Math.min(pokes.current, TROLL.patience.length - 1)]);
    pokes.current += 1;
  };

  return (
    <Section
      id="not-yet"
      field="ink"
      forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[13vh] md:h-[21vh]" }]}
      className="flex flex-col"
    >
      <Cut lines={CUTS.drop} back={CUTS.dropBack} voices={VOICES} backVoices={BACK_VOICES} />
      <Awake />
      <Critters bats={2} sky={[0.06, 0.24]} className="z-[1]" />

      {/* the last shot, held for a while */}
      <div ref={runway} data-wait="drop" className="soon-drop-runway relative">
        <div ref={stage} className="sticky top-0 grid h-[100svh] min-h-[36rem] place-items-center overflow-hidden px-[var(--edge)]">
          {/* everyone's here */}
          <div ref={crowd} className="absolute inset-0" aria-hidden="true">
            {CROWD.map((c, i) => (
              <span key={i} data-look="false" className="contents">
                <InkEyes className={c.at} tilt={c.tilt} blink={4 + (i % 5)} />
              </span>
            ))}
          </div>

          <SectionLabel index="04" className="absolute left-[var(--edge)] top-[clamp(5.5rem,14vh,8rem)] text-bone">
            {t.label}
          </SectionLabel>

          {/* the start of the sentence the heading finishes, on its own in the dark before any of it
              (not with motion turned down, or on the way back up, where it says something else) */}
          {knows ? null : (
            <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center px-[var(--edge)] motion-reduce:hidden">
              <p ref={kicker} className="brush invisible -rotate-[2deg] text-center text-[clamp(2.6rem,8vw,6rem)] leading-[0.9] text-bone opacity-0">
                {t.kicker}
              </p>
            </div>
          )}

          <div className="relative z-[2] flex w-full flex-col items-center">
            {/* the cat from the top of the page, back for the end */}
            <div ref={lock} data-secret={SECRETS.boo} className="w-[min(82vw,38rem)]">
              <HeroLockup />
            </div>
            <h2
              ref={title}
              onClick={patience}
              aria-label={heading.replace("\n", " ")}
              className="soon-slices brush -mt-[0.15em] -rotate-[1.5deg] cursor-default select-none text-center text-[clamp(3.6rem,11vw,8.5rem)] leading-[0.84] text-lime"
            >
              {heading.split("\n").map((l, i) => (
                <span key={l} className="soon-slice-row block pb-[0.06em]" aria-hidden="true">
                  <span data-line data-text={l} data-alt={other[i] ?? ""} className="soon-slice block">
                    {l}
                  </span>
                </span>
              ))}
            </h2>
            <div ref={cta} className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-[clamp(1rem,3vw,2.5rem)]">
                <span data-secret={SECRETS.share}>
                  <BlobButton onClick={share} size="lg">
                    {t.share}
                  </BlobButton>
                </span>
                <p className="hand max-w-[12ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.45rem)] text-bone/60">{t.note}</p>
              </div>
              <p className="body-copy max-w-[40ch] text-center text-[clamp(0.9rem,1.2vw,1.05rem)] text-bone/55">{t.body}</p>
              {/* the end credit: whose banner this is under (poke it) */}
              <p className="soon-credit hand">
                <span>{MU.under[0]}</span>
                <MuLearn className="w-[clamp(7.4rem,30vw,11rem)]" />
                <span>{MU.under[1]}</span>
              </p>
            </div>
          </div>

          {/* the slam, going out in rings */}
          <span aria-hidden="true" className="soon-shock soon-drop-shock" />
          <span aria-hidden="true" className="soon-shock soon-drop-shock soon-shock-late" />
        </div>
      </div>

      {/* the rumours, running */}
      <div className="relative z-[2] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
        <Marquee items={band} speed={46} className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70" />
      </div>
    </Section>
  );
}
