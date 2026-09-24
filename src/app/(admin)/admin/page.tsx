import Dashboard from "@/components/admin/Dashboard";
import SignIn from "@/components/admin/SignIn";
import Trouble from "@/components/admin/Trouble";
import { currentAdmin, missingSetup } from "@/lib/admin/session";
import { isState, listTeams, recentAdminActions, teamsAreTemporary } from "@/lib/register/store";

/**
 * The core team's view of registration. Nothing links here from the site, and
 * it's never indexed; the cookie that keeps a session is scoped to /admin, so
 * a request for any public page doesn't even carry it.
 */

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const who = await currentAdmin();
  if (!who) return <SignIn missing={missingSetup()} trouble={one(query.trouble) || undefined} />;

  const seats = one(query.seats);
  const sort = one(query.sort);
  const group = one(query.group);
  const params = {
    q: one(query.q),
    // several at once: the chips are toggles, not one choice
    state: one(query.state).split(",").filter(isState).join(","),
    seats: seats === "complete" || seats === "waiting" ? seats : "any",
    sort: sort === "year" || sort === "dept" ? sort : "new",
    group: group === "dept" || group === "year" ? group : "none",
  };

  // The teams are the page. If they can't be read, say so in words an event
  // manager can act on rather than letting the whole thing fall over.
  let teams;
  try {
    teams = await listTeams();
  } catch (trouble) {
    return <Trouble message={trouble instanceof Error ? trouble.message : String(trouble)} />;
  }

  // The log is a nicety by comparison: if it's the only thing that won't read
  // — an older database without its table — the dashboard still works.
  const log = await recentAdminActions(15).catch(() => null);

  return (
    <Dashboard
      who={who}
      teams={teams}
      log={log}
      params={params}
      said={one(query.said) || undefined}
      temporary={teamsAreTemporary()}
    />
  );
}
