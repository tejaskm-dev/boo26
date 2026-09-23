import Dashboard from "@/components/admin/Dashboard";
import SignIn from "@/components/admin/SignIn";
import Trouble from "@/components/admin/Trouble";
import { currentAdmin, missingSetup } from "@/lib/admin/session";
import { listTeams, recentAdminActions, teamsAreTemporary } from "@/lib/register/store";
import { origin } from "@/lib/origin";

/**
 * The core team's view of registration. Nothing links here from the site, and
 * it's never indexed; the cookie that keeps a session is scoped to /admin, so
 * a request for any public page doesn't even carry it.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const who = await currentAdmin();
  if (!who) return <SignIn missing={missingSetup()} trouble={typeof query.trouble === "string" ? query.trouble : undefined} />;

  const where = await origin();
  const state = query.state === "complete" || query.state === "waiting" ? query.state : "all";

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
      q={typeof query.q === "string" ? query.q : ""}
      state={state}
      origin={where}
      temporary={teamsAreTemporary()}
    />
  );
}
