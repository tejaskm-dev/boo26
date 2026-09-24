import Link from "next/link";
import SignIn from "@/components/admin/SignIn";
import TeamPage from "@/components/admin/TeamPage";
import Trouble from "@/components/admin/Trouble";
import { currentAdmin, missingSetup } from "@/lib/admin/session";
import { codeFromPath } from "@/lib/register/code";
import { getTeamRecord, teamHistory } from "@/lib/register/store";
import { origin } from "@/lib/origin";

/**
 * One team, with every control on it. Behind the same sign-in as the list —
 * a page under /admin is not a page anyone else can open by knowing a code.
 */

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ code: raw }, query] = await Promise.all([params, searchParams]);
  const who = await currentAdmin();
  if (!who) return <SignIn missing={missingSetup()} />;

  const code = codeFromPath(raw);

  // together, not one after the other: two round trips to the database is
  // two round trips of waiting before anything is on the screen
  const [asked, history, where] = await Promise.all([
    getTeamRecord(code).then(
      (team) => ({ team }),
      (trouble: unknown) => ({ trouble }),
    ),
    teamHistory(code).catch(() => null),
    origin(),
  ]);

  if (!("team" in asked)) {
    const trouble = asked.trouble;
    return <Trouble message={trouble instanceof Error ? trouble.message : String(trouble)} />;
  }
  const team = asked.team;

  if (!team) {
    return (
      <main className="grid min-h-svh place-items-center px-[clamp(1rem,4vw,2rem)] py-16">
        <div className="card w-full max-w-[32rem] px-7 py-8">
          <p className="eyebrow">BOO! 2026</p>
          <h1 className="figure mt-3 text-[clamp(1.7rem,4vw,2.3rem)]">No team by that code</h1>
          <p className="muted mt-3 text-[0.9rem] leading-[1.6]">
            It may have been removed, or the code may be a letter out.
          </p>
          <Link
            href="/admin"
            className="btn btn-go mt-6"
          >
            ← All teams
          </Link>
        </div>
      </main>
    );
  }

  const seat = Number(one(query.seat));

  return (
    <TeamPage
      who={who}
      team={team}
      history={history}
      origin={where}
      said={one(query.said) || undefined}
      seat={seat === 1 || seat === 2 ? seat : undefined}
    />
  );
}
