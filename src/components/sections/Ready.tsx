import Section from "./Section";
import Marquee from "@/components/fx/Marquee";
import Countdown from "@/components/fx/Countdown";
import Sprite from "@/components/ui/Sprite";
import BlobButton from "@/components/ui/BlobButton";
import GooWord from "@/components/fx/Goo";
import BackLine from "@/components/fx/BackLine";
import Awake from "@/components/soon/Awake";
import Critters from "@/components/soon/Critters";
import InkEyes from "@/components/soon/InkEyes";
import { BAND, EVENT, NOTES, SURVIVAL } from "@/lib/site";

/**
 * The closing beat. Lime at full size for the only time on the page, in the
 * lockup's goo, and a signpost by the button pointing the way out. Where the
 * device can take it, a few bats in the dark above, and a pair of eyes.
 */
export default function Ready() {
  return (
    <Section
      id="register"
      field="ink"
      forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[13vh] md:h-[21vh]" }]}
      className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(5.5rem,16vh,13rem)] md:pt-[clamp(5.5rem,25vh,13rem)]"
    >
      <Awake />
      <Critters bats={3} sky={[0.04, 0.22]} zone="[data-night]" className="z-[3]" />
      <div data-night className="relative px-[var(--edge)]">
        <BackLine text={"One prompt.\nAny tech.\nOne way out."} back={SURVIVAL.again.ready} className="label label-loose whitespace-pre-line text-bone/45" />
        <span data-watch className="absolute right-[9%] top-[2%] hidden w-[clamp(4rem,5.4vw,5.4rem)] md:block">
          <InkEyes className="!relative block w-full" tilt={6} blink={5.8} delay={0.3} />
        </span>

        <div className="mt-[clamp(1.5rem,4vh,3rem)] flex flex-wrap items-center justify-center gap-[clamp(1.5rem,5vw,4rem)]">
          <h2 className="brush -rotate-[1.5deg] select-none text-center text-[clamp(5.6rem,18vw,14rem)] leading-[0.84] text-lime">
            {/* short drips: the button's right underneath */}
            <GooWord text="Ready?" short />
          </h2>
        </div>

        <div data-scrub="up" data-scrub-amount="9" className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-center justify-center gap-[clamp(1.25rem,4vw,3rem)]">
          {/* the way out, pointing at the button */}
          <span data-anim="rise" data-note={SURVIVAL.notes.sign} className="relative mt-[clamp(1.5rem,4vh,3rem)] block shrink-0" aria-hidden="true">
            <Sprite name="signboard" scale={0.5} drift={10} />
            <span className="hand absolute left-[34%] top-[45%] w-[54%] rotate-[7deg] whitespace-pre-line text-center text-[clamp(0.85rem,1.45vw,1.3rem)] font-bold leading-[0.95] text-lime [text-shadow:0_1px_0_rgba(8,8,8,0.6)]">
              {`${SURVIVAL.sign}\n→`}
            </span>
          </span>
          <BlobButton data-anim="rise" href={EVENT.registerHref} size="lg">
            Register now
          </BlobButton>
          <p className="hand max-w-[12ch] whitespace-pre-line text-[clamp(1.05rem,1.6vw,1.5rem)] text-bone/60">
            {NOTES.ready}
          </p>
        </div>

        {/* The one thing on the page that is different every time you look.
            It fills the measure under the heading with information rather than
            ornament, and it is the reason to come back. */}
        <div className="mt-[clamp(2rem,6vh,3.5rem)] flex justify-center">
          <Countdown target={EVENT.startsAt} className="justify-center text-bone" />
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
      <Sprite name="star" scale={0.15} drift={28} className="absolute right-[22%] top-[58%] hidden md:block" />
    </Section>
  );
}
