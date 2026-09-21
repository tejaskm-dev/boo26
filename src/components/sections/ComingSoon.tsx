import Section from "./Section";
import Sprite from "@/components/ui/Sprite";
import Wordmark from "@/components/ui/Wordmark";
import BlobButton from "@/components/ui/BlobButton";
import { Sparkle } from "@/components/ui/Glyphs";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Marquee from "@/components/fx/Marquee";
import { BAND } from "@/lib/site";

/**
 * Where every register CTA lands until registration opens.
 *
 * It is the home page's closing "Ready?" beat with the answer changed — the
 * same ink field with the bone spilling in over the top, lime brush at full
 * size, the running facts band along the bottom — so arriving here reads as
 * the next step of the site rather than a dead end. The cat is crouched to
 * pounce, because it is about to start.
 *
 * Only the wordmark rides in the corner. The home page's menu and register
 * button would point back at this page, or at anchors that aren't on it.
 */
export default function ComingSoon() {
  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]">
        <Wordmark href="/" className="pointer-events-auto" />
      </header>

      <Section
        field="ink"
        forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[13vh] md:h-[21vh]" }]}
        className="flex min-h-svh flex-col pt-[clamp(8rem,24vh,13rem)]"
      >
        <div data-intro className="relative flex flex-1 flex-col justify-center px-[var(--edge)]">
          <p data-anim="rise" className="label label-loose whitespace-pre-line text-bone/45">
            Registration{"\n"}isn&rsquo;t open yet.
          </p>

          <div className="relative mt-[clamp(1.5rem,4vh,3rem)]">
            <Words
              as="h1"
              className="brush -rotate-[1.5deg] select-none text-center text-[clamp(4.4rem,15vw,12rem)] leading-[0.84] text-lime"
            >
              {"Coming\nsoon"}
            </Words>

            {/* Crouched on top of the heading, about to pounce. Lifted by its
                own rendered height (317px of art x 0.62 x --sprite-scale) so
                it stands on the letters at every width instead of covering
                them — and dropped by 0.2 of the heading's size, which is where
                the brush caps start inside their line box. */}
            <RiseIn
              className="absolute right-[4%] top-[calc(clamp(4.4rem,15vw,12rem)*0.2-197px*var(--sprite-scale))] z-10 md:right-[12%]"
              start="top 96%"
            >
              <Sprite name="cat-stretch" scale={0.62} drift={18} idle={5} />
            </RiseIn>
          </div>

          <div className="mt-[clamp(1.75rem,4.5vh,2.75rem)] flex flex-wrap items-center justify-center gap-[clamp(1.25rem,4vw,3rem)]">
            <BlobButton data-anim="rise" href="/" size="lg">
              Back to BOO!
            </BlobButton>
            <p className="hand max-w-[12ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.5rem)] text-bone/60">
              {"Keep your\nidea warm."}
            </p>
          </div>

          <Sparkle className="pointer-events-none absolute left-[8%] top-[46%] hidden w-[clamp(1rem,1.6vw,1.6rem)] text-lime md:block" />
        </div>

        {/* the facts, running, exactly as they close the home page */}
        <div className="mt-[clamp(2.5rem,7vh,4.5rem)] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
          <Marquee items={BAND} speed={42} className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70" />
        </div>
      </Section>
    </>
  );
}
