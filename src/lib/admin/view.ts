/**
 * How the dashboard's list is being looked at — which teams, in what order,
 * gathered how — kept in the address so a view worth returning to is a link.
 *
 * Plain module, no "use client" and nothing server-only, because both halves
 * need it: the list (server) builds the links, and the controls (client) push
 * the same addresses when something changes.
 */

import { creatorOf, type TeamRecord } from "@/lib/register/teams";
import { YEARS } from "@/lib/register/fields";

export type Params = { q: string; state: string; seats: string; sort: string; group: string };

export const NOBODY = "No one yet";

export const deptOf = (t: TeamRecord) => creatorOf(t)?.department.toUpperCase() || NOBODY;

export const yearOf = (t: TeamRecord) => {
  const y = creatorOf(t)?.year;
  return y ? (YEARS.find((it) => it.value === y)?.label ?? y) : NOBODY;
};

/**
 * Which teams a view is showing, and in what order — the list asks this, and
 * so does the export, which is how "export what I'm looking at" stays true
 * rather than being a second set of rules that drifts from the first.
 */
export function pick(teams: TeamRecord[], params: Params): TeamRecord[] {
  const wanted = params.state ? params.state.split(",").filter(Boolean) : [];
  const needle = params.q.trim().toLowerCase();

  const shown = teams.filter((t) => {
    if (wanted.length && !wanted.includes(t.state)) return false;
    if (params.seats === "complete" && t.members.length < 2) return false;
    if (params.seats === "waiting" && t.members.length >= 2) return false;
    if (!needle) return true;
    const hay = [t.code, t.name, t.note, ...t.members.flatMap((m) => [m.name, m.email, m.phone, m.collegeId, m.department])]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });

  const newestFirst = (a: TeamRecord, b: TeamRecord) => b.createdAt.localeCompare(a.createdAt);

  return shown.sort((a, b) => {
    if (params.sort === "year") {
      const [x, y] = [creatorOf(a)?.year ?? "9", creatorOf(b)?.year ?? "9"];
      return x === y ? newestFirst(a, b) : x.localeCompare(y);
    }
    if (params.sort === "dept") {
      const [x, y] = [deptOf(a), deptOf(b)];
      if (x === y) return newestFirst(a, b);
      if (x === NOBODY || y === NOBODY) return x === NOBODY ? 1 : -1;
      return x.localeCompare(y);
    }
    return newestFirst(a, b);
  });
}

/** The teams gathered under whatever they're grouped by, in the group's own order. */
export function gather(teams: TeamRecord[], group: string): { name: string; teams: TeamRecord[] }[] {
  if (group !== "dept" && group !== "year") return [{ name: "", teams }];

  const gathered = new Map<string, TeamRecord[]>();
  for (const team of teams) {
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
}

/** Everything a view is set to, as a query — for a link to the same view elsewhere. */
export function queryFor(params: Params): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.state) query.set("state", params.state);
  if (params.seats !== "any") query.set("seats", params.seats);
  if (params.sort !== "new") query.set("sort", params.sort);
  if (params.group !== "none") query.set("group", params.group);
  return query.toString();
}

// short enough to read in a select on a phone
export const SORTS = [
  { value: "new", label: "Newest" },
  { value: "year", label: "Year 1→4" },
  { value: "dept", label: "Dept A→Z" },
];

export const GROUPS = [
  { value: "none", label: "None" },
  { value: "dept", label: "Department" },
  { value: "year", label: "Year" },
];

export const SEATS_SHOWN = [
  { value: "any", label: "Any" },
  { value: "complete", label: "Complete" },
  { value: "waiting", label: "Waiting" },
];

/** The address for these settings, leaving out everything left at its default. */
export function addressFor(params: Params): string {
  const asked = queryFor(params);
  return asked ? `/admin?${asked}` : "/admin";
}
