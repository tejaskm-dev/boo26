"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { CODE_LENGTH, cleanCode, isCode, joinPath } from "@/lib/register/code";
import { leaveTo } from "@/lib/leave";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Typing the team code in. The same pill as the footer's newsletter box, so
 * it reads as the site's own input rather than a new kind of thing.
 *
 * Forgiving about what arrives: lower case, spaces, the dash — or the whole
 * invite link pasted in, which works too.
 */
export default function CodeEntry({ id }: { id: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const pill = useRef<HTMLDivElement>(null);

  const onChange = (raw: string) => {
    const fromLink = raw.match(/\/join\/([a-z0-9-]+)/i)?.[1];
    const code = cleanCode(fromLink ?? raw).slice(0, CODE_LENGTH);
    setValue(code.length > 3 ? `${code.slice(0, 3)}-${code.slice(3)}` : code);
    setError(undefined);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = cleanCode(value);
    if (!isCode(code)) {
      setError(
        code.length < CODE_LENGTH
          ? "Six letters and numbers, like the one your teammate got."
          : "That code has a letter codes never use. Check it again?",
      );
      // a shake, the way the form shakes at a wrong answer
      if (pill.current && !prefersReducedMotion()) {
        gsap.fromTo(pill.current, { x: 0 }, { x: 7, duration: 0.055, repeat: 5, yoyo: true, ease: "none", clearProps: "x" });
      }
      return;
    }
    leaveTo(joinPath(code), (e.nativeEvent as SubmitEvent).submitter ?? e.currentTarget);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-[25rem]">
      <label htmlFor={id} className="label text-bone/55">
        Team code
      </label>
      <div
        ref={pill}
        className={`mt-3 flex items-center gap-2 rounded-full border bg-bone/[0.04] p-1.5 transition-colors duration-300 focus-within:border-lime/60 ${
          error ? "border-lime/50" : "border-bone/20"
        }`}
      >
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size={1}
          placeholder="XXX-XXX"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-note` : undefined}
          className="display min-w-0 flex-1 bg-transparent px-4 py-2 text-[1.45rem] leading-none tracking-[0.14em] text-bone caret-lime outline-none placeholder:text-bone/20"
        />
        <button
          type="submit"
          aria-label="Join the team"
          className="group grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full bg-lime text-ink outline-none transition-transform duration-300 ease-[var(--ease-out-soft)] hover:scale-110 focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          <svg viewBox="0 0 16 10" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 5h13M10 1l4 4-4 4" />
          </svg>
        </button>
      </div>
      {error ? (
        <p id={`${id}-note`} className="hand mt-2 flex items-center gap-2 pl-4 text-[1.15rem] leading-tight text-lime">
          <span aria-hidden="true" className="h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime" />
          {error}
        </p>
      ) : null}
    </form>
  );
}
