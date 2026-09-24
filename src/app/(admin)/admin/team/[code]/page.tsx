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
  const where = await origin();

  let team;
  try {
    team = await getTeamRecord(code);
  } catch (trouble) {
    return <Trouble message={trouble instanceof Error ? trouble.message : String(trouble)} />;
  }

  if (!team) {
    return (
      <main className="grid min-h-svh place-items-center px-[var(--edge)] py-16">
        <div className="w-full max-w-[32rem]">
          <p className="label label-loose text-bone/40">BOO! 2026</p>
          <h1 className="display mt-4 text-[clamp(1.8rem,4vw,2.6rem)] leading-[0.95]">No team by that code</h1>
          <p className="body-copy mt-4 text-[0.95rem] text-bone/60">
            It may have been removed, or the code may be a letter out.
          </p>
          <Link
            href="/admin"
            className="label mt-8 inline-block text-[0.7rem] text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime"
          >
            ← All teams
          </Link>
        </div>
      </main>
    );
  }

  const history = await teamHistory(code).catch(() => null);
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
