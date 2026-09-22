import Section, { SectionLabel } from "@/components/sections/Section";
import Sprite from "@/components/ui/Sprite";
import Words from "@/components/fx/Words";
import RiseIn from "@/components/fx/RiseIn";
import type { SpriteName } from "@/lib/sprites";

/**
 * The opening of a page along the register path: the ink field and the lime
 * brush heading the fine-print pages open on, with a margin note under it and
 * whatever the page leads with held alongside — a cat sitting on top of it.
 */
export default function Hero({
  index,
  label,
  title,
  note,
  cat,
  catScale = 0.46,
  children,
}: {
  index: string;
  label: string;
  title: string;
  note: string;
  cat?: SpriteName;
  catScale?: number;
  children?: React.ReactNode;
}) {
  return (
    <Section field="ink" className="pb-[clamp(3.5rem,9vh,6rem)] pt-[calc(var(--header-h)+clamp(2rem,7vh,5rem))]">
      <div data-intro className="relative px-[var(--edge)]">
        <SectionLabel index={index} className="text-bone">
          {label}
        </SectionLabel>

        <div className="mt-[clamp(2rem,6vh,3.75rem)] grid gap-[clamp(4.5rem,11vh,6rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-[clamp(2.5rem,5vw,5rem)]">
          <div>
            <Words
              as="h1"
              className="brush -rotate-[1.5deg] select-none pb-[0.08em] text-[clamp(3.4rem,9vw,8.5rem)] leading-[0.86] text-lime"
            >
              {title}
            </Words>
            <p className="hand mt-[clamp(0.75rem,2vh,1.25rem)] -rotate-[3deg] whitespace-pre-line pl-[0.4rem] text-[clamp(1.15rem,1.9vw,1.7rem)] text-bone/65 md:pl-[clamp(2rem,6vw,5rem)]">
              {note}
            </p>
          </div>

          {children ? (
            <div data-anim="rise" className="relative">
              {cat ? (
                // sitting on the top edge of whatever is here, whatever its height
                <RiseIn className="absolute bottom-[calc(100%-1.1rem)] right-[10%] z-10" start="top 98%">
                  <Sprite name={cat} scale={catScale} drift={14} idle={5} />
                </RiseIn>
              ) : null}
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

/** The soft blob the FAQ rests its answers on, holding a short list. */
export function Blob({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bone/[0.07] px-[clamp(1.4rem,3vw,2.6rem)] py-[clamp(1.5rem,3.5vh,2.4rem)] [border-radius:34%_66%_58%_42%/40%_36%_64%_60%] md:[border-radius:46%_54%_58%_42%/42%_60%_40%_58%]">
      <p className="label label-loose text-lime">{title}</p>
      <div className="mt-[clamp(1rem,2.4vh,1.4rem)]">{children}</div>
    </div>
  );
}

/** Lines set against the lime diamond, as in the fine print's summaries. */
export function Diamonds({ lines }: { lines: readonly React.ReactNode[] }) {
  return (
    <ul className="space-y-[0.8rem]">
      {lines.map((line, i) => (
        <li key={i} className="body-copy flex gap-[0.9rem] text-[clamp(0.95rem,1.1vw,1.05rem)] text-bone/85">
          <span aria-hidden="true" className="mt-[0.55em] h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
