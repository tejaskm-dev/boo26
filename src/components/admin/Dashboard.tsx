import Shell from "./Shell";
import TeamList from "./TeamList";
import { Panel, Spark, Stat } from "./bits";
import { showCode } from "@/lib/register/code";
import { YEARS } from "@/lib/register/fields";
import type { Params } from "@/lib/admin/view";
import { STATES, type AdminAction, type TeamRecord } from "@/lib/register/teams";

/**
 * The front page of the dashboard.
 *
 * The teams come first, because that's what anybody opening this came for:
 * four numbers and the shape of the intake across the top, then the list.
 * Everything else — how the review is going, who's registered by department
 * and year — sits underneath, folded away until it's wanted.
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

function Bars({ rows }: { rows: [string, number][] }) {
  const most = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <ul className="space-y-2">
      {rows.map(([label, count]) => (
        <li key={label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 truncate text-[0.84rem]">{label || "—"}</span>
          <span aria-hidden="true" className="h-2 flex-1 rounded-[1px] bg-[var(--line)]">
            <span
              className="block h-full rounded-[1px] bg-[var(--accent-deep)]/55"
              style={{ width: `${(count / most) * 100}%` }}
            />
          </span>
          <span className="w-5 shrink-0 text-right text-[0.84rem] tabular-nums">{count}</span>
        </li>
      ))}
      {rows.length ? null : <li className="faint text-[0.84rem]">Nobody yet.</li>}
    </ul>
  );
}

export default function Dashboard({
  who,
  teams,
  log,
  params,
  said,
  seat,
  origin,
  temporary,
}: {
  who: string;
  teams: TeamRecord[];
  log: AdminAction[] | null;
  params: Params & { team?: string };
  said?: string;
  seat?: number;
  origin: string;
  temporary: boolean;
}) {
  const people = teams.flatMap((t) => t.members);
  const complete = teams.filter((t) => t.members.length >= 2).length;
  const today = new Date().toISOString().slice(0, 10);
  const todays = teams.filter((t) => t.createdAt.slice(0, 10) === today).length;

  const counted = (by: "department" | "year"): [string, number][] => {
    const tally = new Map<string, number>();
    for (const m of people) {
      const key = by === "year" ? year(m.year) : m.department.toUpperCase();
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
    return [...tally.entries()].sort((a, b) => b[1] - a[1]);
  };

  return (
    <Shell who={who}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h1 className="figure text-[clamp(1.6rem,3.4vw,2.2rem)]">Registrations</h1>
        {temporary ? (
          <p className="max-w-[30rem] rounded-[2px] border border-[#e4cc93] bg-[#fbf3e0] px-3 py-2 text-[0.8rem] text-[#7a5200]">
            No database configured — these are only in this server&rsquo;s memory and go when it restarts.
          </p>
        ) : null}
      </div>

      {said === "team-removed" ? (
        <p className="mt-4 rounded-[2px] border border-[#cbe06a] bg-[#f2f9d6] px-4 py-3 text-[0.86rem] text-[#40500a]">
          That team is gone.
        </p>
      ) : null}

      <section className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.3fr)]">
        <Stat label="Teams" value={teams.length} under={todays ? `${todays} today` : "none today"} />
        <Stat label="People" value={people.length} />
        <Stat label="Complete" value={complete} under="both seats taken" />
        <Stat label="Waiting" value={teams.length - complete} under="one seat open" />
        <div className="card col-span-2 hidden px-5 py-4 sm:block xl:col-span-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">How they&rsquo;ve come in</p>
            <p className="faint text-[0.74rem]">14 days</p>
          </div>
          <div className="mt-2.5">
            <Spark at={teams.map((t) => t.createdAt)} />
          </div>
        </div>
      </section>

      <TeamList teams={teams} initial={params} origin={origin} said={said} seat={seat} />

      <details className="mt-6">
        <summary className="btn btn-plain inline-flex text-[0.84rem]">Breakdown, and what&rsquo;s been changed</summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <Panel title="The review">
            <Bars rows={STATES.map((s) => [s.label, teams.filter((t) => t.state === s.value).length])} />
          </Panel>
          <Panel title="By department">
            <Bars rows={counted("department")} />
          </Panel>
          <Panel title="By year">
            <Bars rows={counted("year")} />
          </Panel>
        </div>

        {log === null ? (
          <p className="muted mt-3 text-[0.82rem]">
            The record of changes isn&rsquo;t readable — run db/schema.sql, which adds the table it&rsquo;s kept in.
          </p>
        ) : log.length ? (
          <Panel title="What's been changed here" className="mt-3">
            <ul className="space-y-2">
              {log.map((entry, i) => (
                <li key={`${entry.at}-${i}`} className="muted text-[0.84rem]">
                  <span className="faint">{when(entry.at)}</span> · {entry.who} {entry.did}{" "}
                  <span className="text-[var(--ink)]">{showCode(entry.about)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </details>
    </Shell>
  );
}
