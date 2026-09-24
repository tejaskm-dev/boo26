import type { ReactNode } from "react";
import { SEATS, stateLabel, type TeamState } from "@/lib/register/teams";

/**
 * The small parts the two admin pages share. Everything here is server-
 * rendered and styled with what the site already has — ink, bone, lime, the
 * same three type classes — so the dashboard looks like it belongs to the
 * same thing without carrying any of the site's motion.
 */

/** Where a team is, as a word you can see across a room. */
const CHIP: Record<TeamState, string> = {
  new: "border-bone/25 text-bone/55",
  verified: "border-lime/50 text-lime",
  shortlisted: "border-lime bg-lime text-ink",
  waitlisted: "border-dashed border-bone/40 text-bone/70",
  rejected: "border-bone/15 text-bone/30 line-through decoration-bone/30",
};

export function Chip({ state, className = "" }: { state: TeamState; className?: string }) {
  return (
    <span className={`label inline-flex items-center border px-2.5 py-1 text-[0.68rem] leading-none ${CHIP[state]} ${className}`}>
      {stateLabel(state)}
    </span>
  );
}

/** Two little squares: who's in the team, at a glance. */
export function Seats({ taken }: { taken: number[] }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${taken.length} of ${SEATS.length} seats taken`}>
      {SEATS.map((seat) => (
        <span
          key={seat}
          aria-hidden="true"
          className={`h-2 w-2 ${taken.includes(seat) ? "bg-lime" : "border border-dashed border-bone/35"}`}
        />
      ))}
    </span>
  );
}

/**
 * A panel: the unit the dashboard is built out of. One tier up from the page
 * behind it, a hairline around it, and its own heading — so a screen of
 * controls reads as a few things rather than one long column.
 */
export function Panel({
  title,
  note,
  children,
  className = "",
  bare = false,
}: {
  title?: string;
  note?: string;
  children: ReactNode;
  className?: string;
  /** no padding inside: for lists that draw their own rows */
  bare?: boolean;
}) {
  return (
    <section className={`border border-bone/10 bg-bone/[0.018] ${className}`}>
      {title ? (
        <header className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-bone/10 px-5 py-3">
          <h2 className="label text-[0.66rem] text-bone/50">{title}</h2>
          {note ? <p className="body-copy text-[0.8rem] text-bone/30">{note}</p> : null}
        </header>
      ) : null}
      <div className={bare ? "" : "p-5"}>{children}</div>
    </section>
  );
}

/** One number, said plainly. */
export function Stat({ label, value, under }: { label: string; value: number | string; under?: string }) {
  return (
    <div className="bg-ink px-5 py-4">
      <p className="label text-[0.64rem] text-bone/40">{label}</p>
      <p className="display mt-2.5 text-[clamp(1.8rem,3.2vw,2.5rem)] leading-none">{value}</p>
      {under ? <p className="body-copy mt-2 text-[0.78rem] text-bone/30">{under}</p> : null}
    </div>
  );
}

/**
 * How the sign-ups have come in, a day at a time. Bars rather than a line:
 * at this size a line has to be smoothed to look like anything, and a
 * smoothed line invents days that never happened.
 */
export function Spark({ at, days = 14 }: { at: string[]; days?: number }) {
  const today = new Date();
  const buckets = Array.from({ length: days }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (days - 1 - i));
    return { key: day.toISOString().slice(0, 10), n: 0 };
  });
  const where = new Map(buckets.map((b, i) => [b.key, i]));
  for (const iso of at) {
    const i = where.get(iso.slice(0, 10));
    if (i !== undefined) buckets[i].n += 1;
  }

  const most = Math.max(1, ...buckets.map((b) => b.n));
  const width = 100;
  const step = width / days;

  return (
    <svg viewBox={`0 0 ${width} 30`} preserveAspectRatio="none" className="h-14 w-full" aria-hidden="true">
      {buckets.map((b, i) => {
        const h = b.n ? Math.max(1.5, (b.n / most) * 28) : 0.7;
        return (
          <rect
            key={b.key}
            x={i * step + step * 0.22}
            y={30 - h}
            width={step * 0.56}
            height={h}
            className={b.n ? (i === days - 1 ? "fill-lime" : "fill-lime/45") : "fill-bone/15"}
          />
        );
      })}
    </svg>
  );
}

/** One labelled input, the plain kind that posts with its form. */
export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
  placeholder,
  maxLength,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  return (
    <label className="block">
      <span className="label block text-[0.68rem] text-bone/40">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        size={1}
        className="body-copy mt-1.5 w-full border-b border-bone/20 bg-transparent pb-1.5 text-[0.95rem] text-bone caret-lime outline-none transition-colors placeholder:text-bone/20 focus:border-lime"
      />
    </label>
  );
}

/** The same, for one of a short list of answers. */
export function Choice({
  label,
  name,
  defaultValue,
  options,
  blank,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly { value: string; label: string }[];
  blank?: string;
}) {
  return (
    <label className="block">
      <span className="label block text-[0.68rem] text-bone/40">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        // the colour scheme is what the browser draws the open menu with:
        // without it the list comes up white-on-white against this page
        className="body-copy mt-1.5 w-full border-b border-bone/20 bg-ink pb-1.5 text-[0.95rem] text-bone outline-none transition-colors [color-scheme:dark] focus:border-lime"
      >
        {blank ? (
          <option value="" className="bg-ink text-bone">
            {blank}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink text-bone">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A button that means it. */
export function Go({ children, quiet = false }: { children: ReactNode; quiet?: boolean }) {
  return (
    <button
      type="submit"
      className={`label cursor-pointer px-4 py-2.5 text-[0.7rem] outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-lime ${
        quiet
          ? "border border-bone/20 text-bone/70 hover:border-lime hover:text-lime"
          : "bg-lime text-ink hover:bg-bone"
      }`}
    >
      {children}
    </button>
  );
}

/** Anything that can't be undone opens first and asks after. */
export function Confirm({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="label inline-flex cursor-pointer list-none items-center gap-2 text-[0.68rem] text-bone/45 transition-colors hover:text-lime">
        <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open:rotate-45">
          +
        </span>
        {summary}
      </summary>
      <div className="mt-3 border-l-2 border-lime/50 pl-4">{children}</div>
    </details>
  );
}

/** What the last thing that happened had to say. */
const SAID: Record<string, { tone: "good" | "bad"; text: string }> = {
  saved: { tone: "good", text: "Saved." },
  removed: { tone: "good", text: "Taken off the team. The seat is open again." },
  "team-removed": { tone: "good", text: "That team is gone." },
  "name-taken": { tone: "bad", text: "Another team already has that name." },
  "name-no": { tone: "bad", text: "A team name is 2 to 32 characters." },
  "reaction-no": { tone: "bad", text: "That isn't one of the answers." },
  "email-taken": { tone: "bad", text: "Somebody else is registered with that email." },
  "phone-taken": { tone: "bad", text: "Somebody else is registered with that number." },
  "id-taken": { tone: "bad", text: "Somebody else is registered with that college ID." },
  "details-no": {
    tone: "bad",
    text: "Those details didn't pass the same checks the sign-up makes — look at the email, the number, the ID, and whether a department is picked.",
  },
  no: { tone: "bad", text: "That didn't go through." },
};

export function Said({ said }: { said?: string }) {
  const it = said ? SAID[said] : undefined;
  if (!it) return null;
  return (
    <p
      className={`body-copy mt-6 flex items-start gap-3 border-l-2 pl-4 text-[0.92rem] leading-[1.7] ${
        it.tone === "good" ? "border-lime text-bone/80" : "border-bone/40 text-bone/70"
      }`}
    >
      {it.text}
    </p>
  );
}
