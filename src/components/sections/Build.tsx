import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import { BUILD_STEPS, EVENT, NOTES } from "@/lib/site";

/**
 * 05 — one word, as large as the viewport allows, with the cat peeking out of
 * the counter of the D. The four steps run underneath as a rule-connected row;
 * SHIP takes the lime because it is the only one that ends the night.
 */
export default function Build() {
  return (
    <Section
      id="build"
      field="bone"
      edge={{ from: "ink", shape: "swell" }}
      className="pb-[clamp(3rem,8vh,5rem)] pt-[clamp(5rem,13vh,9rem)]"
    >
      <div className="flex items-start justify-between gap-6 px-[var(--edge)]">
        <SectionLabel index="05">The Hackathon</SectionLabel>
        <p className="label whitespace-pre-line text-right text-ink/45">
          Your idea.{"\n"}Your stack.{"\n"}20 hours.
        </p>
      </div>

      <div className="relative mt-[clamp(1.5rem,4vh,3rem)]">
        {/* the word runs wider than the viewport on purpose */}
        <Words
          as="h2"
          className="brush lean -rotate-[1.6deg] select-none whitespace-nowrap pl-[var(--edge)] text-[clamp(4.5rem,20vw,16rem)] leading-[0.84]"
        >
          Build.
        </Words>

        <Sprite
          name="cat-faq-peek"
          scale={1.15}
          drift={18}
          idle={6}
          className="absolute right-[10%] top-[38%] z-10 md:right-[22%]"
        />
        <Sprite name="blob" scale={0.7} drift={8} className="absolute -left-[2%] bottom-[8%] hidden opacity-90 lg:block" />
      </div>

      <div className="mt-[clamp(0.5rem,2vh,1.5rem)] flex flex-wrap items-end gap-x-6 gap-y-3 px-[var(--edge)]">
        <p className="brush -rotate-[3deg] text-[clamp(1.6rem,4vw,3rem)] leading-none">
          Something
          <br />
          weird.
        </p>
        <Sprite name="squiggle-lime" scale={1.1} className="mb-2" />
      </div>

      {/* the four steps */}
      <ol data-stagger
        className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-px border-y border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
        {BUILD_STEPS.map((step, i) => (
          <li
            key={step.label}
            data-anim="rise"
            style={{ rotate: `${[-0.7, 0.5, -0.4, 0.8][i] ?? 0}deg` }}
            className="relative bg-bone px-[var(--edge)] py-[clamp(1.25rem,3vh,2rem)] lg:px-[clamp(1.25rem,2.5vw,2.5rem)]"
          >
            <span className="label text-lime">{step.index}</span>
            <p className="mt-3">
              <span
                className={`display inline-block text-[clamp(1.5rem,2.8vw,2.25rem)] leading-none ${
                  step.lime
                    ? "bg-lime px-3 py-1 text-ink [border-radius:46%_54%_58%_42%/42%_60%_40%_58%]"
                    : ""
                }`}
              >
                {step.label}
              </span>
            </p>
            <p className="label mt-3 text-ink/40">{step.note}</p>
          </li>
        ))}
      </ol>

      <div className="mt-[clamp(2rem,5vh,3rem)] flex flex-wrap items-end justify-between gap-6 px-[var(--edge)]">
        <p className="label label-loose whitespace-pre-line text-ink/45">
          {EVENT.format}
          {"\n"}
          {EVENT.venue}
        </p>
        <p className="hand max-w-[12ch] whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55">
          {NOTES.build}
        </p>
      </div>
    </Section>
  );
}
