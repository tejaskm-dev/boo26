import Shell from "./Shell";
import TeamList from "./TeamList";
import { Panel, Spark, Stat } from "./bits";
import { showCode } from "@/lib/register/code";
import { YEARS } from "@/lib/register/fields";
import type { Params } from "@/lib/admin/view";
import { STATES, type AdminAction, type TeamRecord } from "@/lib/register/teams";

/**
 * The front page of the dashboard: how the night is filling up, and then
 * every team.
 *
 * What's here is what the numbers are made of — counts, the shape of the
 * intake, who's registered by department and year. The list below it does its
 * own thinking in the browser, so none of the looking costs a request.
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

/** how the review stands, as one bar across the page */
function Pipeline({ teams }: { teams: TeamRecord[] }) {
  const counts = STATES.map((s) => ({ ...s, n: teams.filter((t) => t.state === s.value).length }));
  const fill: Record<string, string> = {
    new: "bg-bone/25",
    verified: "bg-lime/45",
    shortlisted: "bg-lime",
    waitlisted: "bg-bone/40",
    rejected: "bg-bone/12",
  };

  return (
    <div>
      <div className="flex h-2 w-full gap-px overflow-hidden" aria-hidden="true">
        {counts.map((s) =>
          s.n ? <span key={s.value} style={{ width: `${(s.n / teams.length) * 100}%` }} className={fill[s.value]} /> : null,
        )}
      </div>
      <ul className="mt-4 space-y-2.5">
        {counts.map((s) => (
          <li key={s.value} className="flex items-baseline gap-3">
            <span aria-hidden="true" className={`h-2 w-2 shrink-0 translate-y-[-0.1em] ${fill[s.value]}`} />
            <span className="label text-[0.64rem] text-bone/55">{s.label}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-bone/10" />
            <span className="body-copy text-[0.86rem] text-bone">{s.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Counted({ people, by }: { people: TeamRecord["members"]; by: "department" | "year" }) {
  const counted = new Map<string, number>();
  for (const m of people) {
    const key = by === "year" ? year(m.year) : m.department.toUpperCase();
    counted.set(key, (counted.get(key) ?? 0) + 1);
  }
  const most = Math.max(1, ...counted.values());

  return (
    <ul className="space-y-2.5">
      {[...counted.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => (
          <li key={label} className="flex items-center gap-3">
            <span className="body-copy w-16 shrink-0 text-[0.84rem] text-bone/70">{label || "—"}</span>
            <span aria-hidden="true" className="h-1.5 flex-1 bg-bone/[0.07]">
              <span className="block h-full bg-lime/50" style={{ width: `${(count / most) * 100}%` }} />
            </span>
            <span className="body-copy w-5 shrink-0 text-right text-[0.84rem] text-bone">{count}</span>
          </li>
        ))}
      {people.length ? null : <li className="body-copy text-[0.84rem] text-bone/30">Nobody yet.</li>}
    </ul>
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
  const people = teams.flatMap((t) => t.members);
  const complete = teams.filter((t) => t.members.length >= 2).length;
  const today = new Date().toISOString().slice(0, 10);
  const todays = teams.filter((t) => t.createdAt.slice(0, 10) === today).length;

  return (
    <Shell who={who}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h1 className="display text-[clamp(2rem,4.5vw,3.2rem)] leading-[0.9]">Registrations</h1>
          <p className="hand mt-2 text-[1.15rem] text-bone/40">
            {teams.length ? `${teams.length} ${teams.length === 1 ? "team" : "teams"} so far.` : "Nothing yet."}
          </p>
        </div>
        {temporary ? (
          <p className="label flex max-w-[28rem] items-start gap-3 text-[0.62rem] leading-[1.8] text-bone/40">
            <span aria-hidden="true" className="mt-[0.4em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
            No database configured: these are only in this server&rsquo;s memory and go when it restarts.
          </p>
        ) : null}
      </div>

      {said === "team-removed" ? (
        <p className="body-copy mt-6 border-l-2 border-lime pl-4 text-[0.92rem] text-bone/80">That team is gone.</p>
      ) : null}

      <section className="mt-[clamp(1.25rem,3.5vh,2rem)] grid gap-3 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-px border border-bone/10 bg-bone/10 md:grid-cols-4">
          <Stat label="Teams" value={teams.length} under={todays ? `${todays} today` : "none today"} />
          <Stat label="People" value={people.length} />
          <Stat label="Complete" value={complete} under="both seats taken" />
          <Stat label="Waiting" value={teams.length - complete} under="one seat open" />
        </div>

        <Panel title="How they've come in" note="last 14 days">
          <Spark at={teams.map((t) => t.createdAt)} />
        </Panel>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-3">
        <Panel title="The review">
          {teams.length ? (
            <Pipeline teams={teams} />
          ) : (
            <p className="body-copy text-[0.84rem] text-bone/30">Nothing to review yet.</p>
          )}
        </Panel>
        <Panel title="By department">
          <Counted people={people} by="department" />
        </Panel>
        <Panel title="By year">
          <Counted people={people} by="year" />
        </Panel>
      </section>

      <TeamList teams={teams} initial={params} />

      {log === null ? (
        <p className="label mt-6 flex items-start gap-3 text-[0.62rem] leading-[1.8] text-bone/35">
          <span aria-hidden="true" className="mt-[0.4em] h-[0.38rem] w-[0.38rem] shrink-0 rotate-45 bg-lime/70" />
          The record of changes isn&rsquo;t readable — run db/schema.sql, which adds the table it&rsquo;s kept in.
        </p>
      ) : log.length ? (
        <details className="mt-6 border border-bone/10 bg-bone/[0.018] px-5 py-3">
          <summary className="label cursor-pointer text-[0.64rem] text-bone/45">What&rsquo;s been changed here</summary>
          <ul className="mt-4 space-y-2 pb-2">
            {log.map((entry, i) => (
              <li key={`${entry.at}-${i}`} className="body-copy text-[0.86rem] text-bone/55">
                <span className="text-bone/25">{when(entry.at)}</span> · {entry.who} {entry.did}{" "}
                <span className="text-bone/85">{showCode(entry.about)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Shell>
  );
}
