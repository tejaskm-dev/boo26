"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TeamDetail, { TeamHeading } from "./TeamDetail";
import { Pill, Said, Seats } from "./bits";
import { setStateManyAction } from "@/lib/admin/actions";
import { addressFor, GROUPS, queryFor, SEATS_SHOWN, SORTS, type Params } from "@/lib/admin/view";
import { showCode } from "@/lib/register/code";
import { YEARS } from "@/lib/register/fields";
import { creatorOf, STATES, type TeamRecord } from "@/lib/register/teams";

/**
 * The teams, and everything about how they're shown.
 *
 * All of it happens here, in the browser. The page hands over every team once
 * and searching, filtering, ordering and grouping are done on what's already
 * in hand — and so is opening one: clicking a team slides its whole record in
 * beside the list rather than going to the server for a page that would come
 * back with what we already had.
 *
 * The address keeps up either way, written with replaceState rather than a
 * navigation, so a view — or a team — is still a link, and /admin/team/<code>
 * is still a real page for a new tab or somebody without JavaScript.
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

const NOBODY = "No one yet";

const deptOf = (t: TeamRecord) => creatorOf(t)?.department.toUpperCase() || NOBODY;
const yearOf = (t: TeamRecord) => {
  const y = creatorOf(t)?.year;
  return y ? year(y) : NOBODY;
};

function Row({ team, open, onOpen }: { team: TeamRecord; open: boolean; onOpen: () => void }) {
  return (
    <div
      className="row"
      data-open={open}
      onClick={(e) => {
        // the tick box, and anything opened in a new tab, are left alone
        const target = e.target as HTMLElement;
        if (target.closest("input,label") || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        onOpen();
      }}
    >
      <label className="cursor-pointer p-1" title={`Tick ${team.name}`} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          name="codes"
          value={team.code}
          className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent-deep)]"
        />
      </label>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <a
            href={`/admin/team/${team.code}`}
            className="figure truncate text-[1rem] hover:underline"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              onOpen();
            }}
          >
            {team.name}
          </a>
          <span className="faint text-[0.74rem] tracking-[0.08em]">{showCode(team.code)}</span>
          {team.note ? (
            <span className="faint text-[0.72rem]" title={team.note}>
              · note
            </span>
          ) : null}
        </div>
        <p className="muted mt-1 truncate text-[0.82rem]">
          {team.members.length ? team.members.map((m) => m.name).join(" · ") : "Nobody on this team."}
        </p>
      </div>

      <Pill state={team.state} />
      <span className="hidden lg:block">
        <Seats taken={team.members.map((m) => m.seat)} />
      </span>
      <span className="muted hidden text-[0.8rem] lg:block">{deptOf(team)}</span>
      <span className="muted hidden text-[0.8rem] lg:block">{yearOf(team)}</span>
      <span className="faint hidden text-[0.78rem] lg:block">{when(team.createdAt)}</span>
    </div>
  );
}

export default function TeamList({
  teams,
  initial,
  origin,
  said,
  seat,
}: {
  teams: TeamRecord[];
  initial: Params & { team?: string };
  origin: string;
  said?: string;
  seat?: number;
}) {
  const [params, setParams] = useState<Params>(initial);
  const [open, setOpen] = useState<string | null>(initial.team ?? null);
  const [per, setPer] = useState(25);
  const [page, setPage] = useState(1);
  const { q, state, seats, sort, group } = params;

  const address = useMemo(() => {
    const base = addressFor(params);
    return open ? `${base}${base.includes("?") ? "&" : "?"}team=${open}` : base;
  }, [params, open]);

  // the address follows the view without fetching anything for it
  useEffect(() => {
    if (address !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", address);
    }
  }, [address]);

  // ...and going back reads it the other way round
  useEffect(() => {
    const read = () => {
      const asked = new URLSearchParams(window.location.search);
      setParams({
        q: asked.get("q") ?? "",
        state: asked.get("state") ?? "",
        seats: asked.get("seats") ?? "any",
        sort: asked.get("sort") ?? "new",
        group: asked.get("group") ?? "none",
      });
      setOpen(asked.get("team"));
    };
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // escape closes whatever is open
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  const set = useCallback((change: Partial<Params>) => {
    setParams((was) => ({ ...was, ...change }));
    // a narrower list is a different list: page 7 of it probably isn't there
    setPage(1);
  }, []);

  const wanted = useMemo(() => (state ? state.split(",").filter(Boolean) : []), [state]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return teams.filter((t) => {
      if (wanted.length && !wanted.includes(t.state)) return false;
      if (seats === "complete" && t.members.length < 2) return false;
      if (seats === "waiting" && t.members.length >= 2) return false;
      if (!needle) return true;
      const hay = [t.code, t.name, t.note, ...t.members.flatMap((m) => [m.name, m.email, m.phone, m.collegeId, m.department])]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [teams, wanted, seats, q]);

  const groups = useMemo(() => {
    const newestFirst = (a: TeamRecord, b: TeamRecord) => b.createdAt.localeCompare(a.createdAt);
    const order = (a: TeamRecord, b: TeamRecord) => {
      if (sort === "year") {
        const [x, y] = [creatorOf(a)?.year ?? "9", creatorOf(b)?.year ?? "9"];
        return x === y ? newestFirst(a, b) : x.localeCompare(y);
      }
      if (sort === "dept") {
        const [x, y] = [deptOf(a), deptOf(b)];
        if (x === y) return newestFirst(a, b);
        if (x === NOBODY || y === NOBODY) return x === NOBODY ? 1 : -1;
        return x.localeCompare(y);
      }
      return newestFirst(a, b);
    };

    const sorted = [...shown].sort(order);
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
  }, [shown, sort, group]);

  const counts = useMemo(
    () => Object.fromEntries(STATES.map((s) => [s.value, teams.filter((t) => t.state === s.value).length])),
    [teams],
  ) as Record<string, number>;

  const grouped = group === "dept" || group === "year";
  const filtered = Boolean(q || wanted.length || seats !== "any");
  const opened = open ? teams.find((t) => t.code === open) : undefined;

  // gathered into departments or years, the groups are the way around it and
  // a page number on top of them only gets in the way
  const paged = !grouped && per > 0 && shown.length > per;
  const pages = paged ? Math.ceil(shown.length / per) : 1;
  const here = Math.min(page, pages);
  const from = (here - 1) * per;
  const onPage = paged ? [{ name: "", teams: groups[0].teams.slice(from, from + per) }] : groups;

  const fold = (isOpen: boolean) => {
    for (const box of document.querySelectorAll<HTMLDetailsElement>("details[data-group]")) box.open = isOpen;
  };

  const toggle = (value: string) =>
    set({ state: (wanted.includes(value) ? wanted.filter((s) => s !== value) : [...wanted, value]).join(",") });

  return (
    <>
      {/* what's shown */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => set({ state: "" })} aria-pressed={!wanted.length} className="toggle">
          Every team <span className="count">{teams.length}</span>
        </button>
        {STATES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => toggle(s.value)}
            title={s.hint}
            aria-pressed={wanted.includes(s.value)}
            className="toggle"
          >
            {s.label} <span className="count">{counts[s.value]}</span>
          </button>
        ))}
        {filtered ? (
          <button type="button" onClick={() => set({ q: "", state: "", seats: "any" })} className="btn btn-plain text-[0.8rem]">
            Clear
          </button>
        ) : null}
      </div>

      {/* how it's shown */}
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,0.7fr))_auto]">
        <label className="col-span-3 block lg:col-span-1">
          <span className="eyebrow mb-1.5 block text-[0.64rem]">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => set({ q: e.target.value })}
            size={1}
            placeholder="name, email, number, code, note…"
            className="field"
          />
        </label>

        {[
          { label: "Seats", name: "seats" as const, options: SEATS_SHOWN },
          { label: "Order by", name: "sort" as const, options: SORTS },
          { label: "Group by", name: "group" as const, options: GROUPS },
        ].map((control) => (
          <label key={control.name} className="block">
            <span className="eyebrow mb-1.5 block text-[0.64rem]">{control.label}</span>
            <select value={params[control.name]} onChange={(e) => set({ [control.name]: e.target.value })} className="field">
              {control.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="col-span-3 flex items-end gap-2 pb-0.5 lg:col-span-1">
          {grouped ? (
            <>
              <button type="button" onClick={() => fold(true)} className="btn btn-plain text-[0.8rem]">
                Expand all
              </button>
              <button type="button" onClick={() => fold(false)} className="btn btn-plain text-[0.8rem]">
                Collapse all
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <p className="faint text-[0.78rem]">
          {shown.length === teams.length ? `${teams.length} teams` : `${shown.length} of ${teams.length} teams`}
        </p>
        {/* whatever is on screen, as a spreadsheet: the export page starts
            from this same view rather than from everything */}
        <a
          href={`/admin/export${queryFor(params) ? `?${queryFor(params)}` : ""}`}
          className="faint text-[0.78rem] underline underline-offset-2 hover:text-[var(--ink)]"
        >
          Export {shown.length === teams.length ? "these" : `these ${shown.length}`} →
        </a>
      </div>

      <form action={setStateManyAction} className="card mt-2 overflow-hidden">
        {shown.length ? (
          <div className="row-head">
            <span />
            <span className="eyebrow text-[0.64rem]">Team</span>
            <span className="eyebrow text-[0.64rem]">Review</span>
            <span className="eyebrow hidden text-[0.64rem] lg:block">Seats</span>
            <button
              type="button"
              onClick={() => set({ sort: sort === "dept" ? "new" : "dept" })}
              className={`eyebrow hidden cursor-pointer text-left text-[0.64rem] lg:block ${sort === "dept" ? "text-[var(--accent-deep)]" : ""}`}
            >
              Dept {sort === "dept" ? "↓" : ""}
            </button>
            <button
              type="button"
              onClick={() => set({ sort: sort === "year" ? "new" : "year" })}
              className={`eyebrow hidden cursor-pointer text-left text-[0.64rem] lg:block ${sort === "year" ? "text-[var(--accent-deep)]" : ""}`}
            >
              Year {sort === "year" ? "↓" : ""}
            </button>
            <button
              type="button"
              onClick={() => set({ sort: "new" })}
              className={`eyebrow hidden cursor-pointer text-left text-[0.64rem] lg:block ${sort === "new" ? "text-[var(--accent-deep)]" : ""}`}
            >
              Registered {sort === "new" ? "↓" : ""}
            </button>
          </div>
        ) : null}

        {onPage.map(({ name, teams: list }) =>
          name ? (
            <details key={name} data-group open className="group/fold">
              <summary className="flex cursor-pointer items-center gap-3 border-b border-[var(--line)] bg-[var(--sunk)] px-5 py-2.5 text-[0.82rem]">
                <span aria-hidden="true" className="transition-transform duration-200 group-open/fold:rotate-90">
                  ›
                </span>
                <span className="font-medium">{name}</span>
                <span className="faint">{list.length}</span>
              </summary>
              {list.map((t) => (
                <Row key={t.code} team={t} open={open === t.code} onOpen={() => setOpen(t.code)} />
              ))}
            </details>
          ) : (
            <div key="all">
              {list.map((t) => (
                <Row key={t.code} team={t} open={open === t.code} onOpen={() => setOpen(t.code)} />
              ))}
            </div>
          ),
        )}

        {/* which of them you're looking at — only once there are enough of
            them for that to be a question */}
        {!grouped && (paged || shown.length > 25) ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--line)] px-4 py-2.5">
            <p className="faint text-[0.78rem]">
              {paged ? `${from + 1}–${Math.min(from + per, shown.length)} of ${shown.length}` : `All ${shown.length}`}
            </p>

            {paged ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(here - 1)}
                  disabled={here === 1}
                  className="btn btn-plain text-[0.8rem]"
                >
                  ← Back
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1)
                  // the first, the last, and a couple either side of here
                  .filter((n) => n === 1 || n === pages || Math.abs(n - here) <= 1)
                  .map((n, i, kept) => (
                    <span key={n} className="flex items-center gap-1.5">
                      {i && n - kept[i - 1] > 1 ? <span className="faint text-[0.78rem]">…</span> : null}
                      <button
                        type="button"
                        onClick={() => setPage(n)}
                        aria-current={n === here}
                        className={`btn text-[0.8rem] ${n === here ? "btn-go" : "btn-plain"}`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  onClick={() => setPage(here + 1)}
                  disabled={here === pages}
                  className="btn btn-plain text-[0.8rem]"
                >
                  Next →
                </button>
              </div>
            ) : null}

            <label className="faint ml-auto flex items-center gap-2 text-[0.78rem]">
              Per page
              <select
                value={per}
                onChange={(e) => {
                  setPer(Number(e.target.value));
                  setPage(1);
                }}
                className="field w-auto py-1 text-[0.8rem]"
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value={0}>All</option>
              </select>
            </label>
          </div>
        ) : null}

        {shown.length ? (
          <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-[var(--line)] bg-[var(--sunk)] px-4 py-3">
            <span className="eyebrow mr-1">With the ticked</span>
            {STATES.map((s) => (
              <button key={s.value} type="submit" name="state" value={s.value} title={s.hint} className="btn text-[0.8rem]">
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="muted px-5 py-16 text-center text-[0.9rem]">
            {teams.length ? "Nothing matches that." : "Nobody yet. The first team will land here."}
          </p>
        )}
      </form>

      {/* one team, beside the list */}
      {opened ? (
        <>
          <div className="scrim" onClick={() => setOpen(null)} aria-hidden="true" />
          <aside className="drawer" role="dialog" aria-label={`${opened.name}, team ${showCode(opened.code)}`}>
            <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] bg-[var(--paper)] px-5 py-4">
              <TeamHeading team={opened} />
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button type="button" onClick={() => setOpen(null)} className="btn btn-plain" autoFocus aria-label="Close">
                  Close ✕
                </button>
                <a href={`/admin/team/${opened.code}`} className="faint text-[0.76rem] underline underline-offset-2">
                  Full page
                </a>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--paper)]">
              {said ? (
                <div className="px-5">
                  <Said said={said} />
                </div>
              ) : null}
              <TeamDetail team={opened} origin={origin} seat={seat} from="list" />
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
