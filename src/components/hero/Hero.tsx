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
      className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-bone"
    >
      <HeroField />

      <Sparkle className="pointer-events-none absolute right-[16%] top-[22%] hidden w-[clamp(1.5rem,2.4vw,2.6rem)] text-lime md:block" />
      <Sparkle className="pointer-events-none absolute left-[7%] top-[34%] w-[clamp(1rem,3.4vw,1.6rem)] text-lime md:left-[10%] md:top-[64%]" />

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-[clamp(1.5rem,3.4vh,2.6rem)] px-[var(--edge)] pt-[calc(var(--header-h)*0.9)] pb-[clamp(3rem,8vh,5rem)] md:-translate-x-[2.5%]">
        {/* oversized on purpose — it runs wider than any column on the page */}
        <HeroLockup
          data-anim="fade"
          className="w-[min(96vw,34rem)] md:w-[clamp(30rem,53vw,54rem)]"
        />

        <p
          data-anim="rise"
          className="label label-loose flex items-baseline gap-4 text-bone/80 md:gap-6"
        >
          <span>{EVENT.date}</span>
          <span aria-hidden="true" className="h-3 w-px bg-bone/30" />
          <span>{EVENT.venue}</span>
        </p>

        <BlobButton data-anim="rise" href={EVENT.registerHref} size="lg">
          Register now
        </BlobButton>
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
