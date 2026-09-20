"use client";

import { useState } from "react";
import Section, { SectionLabel } from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import BlobButton from "@/components/ui/BlobButton";
import { EVENT, FAQ, NOTES } from "@/lib/site";

/**
 * 06 — an editorial spread, not an accordion component. The word holds the
 * left column at poster scale with the thinking cat over it and the laptop cat
 * down in the corner; the questions run as real buttons on the right, one open
 * at a time, each answer resting on a soft blob rather than in a card.
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section
      id="faq"
      field="bone"
      edge={{ from: "ink", shape: "swell" }}
      className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(5rem,13vh,9rem)]"
    >
      <div className="grid gap-[clamp(2.5rem,5vw,4.5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
        {/* the poster half */}
        <div className="relative">
          <SectionLabel index="06">FAQ</SectionLabel>

          <p className="hand mt-6 max-w-[12ch] -rotate-[4deg] whitespace-pre-line text-[clamp(1.15rem,2vw,1.8rem)] text-ink/70">
            {NOTES.faq}
          </p>

          <div className="relative mt-[clamp(0.5rem,2vh,1.5rem)]">
            <Words as="h2" className="brush lean -rotate-[2deg] select-none text-[clamp(5.5rem,17vw,13.5rem)] leading-[0.82]">
              FAQ
            </Words>
            <Sprite
              name="cat-confused"
              scale={1.1}
              drift={16}
              idle={6}
              className="absolute -top-[clamp(2rem,5vw,4rem)] right-[6%] z-10"
            />
          </div>

          <p className="label label-loose mt-4 whitespace-pre-line text-ink/50">
            The important stuff.{"\n"}(And a few other things.)
          </p>
          <Sprite name="squiggle-lime" scale={1.2} className="mt-3" />

          {/* the desk, down in the corner */}
          <div data-scrub="up" data-scrub-amount="16" className="relative mt-[clamp(2.5rem,6vh,4rem)] hidden min-h-[11rem] lg:block">
            <Sprite name="cat-laptop" scale={1.25} drift={12} idle={4} className="absolute bottom-0 left-0 z-10" />
            <Sprite name="books" scale={1.1} drift={7} className="absolute bottom-0 left-[46%]" />
            <Sprite name="thought-bubble" scale={1} drift={22} className="absolute left-[8%] top-0" />
            <p className="hand absolute right-0 top-[10%] max-w-[13ch] whitespace-pre-line text-[clamp(1rem,1.4vw,1.25rem)] text-ink/55">
              Real questions.{"\n"}Real answers.{"\n"}(We think.)
            </p>
          </div>
        </div>

        {/* the questions */}
        <div>
          <ul data-stagger className="border-t border-ink/15">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q} data-anim="rise" className="border-b border-ink/15">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className="group flex w-full items-center gap-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.9rem,2.2vh,1.4rem)] text-left outline-none"
                    >
                      <span className="label shrink-0 text-ink/35 transition-colors duration-300 group-hover:text-ink/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`display flex-1 text-[clamp(0.98rem,1.55vw,1.28rem)] leading-tight transition-colors duration-300 ${
                          isOpen ? "text-ink" : "text-ink/75 group-hover:text-ink"
                        }`}
                      >
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`relative grid h-[1.9rem] w-[1.9rem] shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                          isOpen
                            ? "border-ink bg-ink text-bone"
                            : "border-ink/25 text-ink/60 group-hover:border-ink/60"
                        }`}
                      >
                        <span className="absolute h-[1.5px] w-[0.8rem] rounded-full bg-current" />
                        <span
                          className={`absolute h-[0.8rem] w-[1.5px] rounded-full bg-current transition-transform duration-[450ms] ease-[var(--ease-out-soft)] ${
                            isOpen ? "scale-y-0" : "scale-y-100"
                          }`}
                        />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-soft)]"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      {/* a soft blob under the answer, never a card round every question */}
                      <div className="mb-[clamp(0.75rem,2vh,1.25rem)] ml-[clamp(2rem,4vw,3.5rem)] mr-[3rem] bg-ink/[0.045] px-[clamp(1rem,2vw,1.75rem)] py-[clamp(0.9rem,2vh,1.25rem)] [border-radius:36%_64%_58%_42%/44%_38%_62%_56%]">
                        <p
                          className={`body-copy max-w-[46ch] text-[clamp(0.9rem,1.2vw,1.02rem)] ${
                            item.tba ? "text-ink/40" : "text-ink/75"
                          }`}
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* still stuck */}
          <div className="relative mt-[clamp(2rem,5vh,3rem)] flex flex-wrap items-center gap-[clamp(1rem,3vw,2rem)]">
            <div>
              <p className="hand max-w-[16ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.45rem)] text-ink/60">
                Couldn&rsquo;t find what{"\n"}you&rsquo;re looking for?
              </p>
              <Sprite name="squiggle-lime" scale={0.8} className="mt-2 rotate-[8deg]" />
            </div>
            <BlobButton href={EVENT.discordHref} tone="ink">
              Join our Discord
            </BlobButton>
          </div>
        </div>
      </div>


    </Section>
  );
}
