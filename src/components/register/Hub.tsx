import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import BlobButton from "@/components/ui/BlobButton";
import RowMark from "@/components/ui/RowMark";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Marquee from "@/components/fx/Marquee";
import Countdown from "@/components/fx/Countdown";
import CodeEntry from "./CodeEntry";
import { BAND, EVENT, NOTES } from "@/lib/site";
import { HOW, JUDGING, RULES } from "@/lib/register/content";
import type { SpriteName } from "@/lib/sprites";

const FACTS = [
  { k: "Team", v: "2 PEOPLE" },
  { k: "Fee", v: "₹200 A TEAM" },
  { k: "Open to", v: "ASIET STUDENTS" },
  { k: "Starts", v: "24 OCT, 2 PM" },
] as const;

/** the reading along the way: each its own page, so a phone gets one thing at a time */
const MAP = [
  {
    href: "/register/rules",
    title: "Rules & guidelines",
    note: `${RULES.length} rules, then what to bring, food and sleep.`,
  },
  {
    href: "/register/judging",
    title: "Judging",
    note: JUDGING.map((c) => `${c.name.replace(/^The /, "")} ${c.weight}%`).join(" · "),
  },
  { href: "/code-of-conduct", title: "Code of Conduct", note: "Make people react. Never make them unsafe." },
];

/**
 * /register — where the path forks.
 *
 * Registering takes two people, and one of them has to go first, so the page
 * leads with that choice and nothing else: start a team, or join one. On a
 * phone that's the first thing under the heading. What there is to read —
 * the rules, the judging, the conduct — comes after, as a map of the stops
 * along the way, each one its own page.
 */
