import type { ReactNode } from "react";
import { SEATS, STATES, stateLabel, type TeamState } from "@/lib/register/store";

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

/** A heading for a block of controls. */
export function Heading({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-bone/12 pb-3">
      <h2 className="label label-loose text-bone/50">{children}</h2>
      {note ? <p className="body-copy text-[0.82rem] text-bone/35">{note}</p> : null}
    </div>
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

export const STATE_OPTIONS = STATES.map((s) => ({ value: s.value, label: s.label }));
