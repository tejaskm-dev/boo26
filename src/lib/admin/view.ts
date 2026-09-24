/**
 * How the dashboard's list is being looked at — which teams, in what order,
 * gathered how — kept in the address so a view worth returning to is a link.
 *
 * Plain module, no "use client" and nothing server-only, because both halves
 * need it: the list (server) builds the links, and the controls (client) push
 * the same addresses when something changes.
 */

export type Params = { q: string; state: string; seats: string; sort: string; group: string };

export const SORTS = [
  { value: "new", label: "Newest first" },
  { value: "year", label: "Year, 1st to 4th" },
  { value: "dept", label: "Department, A to Z" },
];

export const GROUPS = [
  { value: "none", label: "Nothing" },
  { value: "dept", label: "Department" },
  { value: "year", label: "Year" },
];

export const SEATS_SHOWN = [
  { value: "any", label: "Either way" },
  { value: "complete", label: "Complete" },
  { value: "waiting", label: "Waiting" },
];

/** The address for these settings, leaving out everything left at its default. */
export function addressFor(params: Params): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.state) query.set("state", params.state);
  if (params.seats !== "any") query.set("seats", params.seats);
  if (params.sort !== "new") query.set("sort", params.sort);
  if (params.group !== "none") query.set("group", params.group);
  const asked = query.toString();
  return asked ? `/admin?${asked}` : "/admin";
}
