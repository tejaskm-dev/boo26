import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import EdgeLabel from "@/components/ui/EdgeLabel";
import Closed from "@/components/register/Closed";
import RegisterHeader from "@/components/register/RegisterHeader";
import Hero, { Blob } from "@/components/register/Hero";
import NextStop from "@/components/register/NextStop";
import { JUDGING } from "@/lib/register/content";
import { registrationOpen } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { EVENT } from "@/lib/site";

export const metadata = registerMeta({
  title: `Judging — ${EVENT.name} ${EVENT.year}`,
  description: `How builds are judged at ${EVENT.name} ${EVENT.year}: the reaction first, then the build, the idea and the show.`,
});

/** the reaction takes the lime; the rest step back into the dark in order */
const SHADES = ["bg-lime", "bg-bone/70", "bg-bone/45", "bg-bone/25"];

const MORNING = [
  { k: "When", v: "The morning of 25 October, at the end of the 20 hours. The night's last stop: 10 AM, make them react." },
  { k: "How", v: "You put your build in front of someone and watch them react." },
  { k: "Who", v: "The judges are still to be announced." },
  { k: "The last word", v: "The judges' decisions are final." },
];

/**
 * Stop 02 on the path: what the night is scored on. The split leads, as one
 * bar, because the proportions are the point — the reaction is most of it.
 */
