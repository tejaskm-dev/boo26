import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import RiseIn from "@/components/fx/RiseIn";
import Awake from "./Awake";
import Classified from "./Classified";
import Cut from "./Cut";
import Critters from "./Critters";
import InkField from "./InkField";
import Rumour from "./Rumour";
import Tremble from "./Tremble";
import { CUTS, SECRETS, SOON } from "@/lib/soon";

/**
 * The night's field. On a laptop it holds the right flank beside the words,
 * its far edge running off the screen; on a phone it's a band right across,
 * running off both sides. Drawn at the proportion each is shown at.
 */
const FLANK = {
  view: "0 0 800 1000",
  d: "M980 30C900 10 820 40 760 36C690 32 660 2 590 12C520 22 500 70 430 76C360 82 330 48 268 60C200 72 190 130 150 176C110 222 40 236 30 300C20 364 96 392 112 452C128 512 60 540 50 604C40 668 100 700 92 760C84 820 20 846 40 900C60 954 150 968 240 956C330 944 380 984 470 980C560 976 600 940 690 948C780 956 860 990 980 976Z",
};
const BAND = {
  view: "0 0 400 560",
  d: "M-40 60C30 30 70 84 140 66C210 48 236 8 306 22C360 34 384 70 440 52L440 520C380 540 350 500 280 512C210 524 190 556 120 540C60 526 30 490 -40 504Z",
};

/**
 * 01 — the rumour. Laid out like The Night: the heading oversized and off
 * the left edge, the peeking cat hauling itself over the join above.
 *
 * Beside it, one of the hero's living fields, with the moon up in it and
 * the night's one story: a rumour passed along a chain of eyes in the dark,
 * changing as it goes (Rumour). Where the device can take it, cat-bats flap
 * about under the moon, and a tap on the dark sends more of them out of it
 * (Critters). What we know is set big and blacked out.
 */
export default function Heard() {
  const t = SOON.heard;
  return (
    <Section
      id="heard"
      field="bone"
      className="pb-[clamp(4rem,11vh,7.5rem)] pt-[clamp(5.5rem,17vh,13rem)] md:pt-[clamp(5.5rem,24vh,13rem)]"
    >
      <Cut lines={CUTS.open} back={CUTS.openBack} />
      <Awake />

      {/* the cat is hauling itself over the boundary above — and it knows */}
      <RiseIn className="absolute -top-[clamp(2.5rem,7vw,6rem)] right-[6%] z-10 md:right-[26%]" start="top 96%">
        <Sprite name="cat-peek" scale={0.7} drift={16} idle={6} />
      </RiseIn>

      <div className="px-[var(--edge)]">
        <SectionLabel index="01">{t.label}</SectionLabel>
      </div>

      <GhostIndex className="left-[46%] top-[5%] hidden text-[clamp(10rem,26vw,24rem)] lg:block">01</GhostIndex>

      <div data-secret={SECRETS.heading} className="relative z-[4] w-fit">
      <Tremble again={t.again} className="soon-glitch brush lean relative z-[4] mt-[clamp(1.75rem,4.5vh,3rem)] -rotate-[1.4deg] select-none pb-[0.1em] pl-[var(--edge)] text-[clamp(3.6rem,11.5vw,10rem)] leading-[0.84]">
        {t.heading}
      </Tremble>
      </div>

      <div className="mt-[clamp(1.75rem,5vh,3.5rem)] grid items-start px-[var(--edge)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-[clamp(2.5rem,5vw,5rem)]">
        <p data-anim="rise" data-secret={SECRETS.body} className="display relative z-[4] max-w-[17ch] text-[clamp(1.35rem,2.6vw,2.15rem)] leading-[1.12] lg:col-start-1 lg:row-start-1">
          {t.body}
        </p>

        {/* the night, and the rumour going round it */}
        <div
          data-night
          className="relative z-[1] -mx-[var(--edge)] mt-[clamp(1.5rem,4vh,3rem)] h-[clamp(34rem,150vw,44rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mr-[var(--edge)] lg:ml-0 lg:mt-0 lg:h-full lg:min-h-[clamp(38rem,80vh,52rem)]"
        >
          <InkField ns="heard-flank" view={FLANK.view} shape={FLANK.d} className="inset-0 hidden lg:block" />
          <InkField ns="heard-band" view={BAND.view} shape={BAND.d} className="inset-0 lg:hidden" />

          <span aria-hidden="true" data-secret={SECRETS.moon} className="absolute right-[6%] top-[7%] block lg:right-[9%] lg:top-[4%]">
            <Sprite name="moon" scale={0.42} drift={22} idle={7} />
          </span>

          <Rumour />
        </div>

        <div className="relative z-[4] mt-[clamp(3rem,8vh,4.5rem)] lg:col-start-1 lg:row-start-2 lg:mt-[clamp(2.5rem,7vh,4.5rem)]">
          <Classified />
        </div>
      </div>

      {/* a few bats about the moon, clear of the rumour (and more out of the dark, tap it) */}
      <Critters bats={3} sky={[0.07, 0.2]} span={[0.6, 1]} className="z-[3]" />
    </Section>
  );
}
