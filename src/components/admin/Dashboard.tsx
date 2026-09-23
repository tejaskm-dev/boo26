import Link from "next/link";
import { Chip, Seats } from "./bits";
import { setStateManyAction } from "@/lib/admin/actions";
import { showCode } from "@/lib/register/code";
import { YEARS } from "@/lib/register/fields";
import { STATES, type AdminAction, type TeamRecord, type TeamState } from "@/lib/register/store";

/**
 * Every team on one page: how many, where each one is in the review, and the
 * way in to the one you want. Searching and filtering are plain links and a
 * plain form — the page reloads with a query, so there's nothing to download
 * and nothing to wait for — and ticking a few teams lets the whole lot be
 * moved along at once.
 */

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(
    new Date(iso),
  );

const year = (v: string) => YEARS.find((y) => y.value === v)?.label ?? v;

export type Filters = { q: string; state: string; seats: string };

export default function Dashboard({
  who,
  teams,
  log,
  filters,
  said,
  temporary,
}: {
  who: string;
  teams: TeamRecord[];
  log: AdminAction[] | null;
  filters: Filters;
  said?: string;
  temporary: boolean;
}) {
  const { q, state, seats } = filters;
  const people = teams.flatMap((t) => t.members);
  const complete = teams.filter((t) => t.members.length >= 2).length;

  const counts = Object.fromEntries(STATES.map((s) => [s.value, teams.filter((t) => t.state === s.value).length])) as Record<
    TeamState,
    number
  >;

  const needle = q.trim().toLowerCase();
  const shown = teams.filter((t) => {
    if (state !== "all" && t.state !== state) return false;
    if (seats === "complete" && t.members.length < 2) return false;
    if (seats === "waiting" && t.members.length >= 2) return false;
    if (!needle) return true;
    const hay = [t.code, t.name, t.note, ...t.members.flatMap((m) => [m.name, m.email, m.phone, m.collegeId, m.department])]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });

  const by = (key: "department" | "year") => {
    const counts = new Map<string, number>();
    for (const m of people) counts.set(key === "year" ? year(m.year) : m.department.toUpperCase(), 0);
    for (const m of people) {
      const k = key === "year" ? year(m.year) : m.department.toUpperCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  };

  /** the same page with one thing about it changed */
  const href = (change: Partial<Filters>) => {
    const next = { q, state, seats, ...change };
    const query = new URLSearchParams();
    if (next.q) query.set("q", next.q);
    if (next.state !== "all") query.set("state", next.state);
    if (next.seats !== "any") query.set("seats", next.seats);
    const s = query.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  const filtered = q || state !== "all" || seats !== "any";

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
          {(["department", "year"] as const).map((key) => (
            <div key={key}>
              <p className="label text-[0.66rem] text-bone/35">{key === "department" ? "Department" : "Year"}</p>
              <ul className="mt-3 space-y-2">
                {by(key).map(([label, count]) => (
                  <li key={label} className="flex items-baseline gap-3">
                    <span className="body-copy text-[0.88rem] text-bone/70">{label || "—"}</span>
                    <span aria-hidden="true" className="h-px flex-1 bg-bone/12" />
                    <span className="body-copy text-[0.88rem] text-bone">{count}</span>
                  </li>
                ))}
                {people.length ? null : <li className="body-copy text-[0.88rem] text-bone/35">Nobody yet.</li>}
              </ul>
            </div>
          ))}
        </div>
      </details>

      {/* where everyone is in the review, and the way to see only those */}
      <nav className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={href({ state: "all" })}
          className={`label border px-3 py-1.5 text-[0.68rem] transition-colors ${
            state === "all" ? "border-bone/60 text-bone" : "border-bone/15 text-bone/45 hover:border-bone/40 hover:text-bone/80"
          }`}
        >
          Every team <span className="ml-1.5 text-bone/40">{teams.length}</span>
        </Link>
        {STATES.map((s) => (
          <Link
            key={s.value}
            href={href({ state: s.value })}
            title={s.hint}
            className={`label border px-3 py-1.5 text-[0.68rem] transition-colors ${
              state === s.value
                ? "border-lime text-lime"
                : "border-bone/15 text-bone/45 hover:border-bone/40 hover:text-bone/80"
            }`}
          >
            {s.label} <span className="ml-1.5 opacity-60">{counts[s.value]}</span>
          </Link>
        ))}
      </nav>

      {/* finding one */}
      <form className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-4 border-y border-bone/12 py-4" action="/admin" method="get">
        <label className="min-w-[14rem] flex-1">
          <span className="label block text-[0.66rem] text-bone/40">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            size={1}
            placeholder="name, email, number, code, department, note…"
            className="body-copy mt-1.5 w-full border-b border-bone/20 bg-transparent pb-1.5 text-[0.95rem] text-bone caret-lime outline-none transition-colors placeholder:text-bone/20 focus:border-lime"
          />
        </label>
        <label>
          <span className="label block text-[0.66rem] text-bone/40">Seats</span>
          <select
            name="seats"
            defaultValue={seats}
            className="body-copy mt-1.5 border-b border-bone/20 bg-ink pb-1.5 text-[0.95rem] text-bone outline-none focus:border-lime"
          >
            <option value="any">Either way</option>
            <option value="complete">Complete</option>
            <option value="waiting">Waiting</option>
          </select>
        </label>
        {state !== "all" ? <input type="hidden" name="state" value={state} /> : null}
        <button
          type="submit"
          className="label cursor-pointer border border-bone/20 px-4 py-2.5 text-[0.7rem] text-bone/80 transition-colors hover:border-lime hover:text-lime"
        >
          Apply
        </button>
        {filtered ? (
          <Link href="/admin" className="label py-2.5 text-[0.68rem] text-bone/40 underline decoration-bone/20 underline-offset-4 hover:text-lime">
            Clear
          </Link>
        ) : null}
        <span className="label ml-auto py-2.5 text-[0.66rem] text-bone/35">
          {`${shown.length} of ${teams.length} shown`}
        </span>
      </form>

      {/* the teams, and what can be done to a few at once */}
      <form action={setStateManyAction}>
        <ul>
          {shown.map((t) => {
            const taken = t.members.map((m) => m.seat);
            return (
              <li key={t.code} className="group relative border-b border-bone/10">
                <div className="flex items-start gap-4 py-4 transition-colors duration-200 group-hover:bg-bone/[0.035]">
                  <label className="mt-1 shrink-0 cursor-pointer p-1" title={`Tick ${t.name}`}>
                    <input
                      type="checkbox"
                      name="codes"
                      value={t.code}
                      className="h-3.5 w-3.5 cursor-pointer appearance-none border border-bone/30 transition-colors checked:border-lime checked:bg-lime"
                    />
                  </label>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                      <Link
                        href={`/admin/team/${t.code}`}
                        className="display text-[0.95rem] tracking-[0.06em] text-lime outline-none transition-opacity hover:opacity-80 focus-visible:underline"
                      >
                        {showCode(t.code)}
                      </Link>
                      <Link
                        href={`/admin/team/${t.code}`}
                        className="display text-[clamp(1.05rem,1.8vw,1.35rem)] leading-none outline-none transition-colors hover:text-lime focus-visible:text-lime"
                      >
                        {t.name}
                      </Link>
                      <Chip state={t.state} />
                      <Seats taken={taken} />
                      {t.note ? (
                        <span className="label text-[0.66rem] text-bone/35" title={t.note}>
                          Note
                        </span>
                      ) : null}
                      <span className="label ml-auto text-[0.66rem] text-bone/30">{when(t.createdAt)}</span>
                    </div>

                    <p className="body-copy mt-2 truncate text-[0.88rem] text-bone/55">
                      {t.members.length
                        ? t.members
                            .map((m) => `${m.name} · ${m.department.toUpperCase()} ${year(m.year)}`)
                            .join("   ·   ")
                        : "Nobody on this team."}
                    </p>
                  </div>

                  <Link
                    href={`/admin/team/${t.code}`}
                    className="label mt-1 hidden shrink-0 text-[0.66rem] text-bone/30 transition-all group-hover:translate-x-1 group-hover:text-lime sm:block"
                    aria-label={`Open ${t.name}`}
                  >
                    Open →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

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
