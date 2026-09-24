import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The frame both dashboard pages sit in: the bar that stays put, and the
 * column everything lines up in.
 *
 * It borrows the site's voice — the same display face, the same lettered
 * labels, lime for anything that matters — and leaves the site's behaviour
 * behind. No smooth scrolling, no wipe between pages, and the grain holds
 * still, because this is a page people read for an hour rather than a page
 * that introduces itself.
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
      <div className="grain" data-still="true" aria-hidden="true" />

      <header className="sticky top-0 z-30 border-b border-bone/10 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[94rem] flex-wrap items-center gap-x-6 gap-y-2 px-[var(--edge)] py-3">
          <Link href="/admin" className="group flex items-baseline gap-3 outline-none">
            <span className="display text-[1.15rem] leading-none text-lime transition-opacity group-hover:opacity-80">
              BOO!
            </span>
            <span className="label text-[0.66rem] text-bone/45 transition-colors group-hover:text-bone/75">
              Registrations
            </span>
          </Link>

          {back ? (
            <Link
              href="/admin"
              className="label border-l border-bone/15 pl-6 text-[0.66rem] text-bone/45 transition-colors hover:text-lime"
            >
              ← All teams
            </Link>
          ) : null}

          <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="/admin/export"
              className="label border border-bone/15 px-3 py-2 text-[0.64rem] text-bone/70 transition-colors hover:border-lime hover:text-lime"
            >
              Export CSV
            </a>
            <span className="label hidden text-[0.64rem] text-bone/30 sm:block">{who}</span>
            <form action="/admin/signout" method="post">
              <button
                type="submit"
                className="label cursor-pointer text-[0.64rem] text-bone/45 transition-colors hover:text-lime"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[94rem] px-[var(--edge)] pb-28 pt-[clamp(1.25rem,3.5vh,2rem)]">
        {children}
      </main>
    </>
  );
}
