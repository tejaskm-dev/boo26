import Link from "next/link";
import Copy from "./Copy";
import { Choice, Chip, Confirm, Field, Go, Heading, Said, Seats } from "./bits";
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
import { showPhone, YEARS } from "@/lib/register/fields";
import { SEATS, STATES, type AdminAction, type MemberRecord, type TeamRecord } from "@/lib/register/store";

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
    <li className="border-l-2 border-bone/15 pl-5 transition-colors hover:border-lime/50">
      <p className="label text-[0.66rem] text-bone/35">
        Seat {String(member.seat).padStart(2, "0")} · joined {when(member.joinedAt)}
      </p>
      <p className="display mt-2 text-[1.15rem] leading-none">{member.name}</p>
      <p className="body-copy mt-2 text-[0.9rem] text-bone/70">
        <a href={`mailto:${member.email}`} className="underline decoration-bone/20 underline-offset-4 hover:text-lime">
          {member.email}
        </a>
        <span className="text-bone/25"> · </span>
        <a href={`tel:+91${member.phone}`} className="underline decoration-bone/20 underline-offset-4 hover:text-lime">
          {showPhone(member.phone)}
        </a>
      </p>
      <p className="label mt-2 text-[0.66rem] text-bone/40">
        {member.department.toUpperCase()} · {year(member.year)} · {member.collegeId}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <details className="group w-full" open={editing}>
          <summary className="label inline-flex cursor-pointer list-none items-center gap-2 text-[0.68rem] text-bone/45 transition-colors hover:text-lime">
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open:rotate-45">
              +
            </span>
            Correct these details
          </summary>
          <form action={editMemberAction} className="mt-4 border-l-2 border-lime/50 pl-4">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="seat" value={member.seat} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" defaultValue={member.name} maxLength={60} />
              <Field label="Email" name="email" type="email" defaultValue={member.email} inputMode="email" />
              <Field label="Phone" name="phone" defaultValue={member.phone} inputMode="tel" maxLength={14} />
              <Field label="College ID" name="collegeId" defaultValue={member.collegeId} maxLength={24} />
              <Field label="Department" name="department" defaultValue={member.department} maxLength={24} />
              <Choice label="Year" name="year" defaultValue={member.year} options={[...YEARS]} />
            </div>
            <p className="mt-4">
              <Go>Save the changes</Go>
            </p>
          </form>
        </details>

        <Confirm summary={`Take ${member.name.split(" ")[0]} off the team`}>
          <form action={removeMemberAction} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="seat" value={member.seat} />
            <input type="hidden" name="name" value={member.name} />
            <span className="body-copy text-[0.88rem] text-bone/60">
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
    <li className="border-l-2 border-dashed border-bone/20 pl-5">
      <p className="label text-[0.66rem] text-bone/35">Seat {String(seat).padStart(2, "0")} · empty</p>
      <p className="body-copy mt-2 text-[0.9rem] text-bone/55">
        Whoever has the code or the link takes this seat.
      </p>
      <p className="body-copy mt-3 break-all text-[0.82rem] text-bone/45">{invite}</p>
      <p className="mt-2 flex flex-wrap gap-5">
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
  const taken = team.members.map((m) => m.seat);

  return (
    <div className="mx-auto w-full max-w-[80rem] px-[var(--edge)] pb-24 pt-[clamp(1.25rem,3.5vh,2rem)]">
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-bone/12 pb-4">
        <Link
          href="/admin"
          className="label text-[0.7rem] text-bone/50 transition-colors hover:text-lime"
        >
          ← All teams
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="label text-[0.7rem] text-bone/35">{who}</span>
          <form action="/admin/signout" method="post">
            <button
              type="submit"
              className="label cursor-pointer text-[0.7rem] text-bone/50 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className="display text-[1.05rem] tracking-[0.08em] text-lime">{showCode(team.code)}</span>
        <h1 className="display text-[clamp(1.9rem,4.5vw,3rem)] leading-[0.95]">{team.name}</h1>
        <Chip state={team.state} className="translate-y-[-0.2em]" />
        <Seats taken={taken} />
      </div>
      <p className="label mt-3 text-[0.66rem] text-bone/35">
        Started {when(team.createdAt)}
        {team.reaction ? ` · going for: ${team.reaction}` : ""}
      </p>

      <Said said={said} />

      <div className="mt-[clamp(1.75rem,4.5vh,2.75rem)] grid gap-x-[clamp(2rem,4vw,4rem)] gap-y-[clamp(2rem,5vh,3rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* the people */}
        <section>
          <Heading note={`${team.members.length} of ${SEATS.length} seats`}>Who&rsquo;s on it</Heading>
          <ul className="mt-6 space-y-8">
            {SEATS.map((s) => {
              const member = team.members.find((m) => m.seat === s);
              return member ? (
                <Person key={s} member={member} code={team.code} editing={seat === s} />
              ) : (
                <EmptySeat key={s} seat={s} code={team.code} origin={origin} />
              );
            })}
          </ul>

          {history && history.length ? (
            <div className="mt-[clamp(2rem,5vh,3rem)]">
              <Heading note="Newest first">What&rsquo;s been done to it</Heading>
              <ul className="mt-4 space-y-2">
                {history.map((entry, i) => (
                  <li key={`${entry.at}-${i}`} className="body-copy text-[0.86rem] leading-[1.6] text-bone/55">
                    <span className="text-bone/30">{when(entry.at)}</span> · {entry.who} {entry.did}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* everything that can be changed */}
        <section className="space-y-[clamp(1.75rem,4vh,2.5rem)]">
          <div>
            <Heading note="Where they are in the review">Mark this team</Heading>
            <form action={setStateAction} className="mt-4 flex flex-wrap gap-2">
              <input type="hidden" name="code" value={team.code} />
              {STATES.map((s) => (
                <button
                  key={s.value}
                  type="submit"
                  name="state"
                  value={s.value}
                  title={s.hint}
                  disabled={team.state === s.value}
                  className={`label border px-3 py-2 text-[0.68rem] transition-colors ${
                    team.state === s.value
                      ? "cursor-default border-lime bg-lime text-ink"
                      : "cursor-pointer border-bone/20 text-bone/65 hover:border-lime hover:text-lime"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </form>
            <p className="body-copy mt-3 text-[0.82rem] text-bone/35">
              {STATES.find((s) => s.value === team.state)?.hint}
            </p>
          </div>

          <div>
            <Heading note="Only the core team sees this">Note</Heading>
            <form action={setNoteAction} className="mt-4">
              <input type="hidden" name="code" value={team.code} />
              <textarea
                name="note"
                rows={3}
                maxLength={500}
                defaultValue={team.note}
                placeholder="Called them, no answer. Fee pending. Second member switched…"
                className="body-copy w-full border border-bone/20 bg-transparent p-3 text-[0.9rem] leading-[1.6] text-bone caret-lime outline-none transition-colors placeholder:text-bone/20 focus:border-lime"
              />
              <p className="mt-3">
                <Go quiet>Save the note</Go>
              </p>
            </form>
          </div>

          <div>
            <Heading>The team itself</Heading>
            <form action={renameTeamAction} className="mt-4 space-y-4">
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
          </div>

          <div>
            <Heading note="There's no undo">Remove</Heading>
            <div className="mt-4">
              <Confirm summary="Remove this team altogether">
                <form action={removeTeamAction} className="flex flex-wrap items-center gap-4">
                  <input type="hidden" name="code" value={team.code} />
                  <span className="body-copy text-[0.88rem] text-bone/60">
                    {team.name} and {team.members.length === 1 ? "the person on it" : "both people on it"} are deleted.
                  </span>
                  <Go quiet>Remove the team</Go>
                </form>
              </Confirm>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
