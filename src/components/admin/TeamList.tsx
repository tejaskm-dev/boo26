"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Chip, Seats } from "./bits";
import { setStateManyAction } from "@/lib/admin/actions";
import { addressFor, GROUPS, SEATS_SHOWN, SORTS, type Params } from "@/lib/admin/view";
import { showCode } from "@/lib/register/code";
import { YEARS } from "@/lib/register/fields";
import { creatorOf, STATES, type TeamRecord } from "@/lib/register/teams";

/**
 * The teams, and everything about how they're shown.
 *
 * All of it happens here, in the browser. The page hands over every team once
 * and searching, filtering, ordering and grouping are done on what's already
 * in hand — so a toggle is instant instead of a trip to the server and back to
 * the database, which is what made this feel like wading.
 *
 * The address is kept in step all the same, with replaceState rather than a
 * navigation: a view worth coming back to is still a link, and nothing is
 * fetched to produce one. Going back a page reads it the other way.
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

const NOBODY = "Nobody on it yet";

const deptOf = (t: TeamRecord) => creatorOf(t)?.department.toUpperCase() || NOBODY;
const yearOf = (t: TeamRecord) => {
  const y = creatorOf(t)?.year;
  return y ? year(y) : NOBODY;
};

/**
 * The shape every row and the header above them are laid out on: two cells on
 * a phone — a tick and the team — and nine once there's room for the columns,
 * which is what makes a table read as a table rather than as stacked cards.
 */
const COLUMNS =
  "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 lg:grid-cols-[1.75rem_6.5rem_minmax(0,1fr)_7rem_3.5rem_5rem_4rem_8rem_3.5rem]";

const field =
  "body-copy mt-1.5 w-full border border-bone/15 bg-ink px-3 py-2 text-[0.9rem] text-bone outline-none transition-colors [color-scheme:dark] focus:border-lime";

function Row({ team }: { team: TeamRecord }) {
  const to = `/admin/team/${team.code}`;
  const started = creatorOf(team);

  return (
    <div className={`${COLUMNS} group border-b border-bone/[0.07] px-4 py-3 transition-colors hover:bg-bone/[0.03]`}>
      <label className="cursor-pointer p-1" title={`Tick ${team.name}`}>
        <input
          type="checkbox"
          name="codes"
          value={team.code}
          className="h-3.5 w-3.5 cursor-pointer appearance-none border border-bone/25 transition-colors checked:border-lime checked:bg-lime"
        />
      </label>

      <Link
        href={to}
        className="display hidden text-[0.85rem] tracking-[0.06em] text-lime outline-none transition-opacity hover:opacity-75 focus-visible:underline lg:block"
      >
        {showCode(team.code)}
      </Link>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={to}
            className="display truncate text-[1.05rem] leading-none outline-none transition-colors hover:text-lime focus-visible:text-lime"
          >
            {team.name}
          </Link>
          <span className="display text-[0.72rem] tracking-[0.06em] text-lime/70 lg:hidden">{showCode(team.code)}</span>
          {/* on a phone the review and the seats travel with the name */}
          <span className="lg:hidden">
            <Chip state={team.state} />
          </span>
          <span className="lg:hidden">
            <Seats taken={team.members.map((m) => m.seat)} />
          </span>
          {team.note ? (
            <span className="label text-[0.6rem] text-bone/30" title={team.note}>
              Note
            </span>
          ) : null}
        </div>
        <p className="body-copy mt-1.5 truncate text-[0.82rem] text-bone/45">
          {team.members.length ? team.members.map((m) => m.name).join(" · ") : "Nobody on this team."}
        </p>
      </div>

      <div className="hidden lg:block">
        <Chip state={team.state} />
      </div>
      <div className="hidden lg:block">
        <Seats taken={team.members.map((m) => m.seat)} />
      </div>
      <p className="label hidden text-[0.62rem] text-bone/45 lg:block">{started ? deptOf(team) : "—"}</p>
      <p className="label hidden text-[0.62rem] text-bone/35 lg:block">{started ? yearOf(team) : "—"}</p>
      <p className="label hidden text-[0.6rem] leading-[1.5] text-bone/25 lg:block">{when(team.createdAt)}</p>

      <Link
        href={to}
        className="label hidden justify-self-end text-[0.6rem] text-bone/25 transition-all group-hover:translate-x-0.5 group-hover:text-lime lg:block"
        aria-label={`Open ${team.name}`}
      >
        Open →
      </Link>
    </div>
  );
}

