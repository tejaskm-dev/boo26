import Link from "next/link";
import Controls from "./Controls";
import { addressFor, type Params } from "@/lib/admin/view";
import { Chip, Seats } from "./bits";
import { setStateManyAction } from "@/lib/admin/actions";
import { showCode } from "@/lib/register/code";
import { YEARS } from "@/lib/register/fields";
import { STATES, type AdminAction, type MemberRecord, type TeamRecord, type TeamState } from "@/lib/register/store";

/**
 * Every team on one page: how many, where each one is in the review, and the
 * way in to the one you want.
 *
 * Which teams are shown, in what order, and whether they're gathered into
 * departments or years all live in the address, so a view worth coming back
 * to is a link — and every control sets it the moment it's changed.
 *
 * Where a team's people disagree — one from CSE, one from ECE — it's the one
 * who started the team that decides where it sits, since that's the person
 * the team is organised around.
 */

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));

const year = (v: string) => YEARS.find((y) => y.value === v)?.label ?? v;

/** whoever started it: the earliest to join, whatever seat they ended up in */
const creatorOf = (t: TeamRecord): MemberRecord | undefined =>
  [...t.members].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];

const NOBODY = "Nobody on it yet";

const deptOf = (t: TeamRecord) => creatorOf(t)?.department.toUpperCase() || NOBODY;
const yearOf = (t: TeamRecord) => {
  const y = creatorOf(t)?.year;
  return y ? year(y) : NOBODY;
};

function Row({ team }: { team: TeamRecord }) {
  const taken = team.members.map((m) => m.seat);
  const to = `/admin/team/${team.code}`;

  return (
    <li className="group relative border-b border-bone/10">
      <div className="flex items-start gap-4 py-4 transition-colors duration-200 group-hover:bg-bone/[0.035]">
        <label className="mt-1 shrink-0 cursor-pointer p-1" title={`Tick ${team.name}`}>
          <input
            type="checkbox"
            name="codes"
            value={team.code}
            className="h-3.5 w-3.5 cursor-pointer appearance-none border border-bone/30 transition-colors checked:border-lime checked:bg-lime"
          />
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <Link
              href={to}
              className="display text-[0.95rem] tracking-[0.06em] text-lime outline-none transition-opacity hover:opacity-80 focus-visible:underline"
            >
              {showCode(team.code)}
            </Link>
            <Link
              href={to}
              className="display text-[clamp(1.05rem,1.8vw,1.35rem)] leading-none outline-none transition-colors hover:text-lime focus-visible:text-lime"
            >
              {team.name}
            </Link>
            <Chip state={team.state} />
            <Seats taken={taken} />
            {team.note ? (
              <span className="label text-[0.66rem] text-bone/35" title={team.note}>
                Note
              </span>
            ) : null}
            <span className="label ml-auto text-[0.66rem] text-bone/30">{when(team.createdAt)}</span>
          </div>

          <p className="body-copy mt-2 truncate text-[0.88rem] text-bone/55">
            {team.members.length
              ? team.members.map((m) => `${m.name} · ${m.department.toUpperCase()} ${year(m.year)}`).join("   ·   ")
              : "Nobody on this team."}
          </p>
        </div>

        <Link
          href={to}
          className="label mt-1 hidden shrink-0 text-[0.66rem] text-bone/30 transition-all group-hover:translate-x-1 group-hover:text-lime sm:block"
          aria-label={`Open ${team.name}`}
        >
          Open →
        </Link>
      </div>
    </li>
  );
}

