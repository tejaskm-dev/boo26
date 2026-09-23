import Section from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import CodeEntry from "./CodeEntry";
import { Diamonds } from "./Hero";
import type { SpriteName } from "@/lib/sprites";

/**
 * The way in for Path B — and where a code that leads nowhere ends up, saying
 * what went wrong with it. Either way the code box is right there, with what
 * to do if you haven't got one.
 */
export default function JoinDoor({
  title,
  note,
  cat = "cat-curious",
  children,
}: {
  title: string;
  note: string;
  cat?: SpriteName;
  /** what happened to the code the visitor came with, if anything did */
  children?: React.ReactNode;
}) {
  return (
    <Section field="ink" className="min-h-svh pb-[clamp(3.5rem,9vh,6rem)] pt-[calc(var(--header-h)+clamp(2rem,7vh,5rem))]">
      <div
        data-intro
        className="grid grid-cols-1 gap-[clamp(3rem,7vh,5rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-[clamp(3rem,6vw,6rem)]"
      >
        <div className="relative">
          <p data-anim="rise" className="label label-loose text-bone/45">
            Path B · Join a team
          </p>
          <Words
            as="h1"
            className="brush mt-[clamp(1.5rem,4vh,2.5rem)] -rotate-[1.5deg] select-none pb-[0.06em] pr-[clamp(4.5rem,22vw,11rem)] text-[clamp(3.6rem,10vw,8.5rem)] leading-[0.86] text-lime lg:pr-0"
          >
            {title}
          </Words>
          <p className="hand mt-[clamp(0.6rem,1.6vh,1rem)] -rotate-[3deg] whitespace-pre-line pl-[0.4rem] text-[clamp(1.15rem,1.9vw,1.7rem)] text-bone/65 md:pl-[clamp(2rem,6vw,5rem)]">
            {note}
          </p>
          <RiseIn className="pointer-events-none absolute right-0 top-[clamp(2rem,6vh,3.5rem)] lg:right-[6%]" start="top 100%">
            <Sprite name={cat} scale={0.42} drift={14} idle={5} />
          </RiseIn>
        </div>

        <div data-anim="rise">
          {children ? <div className="mb-[clamp(1.75rem,4vh,2.5rem)]">{children}</div> : null}
          <CodeEntry id="join-code" />
          <div className="mt-[clamp(2rem,5vh,3rem)] max-w-[34rem] border-t border-bone/15 pt-[clamp(1.25rem,3vh,1.75rem)]">
            <Diamonds
              lines={[
                "Whoever starts the team gets a code, a link and a QR to send you.",
                "Scan the QR with your phone camera, or tap the link: either brings you straight to their team.",
              ]}
            />
            <p className="body-copy mt-[clamp(1.25rem,3vh,1.75rem)] text-[0.95rem] text-bone/60">
              Nobody&rsquo;s started your team yet?{" "}
              <a
                href="/register/create"
                className="font-medium text-bone underline decoration-bone/35 decoration-[1.5px] underline-offset-[0.22em] outline-none transition-[text-decoration-color] duration-300 hover:decoration-lime focus-visible:decoration-lime"
              >
                Start it yourself
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
