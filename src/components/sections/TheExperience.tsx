import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import { EXPERIENCE, NOTES } from "@/lib/site";

/**
 * 02 — black field. The heading fills the left half at billboard scale and the
 * curious cat crawls over the top of it, which is the composition the comp
 * uses. The three beats are a hairline-ruled list, not cards.
 */
export default function TheExperience() {
  return (
    <Section
      id="experience"
      field="ink"
      edge={{ from: "bone", shape: "wave" }}
      className="pb-[clamp(3rem,8vh,5.5rem)] pt-[clamp(4rem,11vh,7.5rem)]"
    >
      <div className="flex items-start justify-between gap-6 px-[var(--edge)]">
        <SectionLabel index="02" className="text-bone">
          The Experience
        </SectionLabel>
        <p className="label max-w-[10ch] text-right text-bone/45">More than just code.</p>
      </div>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-x-[clamp(2rem,4vw,4rem)] gap-y-[clamp(2rem,5vh,3.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="relative min-w-0">
          {/* sized to its own column so it can never run into the list */}
          <Words
            as="h2"
            className="brush lean rotate-[1.2deg] select-none pl-[var(--edge)] text-[clamp(2.9rem,9.2vw,7.5rem)] leading-[0.86] text-bone"
          >
            {"The\nExperience"}
          </Words>

          <RiseIn className="absolute -top-[clamp(2.5rem,6vw,5rem)] right-[6%] z-10 md:right-[10%]" start="top 94%">
            <Sprite name="cat-curious" scale={1.2} drift={20} idle={6} />
          </RiseIn>

          <p className="mt-[clamp(1.75rem,4.5vh,2.75rem)] flex items-center gap-3 px-[var(--edge)]">
            <Sprite name="star" scale={0.42} className="shrink-0" />
            <span className="label label-loose whitespace-pre-line text-bone/70">
              Ideas hit different{"\n"}at night.
            </span>
          </p>
        </div>

        <ul data-stagger data-scrub="up" data-scrub-amount="9" className="px-[var(--edge)] lg:pl-0 lg:pr-[var(--edge)]">
          {EXPERIENCE.map((e, i) => (
            <li
              key={e.label}
              data-anim="rise"
              style={{ marginLeft: `${[0, 3.5, 1.5][i] ?? 0}vw`, rotate: `${[-0.6, 0.8, -0.4][i] ?? 0}deg` }}
              className={`py-[clamp(1.5rem,4vh,2.5rem)] ${i > 0 ? "border-t border-bone/15" : ""}`}
            >
              <span className="label text-lime">{e.index}</span>
              <h3 className="brush mt-3 text-[clamp(2.1rem,4.6vw,3.6rem)] leading-none text-bone">
                {e.label}
              </h3>
              <p className="body-copy mt-3 max-w-[34ch] text-[clamp(0.95rem,1.3vw,1.1rem)] text-bone/65">
                {e.note}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-[clamp(2.5rem,6vh,4rem)] flex items-end justify-between gap-6 px-[var(--edge)]">
        <p className="label label-loose whitespace-pre-line text-bone/45">
          Same people.{"\n"}Brighter ideas.
        </p>
        <p className="hand whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-bone/55">
          {NOTES.survive}
        </p>
      </div>

      <Sprite name="cat-tail" scale={1.05} drift={12} idle={5} className="absolute -bottom-[3%] right-[6%] hidden lg:block" />
    </Section>
  );
}
