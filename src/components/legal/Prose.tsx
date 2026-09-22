/**
 * The reading type for the fine print: the site's body copy at a size and
 * measure made for reading a page of it, rather than the one-line notes it
 * is usually set for.
 */
const TEXT = "body-copy text-[clamp(0.96rem,1.1vw,1.06rem)] text-ink/75";

export function P({ children }: { children: React.ReactNode }) {
  return <p className={`${TEXT} max-w-[62ch]`}>{children}</p>;
}

/**
 * Bulleted with the lime diamond the marquee and the toast use. Lime barely
 * registers on off-white, so each one carries the hairline the scrollbar's
 * bead uses for the same reason.
 */
export function List({ children }: { children: React.ReactNode }) {
  return <ul className="max-w-[62ch] space-y-[0.7rem]">{children}</ul>;
}

export function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className={`${TEXT} flex gap-[0.9rem]`}>
      <span
        aria-hidden="true"
        className="mt-[0.58em] h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime shadow-[0_0_0_1px_rgba(8,8,8,0.28)]"
      />
      <span>{children}</span>
    </li>
  );
}

/** a link inside the text — underlined throughout, and lime under the pointer */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium text-ink underline decoration-ink/30 decoration-[1.5px] underline-offset-[0.22em] outline-none transition-[text-decoration-color] duration-300 hover:decoration-lime focus-visible:decoration-lime"
    >
      {children}
    </a>
  );
}

/** a name the code uses, such as a storage key */
export function Key({ children }: { children: React.ReactNode }) {
  return (
    <code className="whitespace-nowrap rounded-[0.35em] bg-ink/[0.07] px-[0.4em] py-[0.1em] font-mono text-[0.88em] text-ink">
      {children}
    </code>
  );
}
