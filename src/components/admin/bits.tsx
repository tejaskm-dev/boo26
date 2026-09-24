import type { ReactNode } from "react";
import { SEATS, stateLabel, type TeamState } from "@/lib/register/teams";

/**
 * The small parts the dashboard is built from. Everything here is server-
 * rendered and dressed by admin.css, so a button looks like a button in every
 * place one turns up, and the JSX stays about what a thing is rather than
 * what it's painted.
 */

/** Where a team stands, as a word you can pick out of a list. */
export function Pill({ state, className = "" }: { state: TeamState; className?: string }) {
  return <span className={`pill pill-${state} ${className}`}>{stateLabel(state)}</span>;
}

/** Two squares: who's on the team, at a glance. */
export function Seats({ taken }: { taken: number[] }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${taken.length} of ${SEATS.length} seats taken`}>
      {SEATS.map((seat) => (
        <span
          key={seat}
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-[1px] ${
            taken.includes(seat) ? "bg-[var(--accent-deep)]" : "border border-dashed border-[var(--line-firm)]"
          }`}
        />
      ))}
    </span>
  );
}

/** A sheet of paper with a heading on it. */
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
    <section className={`card ${className}`}>
      {title ? (
        <header className="card-head">
          <h2 className="eyebrow">{title}</h2>
          {note ? <p className="faint text-[0.78rem]">{note}</p> : null}
        </header>
      ) : null}
      <div className={bare ? "" : "card-body"}>{children}</div>
    </section>
  );
}

/** One number, said plainly. */
export function Stat({ label, value, under }: { label: string; value: number | string; under?: string }) {
  return (
    <div className="card px-4 py-3 sm:px-5 sm:py-4">
      <p className="eyebrow text-[0.62rem] sm:text-[0.7rem]">{label}</p>
      <p className="figure mt-2 text-[clamp(1.5rem,3vw,2.2rem)]">{value}</p>
      {under ? <p className="faint mt-1 text-[0.74rem] sm:text-[0.78rem]">{under}</p> : null}
    </div>
  );
}

/**
 * How the sign-ups have come in, a day at a time. Bars rather than a line: at
 * this size a line has to be smoothed to look like anything, and a smoothed
 * line invents days that never happened.
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
    <svg viewBox={`0 0 ${width} 30`} preserveAspectRatio="none" className="h-12 w-full" aria-hidden="true">
      {buckets.map((b, i) => {
        const h = b.n ? Math.max(2, (b.n / most) * 28) : 1;
        return (
          <rect
            key={b.key}
            x={i * step + step * 0.2}
            y={30 - h}
            width={step * 0.6}
            height={h}
            rx={0.6}
            fill={b.n ? (i === days - 1 ? "var(--accent-deep)" : "rgb(91 107 0 / 0.45)") : "var(--line-firm)"}
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
      <span className="eyebrow mb-1.5 block text-[0.66rem]">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        size={1}
        className="field"
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
      <span className="eyebrow mb-1.5 block text-[0.66rem]">{label}</span>
      <select name={name} defaultValue={defaultValue} className="field">
        {blank ? <option value="">{blank}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A button that submits the form it's in. */
export function Go({ children, tone = "go" }: { children: ReactNode; tone?: "go" | "quiet" | "danger" }) {
  return (
    <button type="submit" className={`btn ${tone === "go" ? "btn-go" : tone === "danger" ? "btn-danger" : ""}`}>
      {children}
    </button>
  );
}

/** Anything that can't be undone opens first and asks after. */
export function Confirm({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="muted inline-flex cursor-pointer list-none items-center gap-2 text-[0.84rem] hover:text-[var(--ink)]">
        <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open:rotate-45">
          +
        </span>
        {summary}
      </summary>
      <div className="mt-3 border-l-2 border-[var(--accent-deep)] pl-4">{children}</div>
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
      className={`mt-5 rounded-[2px] border px-4 py-3 text-[0.86rem] leading-[1.5] ${
        it.tone === "good"
          ? "border-[#cbe06a] bg-[#f2f9d6] text-[#40500a]"
          : "border-[#e3bdb7] bg-[#fbeeec] text-[#8a3227]"
      }`}
    >
      {it.text}
    </p>
  );
}
