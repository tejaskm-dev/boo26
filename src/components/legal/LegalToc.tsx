"use client";

import { useEffect, useRef } from "react";
import RowMark from "@/components/ui/RowMark";
import { getLenis } from "@/lib/lenis";

type Item = { id: string; title: string };

/**
 * The contents of a legal page, as the FAQ's numbered rows.
 *
 * On a wide screen it holds its place beside the text and marks the clause
 * being read with the rows' own marker stroke, so a long page always shows
 * where you are in it and how much is left. On a phone it folds away above
 * the text.
 *
 * The clause being read is found with an IntersectionObserver on a thin band
 * across the top of the screen, not by measuring on scroll: nothing here
 * reads layout while the page moves.
 */
export default function LegalToc({ items }: { items: Item[] }) {
  const wide = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const rows = Array.from(wide.current?.querySelectorAll<HTMLElement>("[data-toc]") ?? []);
    const clauses = items.map((i) => document.getElementById(i.id));
    // A clause only reports when it crosses the band, and the band can hold
    // the end of one and the start of the next, so what is in it is tracked
    // and the first of those is the one being read.
    const inBand = new Set<number>();
    let current = -1;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = clauses.indexOf(e.target as HTMLElement);
          if (i < 0) continue;
          if (e.isIntersecting) inBand.add(i);
          else inBand.delete(i);
        }
        const next = inBand.size ? Math.min(...inBand) : -1;
        if (next === current) return;
        if (current >= 0) rows[current]?.removeAttribute("data-current");
        if (next >= 0) rows[next]?.setAttribute("data-current", "true");
        current = next;
      },
      // just under the header, where a clause stops when its row is clicked
      { rootMargin: "-12% 0px -80% 0px" },
    );
    clauses.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, [items]);

  // Through Lenis when it is running, so the jump glides like the rest of the
  // page. It stops where the clause's scroll margin says, as the plain anchor
  // does without Lenis (reduced motion) — Lenis reads the margin itself.
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const lenis = getLenis();
    const target = document.getElementById(id);
    e.currentTarget.closest("details")?.removeAttribute("open");
    if (!lenis || !target) return;
    e.preventDefault();
    lenis.scrollTo(target);
    history.replaceState(null, "", `#${id}`);
  };

  const rows = (tagged: boolean) =>
    items.map((item, i) => (
      <li key={item.id} className="border-b border-ink/15">
        <a
          href={`#${item.id}`}
          onClick={(e) => go(e, item.id)}
          {...(tagged ? { "data-toc": "" } : {})}
          className="group relative flex items-baseline gap-[clamp(0.75rem,1.4vw,1.1rem)] py-[clamp(0.7rem,1.6vh,0.95rem)] outline-none"
        >
          <RowMark seed={i} />
          <span className="row-index label relative w-[1.6rem] shrink-0 text-ink/35">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="display relative text-[clamp(0.82rem,0.95vw,0.95rem)] leading-tight text-ink/75 transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink group-data-[current=true]:text-ink">
            {item.title}
          </span>
        </a>
      </li>
    ));

  return (
    <>
      {/* a phone: folded away above the text */}
      <details className="group/toc border-y border-ink/15 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-4 py-4 outline-none [&::-webkit-details-marker]:hidden">
          <span className="label flex-1 text-ink/55">On this page</span>
          <span className="label text-ink/35">{String(items.length).padStart(2, "0")}</span>
          <span
            aria-hidden="true"
            className="relative grid h-[1.9rem] w-[1.9rem] shrink-0 place-items-center rounded-full border border-ink/25 text-ink/60 transition-colors duration-300 group-open/toc:border-ink group-open/toc:bg-ink group-open/toc:text-bone"
          >
            <span className="absolute h-[1.5px] w-[0.8rem] rounded-full bg-current" />
            <span className="absolute h-[0.8rem] w-[1.5px] rounded-full bg-current transition-transform duration-[450ms] ease-[var(--ease-out-soft)] group-open/toc:scale-y-0" />
          </span>
        </summary>
        <ol className="border-t border-ink/15 pb-2">{rows(false)}</ol>
      </details>

      {/* a wide screen: held beside the text */}
      <nav aria-label="On this page" className="hidden self-start lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:block">
        <p className="label text-ink/45">On this page</p>
        <ol ref={wide} className="mt-5 border-t border-ink/15">
          {rows(true)}
        </ol>
      </nav>
    </>
  );
}
