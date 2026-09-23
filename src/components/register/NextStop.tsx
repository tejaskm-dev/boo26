import Section from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import RowMark from "@/components/ui/RowMark";
import BlobButton from "@/components/ui/BlobButton";
import RiseIn from "@/components/fx/RiseIn";
import Marquee from "@/components/fx/Marquee";
import { BAND } from "@/lib/site";
import type { SpriteName } from "@/lib/sprites";

/**
 * The end of each page on the path is the start of the next: the next stop
 * as one big row to follow, and beside it a way straight on for anyone who's
 * read enough. The facts run along the bottom, as they close every page.
 */
export default function NextStop({
  index,
  title,
  note,
  href,
  cat,
  aside,
  action,
}: {
  index: string;
  title: string;
  note: string;
  href: string;
  cat: SpriteName;
  aside: string;
  action: { href: string; label: string };
}) {
  return (
    <Section
      field="ink"
      forms={[{ shape: "spillLeft", tone: "bone", at: "inset-x-0 top-0 w-full h-[11vh] md:h-[19vh]" }]}
      className="pb-[clamp(3.5rem,9vh,6rem)] pt-[clamp(6rem,19vh,12rem)]"
    >
      <div className="relative grid gap-[clamp(3rem,7vw,6rem)] px-[var(--edge)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
        <nav aria-label="Next stop">
          <p className="label label-loose text-bone/45">Next stop</p>
          <a
            href={href}
            className="group relative mt-[clamp(1.25rem,3vh,2rem)] flex items-baseline gap-[clamp(0.9rem,2vw,1.6rem)] border-y border-bone/15 py-[clamp(1.1rem,3vh,1.75rem)] text-bone outline-none focus-visible:text-lime"
          >
            <RowMark seed={1} />
            <span className="row-index label relative w-[1.6rem] shrink-0 text-bone/35">{index}</span>
            <span className="relative min-w-0 flex-1">
              <span className="display lean block text-[clamp(1.9rem,5.4vw,4.4rem)] leading-[0.95]">{title}</span>
              <span className="body-copy mt-3 block text-[clamp(0.9rem,1.1vw,1rem)] text-bone/55">{note}</span>
            </span>
            <span
              aria-hidden="true"
              className="relative shrink-0 text-[clamp(1.2rem,2vw,1.8rem)] opacity-70 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            >
              ↗
            </span>
          </a>
        </nav>

        <div className="relative flex flex-col items-start gap-[clamp(1.5rem,4vh,2.5rem)] lg:items-end lg:text-right">
          <RiseIn className="self-end" from="bottom">
            <Sprite name={cat} scale={0.46} drift={12} idle={4} />
          </RiseIn>
          <p data-write className="hand max-w-[16ch] -rotate-[2deg] whitespace-pre-line text-[clamp(1.1rem,1.7vw,1.55rem)] text-bone/60">
            {aside}
          </p>
          <BlobButton href={action.href} size="lg">
            {action.label}
          </BlobButton>
        </div>
      </div>

      <div className="mt-[clamp(3rem,8vh,5rem)] border-y border-bone/12 py-[clamp(0.85rem,2.2vh,1.5rem)]">
        <Marquee items={BAND} speed={42} className="display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-none text-bone/70" />
      </div>
    </Section>
  );
}
