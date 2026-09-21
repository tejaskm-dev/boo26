"use client";

import HeroField from "./HeroField";
import HeroLockup from "./HeroLockup";
import BlobButton from "@/components/ui/BlobButton";
import { Sparkle } from "@/components/ui/Glyphs";
import { EVENT } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      data-field="bone"
      data-field-right="ink"
      data-intro
      className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-bone [contain:paint] [transform:translateZ(0)]"
    >
      <HeroField />

      <Sparkle className="pointer-events-none absolute right-[16%] top-[22%] hidden w-[clamp(1.5rem,2.4vw,2.6rem)] text-lime md:block" />
      <Sparkle className="pointer-events-none absolute left-[7%] top-[34%] w-[clamp(1rem,3.4vw,1.6rem)] text-lime md:left-[10%] md:top-[64%]" />

      {/*
        Two compositions, not one squashed.

        A wide frame wants the lockup centred with the details gathered under
        it. A tall one does not: the same stack in the middle of a phone leaves
        a third of the screen empty above and below and reads as an accident.
        Portrait spreads the same material across the full height instead —
        what it is at the top, the mark in the middle, when and where at the
        bottom — so the frame is used deliberately end to end.
      */}
      <div className="relative z-10 flex min-h-svh flex-col justify-between gap-[clamp(1.25rem,3vh,2rem)] px-[var(--edge)] pb-[clamp(4.5rem,11vh,6rem)] pt-[calc(var(--header-h)+clamp(1.25rem,4vh,2.5rem))] md:items-center md:justify-center md:gap-[clamp(1.5rem,3.4vh,2.6rem)] md:-translate-x-[2.5%] md:pb-[clamp(3rem,8vh,5rem)] md:pt-[calc(var(--header-h)*0.9)]">
        {/* portrait only — the format takes the top of the frame */}
        <p
          data-anim="rise"
          className="label max-w-[15ch] leading-[1.9] text-ink/70 md:hidden"
        >
          {EVENT.format}
        </p>

        {/* oversized on purpose — it runs wider than any column on the page */}
        <HeroLockup
          data-anim="fade"
          className="w-[min(86vw,34rem)] md:w-[clamp(30rem,53vw,54rem)]"
        />

        <div className="flex flex-col gap-[clamp(1.1rem,2.6vh,1.75rem)] md:items-center md:gap-[clamp(1.5rem,3.4vh,2.6rem)]">
          {/* Mobile: dark pill wrapping facts + button so text is always readable regardless
              of where the ink SVG field ends */}
          <div className="rounded-2xl bg-ink/95 px-5 py-4 md:contents">
            {/* Mobile facts sit directly above the register button over the dark ink mass */}
            <div className="label label-loose grid grid-cols-[auto_auto] justify-start gap-x-[clamp(1.25rem,6vw,2.5rem)] gap-y-[clamp(0.5rem,1.4vh,0.9rem)] font-medium text-bone/95 md:flex md:items-baseline md:gap-6 md:font-normal md:text-bone/80">
              <span data-anim="rise">{EVENT.date}</span>
              <span data-anim="rise" className="md:hidden">{EVENT.duration}</span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-bone/30 md:block" />
              <span data-anim="rise">{EVENT.venue}</span>
              <span data-anim="rise" className="md:hidden">{EVENT.team}</span>
            </div>

            <BlobButton data-anim="rise" href={EVENT.registerHref} size="lg">
              Register now
            </BlobButton>
          </div>
        </div>
      </div>

      <p className="label absolute bottom-[clamp(1.1rem,2.4vh,2rem)] left-1/2 z-10 hidden -translate-x-1/2 text-ink/45 md:block">
        {EVENT.format}
      </p>

      <a
        href="#about"
        aria-label="Skip to about"
        className="absolute bottom-[clamp(1.5rem,3vh,2.5rem)] left-1/2 z-10 -translate-x-1/2 text-ink/45 outline-none transition-colors duration-300 hover:text-ink focus-visible:text-lime md:hidden"
      >
        <svg viewBox="0 0 16 30" className="h-[1.85rem] w-4 animate-[cue_2.2s_var(--ease-out-soft)_infinite]" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true">
          <path d="M8 1v26M2.5 21.5 8 28l5.5-6.5" />
        </svg>
      </a>
    </section>
  );
}