export default function TeamList({ teams, initial }: { teams: TeamRecord[]; initial: Params }) {
  const [params, setParams] = useState<Params>(initial);
  const { q, state, seats, sort, group } = params;

  // the address follows the view without fetching anything for it
  useEffect(() => {
    const address = addressFor(params);
    if (address !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", address);
    }
  }, [params]);

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
    };
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const set = useCallback((change: Partial<Params>) => setParams((was) => ({ ...was, ...change })), []);

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
    () =>
      Object.fromEntries(STATES.map((s) => [s.value, teams.filter((t) => t.state === s.value).length])) as Record<
        string,
        number
      >,
    [teams],
  );

  const grouped = group === "dept" || group === "year";
  const filtered = Boolean(q || wanted.length || seats !== "any");

  const fold = (open: boolean) => {
    for (const box of document.querySelectorAll<HTMLDetailsElement>("details[data-group]")) box.open = open;
  };

  /** one part of the review shown or hidden, the rest left as it is */
  const toggle = (value: string) =>
    set({ state: (wanted.includes(value) ? wanted.filter((s) => s !== value) : [...wanted, value]).join(",") });

  const headings = (
    <div className={`${COLUMNS} border-b border-bone/10 bg-bone/[0.02] px-4 py-2.5`}>
      <span />
      <span className="label hidden text-[0.6rem] text-bone/30 lg:block">Code</span>
      <span className="label text-[0.6rem] text-bone/30">Team</span>
      <span className="label hidden text-[0.6rem] text-bone/30 lg:block">Review</span>
      <span className="label hidden text-[0.6rem] text-bone/30 lg:block">Seats</span>
      <button
        type="button"
        onClick={() => set({ sort: sort === "dept" ? "new" : "dept" })}
        className={`label hidden cursor-pointer text-left text-[0.6rem] transition-colors hover:text-lime lg:block ${
          sort === "dept" ? "text-lime" : "text-bone/30"
        }`}
      >
        Dept {sort === "dept" ? "↓" : ""}
      </button>
      <button
        type="button"
        onClick={() => set({ sort: sort === "year" ? "new" : "year" })}
        className={`label hidden cursor-pointer text-left text-[0.6rem] transition-colors hover:text-lime lg:block ${
          sort === "year" ? "text-lime" : "text-bone/30"
        }`}
      >
        Year {sort === "year" ? "↓" : ""}
      </button>
      <button
        type="button"
        onClick={() => set({ sort: "new" })}
        className={`label hidden cursor-pointer text-left text-[0.6rem] transition-colors hover:text-lime lg:block ${
          sort === "new" ? "text-lime" : "text-bone/30"
        }`}
      >
        Registered {sort === "new" ? "↓" : ""}
      </button>
      <span className="hidden lg:block" />
    </div>
  );

  return (
    <>
      {/* the review, as a row of switches */}
      <nav className="mt-[clamp(1.25rem,3.5vh,2rem)] flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => set({ state: "" })}
          className={`label cursor-pointer border px-3 py-2 text-[0.64rem] transition-colors ${
            wanted.length ? "border-bone/12 text-bone/40 hover:border-bone/35 hover:text-bone/75" : "border-bone/55 text-bone"
          }`}
        >
          Every team <span className="ml-1.5 text-bone/35">{teams.length}</span>
        </button>
        {STATES.map((s) => {
          const on = wanted.includes(s.value);
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => toggle(s.value)}
              title={s.hint}
              aria-pressed={on}
              className={`label cursor-pointer border px-3 py-2 text-[0.64rem] transition-colors ${
                on ? "border-lime bg-lime/10 text-lime" : "border-bone/12 text-bone/40 hover:border-bone/35 hover:text-bone/75"
              }`}
            >
              {s.label} <span className="ml-1.5 opacity-60">{counts[s.value]}</span>
            </button>
          );
        })}
        {filtered ? (
          <button
            type="button"
            onClick={() => set({ q: "", state: "", seats: "any" })}
            className="label ml-1 cursor-pointer py-2 text-[0.62rem] text-bone/30 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-lime"
          >
            Clear
          </button>
        ) : null}
        <span className="label ml-auto text-[0.62rem] text-bone/30">{`${shown.length} of ${teams.length}`}</span>
      </nav>

      {/* searching, ordering, gathering — each takes hold as it changes */}
      <div className="mt-3 grid gap-x-5 gap-y-3 border border-bone/10 bg-bone/[0.018] p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.75fr))_auto]">
        <label className="block">
          <span className="label block text-[0.62rem] text-bone/35">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => set({ q: e.target.value })}
            size={1}
            placeholder="name, email, number, code, note…"
            className="body-copy mt-1.5 w-full border border-bone/15 bg-ink px-3 py-2 text-[0.9rem] text-bone caret-lime outline-none transition-colors placeholder:text-bone/20 focus:border-lime"
          />
        </label>

        {[
          { label: "Seats", name: "seats" as const, options: SEATS_SHOWN },
          { label: "Order by", name: "sort" as const, options: SORTS },
          { label: "Group by", name: "group" as const, options: GROUPS },
        ].map((control) => (
          <label key={control.name} className="block">
            <span className="label block text-[0.62rem] text-bone/35">{control.label}</span>
            <select value={params[control.name]} onChange={(e) => set({ [control.name]: e.target.value })} className={field}>
              {control.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink text-bone">
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="flex items-end gap-4 self-end pb-2">
          {grouped ? (
            [
              { label: "Expand all", open: true },
              { label: "Collapse all", open: false },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => fold(b.open)}
                className="label cursor-pointer text-[0.62rem] text-bone/40 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime"
              >
                {b.label}
              </button>
            ))
          ) : (
            <span className="hidden lg:block" />
          )}
        </div>
      </div>

      <form action={setStateManyAction} className="mt-3 border border-bone/10 bg-bone/[0.018]">
        {shown.length ? headings : null}

        {groups.map(({ name, teams: list }) =>
          name ? (
            <details key={name} data-group open className="group/fold border-b border-bone/10 last:border-b-0">
              <summary className="label flex cursor-pointer items-center gap-3 bg-bone/[0.025] px-4 py-2.5 text-[0.66rem] text-bone/55 transition-colors hover:text-lime">
                <span aria-hidden="true" className="inline-block transition-transform duration-200 group-open/fold:rotate-90">
                  ›
                </span>
                {name}
                <span className="text-bone/30">{list.length}</span>
                <span aria-hidden="true" className="ml-2 h-px flex-1 bg-bone/10" />
              </summary>
              <div>
                {list.map((t) => (
                  <Row key={t.code} team={t} />
                ))}
              </div>
            </details>
          ) : (
            <div key="all">
              {list.map((t) => (
                <Row key={t.code} team={t} />
              ))}
            </div>
          ),
        )}

        {shown.length ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-bone/10 bg-ink/95 px-4 py-3 backdrop-blur sm:sticky sm:bottom-0">
            <span className="label text-[0.62rem] text-bone/35">With the ticked</span>
            {STATES.map((s) => (
              <button
                key={s.value}
                type="submit"
                name="state"
                value={s.value}
                title={s.hint}
                className="label cursor-pointer border border-bone/15 px-3 py-2 text-[0.64rem] text-bone/65 transition-colors hover:border-lime hover:text-lime"
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="hand py-16 text-center text-[1.4rem] text-bone/35">
            {teams.length ? "Nothing matches that." : "Nobody yet. The first team will land here."}
          </p>
        )}
      </form>
    </>
  );
}