export default function Dashboard({
  who,
  teams,
  log,
  params,
  said,
  temporary,
}: {
  who: string;
  teams: TeamRecord[];
  log: AdminAction[] | null;
  params: Params;
  said?: string;
  temporary: boolean;
}) {
  const { q, state, seats, sort, group } = params;
  const people = teams.flatMap((t) => t.members);
  const complete = teams.filter((t) => t.members.length >= 2).length;

  const counts = Object.fromEntries(
    STATES.map((s) => [s.value, teams.filter((t) => t.state === s.value).length]),
  ) as Record<TeamState, number>;

  // no state named is every state: a filter nobody has set shows everything
  const wanted = state ? state.split(",").filter(Boolean) : [];
  const needle = q.trim().toLowerCase();

  const shown = teams.filter((t) => {
    if (wanted.length && !wanted.includes(t.state)) return false;
    if (seats === "complete" && t.members.length < 2) return false;
    if (seats === "waiting" && t.members.length >= 2) return false;
    if (!needle) return true;
    const hay = [t.code, t.name, t.note, ...t.members.flatMap((m) => [m.name, m.email, m.phone, m.collegeId, m.department])]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });

  const newestFirst = (a: TeamRecord, b: TeamRecord) => b.createdAt.localeCompare(a.createdAt);
  const order = (a: TeamRecord, b: TeamRecord) => {
    if (sort === "year") {
      const [x, y] = [creatorOf(a)?.year ?? "9", creatorOf(b)?.year ?? "9"];
      return x === y ? newestFirst(a, b) : x.localeCompare(y);
    }
    if (sort === "dept") {
      const [x, y] = [deptOf(a), deptOf(b)];
      if (x === y) return newestFirst(a, b);
      // a team with nobody on it goes last, whichever way the list runs
      if (x === NOBODY || y === NOBODY) return x === NOBODY ? 1 : -1;
      return x.localeCompare(y);
    }
    return newestFirst(a, b);
  };

  const sorted = [...shown].sort(order);

  /** the teams gathered under whatever they're grouped by, in the group's own order */
  const groups: { name: string; teams: TeamRecord[] }[] = (() => {
    if (group !== "dept" && group !== "year") return [{ name: "", teams: sorted }];

    const gathered = new Map<string, TeamRecord[]>();
    for (const team of sorted) {
      const key = group === "dept" ? deptOf(team) : yearOf(team);
      gathered.set(key, [...(gathered.get(key) ?? []), team]);
    }

    const byYear: string[] = YEARS.map((y) => y.label);
    return [...gathered.entries()]
      .sort(([a], [b]) => {
        if (a === NOBODY || b === NOBODY) return a === NOBODY ? 1 : -1;
        return group === "year" ? byYear.indexOf(a) - byYear.indexOf(b) : a.localeCompare(b);
      })
      .map(([name, list]) => ({ name, teams: list }));
  })();

  /** one state added to the filter, or taken back out of it */
  const toggled = (value: string) => {
    const next = wanted.includes(value) ? wanted.filter((s) => s !== value) : [...wanted, value];
    return addressFor({ ...params, state: next.join(",") });
  };

  const filtered = Boolean(q || wanted.length || seats !== "any");

  return (
    <div className="mx-auto w-full max-w-[92rem] px-[var(--edge)] pb-24 pt-[clamp(1.25rem,3.5vh,2rem)]">
      <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <div>
          <p className="label label-loose text-bone/40">BOO! 2026</p>
          <h1 className="display mt-2 text-[clamp(1.7rem,3.6vw,2.6rem)] leading-none">Registrations</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a
            href="/admin/export"
            className="label text-[0.7rem] text-lime underline decoration-lime/40 underline-offset-4 transition-colors hover:decoration-lime"
          >
            Export CSV
          </a>
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

      {temporary ? (
        <p className="label mt-5 flex items-start gap-3 text-[0.68rem] leading-[1.7] text-bone/45">
          <span aria-hidden="true" className="mt-[0.45em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
          No database configured: these are only in this server&rsquo;s memory and go when it restarts.
        </p>
      ) : null}

      {said === "team-removed" ? (
        <p className="body-copy mt-6 border-l-2 border-lime pl-4 text-[0.92rem] text-bone/80">That team is gone.</p>
      ) : null}

      {/* the numbers, and the same numbers as a strip */}
      <section className="mt-[clamp(1.25rem,3.5vh,2rem)]">
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-bone/12 bg-bone/12 md:grid-cols-4">
          {[
            { k: "Teams", v: teams.length },
            { k: "People", v: people.length },
            { k: "Complete", v: complete },
            { k: "Waiting for a teammate", v: teams.length - complete },
          ].map((n) => (
            <div key={n.k} className="bg-ink px-5 py-4">
              <p className="label text-[0.66rem] text-bone/40">{n.k}</p>
              <p className="display mt-2 text-[clamp(1.7rem,3vw,2.3rem)] leading-none">{n.v}</p>
            </div>
          ))}
        </div>

        {teams.length ? (
          <div className="mt-3 flex h-1.5 w-full overflow-hidden" aria-hidden="true">
            {STATES.map((s) =>
              counts[s.value] ? (
                <span
                  key={s.value}
                  style={{ width: `${(counts[s.value] / teams.length) * 100}%` }}
                  className={
                    s.value === "shortlisted"
                      ? "bg-lime"
                      : s.value === "verified"
                        ? "bg-lime/45"
                        : s.value === "waitlisted"
                          ? "bg-bone/40"
                          : s.value === "rejected"
                            ? "bg-bone/15"
                            : "bg-bone/25"
                  }
                />
              ) : null,
            )}
          </div>
        ) : null}
      </section>

      <details className="mt-4 border border-bone/12 px-5 py-3">
        <summary className="label cursor-pointer text-[0.68rem] text-bone/45">Who they are — by department and year</summary>
        <div className="mt-5 grid gap-8 sm:grid-cols-2">
          {(["department", "year"] as const).map((key) => {
            const counted = new Map<string, number>();
            for (const m of people) {
              const k = key === "year" ? year(m.year) : m.department.toUpperCase();
              counted.set(k, (counted.get(k) ?? 0) + 1);
            }
            return (
              <div key={key}>
                <p className="label text-[0.66rem] text-bone/35">{key === "department" ? "Department" : "Year"}</p>
                <ul className="mt-3 space-y-2">
                  {[...counted.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, count]) => (
                      <li key={label} className="flex items-baseline gap-3">
                        <span className="body-copy text-[0.88rem] text-bone/70">{label || "—"}</span>
                        <span aria-hidden="true" className="h-px flex-1 bg-bone/12" />
                        <span className="body-copy text-[0.88rem] text-bone">{count}</span>
                      </li>
                    ))}
                  {people.length ? null : <li className="body-copy text-[0.88rem] text-bone/35">Nobody yet.</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </details>

      {/* each one shows or hides that part of the review; together they narrow it */}
      <nav className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={addressFor({ ...params, state: "" })}
          className={`label border px-3 py-1.5 text-[0.68rem] transition-colors ${
            wanted.length ? "border-bone/15 text-bone/45 hover:border-bone/40 hover:text-bone/80" : "border-bone/60 text-bone"
          }`}
        >
          Every team <span className="ml-1.5 text-bone/40">{teams.length}</span>
        </Link>
        {STATES.map((s) => {
          const on = wanted.includes(s.value);
          return (
            <Link
              key={s.value}
              href={toggled(s.value)}
              title={s.hint}
              aria-pressed={on}
              className={`label border px-3 py-1.5 text-[0.68rem] transition-colors ${
                on ? "border-lime bg-lime/10 text-lime" : "border-bone/15 text-bone/45 hover:border-bone/40 hover:text-bone/80"
              }`}
            >
              {s.label} <span className="ml-1.5 opacity-60">{counts[s.value]}</span>
            </Link>
          );
        })}
        {filtered ? (
          <Link
            href="/admin"
            className="label ml-1 py-1.5 text-[0.66rem] text-bone/35 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-lime"
          >
            Clear
          </Link>
        ) : null}
        <span className="label ml-auto text-[0.66rem] text-bone/35">{`${shown.length} of ${teams.length} shown`}</span>
      </nav>

      <Controls params={params} grouped={group === "dept" || group === "year"} />

      {/* the teams, and what can be done to a few at once */}
      <form action={setStateManyAction}>
        {groups.map(({ name, teams: list }) =>
          name ? (
            <details key={name} data-group open className="group/fold border-b border-bone/10 last:border-b-0">
              <summary className="label flex cursor-pointer items-center gap-3 py-4 text-[0.7rem] text-bone/60 transition-colors hover:text-lime">
                <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open/fold:rotate-90">
                  ›
                </span>
                {name}
                <span className="text-bone/30">{list.length}</span>
                <span aria-hidden="true" className="ml-2 h-px flex-1 bg-bone/10" />
              </summary>
              <ul className="pl-4">
                {list.map((t) => (
                  <Row key={t.code} team={t} />
                ))}
              </ul>
            </details>
          ) : (
            <ul key="all">
              {list.map((t) => (
                <Row key={t.code} team={t} />
              ))}
            </ul>
          ),
        )}

        {shown.length ? (
          <div
            // it follows you down a long list, but on a phone that's a third
            // of the screen, so there it simply comes after the last team
            className="mt-px flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-bone/15 bg-ink/95 py-4 backdrop-blur sm:sticky sm:bottom-0"
          >
            <span className="label text-[0.66rem] text-bone/40">With the ticked</span>
            {STATES.map((s) => (
              <button
                key={s.value}
                type="submit"
                name="state"
                value={s.value}
                title={s.hint}
                className="label cursor-pointer border border-bone/20 px-3 py-2 text-[0.68rem] text-bone/70 transition-colors hover:border-lime hover:text-lime"
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="body-copy py-16 text-center text-[0.95rem] text-bone/40">
            {teams.length ? "Nothing matches that." : "No teams yet."}
          </p>
        )}
      </form>

      {log === null ? (
        <p className="label mt-10 flex items-start gap-3 text-[0.66rem] leading-[1.7] text-bone/35">
          <span aria-hidden="true" className="mt-[0.45em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
          The record of changes isn&rsquo;t readable — run db/schema.sql, which adds the table it&rsquo;s kept in.
        </p>
      ) : log.length ? (
        <details className="mt-10 border border-bone/12 px-5 py-3">
          <summary className="label cursor-pointer text-[0.68rem] text-bone/45">What&rsquo;s been changed here</summary>
          <ul className="mt-4 space-y-2">
            {log.map((entry, i) => (
              <li key={`${entry.at}-${i}`} className="body-copy text-[0.88rem] text-bone/60">
                <span className="text-bone/30">{when(entry.at)}</span> · {entry.who} {entry.did}{" "}
                <span className="text-bone/90">{showCode(entry.about)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
