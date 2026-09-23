import Wordmark from "@/components/ui/Wordmark";

/**
 * The corner of every register page: the wordmark home on the left, and on
 * the right one step back up the path — to /register from the pages under
 * it, home from /register itself. Fixed, so on a phone the way back is never
 * a scroll away.
 *
 * The page wipe closes into that link on arrival, as it does on the other
 * pages off the home page.
 */
export default function RegisterHeader({ back }: { back: { href: string; label: string } }) {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[var(--edge)] py-[clamp(1rem,2.2vw,1.9rem)]"
      style={{ color: "var(--head-fg)" }}
    >
      <Wordmark href="/" className="pointer-events-auto" />
      {/* a plain link, as everywhere: the wipe plays between full page loads */}
      <a
        href={back.href}
        data-wipe-origin
        className="group label pointer-events-auto mt-[0.35rem] inline-flex items-center gap-3 py-2 text-[var(--head-fg-right)] outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime"
      >
        <svg
          viewBox="0 0 16 10"
          className="h-[0.7rem] w-[1.1rem] transition-transform duration-300 group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 5H2M6 1 2 5l4 4" />
        </svg>
        {back.label}
      </a>
    </header>
  );
}
