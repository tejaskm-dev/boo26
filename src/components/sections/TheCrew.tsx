"use client";

import { useEffect, useState } from "react";
import Section, { SectionLabel } from "./Section";
import { PolaroidCard } from "./ThePeople";
import GhostIndex from "@/components/ui/GhostIndex";
import { CREW_WORDS, type TeamMember } from "@/lib/site";

/**
 * 05, the second half (TEAM_SECTION=2): the crew behind the core team.
 *
 * The People's composition turned to the ink — the same polaroids, the same
 * MEET-over-THE heading — with a ghost popping up over each card where the
 * core team have their cats, and everyone else who helps in one line under
 * the cards. The cards wear the core team's doodles a few places along, so
 * the two rows never match.
 */
export default function TheCrew({
  members,
  index,
  preview = false,
}: {
  members: TeamMember[];
  index: string;
  /** the dashboard's preview, showing stand-ins before the crew's photos are in */
  preview?: boolean;
}) {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  // a mouse or pen over a card, which CSS hover can't always see (ThePeople.tsx)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const w = CREW_WORDS;

  useEffect(() => {
    const outside = (e: MouseEvent | TouchEvent) => {
      if (!(e.target as HTMLElement).closest("[data-polaroid-card]")) setActiveCard(null);
    };
    document.addEventListener("click", outside);
    document.addEventListener("touchstart", outside, { passive: true });
    return () => {
      document.removeEventListener("click", outside);
      document.removeEventListener("touchstart", outside);
    };
  }, []);

  return (
    <Section
      id="crew"
      field="ink"
      forms={[{ shape: "swellMid", tone: "bone", at: "inset-x-0 top-0 w-full h-[9vh] md:h-[15vh]" }]}
      className="pb-[clamp(5rem,13vh,8.5rem)] pt-[clamp(6.5rem,18vh,13rem)] md:pt-[clamp(7.5rem,24vh,15rem)]"
    >
      <div className="px-[var(--edge)]">
        <SectionLabel index={index} className="text-bone">
          {w.label}
        </SectionLabel>
      </div>

      <GhostIndex className="right-[8%] top-[6%] hidden text-[clamp(10rem,26vw,24rem)] lg:block">{index}</GhostIndex>

      <div className="relative mt-[clamp(2.5rem,5vh,4rem)] px-[var(--edge)]">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-center">
          <p className="hand hidden w-[14ch] shrink-0 -rotate-[3deg] whitespace-pre-line text-[clamp(1.15rem,1.4vw,1.45rem)] font-bold leading-[1.18] text-bone/60 lg:block">
            {w.note}
          </p>

          <h2 className="brush select-none text-center text-[clamp(3.8rem,10.5vw,8.5rem)] leading-[0.82] tracking-tight text-bone">
            <span className="block -rotate-[2deg]">{w.heading[0]}</span>
            <span className="flex items-baseline justify-center gap-[0.16em]">
              <span className="rotate-[1deg]">{w.heading[1]}</span>
              <span className="inline-block -rotate-[2deg] text-lime [text-shadow:0px_6px_22px_rgba(216,255,40,0.3)]">{w.heading[2]}</span>
            </span>
          </h2>

          <div className="max-w-[20ch] text-center lg:w-[22rem] lg:text-right">
            <p className="label label-loose text-[clamp(0.66rem,0.72vw,0.78rem)] leading-relaxed text-bone/50">{w.aside}</p>
            <span className="mx-auto mt-2.5 block h-[2px] w-9 bg-lime lg:mr-0" />
          </div>
        </div>
      </div>

      <div className="relative mt-[clamp(3rem,6vh,5rem)] px-[var(--edge)]">
        <div
          data-stagger
          className="grid grid-cols-2 gap-x-3.5 gap-y-36 pt-28 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-40 sm:pt-36 lg:grid-cols-6 lg:gap-3.5 lg:pt-40 xl:gap-4.5"
        >
          {members.map((member, i) => (
            <PolaroidCard
              key={`${member.name}-${i}`}
              member={member}
              index={i}
              doodle={(i + 3) % 6}
              isActive={activeCard === i || hoveredCard === i}
              isOpen={activeCard === i}
              onCardClick={(idx) => setActiveCard((prev) => (prev === idx ? null : idx))}
              onHoverChange={(idx, on) => setHoveredCard((prev) => (on ? idx : prev === idx ? null : prev))}
            />
          ))}
        </div>
      </div>

      {/* everyone else */}
      <p data-anim="rise" className="brush mt-[clamp(4rem,10vh,6.5rem)] -rotate-[1.5deg] px-[var(--edge)] text-center text-[clamp(1.9rem,5.2vw,4rem)] leading-[0.95] text-bone">
        {w.rest[0]} <span className="text-lime">{w.rest[1]}</span>
        <br className="sm:hidden" /> {w.rest[2]}
      </p>

      {preview ? (
        <p className="label label-loose mx-auto mt-8 max-w-[52ch] px-[var(--edge)] text-center text-[0.68rem] text-lime/80">{w.previewNote}</p>
      ) : null}
    </Section>
  );
}
