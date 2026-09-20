import Section from "./Section";
import Marquee from "@/components/fx/Marquee";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import BlobButton from "@/components/ui/BlobButton";
import { BAND, EVENT, NOTES } from "@/lib/site";

/**
 * The closing beat. Lime at full size for the only time on the page, and the
 * cat coming up over the bottom edge as if the night is about to start.
 */
export default function Ready() {
  return (
    <Section
      id="register"
      field="ink"
      forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[13vh] md:h-[21vh]" }]}
      className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(5.5rem,16vh,13rem)] md:pt-[clamp(5.5rem,25vh,13rem)]"
    >
      <div className="relative px-[var(--edge)]">
        <p className="label label-loose whitespace-pre-line text-bone/45">
          Same people.{"\n"}Brighter ideas.{"\n"}Scarier night.
        </p>

        <div className="mt-[clamp(1.5rem,4vh,3rem)] flex flex-wrap items-center justify-center gap-[clamp(1.5rem,5vw,4rem)]">
          <Words
            as="h2"
            className="brush -rotate-[1.5deg] select-none text-center text-[clamp(5.6rem,18vw,14rem)] leading-[0.84] text-lime"
          >
            Ready?
          </Words>
        </div>

        <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-center justify-center gap-[clamp(1.25rem,4vw,3rem)]">
          <BlobButton data-anim="rise" href={EVENT.registerHref} size="lg">
            Register now
          </BlobButton>
          <p className="hand max-w-[12ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.5rem)] text-bone/60">
            {NOTES.ready}
          </p>
        </div>

      </div>

      {/* the facts, running — the measure under the call to action was the
          emptiest on the page and this is the one thing still worth saying */}
      <div className="mt-[clamp(2.5rem,7vh,4.5rem)] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
        <Marquee
          items={BAND}
          speed={42}
          className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70"
        />
      </div>

      {/* coming up over the bottom edge */}
      <RiseIn from="bottom" className="absolute -bottom-[clamp(1.5rem,4vw,3.5rem)] left-[6%] z-10 md:left-[12%]" start="top 92%">
        <Sprite name="cat-peek" scale={0.76} drift={14} idle={6} />
      </RiseIn>
      <Sprite name="star" scale={0.15} drift={28} className="absolute right-[22%] top-[58%] hidden md:block" />
    </Section>
  );
}
