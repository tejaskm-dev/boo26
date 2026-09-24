import Copy from "./Copy";
import LiveId from "./LiveId";
import Shell from "./Shell";
import { Choice, Chip, Confirm, Field, Go, Panel, Said, Seats } from "./bits";
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
 * One team, and everything that can be done to it: where it is in the review,
 * the note beside it, its name, each person's details, and taking either of
 * them — or the whole team — off.
 *
 * The list is for looking; this is for changing. Keeping them apart is what
 * lets the list stay quick to read, and it means every control here has room
 * to say what it does before it does it.
 */

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(
    new Date(iso),
  );

const year = (v: string) => YEARS.find((y) => y.value === v)?.label ?? v;

function Person({ member, code, editing }: { member: MemberRecord; code: string; editing: boolean }) {
  return (
    <li className="border-t border-bone/10 px-5 py-5 first:border-t-0">
      <p className="label text-[0.62rem] text-bone/30">
        Seat {String(member.seat).padStart(2, "0")} · joined {when(member.joinedAt)}
      </p>
      <p className="display mt-2.5 text-[1.25rem] leading-none">{member.name}</p>

      <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="label text-[0.6rem] text-bone/30">Email</dt>
        <dd className="body-copy text-[0.88rem]">
          <a href={`mailto:${member.email}`} className="text-bone/75 underline decoration-bone/20 underline-offset-4 hover:text-lime">
            {member.email}
          </a>
        </dd>
        <dt className="label text-[0.6rem] text-bone/30">Phone</dt>
        <dd className="body-copy text-[0.88rem]">
          <a href={`tel:+91${member.phone}`} className="text-bone/75 underline decoration-bone/20 underline-offset-4 hover:text-lime">
            {showPhone(member.phone)}
          </a>
        </dd>
        <dt className="label text-[0.6rem] text-bone/30">College</dt>
        <dd className="body-copy text-[0.88rem] text-bone/60">
          {member.department.toUpperCase()} · {year(member.year)} · {member.collegeId}
        </dd>
      </dl>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        <details className="group w-full" open={editing}>
          <summary className="label inline-flex cursor-pointer list-none items-center gap-2 text-[0.64rem] text-bone/40 transition-colors hover:text-lime">
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open:rotate-45">
              +
            </span>
            Correct these details
          </summary>
          <form action={editMemberAction} className="mt-4 border-l-2 border-lime/40 pl-4">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="seat" value={member.seat} />
            <div className="grid gap-4 sm:grid-cols-2">
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
            <p className="mt-5">
              <Go>Save the changes</Go>
            </p>
          </form>
        </details>

        <Confirm summary={`Take ${member.name.split(" ")[0]} off the team`}>
          <form action={removeMemberAction} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="seat" value={member.seat} />
            <input type="hidden" name="name" value={member.name} />
            <span className="body-copy text-[0.86rem] text-bone/55">
              The seat opens again and the invite works for it.
            </span>
            <Go quiet>Take them off</Go>
          </form>
        </Confirm>
      </div>
    </li>
  );
}

function EmptySeat({ seat, code, origin }: { seat: number; code: string; origin: string }) {
  const invite = `${origin}${joinPath(code)}`;
  return (
    <li className="border-t border-bone/10 px-5 py-5 first:border-t-0">
      <p className="label text-[0.62rem] text-bone/30">Seat {String(seat).padStart(2, "0")} · empty</p>
      <p className="hand mt-2.5 text-[1.3rem] text-bone/45">Waiting for someone.</p>
      <p className="body-copy mt-3 text-[0.86rem] text-bone/50">
        Whoever has the code or the link takes this seat.
      </p>
      <p className="body-copy mt-3 break-all border-l-2 border-bone/15 pl-3 text-[0.8rem] text-bone/40">{invite}</p>
      <p className="mt-3 flex flex-wrap gap-5">
        <Copy text={invite} label="Copy invite link" />
        <Copy text={showCode(code)} label="Copy code" />
      </p>
    </li>
  );
}

