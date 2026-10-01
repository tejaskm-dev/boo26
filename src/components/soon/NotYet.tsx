"use client";

import { useEffect, useRef, useState } from "react";
import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import BlobButton from "@/components/ui/BlobButton";
import { Sparkle } from "@/components/ui/Glyphs";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Marquee from "@/components/fx/Marquee";
import { SOON, TROLL } from "@/lib/soon";
import Awake from "./Awake";
import Boing from "./Boing";
import Critters from "./Critters";
import InkEyes from "./InkEyes";
import { answer } from "./troll";

const BAR = "▇▇▇▇▇▇";
/** these stay readable: the band still has to say where */
const KEEP = new Set(["ASIET, KALADY", "BOO! 2026"]);

/**
 * 04 — what's next, which is: not yet.
 *
 * The /register coming-soon page's composition — the bone spilling in over
 * the top, the lime at full size, the cat crouched on the letters about to
 * pounce — saying "you'll know" instead of "coming soon". The one thing to do
 * is pass it on, and what gets passed on is the old chain-message curse.
 *
 * It's dark in here, and not empty: eyes all round the words, narrowing at
 * you and shutting if you get too close, wisps that come and circle you, a
 * couple of the bats from 01. The cat jumps if you poke it.
 *
 * The band runs the rumours, with a different couple blacked out on every
 * visit and one that knows what you're holding. That's decided after the page
 * loads, under the loading screen, so the server and the browser never
 * disagree about it.
 */
export default function NotYet() {
  const t = SOON.notYet;
  const [band, setBand] = useState<readonly string[]>(t.band);
  const pokes = useRef(0);

  useEffect(() => {
    const items: string[] = [...t.band];
    const open = items.map((s, i) => (KEEP.has(s) ? -1 : i)).filter((i) => i >= 0);
    for (let n = 0; n < 2 && open.length; n++) {
      const pick = open.splice(Math.floor(Math.random() * open.length), 1)[0];
      items[pick] = BAR;
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
      className="flex min-h-svh flex-col pt-[clamp(7rem,22vh,12rem)]"
    >
      <Awake />

      {/* eyes in the dark, all round the words */}
      <InkEyes watch className="left-[5%] top-[26%] w-[3rem] md:left-[8%] md:w-[4.6rem]" tilt={-10} blink={6.5} />
      <InkEyes watch className="right-[6%] top-[60%] w-[2.4rem] md:right-[9%] md:w-[3.6rem]" tilt={8} blink={5.2} delay={0.4} />
      <InkEyes watch className="left-[10%] top-[66%] hidden w-[2.2rem] md:block" tilt={4} blink={7.6} delay={0.8} />
      <InkEyes watch className="right-[22%] top-[21%] w-[1.7rem] md:w-[2.2rem]" tilt={-4} blink={8.4} delay={1.1} />
      <InkEyes watch className="left-[30%] top-[84%] w-[1.5rem] md:left-[38%] md:w-[1.9rem]" tilt={6} blink={9.1} delay={1.4} />
      <Critters bats={2} wisps={9} ghosts={0} sky={[0.1, 0.36]} ground={[0.25, 0.85]} className="z-[1]" />

      <div className="relative z-[2] flex flex-1 flex-col justify-center px-[var(--edge)]">
        <SectionLabel index="04" className="text-bone">
          {t.label}
        </SectionLabel>

        {/* tap it, if you must */}
        <div className="relative mt-[clamp(1.5rem,4vh,3rem)]" onClick={patience}>
          <Words
            as="h2"
            className="brush -rotate-[1.5deg] cursor-default select-none text-center text-[clamp(4.4rem,15vw,12rem)] leading-[0.84] text-lime"
          >
            {t.heading}
          </Words>

          {/* crouched on the letters, about to pounce — placed the way the
              /register coming-soon page places it */}
          <RiseIn
            className="absolute right-[4%] top-[calc(clamp(4.4rem,15vw,12rem)*0.2-197px*var(--sprite-scale))] z-10 md:right-[12%]"
            start="top 96%"
          >
            <Boing hop={40}>
              <Sprite name="cat-stretch" scale={0.62} drift={18} idle={5} />
            </Boing>
          </RiseIn>
        </div>

        <p data-anim="rise" className="body-copy mx-auto mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[40ch] text-center text-[clamp(0.98rem,1.35vw,1.15rem)] text-bone/70">
          {t.body}
        </p>

        <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-center justify-center gap-[clamp(1.25rem,4vw,3rem)]">
          <BlobButton data-anim="rise" onClick={share} size="lg">
            {t.share}
          </BlobButton>
          <p className="hand max-w-[12ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.5rem)] text-bone/60">{t.note}</p>
        </div>

        <Sparkle className="pointer-events-none absolute left-[8%] top-[46%] hidden w-[clamp(1rem,1.6vw,1.6rem)] text-lime md:block" />
      </div>

      {/* the rumours, running */}
      <div className="relative z-[2] mt-[clamp(2.5rem,7vh,4.5rem)] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
        <Marquee items={band} speed={46} className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70" />
      </div>
    </Section>
  );
}
