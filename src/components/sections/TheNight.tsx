import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import { EVENT, FACTS, NOTES } from "@/lib/site";

/**
 * 01 — the first thing after the hero. The heading runs oversized and off the
 * left edge; the facts sit in a quiet editorial row underneath. The peeking cat
 * hooks over the wave the page arrives on, so it reads as coming *through* the
 * section boundary rather than sitting inside the box.
 */
export default function TheNight() {
  return (
    <Section
      id="night"
      field="bone"
      className="pb-[clamp(3rem,8vh,5.5rem)] pt-[clamp(5.5rem,17vh,13rem)] md:pt-[clamp(5.5rem,26vh,13rem)]"
    >
      {/* the cat is hauling itself over the boundary above */}
      <RiseIn className="absolute -top-[clamp(2.5rem,7vw,6rem)] right-[6%] z-10 md:right-[26%]" start="top 96%">
        <Sprite name="cat-peek" scale={0.7} drift={16} idle={6} />
      </RiseIn>
      <Sprite name="star" scale={0.14} drift={26} className="absolute left-[46%] top-[42%] hidden md:block" />

      <div className="px-[var(--edge)]">
        <SectionLabel index="01">The Night</SectionLabel>
      </div>

      <GhostIndex className="left-[46%] top-[6%] hidden text-[clamp(10rem,26vw,24rem)] lg:block">01</GhostIndex>

        <div data-scrub="down" data-scrub-amount="6" className="mt-[clamp(2rem,5vh,3.5rem)] grid items-end gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* oversized, and deliberately hanging off the left edge */}
        <div className="min-w-0">
          <Words
            as="h2"
            className="brush lean -rotate-[1.4deg] select-none pb-[0.1em] pl-[var(--edge)] text-[clamp(4.4rem,13.5vw,12rem)] leading-[0.84]"
          >
            {"The\nNight"}
          </Words>
          <p className="hand mt-7 max-w-[14ch] lg:mt-[clamp(0.75rem,2vh,1.25rem)] -rotate-[2deg] whitespace-pre-line pl-[calc(var(--edge)+0.5rem)] text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55">
            {NOTES.night}
          </p>
        </div>

        <div data-scrub="up" data-scrub-amount="10" className="px-[var(--edge)] lg:pl-0 lg:pr-[var(--edge)]">
          <p data-anim="rise" className="display max-w-[16ch] text-[clamp(1.35rem,2.6vw,2.15rem)] leading-[1.12]">
            {EVENT.name} is a 20-hour creative technology hackathon.
          </p>

          <dl data-stagger
            className="mt-[clamp(2rem,5vh,3.25rem)] grid grid-cols-2 gap-x-6 gap-y-[clamp(1.25rem,3vh,2rem)] border-t border-ink/15 pt-[clamp(1.25rem,3vh,2rem)] sm:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.k} data-anim="rise">
                <dt className="label text-ink/45">{f.k}</dt>
                <dd className="display mt-2 text-[clamp(0.95rem,1.5vw,1.2rem)] leading-none">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>


    </Section>
  );
}