export default function TeamPage({
  who,
  team,
  history,
  origin,
  said,
  seat,
}: {
  who: string;
  team: TeamRecord;
  history: AdminAction[] | null;
  origin: string;
  said?: string;
  seat?: number;
}) {
  return (
    <Shell who={who} back>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className="display text-[1rem] tracking-[0.08em] text-lime">{showCode(team.code)}</span>
        <h1 className="display text-[clamp(1.9rem,4.5vw,3rem)] leading-[0.92]">{team.name}</h1>
        <Chip state={team.state} className="translate-y-[-0.2em]" />
        <Seats taken={team.members.map((m) => m.seat)} />
      </div>
      <p className="label mt-3 text-[0.62rem] text-bone/30">
        Started {when(team.createdAt)}
        {team.reaction ? ` · going for: ${team.reaction}` : ""}
      </p>

      <Said said={said} />

      <div className="mt-[clamp(1.5rem,4vh,2.25rem)] grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-3">
          <Panel title="Who's on it" note={`${team.members.length} of ${SEATS.length} seats`} bare>
            <ul>
              {SEATS.map((s) => {
                const member = team.members.find((m) => m.seat === s);
                return member ? (
                  <Person key={s} member={member} code={team.code} editing={seat === s} />
                ) : (
                  <EmptySeat key={s} seat={s} code={team.code} origin={origin} />
                );
              })}
            </ul>
          </Panel>

          {history && history.length ? (
            <Panel title="What's been done to it" note="newest first">
              <ul className="space-y-2.5">
                {history.map((entry, i) => (
                  <li key={`${entry.at}-${i}`} className="body-copy text-[0.85rem] leading-[1.6] text-bone/55">
                    <span className="text-bone/25">{when(entry.at)}</span> · {entry.who} {entry.did}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-3">
          <Panel title="Mark this team" note="where they are in the review">
            <form action={setStateAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="code" value={team.code} />
              {STATES.map((s) => (
                <button
                  key={s.value}
                  type="submit"
                  name="state"
                  value={s.value}
                  title={s.hint}
                  disabled={team.state === s.value}
                  className={`label border px-3 py-2 text-[0.64rem] transition-colors ${
                    team.state === s.value
                      ? "cursor-default border-lime bg-lime text-ink"
                      : "cursor-pointer border-bone/15 text-bone/60 hover:border-lime hover:text-lime"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </form>
            <p className="body-copy mt-4 text-[0.8rem] text-bone/30">
              {STATES.find((s) => s.value === team.state)?.hint}
            </p>
          </Panel>

          <Panel title="Note" note="only the core team sees this">
            <form action={setNoteAction}>
              <input type="hidden" name="code" value={team.code} />
              <textarea
                name="note"
                rows={3}
                maxLength={500}
                defaultValue={team.note}
                placeholder="Called them, no answer. Second member switched…"
                className="body-copy w-full border border-bone/15 bg-ink p-3 text-[0.88rem] leading-[1.6] text-bone caret-lime outline-none transition-colors placeholder:text-bone/20 focus:border-lime"
              />
              <p className="mt-3">
                <Go quiet>Save the note</Go>
              </p>
            </form>
          </Panel>

          <Panel title="The team itself">
            <form action={renameTeamAction} className="space-y-4">
              <input type="hidden" name="code" value={team.code} />
              <Field label="Name" name="name" defaultValue={team.name} maxLength={32} />
              <Choice
                label="Going for"
                name="reaction"
                defaultValue={team.reaction}
                blank="Not sure yet"
                options={REACTIONS.map((r) => ({ value: r, label: r }))}
              />
              <p>
                <Go quiet>Save the team</Go>
              </p>
            </form>
          </Panel>

          <Panel title="Remove" note="there's no undo">
            <Confirm summary="Remove this team altogether">
              <form action={removeTeamAction} className="flex flex-wrap items-center gap-4">
                <input type="hidden" name="code" value={team.code} />
                <span className="body-copy text-[0.86rem] text-bone/55">
                  {team.name} and {team.members.length === 1 ? "the person on it" : "both people on it"} are deleted.
                </span>
                <Go quiet>Remove the team</Go>
              </form>
            </Confirm>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
