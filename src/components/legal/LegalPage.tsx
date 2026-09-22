import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import Wordmark from "@/components/ui/Wordmark";
import BlobButton from "@/components/ui/BlobButton";
import GhostIndex from "@/components/ui/GhostIndex";
import EdgeLabel from "@/components/ui/EdgeLabel";
import RowMark from "@/components/ui/RowMark";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import Marquee from "@/components/fx/Marquee";
import LegalToc from "./LegalToc";
import { BAND, EVENT, LEGAL } from "@/lib/site";
import type { SpriteName } from "@/lib/sprites";

export type Clause = { id: string; title: string; body: React.ReactNode };

export type LegalDoc = {
  /** which of the three this is — an href from LEGAL */
  href: string;
  title: string;
  /** the brush heading, broken where it should break */
  heading: string;
  /** the handwritten note under the heading */
  note: string;
  /** the cat reading over the summary */
  cat: SpriteName;
  /** its size, as a multiple of its art; the cats' art isn't drawn to one scale */
  catScale?: number;
  updated: string;
  summary: React.ReactNode[];
  clauses: Clause[];
};

/**
 * One page of the fine print, in the site's three beats: the ink field with
 * the lime brush heading the register page opens on, the text on the bone
 * field with its contents held alongside (the FAQ's spread, stretched to a
 * document), and the ink field again to close, with the other two documents
 * and the way back.
 *
 * Like the register page, only the wordmark rides in the corner: the home
 * page's menu points at anchors that aren't on this page.
 */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const tag = `${doc.title} — ${EVENT.name} ${EVENT.year}`;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]">
        <Wordmark href="/" className="pointer-events-auto" />
      </header>

      <main className="relative overflow-x-clip">
        {/* 1 — what this is */}
        <Section field="ink" className="pb-[clamp(3.5rem,9vh,6rem)] pt-[calc(var(--header-h)+clamp(2.5rem,8vh,5.5rem))]">
          <div data-intro className="relative px-[var(--edge)]">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <SectionLabel index="§" className="text-bone">
                The fine print
              </SectionLabel>
              {/* Arriving here, the page wipe closes into the way back. A plain
                  link on purpose, as everywhere: the wipe plays between full
                  page loads, and next/link would skip it. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                data-wipe-origin
                data-anim="rise"
                className="group label inline-flex items-center gap-3 text-bone/60 outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime"
              >
                <svg viewBox="0 0 16 10" className="h-[0.7rem] w-[1.1rem] transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5H2M6 1 2 5l4 4" />
                </svg>
                Back to {EVENT.name}
              </a>
            </div>

            <div className="mt-[clamp(2rem,6vh,3.75rem)] grid gap-[clamp(4.5rem,11vh,6rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-[clamp(2.5rem,5vw,5rem)]">
              <div>
                <Words
                  as="h1"
                  className="brush -rotate-[1.5deg] select-none pb-[0.08em] text-[clamp(3.4rem,9vw,8.5rem)] leading-[0.86] text-lime"
                >
                  {doc.heading}
                </Words>
                <p className="hand mt-[clamp(0.75rem,2vh,1.25rem)] -rotate-[3deg] whitespace-pre-line pl-[0.4rem] text-[clamp(1.15rem,1.9vw,1.7rem)] text-bone/65 md:pl-[clamp(2rem,6vw,5rem)]">
                  {doc.note}
                </p>
                <p data-anim="rise" className="label label-loose mt-[clamp(1.75rem,4.5vh,3rem)] text-bone/45">
                  <span className="block">Updated {doc.updated}</span>
                  <span className="mt-[0.9em] block">
                    {EVENT.name} {EVENT.year} · {EVENT.venue}
                  </span>
                </p>
              </div>

              {/* the short version, on the soft blob the FAQ rests its answers on */}
              <div data-anim="rise" className="relative">
                {/* sitting on the blob's top edge, whatever its height */}
                <RiseIn className="absolute bottom-[calc(100%-1.1rem)] right-[10%] z-10" start="top 98%">
                  <Sprite name={doc.cat} scale={doc.catScale ?? 0.46} drift={14} idle={5} />
                </RiseIn>
                <div className="bg-bone/[0.07] px-[clamp(1.4rem,3vw,2.6rem)] py-[clamp(1.5rem,3.5vh,2.4rem)] [border-radius:34%_66%_58%_42%/40%_36%_64%_60%] md:[border-radius:46%_54%_58%_42%/42%_60%_40%_58%]">
                  <p className="label label-loose text-lime">In short</p>
                  <ul className="mt-[clamp(1rem,2.4vh,1.4rem)] space-y-[0.8rem]">
                    {doc.summary.map((line, i) => (
                      <li key={i} className="body-copy flex gap-[0.9rem] text-[clamp(0.95rem,1.1vw,1.05rem)] text-bone/85">
                        <span aria-hidden="true" className="mt-[0.55em] h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 2 — the document */}
        <Section
          field="bone"
          forms={[{ shape: "swellMid", tone: "ink", at: "inset-x-0 top-0 w-full h-[8vh] md:h-[15vh]" }]}
          className="pb-[clamp(4rem,10vh,7rem)] pt-[clamp(4.5rem,13vh,10rem)]"
        >
          {/* the margin beside the text is air on a wide screen; this is what fills it */}
          <GhostIndex className="right-[4%] top-[5%] hidden text-[clamp(12rem,22vw,22rem)] lg:block">§</GhostIndex>
          {/* left, because the scrollbar runs down the right edge */}
          <EdgeLabel side="left" className="top-[18%]">
            {tag}
          </EdgeLabel>

          <div className="grid gap-[clamp(2rem,5vw,5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:pr-[clamp(3rem,6vw,7rem)]">
            <LegalToc items={doc.clauses.map(({ id, title }) => ({ id, title }))} />

            <div className="border-b border-ink/15">
              {doc.clauses.map((clause, i) => (
                <article
                  key={clause.id}
                  id={clause.id}
                  aria-labelledby={`${clause.id}-title`}
                  className="scroll-mt-[calc(var(--header-h)+1.5rem)] border-t border-ink/15 py-[clamp(1.75rem,4.5vh,2.75rem)]"
                >
                  <div className="flex items-baseline gap-[clamp(0.9rem,1.8vw,1.5rem)]">
                    <span className="label w-[1.6rem] shrink-0 text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                    <h2 id={`${clause.id}-title`} className="display text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.02]">
                      {clause.title}
                    </h2>
                  </div>
                  <div className="mt-[clamp(1rem,2.4vh,1.4rem)] space-y-[1.05rem] md:pl-[calc(1.6rem+clamp(0.9rem,1.8vw,1.5rem))]">
                    {clause.body}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        {/* 3 — the rest of the fine print, and the way back */}
        <Section
          field="ink"
          forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[11vh] md:h-[19vh]" }]}
          className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(6rem,19vh,12rem)]"
        >
          <div className="relative grid gap-[clamp(3rem,7vw,6rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
            <nav aria-label="The fine print">
              <p className="label label-loose text-bone/45">All of the fine print</p>
              <ol className="mt-[clamp(1.25rem,3vh,2rem)] border-t border-bone/15">
                {LEGAL.map((l, i) => {
                  const here = l.href === doc.href;
                  const inner = (
                    <>
                      <span className="row-index label relative w-[1.6rem] shrink-0 text-bone/35">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="display relative flex-1 text-[clamp(1.45rem,3.6vw,3rem)] leading-none">{l.label}</span>
                    </>
                  );
                  return (
                    <li key={l.href} className="border-b border-bone/15">
                      {here ? (
                        <p aria-current="page" className="relative flex items-baseline gap-[clamp(0.9rem,2vw,1.6rem)] py-[clamp(0.9rem,2.2vh,1.35rem)] text-bone/30">
                          {inner}
                          <span className="hand relative shrink-0 -rotate-[4deg] text-[clamp(1rem,1.5vw,1.35rem)] text-lime">
                            You&rsquo;re here
                          </span>
                        </p>
                      ) : (
                        <a
                          href={l.href}
                          className="group relative flex items-baseline gap-[clamp(0.9rem,2vw,1.6rem)] py-[clamp(0.9rem,2.2vh,1.35rem)] text-bone/85 outline-none transition-colors duration-300 hover:text-bone focus-visible:text-lime"
                        >
                          <RowMark seed={i} />
                          {inner}
                          <span aria-hidden="true" className="relative shrink-0 text-[clamp(1rem,1.6vw,1.4rem)] opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                            ↗
                          </span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="relative flex flex-col items-start gap-[clamp(1.5rem,4vh,2.5rem)] lg:items-end lg:text-right">
              <RiseIn className="self-end" from="bottom">
                <Sprite name="cat-sleepy" scale={0.5} drift={12} idle={4} />
              </RiseIn>
              <p className="hand max-w-[16ch] -rotate-[2deg] whitespace-pre-line text-[clamp(1.1rem,1.7vw,1.55rem)] text-bone/60">
                {"Read all of it?\nRespect. Now go\nmake someone react."}
              </p>
              <BlobButton href="/" size="lg">
                Back to {EVENT.name}
              </BlobButton>
            </div>
          </div>

          {/* the facts, running, as they close every page */}
          <div className="mt-[clamp(3rem,8vh,5rem)] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
            <Marquee items={BAND} speed={42} className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70" />
          </div>
        </Section>
      </main>
    </>
  );
}
