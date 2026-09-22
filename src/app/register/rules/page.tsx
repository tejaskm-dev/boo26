import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import GhostIndex from "@/components/ui/GhostIndex";
import EdgeLabel from "@/components/ui/EdgeLabel";
import Closed from "@/components/register/Closed";
import RegisterHeader from "@/components/register/RegisterHeader";
import Hero, { Blob, Diamonds } from "@/components/register/Hero";
import NextStop from "@/components/register/NextStop";
import { GUIDE, RULES, RULES_SHORT } from "@/lib/register/content";
import { registrationMode } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { EVENT, TIMELINE } from "@/lib/site";

export const metadata = registerMeta({
  title: `Rules & guidelines — ${EVENT.name} ${EVENT.year}`,
  description: `The rules for ${EVENT.name} ${EVENT.year}, and what to know for the night: what to bring, food, sleep and the fee.`,
});

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Stop 01 on the path: the rules, all on show — a rule you have to open isn't
 * one anybody reads — then the practical side of the night.
 */
export default function RulesPage() {
  if (registrationMode() === "soon") return <Closed />;
  return (
    <>
      <RegisterHeader back={{ href: "/register", label: "Register" }} />
      <main className="relative overflow-x-clip">
        <Hero index="01" label="Rules & guidelines" title={"The\nrules."} note={"Short. Mostly\ncommon sense."} cat="cat-confused">
          <Blob title="In short">
            <Diamonds lines={RULES_SHORT} />
          </Blob>
        </Hero>

        <Section
          field="bone"
          forms={[{ shape: "swellMid", tone: "ink", at: "inset-x-0 top-0 w-full h-[8vh] md:h-[15vh]" }]}
          className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(4.5rem,13vh,10rem)]"
        >
          <GhostIndex className="right-[4%] top-[3%] hidden text-[clamp(12rem,22vw,22rem)] lg:block">01</GhostIndex>
          <EdgeLabel side="left" className="top-[12%]">
            The rules — {EVENT.name} {EVENT.year}
          </EdgeLabel>

          {/* the rules */}
          <div className="grid gap-[clamp(1.5rem,4vw,5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:pr-[clamp(3rem,6vw,7rem)]">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
              <SectionLabel index="01">The rules</SectionLabel>
              <p className="hand mt-5 max-w-[14ch] -rotate-[3deg] whitespace-pre-line text-[clamp(1.1rem,1.8vw,1.6rem)] text-ink/60">
                {`${RULES.length} of them.\nAll of them count.`}
              </p>
            </div>

            <ol data-stagger className="border-b border-ink/15">
              {RULES.map((r, i) => (
                <li
                  key={r.title}
                  data-anim="rise"
                  className="border-t border-ink/15 py-[clamp(1.2rem,3vh,1.8rem)] md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-baseline md:gap-8"
                >
                  <div className="flex items-baseline gap-[clamp(0.9rem,1.8vw,1.5rem)]">
                    <span className="label w-[1.6rem] shrink-0 text-ink/35">{pad(i)}</span>
                    <h2 className="display text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.02]">{r.title}</h2>
                  </div>
                  <p className="body-copy mt-2 max-w-[52ch] pl-[calc(1.6rem+clamp(0.9rem,1.8vw,1.5rem))] text-[clamp(0.96rem,1.1vw,1.05rem)] text-ink/75 md:mt-0 md:pl-0">
                    {r.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* the night, practically */}
          <div className="mt-[clamp(4.5rem,11vh,7rem)] px-[var(--edge)] lg:pr-[clamp(3rem,6vw,7rem)]">
            <SectionLabel index="02">The night, practically</SectionLabel>
            <p className="hand mt-5 max-w-[16ch] -rotate-[3deg] whitespace-pre-line text-[clamp(1.1rem,1.8vw,1.6rem)] text-ink/60">
              {"Pack light.\nCharge everything."}
            </p>

            <ul className="mt-[clamp(3rem,7vh,4.5rem)] grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-[clamp(3.25rem,8vh,4.5rem)] sm:grid-cols-2 lg:grid-cols-3">
              {GUIDE.map((g) => (
                <li key={g.title} className="relative border-t border-ink/15 pt-[clamp(1.1rem,2.6vh,1.5rem)]">
                  <Sprite
                    name={g.sprite}
                    scale={g.scale}
                    drift={10}
                    className="absolute bottom-[calc(100%-0.5rem)] right-[4%]"
                  />
                  <h2 className="display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-none">{g.title}</h2>
                  <p className="body-copy mt-3 max-w-[36ch] text-[clamp(0.95rem,1.05vw,1rem)] text-ink/75">{g.body}</p>
                </li>
              ))}
              <li className="relative border-t border-ink/15 pt-[clamp(1.1rem,2.6vh,1.5rem)]">
                <Sprite name="moon" scale={0.2} drift={10} className="absolute bottom-[calc(100%-0.5rem)] right-[4%]" />
                <h2 className="display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-none">The schedule</h2>
                <ol className="mt-3 space-y-[0.55rem]">
                  {TIMELINE.map((t) => (
                    <li key={t.time} className="body-copy flex items-baseline gap-3 text-[clamp(0.95rem,1.05vw,1rem)]">
                      <span className="label w-[3.4rem] shrink-0 text-ink/45">{t.time}</span>
                      <span className="text-ink/80">{t.label}</span>
                    </li>
                  ))}
                </ol>
              </li>
            </ul>
          </div>
        </Section>

        <NextStop
          index="02"
          title="Judging"
          note="The four things the night is scored on."
          href="/register/judging"
          cat="cat-sleepy"
          aside={"Rules read.\nOne stop to go."}
          action={{ href: "/register", label: "Pick your path" }}
        />
      </main>
    </>
  );
}
