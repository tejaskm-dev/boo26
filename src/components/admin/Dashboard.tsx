import Copy from "./Copy";
import { freeSeatAction, removeTeamAction } from "@/lib/admin/actions";
import { joinPath, showCode } from "@/lib/register/code";
import { showPhone, YEARS } from "@/lib/register/fields";
import type { AdminAction, TeamRecord } from "@/lib/register/store";

/**
 * What an event manager needs on one page: how many, who, how to reach them,
 * who's still short a teammate, and the two fixes a night like this needs.
 *
 * Server-rendered, filters and all — searching is a plain form that reloads
 * the page with a query, so there's nothing to download and nothing to wait
 * for. The only JavaScript is the copy button.
 */

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));

const year = (v: string) => YEARS.find((y) => y.value === v)?.label ?? v;

export default function Dashboard({
  who,
  teams,
  log,
  q,
  state,
  origin,
  temporary,
}: {
  who: string;
  teams: TeamRecord[];
  log: AdminAction[];
  q: string;
  state: "all" | "complete" | "waiting";
  origin: string;
  temporary: boolean;
}) {
  const people = teams.flatMap((t) => t.members);
  const complete = teams.filter((t) => t.members.length >= 2);
  const waiting = teams.filter((t) => t.members.length < 2);

  const needle = q.trim().toLowerCase();
  const shown = teams.filter((t) => {
    if (state === "complete" && t.members.length < 2) return false;
    if (state === "waiting" && t.members.length >= 2) return false;
    if (!needle) return true;
    const hay = [t.code, t.name, ...t.members.flatMap((m) => [m.name, m.email, m.phone, m.collegeId, m.department])]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });

  const by = (key: "department" | "year") => {
    const counts = new Map<string, number>();
    for (const m of people) {
      const k = key === "year" ? year(m.year) : m.department.toUpperCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  };

  return (
    <main className="mx-auto w-full max-w-[86rem] px-[var(--edge)] py-[clamp(1.5rem,4vh,2.5rem)]">
      <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-bone/15 pb-5">
        <div>
          <p className="label label-loose text-bone/45">BOO! 2026</p>
          <h1 className="display mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] leading-none">Registrations</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href="/admin/export" className="label text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime">
            Export CSV
          </a>
          <span className="label text-bone/40">{who}</span>
          <form action="/admin/signout" method="post">
            <button type="submit" className="label cursor-pointer text-bone/55 underline decoration-bone/25 underline-offset-4 hover:text-lime hover:decoration-lime">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {temporary ? (
        <p className="label mt-5 flex items-start gap-3 leading-[1.7] text-bone/45">
          <span aria-hidden="true" className="mt-[0.45em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
          No database configured: these are only in this server&rsquo;s memory and go when it restarts.
        </p>
      ) : null}

      {/* the numbers */}
      <section className="mt-[clamp(1.5rem,4vh,2.5rem)] grid grid-cols-2 gap-px overflow-hidden border border-bone/15 bg-bone/15 md:grid-cols-4">
        {[
          { k: "Teams", v: teams.length },
          { k: "People", v: people.length },
          { k: "Complete", v: complete.length },
          { k: "Waiting for a teammate", v: waiting.length },
        ].map((n) => (
          <div key={n.k} className="bg-ink px-5 py-4">
            <p className="label text-bone/45">{n.k}</p>
            <p className="display mt-2 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">{n.v}</p>
          </div>
        ))}
      </section>

      <details className="mt-4 border border-bone/15 px-5 py-3">
        <summary className="label cursor-pointer text-bone/55">Who they are — by department and year</summary>
        <div className="mt-4 grid gap-8 sm:grid-cols-2">
          {(["department", "year"] as const).map((key) => (
            <div key={key}>
              <p className="label text-bone/40">{key === "department" ? "Department" : "Year"}</p>
              <ul className="mt-3 space-y-1.5">
                {by(key).map(([label, count]) => (
                  <li key={label} className="body-copy flex items-baseline justify-between gap-4 text-[0.92rem] text-bone/75">
                    <span>{label || "—"}</span>
                    <span className="text-bone">{count}</span>
                  </li>
                ))}
                {people.length ? null : <li className="body-copy text-[0.92rem] text-bone/40">Nobody yet.</li>}
              </ul>
            </div>
          ))}
        </div>
      </details>

      {/* finding one */}
      <form className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-end gap-4" action="/admin" method="get">
        <label className="min-w-[16rem] flex-1">
          <span className="label block text-bone/45">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="name, email, number, code, department…"
            className="body-copy mt-2 w-full border-b border-bone/25 bg-transparent pb-2 text-[1rem] text-bone caret-lime outline-none placeholder:text-bone/25 focus:border-lime"
          />
        </label>
        <label>
          <span className="label block text-bone/45">Show</span>
          <select
            name="state"
            defaultValue={state}
            className="body-copy mt-2 border-b border-bone/25 bg-ink pb-2 text-[1rem] text-bone outline-none focus:border-lime"
          >
            <option value="all">Every team</option>
            <option value="complete">Complete</option>
            <option value="waiting">Waiting</option>
          </select>
        </label>
        <button type="submit" className="label cursor-pointer bg-bone/10 px-5 py-3 text-bone transition-colors hover:bg-lime hover:text-ink">
          Apply
        </button>
        {q || state !== "all" ? (
          <a href="/admin" className="label py-3 text-bone/50 underline decoration-bone/25 underline-offset-4 hover:text-lime">
            Clear
          </a>
        ) : null}
        <span className="label ml-auto py-3 text-bone/40">
          {shown.length} of {teams.length}
        </span>
      </form>

      {/* the teams */}
      <section className="mt-4 border-t border-bone/15">
        {shown.map((t) => {
          const [first, second] = t.members;
          const invite = `${origin}${joinPath(t.code)}`;
          return (
            <article key={t.code} className="border-b border-bone/15 py-5">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="display text-[1.05rem] tracking-[0.06em] text-lime">{showCode(t.code)}</span>
                <h2 className="display text-[clamp(1.1rem,2vw,1.4rem)] leading-none">{t.name}</h2>
                <span className={`label ${second ? "text-bone/45" : "text-lime"}`}>{second ? "Complete" : "Waiting"}</span>
                {t.reaction ? <span className="label text-bone/35">Going for: {t.reaction}</span> : null}
                <span className="label ml-auto text-bone/35">{when(t.createdAt)}</span>
              </div>

              <ol className="mt-4 grid gap-3 md:grid-cols-2">
                {[first, second].map((m, i) =>
                  m ? (
                    <li key={m.email} className="border-l-2 border-bone/15 pl-4">
                      <p className="label text-bone/40">
                        {i === 0 ? "01 · started it" : "02 · joined"} · {m.department.toUpperCase()} {year(m.year)} ·{" "}
                        {m.collegeId}
                      </p>
                      <p className="display mt-2 text-[1.05rem] leading-none">{m.name}</p>
                      <p className="body-copy mt-2 text-[0.9rem] text-bone/70">
                        <a href={`mailto:${m.email}`} className="underline decoration-bone/25 underline-offset-4 hover:text-lime">
                          {m.email}
                        </a>{" "}
                        ·{" "}
                        <a href={`tel:+91${m.phone}`} className="underline decoration-bone/25 underline-offset-4 hover:text-lime">
                          {showPhone(m.phone)}
                        </a>
                      </p>
                    </li>
                  ) : (
                    <li key="empty" className="border-l-2 border-dashed border-bone/20 pl-4">
                      <p className="label text-bone/40">02 · seat empty</p>
                      <p className="body-copy mt-2 break-all text-[0.85rem] text-bone/50">{invite}</p>
                      <p className="mt-2 flex gap-4">
                        <Copy text={invite} label="Copy invite link" />
                        <Copy text={showCode(t.code)} label="Copy code" />
                      </p>
                    </li>
                  ),
                )}
              </ol>

              {/* the fixes, each behind its own confirmation */}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {second ? (
                  <details className="group">
                    <summary className="label cursor-pointer list-none text-bone/45 hover:text-lime">Free the second seat</summary>
                    <form action={freeSeatAction} className="mt-2 flex items-center gap-3">
                      <input type="hidden" name="code" value={t.code} />
                      <span className="body-copy text-[0.88rem] text-bone/60">
                        {second.name} comes off the team. The invite works again.
                      </span>
                      <button type="submit" className="label cursor-pointer bg-bone/10 px-4 py-2 hover:bg-lime hover:text-ink">
                        Do it
                      </button>
                    </form>
                  </details>
                ) : null}
                <details className="group">
                  <summary className="label cursor-pointer list-none text-bone/45 hover:text-lime">Remove the team</summary>
                  <form action={removeTeamAction} className="mt-2 flex items-center gap-3">
                    <input type="hidden" name="code" value={t.code} />
                    <span className="body-copy text-[0.88rem] text-bone/60">
                      {t.name} and everyone on it are deleted. There&rsquo;s no undo.
                    </span>
                    <button type="submit" className="label cursor-pointer bg-bone/10 px-4 py-2 hover:bg-lime hover:text-ink">
                      Remove
                    </button>
                  </form>
                </details>
              </div>
            </article>
          );
        })}

        {shown.length ? null : (
          <p className="body-copy py-10 text-center text-[0.95rem] text-bone/45">
            {teams.length ? "Nothing matches that." : "No teams yet."}
          </p>
        )}
      </section>

      {log.length ? (
        <details className="mt-8 border border-bone/15 px-5 py-3">
          <summary className="label cursor-pointer text-bone/55">What&rsquo;s been changed here</summary>
          <ul className="mt-4 space-y-2">
            {log.map((entry, i) => (
              <li key={`${entry.at}-${i}`} className="body-copy text-[0.9rem] text-bone/65">
                <span className="text-bone/40">{when(entry.at)}</span> · {entry.who} {entry.did}{" "}
                <span className="text-bone">{entry.about}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </main>
  );
}
