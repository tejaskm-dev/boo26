import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Awake from "./Awake";
import RedactedCard from "./RedactedCard";
import PinnedNote from "./PinnedNote";
import Spider from "./Spider";
import { SOON } from "@/lib/soon";

/** Hand-placed, so the notes read as pinned up by different people. */
const TILT = [-2.4, 1.8, -1.2, 2.6];
const DROP = ["lg:mt-0", "lg:mt-10", "lg:mt-3", "lg:mt-14"];

/**
 * 01 — the rumour. Laid out like The Night: the heading oversized and off the
 * left edge, the peeking cat hauling itself over the join above. What The
 * Night gives as facts, this gives as a file with the facts blacked out, and
 * a few notes someone pinned up and would rather you didn't read.
 */
export default function Heard() {
  const t = SOON.heard;
  return (
    <Section
      id="heard"
      field="bone"
      className="pb-[clamp(4rem,11vh,7.5rem)] pt-[clamp(5.5rem,17vh,13rem)] md:pt-[clamp(5.5rem,24vh,13rem)]"
    >
      <Awake />

      {/* the cat is hauling itself over the boundary above — and it knows */}
      <RiseIn className="absolute -top-[clamp(2.5rem,7vw,6rem)] right-[6%] z-10 md:right-[24%]" start="top 96%">
        <Sprite name="cat-peek" scale={0.7} drift={16} idle={6} />
      </RiseIn>
      <p className="hand absolute right-[8%] top-[clamp(3.4rem,8vw,6.2rem)] z-10 -rotate-[5deg] text-[clamp(1rem,1.5vw,1.35rem)] text-ink/60 md:right-[21%]">
        {t.cat}
      </p>

      <Spider className="absolute right-0 top-0 z-[5] hidden w-[clamp(4.5rem,9vw,8rem)] sm:block" />

      <div className="px-[var(--edge)]">
        <SectionLabel index="01">{t.label}</SectionLabel>
      </div>

      <GhostIndex className="left-[52%] top-[5%] hidden text-[clamp(10rem,26vw,24rem)] lg:block">01</GhostIndex>

      <Words
        as="h2"
        className="brush lean mt-[clamp(1.75rem,4.5vh,3rem)] -rotate-[1.4deg] select-none pb-[0.1em] pl-[var(--edge)] text-[clamp(3.6rem,11.5vw,10rem)] leading-[0.84]"
      >
        {t.heading}
      </Words>

      <div className="mt-[clamp(1.75rem,5vh,3.5rem)] grid items-start gap-[clamp(2.5rem,6vw,5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <p data-anim="rise" className="display max-w-[17ch] text-[clamp(1.35rem,2.6vw,2.15rem)] leading-[1.12]">
          {t.body}
        </p>

        <div data-scrub="up" data-scrub-amount="8">
          <RedactedCard />
        </div>
      </div>

      {/* pinned up by different people, at different heights */}
      <ul className="mt-[clamp(3rem,8vh,5rem)] grid grid-cols-1 gap-x-[clamp(1rem,2.5vw,2rem)] gap-y-7 px-[var(--edge)] sm:grid-cols-2 lg:grid-cols-4">
        {t.notes.map((n, i) => (
          <li
            key={n.front}
            className={`${DROP[i]} ${i % 2 ? "justify-self-end sm:justify-self-auto" : ""} w-[min(100%,17rem)]`}
            style={{ rotate: `${TILT[i]}deg` }}
          >
            <PinnedNote front={n.front} back={n.back} tape={i % 2 ? "tape-dark" : "tape-lime"} i={i} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
