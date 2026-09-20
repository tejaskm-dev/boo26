import Section from "./Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import BlobButton from "@/components/ui/BlobButton";
import { EVENT, NOTES } from "@/lib/site";

/**
 * The closing beat. Lime at full size for the only time on the page, and the
 * cat coming up over the bottom edge as if the night is about to start.
 */
export default function Ready() {
  return (
    <Section
      id="register"
      field="ink"
      edge={{ from: "bone", shape: "wave" }}
      className="pb-[clamp(6rem,16vh,11rem)] pt-[clamp(5rem,13vh,9rem)]"
    >
      <div className="relative px-[var(--edge)]">
        <p className="label label-loose whitespace-pre-line text-bone/45">
          Same people.{"\n"}Brighter ideas.{"\n"}Scarier night.
        </p>

        <div className="mt-[clamp(1.5rem,4vh,3rem)] flex flex-wrap items-center justify-center gap-[clamp(1.5rem,5vw,4rem)]">
          <Words
            as="h2"
            className="brush -rotate-[1.5deg] select-none text-center text-[clamp(4.5rem,18vw,14rem)] leading-[0.84] text-lime"
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

        <p className="label label-loose mt-[clamp(2.5rem,6vh,4rem)] text-center text-bone/40">
          {EVENT.date} &nbsp;|&nbsp; {EVENT.venue} &nbsp;|&nbsp; {EVENT.duration}
        </p>
      </div>

      {/* coming up over the bottom edge */}
      <RiseIn from="bottom" className="absolute -bottom-[clamp(1.5rem,4vw,3.5rem)] left-[6%] z-10 md:left-[12%]" start="top 92%">
        <Sprite name="cat-peek" scale={1.25} drift={14} idle={6} />
      </RiseIn>
      <Sprite name="ghost-drip" scale={1.1} drift={22} idle={7} className="absolute right-[10%] top-[24%] hidden opacity-80 md:block" />
      <Sprite name="star" scale={0.55} drift={28} className="absolute right-[22%] top-[58%] hidden md:block" />
    </Section>
  );
}