export default function JudgingPage() {
  if (!registrationOpen()) return <Closed />;
  return (
    <>
      <RegisterHeader back={{ href: "/register", label: "Register" }} />
      <main className="relative overflow-x-clip">
        <Sprite name="star" scale={0.13} drift={30} className="pointer-events-none absolute left-[46%] top-[30%] z-10 hidden md:block" />
        <Hero index="02" label="Judging" title={"How it's\njudged."} note={"Spoiler: make\nthem react."} cat="eyes-glow" catScale={0.34}>
          <Blob title="The split">
            <div aria-hidden="true" className="flex h-[2.4rem] w-full gap-[3px] overflow-hidden rounded-full">
              {JUDGING.map((c, i) => (
                <span
                  key={c.name}
                  data-grow={0.12 * i}
                  className={`h-full basis-0 ${SHADES[i]}`}
                  style={{ flexGrow: c.weight }}
                />
              ))}
            </div>
            <ul className="mt-[clamp(1rem,2.4vh,1.4rem)] grid grid-cols-2 gap-x-[clamp(1rem,2vw,1.75rem)] gap-y-3">
              {JUDGING.map((c, i) => (
                <li key={c.name} className="flex items-baseline justify-between gap-3 border-t border-bone/15 pt-2.5">
                  <span className="label flex items-center gap-2.5 text-bone/70">
                    <span aria-hidden="true" className={`h-[0.45rem] w-[0.45rem] shrink-0 rotate-45 ${SHADES[i]}`} />
                    {c.name.replace(/^The /, "")}
                  </span>
                  <span className="display text-[clamp(1.05rem,1.5vw,1.3rem)] leading-none text-bone">
                    <span data-count={c.weight}>{c.weight}</span>%
                  </span>
                </li>
              ))}
            </ul>
          </Blob>
        </Hero>

        <Section
          field="bone"
          forms={[{ shape: "swellMid", tone: "ink", at: "inset-x-0 top-0 w-full h-[8vh] md:h-[15vh]" }]}
          className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(4.5rem,13vh,10rem)]"
        >
          <GhostIndex className="right-[4%] top-[3%] hidden text-[clamp(12rem,22vw,22rem)] lg:block">02</GhostIndex>
          <EdgeLabel side="left" className="top-[12%]">
            Judging — {EVENT.name} {EVENT.year}
          </EdgeLabel>

          <div className="px-[var(--edge)] lg:pr-[clamp(3rem,6vw,7rem)]">
            <SectionLabel index="01">The four things</SectionLabel>
            <p data-write className="hand mt-5 max-w-[14ch] -rotate-[3deg] whitespace-pre-line text-[clamp(1.1rem,1.8vw,1.6rem)] text-ink/60">
              {"Weighted.\nOn purpose."}
            </p>

            <ol className="mt-[clamp(1.75rem,4.5vh,2.75rem)] border-b border-ink/15">
              {JUDGING.map((c, i) => (
                <li
                  key={c.name}
                  className="grid gap-[clamp(1.25rem,3vw,3rem)] border-t border-ink/15 py-[clamp(1.75rem,4.5vh,2.75rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <div className="relative">
                    <span className="label text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="brush mt-3 -rotate-[1.2deg] pr-[clamp(4.5rem,14vw,8rem)] text-[clamp(2.3rem,5.2vw,4.3rem)] leading-[0.88]">
                      {c.name}
                    </h2>
                    <p className="hand mt-2 -rotate-[2deg] pl-[0.3rem] text-[clamp(1.1rem,1.6vw,1.45rem)] text-ink/60">{c.line}</p>
                    <Sprite name={c.sprite} data-pop scale={0.26} drift={12} className="absolute right-0 top-[0.4rem] rotate-[6deg]" />
                  </div>

                  <div>
                    <p className="flex items-baseline gap-3">
                      <span
                        className={`display inline-block text-[clamp(2.8rem,6.4vw,5.2rem)] leading-[0.85] ${
                          i === 0 ? "bg-lime px-[0.18em] py-[0.08em] [border-radius:46%_54%_58%_42%/42%_60%_40%_58%]" : ""
                        }`}
                      >
                        <span data-count={c.weight}>{c.weight}</span>%
                      </span>
                      <span className="label text-ink/45">of the score</span>
                    </p>
                    {/* the same share again, as a bar that fills */}
                    <span aria-hidden="true" className="mt-4 block h-[3px] w-full max-w-[18rem] bg-ink/10">
                      <span data-grow className={`block h-full ${i === 0 ? "bg-lime" : "bg-ink/45"}`} style={{ width: `${c.weight}%` }} />
                    </span>
                    <p className="label mt-[clamp(1.25rem,3vh,1.75rem)] text-ink/45">What the judges ask</p>
                    <ul className="mt-3 max-w-[48ch] space-y-[0.6rem]">
                      {c.asks.map((a) => (
                        <li key={a} className="body-copy flex gap-[0.9rem] text-[clamp(0.95rem,1.05vw,1.02rem)] text-ink/75">
                          <span
                            aria-hidden="true"
                            className="mt-[0.58em] h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime shadow-[0_0_0_1px_rgba(8,8,8,0.28)]"
                          />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>

            {/* the morning itself */}
            <div
              data-scrub="up"
              data-scrub-amount="5"
              className="mt-[clamp(4rem,10vh,6.5rem)] grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]"
            >
              <div>
                <SectionLabel index="02">On the morning</SectionLabel>
                <p data-write className="hand mt-5 max-w-[12ch] -rotate-[3deg] whitespace-pre-line text-[clamp(1.1rem,1.8vw,1.6rem)] text-ink/60">
                  {"Show\ntime."}
                </p>
              </div>
              <dl data-stagger className="grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-[clamp(1.5rem,4vh,2.25rem)] sm:grid-cols-2">
                {MORNING.map((m) => (
                  <div key={m.k} data-anim="rise" className="border-t border-ink/15 pt-4">
                    <dt className="label text-ink/45">{m.k}</dt>
                    <dd className="body-copy mt-3 max-w-[40ch] text-[clamp(0.96rem,1.1vw,1.05rem)] text-ink/80">{m.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>

        <NextStop
          index="03"
          title="Your team"
          note="Start one, or join the one your teammate started."
          href="/register"
          cat="cat-stretch"
          aside={"Know the rules?\nKnow the score?\nGo."}
          action={{ href: "/register/create", label: "Start a team" }}
        />
      </main>
    </>
  );
}
