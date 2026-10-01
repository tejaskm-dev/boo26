"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section, { SectionLabel } from "@/components/sections/Section";
import BlobButton from "@/components/ui/BlobButton";
import Marquee from "@/components/fx/Marquee";
import HeroLockup from "@/components/hero/HeroLockup";
import { prefersReducedMotion } from "@/lib/motion";
import { CUTS, SECRETS, SOON, TROLL } from "@/lib/soon";
import Awake from "./Awake";
import Critters from "./Critters";
import Cut from "./Cut";
import InkEyes from "./InkEyes";
import { cue } from "./sound";
import { answer, buzz, shiver } from "./troll";

/** what a silenced rumour says instead — block glyphs read as a broken font, not a redaction */
const HUSH = "SHH.";
/** these stay readable: the band still has to say where */
const KEEP = new Set(["ASIET, KALADY", "BOO! 2026"]);

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
 * The last shot, held while you scroll through it. It cuts in from black
 * ("When it drops,"), and in the dark, eyes open one after another all round
 * the edge of the frame — everyone's here. Then the cat from the top of the
 * page slams in, the BOO! lockup and all, and "You'll know." comes up under
 * it, then the one thing to do: pass it on. What gets passed on is the old
 * chain-message curse.
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
  const title = useRef<HTMLHeadingElement>(null);
  const cta = useRef<HTMLDivElement>(null);

  // the shot: eyes, then the slam, then the line, then the ask
  useEffect(() => {
    const run = runway.current;
    const st = stage.current;
    const wrappers = crowd.current ? [...crowd.current.children] as HTMLElement[] : [];
    if (!run || !st) return;
    if (prefersReducedMotion()) {
      wrappers.forEach((w) => (w.dataset.look = "true"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const lines = title.current ? [...title.current.querySelectorAll<HTMLElement>("[data-line]")] : [];
    const ctx = gsap.context(() => {
      gsap.set(lock.current, { scale: 2.6, rotation: -10, autoAlpha: 0 });
      gsap.set(lines, { yPercent: 115, rotation: 4, autoAlpha: 0 });
      gsap.set(cta.current, { y: 30, autoAlpha: 0 });
      let slammed = false;
      let said = false;
      let asked = false;
      ScrollTrigger.create({
        trigger: run,
        start: "top top",
        end: "bottom bottom",
        onUpdate: ({ progress: p }) => {
          // the crowd: one more pair each step into the shot
          wrappers.forEach((w, i) => {
            const open = p > 0.02 + (i / wrappers.length) * 0.36 ? "true" : "false";
            if (w.dataset.look !== open) w.dataset.look = open;
          });
          if (!slammed && p > 0.4) {
            slammed = true;
            gsap.to(lock.current, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.42, ease: "power4.in" });
            gsap.delayedCall(0.42, () => {
              shiver(st, 12);
              buzz(80);
              cue("slam", true);
              st.dataset.slammed = "true";
            });
          }
          if (!said && p > 0.52) {
            said = true;
            gsap.to(lines, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out", stagger: 0.1 });
          }
          if (!asked && p > 0.64) {
            asked = true;
            gsap.to(cta.current, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
          }
        },
      });
    }, st);
    return () => ctx.revert();
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

  const share = async () => {
    const url = `${window.location.origin}/`;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (coarse && navigator.share) {
      try {
        await navigator.share({ title: SOON.meta.title, text: t.chain, url });
        answer(TROLL.shared);
      } catch {
        /* closed the share sheet: fair */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${t.chain} ${url}`);
      answer(TROLL.copied);
    } catch {
      answer("copy the address bar. we trust you.");
    }
  };

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
      <Cut lines={CUTS.drop} />
      <Awake />
      <Critters bats={2} wisps={10} ghosts={0} sky={[0.06, 0.24]} ground={[0.2, 0.9]} className="z-[1]" />

      {/* the last shot, held for a while */}
      <div ref={runway} className="soon-drop-runway relative">
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

          <div className="relative z-[2] flex w-full flex-col items-center">
            {/* the cat from the top of the page, back for the end */}
            <div ref={lock} data-secret={SECRETS.boo} className="w-[min(82vw,38rem)]">
              <HeroLockup />
            </div>
            <h2
              ref={title}
              onClick={patience}
              aria-label={t.heading.replace("\n", " ")}
              className="soon-glitch brush -mt-[0.15em] -rotate-[1.5deg] cursor-default select-none text-center text-[clamp(3.6rem,11vw,8.5rem)] leading-[0.84] text-lime"
            >
              {t.heading.split("\n").map((l) => (
                <span key={l} className="block overflow-hidden pb-[0.06em]" aria-hidden="true">
                  <span data-line className="block">
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
