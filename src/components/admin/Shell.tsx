import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The frame both dashboard pages sit in: a bar that stays put, and the column
 * everything lines up in.
 *
 * It keeps the brand — Archivo on the name, the same green — and none of the
 * site's behaviour. No smooth scrolling, no wipe between pages, nothing
 * fading in over a table of names.
 */
export default function Shell({
  who,
  children,
  back,
}: {
  who: string;
  children: ReactNode;
  /** on a team's page, the way back to the list */
  back?: boolean;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[86rem] flex-wrap items-center gap-x-5 gap-y-2 px-[clamp(1rem,3vw,2rem)] py-2.5">
          <Link href="/admin" className="flex items-baseline gap-2.5">
            <span className="figure text-[1.1rem]">BOO!</span>
            <span className="eyebrow">Registrations</span>
          </Link>

          {back ? (
            <Link href="/admin" className="btn btn-plain text-[0.82rem]">
              ← All teams
            </Link>
          ) : null}

          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
            <a href="/admin/export" className="btn text-[0.8rem]">
              Export CSV
            </a>
            <span className="faint hidden text-[0.78rem] sm:block">{who}</span>
            <form action="/admin/signout" method="post">
              <button type="submit" className="btn btn-plain text-[0.8rem]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[86rem] flex-col px-[clamp(1rem,3vw,2rem)] pt-6 pb-8">
        {children}

        {/* the page has a bottom even when there's little on it, rather than
            trailing off into empty paper */}
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[var(--line)] pt-5 text-[0.76rem] text-[var(--faint)]">
          <p>BOO! 2026 · 24–25 October · ASIET, Kalady</p>
          <p>Only the core team can see this page.</p>
        </footer>
      </main>
    </>
  );
}