export default function Hub() {
  return (
    <main className="relative overflow-x-clip">
      {/* 1 — the fork */}
      <Section field="ink" className="pb-[clamp(3rem,8vh,5rem)] pt-[calc(var(--header-h)+clamp(1.5rem,5vh,3.5rem))]">
        <div data-intro className="relative px-[var(--edge)]">
          <p data-anim="rise" className="label label-loose text-bone/45">
            Registration · {EVENT.date}
          </p>

          {/* On a phone it runs question, the two paths, then the facts. On a
              wide screen the paths take the right half, so both are on the
              first screen beside the question they answer. */}
          <div className="mt-[clamp(1.5rem,4vh,2.5rem)] grid grid-cols-1 gap-y-[clamp(2rem,5vh,3rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative lg:col-start-1 lg:row-start-1 lg:pr-[clamp(2rem,4vw,4.5rem)]">
              <Words
                as="h1"
                className="brush -rotate-[1.5deg] select-none pb-[0.06em] text-[clamp(3.6rem,12vw,8rem)] leading-[0.84] text-lime lg:text-[clamp(4.5rem,8.6vw,8rem)]"
              >
                {"Pick your\npath."}
              </Words>
              <p className="hand mt-[clamp(0.6rem,1.6vh,1rem)] -rotate-[3deg] whitespace-pre-line pl-[0.4rem] text-[clamp(1.15rem,1.9vw,1.7rem)] text-bone/65 md:pl-[clamp(2rem,6vw,5rem)]">
                {"Two of you.\nOne night."}
              </p>
              {/* the signpost at the fork, beside the short second line */}
              <RiseIn className="pointer-events-none absolute right-[4%] top-[30%] md:right-[14%] lg:right-[10%]" start="top 100%">
                <Sprite name="signboard" scale={0.5} drift={14} idle={4} />
              </RiseIn>
            </div>

            <div className="border-t border-bone/15 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0 lg:pl-[clamp(2.5rem,4vw,4.5rem)]">
              <Path
                letter="A"
                who="One of you"
                title="Start a team."
                body="Go first. Your details and a team name, then a code, a link and a QR to send your teammate."
                cat="cat-excited"
              >
                <BlobButton href="/register/create" size="lg">
                  Start a team
                </BlobButton>
              </Path>

              {/* where the path splits */}
              <div aria-hidden="true" className="flex items-center gap-4">
                <span className="h-px flex-1 bg-bone/15" />
                <span className="hand grid h-[3.2rem] w-[3.2rem] place-items-center rounded-full pb-1 text-[1.55rem] text-lime">or</span>
                <span className="h-px flex-1 bg-bone/15" />
              </div>

              <Path
                letter="B"
                who="The other one"
                title="Join a team."
                body="Your teammate started it? Scan their QR, tap their link, or type their code in here."
                cat="cat-curious"
              >
                <CodeEntry id="hub-code" />
              </Path>
            </div>

            <dl
              data-anim="rise"
              className="grid grid-cols-2 gap-x-6 gap-y-[clamp(1.1rem,2.6vh,1.6rem)] border-t border-bone/15 pt-[clamp(1.1rem,2.6vh,1.6rem)] lg:col-start-1 lg:row-start-2 lg:mr-[clamp(2rem,4vw,4.5rem)] lg:self-end"
            >
              {FACTS.map((f) => (
                <div key={f.k}>
                  <dt className="label text-bone/45">{f.k}</dt>
                  <dd className="display mt-2 text-[clamp(0.95rem,1.5vw,1.2rem)] leading-none">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* 2 — how it works, and the stops to read on the way */}
      <Section
        field="bone"
        forms={[{ shape: "swellMid", tone: "ink", at: "inset-x-0 top-0 w-full h-[8vh] md:h-[15vh]" }]}
        className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(4.5rem,13vh,10rem)]"
      >
        <div className="flex items-start justify-between gap-6 px-[var(--edge)]">
          <SectionLabel index="01">How it works</SectionLabel>
          <p className="hand max-w-[12ch] whitespace-pre-line text-right text-[clamp(1rem,1.5vw,1.4rem)] text-ink/55">
            {"Two people.\nOne code."}
          </p>
        </div>

        <ol data-stagger className="mt-[clamp(1.5rem,4vh,2.5rem)] grid border-y border-ink/15 md:grid-cols-3">
          {HOW.map((s, i) => (
            <li
              key={s.index}
              data-anim="rise"
              className={`relative bg-bone px-[var(--edge)] py-[clamp(1.25rem,3vh,2rem)] md:px-[clamp(1.25rem,2.5vw,2.5rem)] ${
                i > 0 ? "border-t border-ink/15 md:border-l md:border-t-0" : ""
              }`}
            >
              <span className="label text-lime">{s.index}</span>
              <p className="mt-3">
                <span
                  className={`display inline-block text-[clamp(1.4rem,2.5vw,2.1rem)] leading-none ${
                    "lime" in s && s.lime ? "bg-lime px-3 py-1 text-ink [border-radius:46%_54%_58%_42%/42%_60%_40%_58%]" : ""
                  }`}
                >
                  {s.label}
                </span>
              </p>
              <p className="label mt-3 text-ink/45">{s.note}</p>
            </li>
          ))}
        </ol>

        <div className="mt-[clamp(3.5rem,9vh,6rem)] grid gap-[clamp(2rem,5vw,5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div className="relative">
            <SectionLabel index="02">Before you start</SectionLabel>
            <p className="hand mt-6 max-w-[14ch] -rotate-[3deg] whitespace-pre-line text-[clamp(1.15rem,2vw,1.8rem)] text-ink/70">
              {"Read the map.\nIt's short."}
            </p>
            <Sprite name="treasure-map" scale={0.46} drift={12} idle={4} className="mt-8 hidden -rotate-[6deg] lg:block" />
          </div>

          <nav aria-label="Before you start">
            <ol className="border-t border-ink/15">
              {MAP.map((m, i) => (
                <li key={m.href} className="border-b border-ink/15">
                  <a
                    href={m.href}
                    className="group relative flex items-baseline gap-[clamp(0.9rem,2vw,1.6rem)] py-[clamp(1rem,2.6vh,1.5rem)] outline-none"
                  >
                    <RowMark seed={i} />
                    <span className="row-index label relative w-[1.6rem] shrink-0 text-ink/35">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="display block text-[clamp(1.45rem,3.4vw,2.8rem)] leading-none">{m.title}</span>
                      <span className="body-copy mt-2 block text-[clamp(0.88rem,1vw,0.98rem)] text-ink/60">{m.note}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="relative shrink-0 text-[clamp(1rem,1.6vw,1.4rem)] opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </Section>

      {/* 3 — how long's left */}
      <Section
        field="ink"
        forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[11vh] md:h-[19vh]" }]}
        className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(6rem,19vh,12rem)]"
      >
        <div className="flex flex-col items-center px-[var(--edge)] text-center">
          <p className="label label-loose text-bone/45">The doors open in</p>
          <div className="mt-[clamp(1.25rem,3vh,2rem)]">
            <Countdown target={EVENT.startsAt} className="justify-center text-bone" />
          </div>
          <p className="hand mt-[clamp(1.75rem,4.5vh,2.75rem)] -rotate-[2deg] text-[clamp(1.25rem,2.2vw,1.9rem)] text-lime">
            {NOTES.footer}
          </p>
        </div>

        <div className="mt-[clamp(2.5rem,7vh,4.5rem)] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
          <Marquee items={BAND} speed={42} className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70" />
        </div>
      </Section>
    </main>
  );
}

function Path({
  letter,
  who,
  title,
  body,
  cat,
  children,
}: {
  letter: string;
  who: string;
  title: string;
  body: string;
  cat: SpriteName;
  children: React.ReactNode;
}) {
  return (
    <article className="relative py-[clamp(1.5rem,3.5vh,2.25rem)]">
      <p className="label flex items-center gap-3 text-bone/45">
        <span className="text-lime">Path {letter}</span>
        <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
        <span>{who}</span>
      </p>
      <Words
        as="h2"
        className="brush mt-[clamp(0.85rem,2.2vh,1.25rem)] -rotate-[1.2deg] select-none pr-[clamp(4rem,16vw,9rem)] text-[clamp(2.6rem,9vw,4rem)] leading-[0.88] text-bone lg:text-[clamp(2.4rem,3.4vw,3.5rem)]"
      >
        {title}
      </Words>
      <p className="body-copy mt-[clamp(0.75rem,1.8vh,1rem)] max-w-[44ch] text-[clamp(0.95rem,1.1vw,1.05rem)] text-bone/70">
        {body}
      </p>
      <div className="mt-[clamp(1.1rem,3vh,1.75rem)]">{children}</div>
      {/* beside the label and the heading, clear of the text under them */}
      <RiseIn className="pointer-events-none absolute right-[2%] top-[clamp(1.25rem,3.5vh,2.25rem)] lg:top-[-0.4rem]" start="top 96%">
        <Sprite name={cat} scale={0.33} drift={12} idle={5} />
      </RiseIn>
    </article>
  );
}
