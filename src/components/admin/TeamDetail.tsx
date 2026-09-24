import Copy from "./Copy";
import LiveId from "./LiveId";
import { Choice, Confirm, Field, Go, Pill, Seats } from "./bits";
import {
  editMemberAction,
  removeMemberAction,
  removeTeamAction,
  renameTeamAction,
  setNoteAction,
  setStateAction,
} from "@/lib/admin/actions";
import { joinPath, showCode } from "@/lib/register/code";
import { REACTIONS } from "@/lib/register/content";
import { DEPARTMENT_OPTIONS, isDepartment, showPhone, YEARS } from "@/lib/register/fields";
import { SEATS, STATES, type AdminAction, type MemberRecord, type TeamRecord } from "@/lib/register/teams";

/**
 * One team, and everything that can be done to it.
 *
 * The same thing whether it's sliding in beside the list or standing on its
 * own page — the list opens it from what the browser already holds, which is
 * why looking at a team no longer costs a trip to the server, while the page
 * behind it stays a real address anyone can link to or open in a new tab.
 */

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(
    new Date(iso),
  );

const year = (v: string) => YEARS.find((y) => y.value === v)?.label ?? v;

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="border-t border-[var(--line)] px-5 py-5 first:border-t-0">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="eyebrow">{title}</h3>
        {note ? <p className="faint text-[0.76rem]">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Person({
  member,
  code,
  editing,
  from,
}: {
  member: MemberRecord;
  code: string;
  editing: boolean;
  from: string;
}) {
  return (
    <li className="border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="figure text-[1.05rem]">{member.name}</p>
        <p className="faint text-[0.74rem]">
          Seat {String(member.seat).padStart(2, "0")} · joined {when(member.joinedAt)}
        </p>
      </div>

      <dl className="mt-2.5 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[0.85rem]">
        <dt className="faint">Email</dt>
        <dd className="truncate">
          <a href={`mailto:${member.email}`} className="underline decoration-[var(--line-firm)] underline-offset-2 hover:decoration-[var(--ink)]">
            {member.email}
          </a>
        </dd>
        <dt className="faint">Phone</dt>
        <dd>
          <a href={`tel:+91${member.phone}`} className="underline decoration-[var(--line-firm)] underline-offset-2 hover:decoration-[var(--ink)]">
            {showPhone(member.phone)}
          </a>
        </dd>
        <dt className="faint">College</dt>
        <dd className="muted">
          {member.department.toUpperCase()} · {year(member.year)} · {member.collegeId}
        </dd>
      </dl>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <details className="group w-full" open={editing}>
          <summary className="muted inline-flex cursor-pointer list-none items-center gap-2 text-[0.82rem] hover:text-[var(--ink)]">
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open:rotate-45">
              +
            </span>
            Correct these details
          </summary>
          <form action={editMemberAction} className="mt-4 border-l-2 border-[var(--accent-deep)] pl-4">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="from" value={from} />
            <input type="hidden" name="seat" value={member.seat} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Name" name="name" defaultValue={member.name} maxLength={60} />
              <Field label="Email" name="email" type="email" defaultValue={member.email} inputMode="email" />
              <Field label="Phone" name="phone" defaultValue={member.phone} inputMode="tel" maxLength={14} />
              <LiveId code={code} seat={member.seat} defaultValue={member.collegeId} />
              <Choice
                label="Department"
                name="department"
                defaultValue={member.department}
                options={DEPARTMENT_OPTIONS}
                // anyone registered before the list existed has whatever they
                // typed; it shows, but it has to be swapped for one of these
                blank={
                  isDepartment(member.department)
                    ? undefined
                    : member.department
                      ? `${member.department} — pick one below`
                      : "Pick one"
                }
              />
              <Choice label="Year" name="year" defaultValue={member.year} options={[...YEARS]} />
            </div>
            <p className="mt-4">
              <Go>Save the changes</Go>
            </p>
          </form>
        </details>

        <Confirm summary={`Take ${member.name.split(" ")[0]} off the team`}>
          <form action={removeMemberAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="from" value={from} />
            <input type="hidden" name="seat" value={member.seat} />
            <input type="hidden" name="name" value={member.name} />
            <span className="muted text-[0.84rem]">The seat opens again and the invite works for it.</span>
            <Go tone="danger">Take them off</Go>
          </form>
        </Confirm>
      </div>
    </li>
  );
}

function EmptySeat({ seat, code, origin }: { seat: number; code: string; origin: string }) {
  const invite = `${origin}${joinPath(code)}`;
  return (
    <li className="border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="figure text-[1.05rem] text-[var(--faint)]">Empty seat</p>
        <p className="faint text-[0.74rem]">Seat {String(seat).padStart(2, "0")}</p>
      </div>
      <p className="muted mt-2 text-[0.85rem]">Whoever has the code or the link takes this seat.</p>
      <p className="mt-2.5 truncate rounded-[2px] border border-[var(--line)] bg-[var(--sunk)] px-3 py-2 text-[0.8rem]">
        {invite}
      </p>
      <p className="mt-2.5 flex flex-wrap gap-4">
        <Copy text={invite} label="Copy invite link" />
        <Copy text={showCode(code)} label="Copy code" />
      </p>
    </li>
  );
}

export default function TeamDetail({
  team,
  origin,
  history,
  seat,
  full = false,
  from = "page",
}: {
  team: TeamRecord;
  origin: string;
  history?: AdminAction[] | null;
  /** which member's details to open straight away, after a correction failed */
  seat?: number;
  /** on its own page there's room for everything; in the drawer there isn't */
  full?: boolean;
  /** where a save should land afterwards: back here, or back to the list */
  from?: "page" | "list";
}) {
  return (
    <>
      <Block title="Who's on it" note={`${team.members.length} of ${SEATS.length} seats`}>
        <ul className="space-y-4">
          {SEATS.map((s) => {
            const member = team.members.find((m) => m.seat === s);
            return member ? (
              <Person key={s} member={member} code={team.code} editing={seat === s} from={from} />
            ) : (
              <EmptySeat key={s} seat={s} code={team.code} origin={origin} />
            );
          })}
        </ul>
      </Block>

      <Block title="Mark this team" note={STATES.find((s) => s.value === team.state)?.hint}>
        <form action={setStateAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="code" value={team.code} />
          <input type="hidden" name="from" value={from} />
          {STATES.map((s) => (
            <button
              key={s.value}
              type="submit"
              name="state"
              value={s.value}
              title={s.hint}
              aria-pressed={team.state === s.value}
              disabled={team.state === s.value}
              className="toggle"
            >
              {s.label}
            </button>
          ))}
        </form>
      </Block>

      <Block title="Note" note="only the core team sees this">
        <form action={setNoteAction}>
          <input type="hidden" name="code" value={team.code} />
          <input type="hidden" name="from" value={from} />
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            defaultValue={team.note}
            placeholder="Called them, no answer. Second member switched…"
            className="field"
          />
          <p className="mt-3">
            <Go tone="quiet">Save the note</Go>
          </p>
        </form>
      </Block>

      <Block title="The team itself">
        <form action={renameTeamAction} className="space-y-3.5">
          <input type="hidden" name="code" value={team.code} />
          <input type="hidden" name="from" value={from} />
          <Field label="Name" name="name" defaultValue={team.name} maxLength={32} />
          <Choice
            label="Going for"
            name="reaction"
            defaultValue={team.reaction}
            blank="Not sure yet"
            options={REACTIONS.map((r) => ({ value: r, label: r }))}
          />
          <p>
            <Go tone="quiet">Save the team</Go>
          </p>
        </form>
      </Block>

      {full && history && history.length ? (
        <Block title="What's been done to it" note="newest first">
          <ul className="space-y-2">
            {history.map((entry, i) => (
              <li key={`${entry.at}-${i}`} className="muted text-[0.84rem] leading-[1.5]">
                <span className="faint">{when(entry.at)}</span> · {entry.who} {entry.did}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      <Block title="Remove" note="there's no undo">
        <Confirm summary="Remove this team altogether">
          <form action={removeTeamAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="code" value={team.code} />
            <span className="muted text-[0.84rem]">
              {team.name} and {team.members.length === 1 ? "the person on it" : "both people on it"} are deleted.
            </span>
            <Go tone="danger">Remove the team</Go>
          </form>
        </Confirm>
      </Block>
    </>
  );
}

/** The line of type that introduces a team, in the drawer and on the page. */
export function TeamHeading({ team }: { team: TeamRecord }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="eyebrow text-[var(--accent-deep)]">{showCode(team.code)}</span>
        <Pill state={team.state} />
        <Seats taken={team.members.map((m) => m.seat)} />
      </div>
      <h2 className="figure mt-2 text-[clamp(1.5rem,3vw,2rem)]">{team.name}</h2>
      <p className="faint mt-1.5 text-[0.78rem]">
        Started {when(team.createdAt)}
        {team.reaction ? ` · going for: ${team.reaction}` : ""}
      </p>
    </div>
  );
}
