import { redirect } from "next/navigation";
import Closed from "@/components/register/Closed";
import JoinDoor from "@/components/register/JoinDoor";
import JoinTeam from "@/components/register/JoinTeam";
import RegisterHeader from "@/components/register/RegisterHeader";
import { codeFromPath, isCode, joinPath, showCode, teamPath } from "@/lib/register/code";
import { registrationOpen, TEAMS_ARE_TEMPORARY } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { getTeam } from "@/lib/register/store";
import { EVENT } from "@/lib/site";

export const metadata = registerMeta({
  title: `Join a team — ${EVENT.name} ${EVENT.year}`,
  description: `You've been invited to a team for ${EVENT.name} ${EVENT.year}.`,
  // an invite is for one person, not for search results
  robots: { index: false, follow: false },
});

/**
 * Where the link and the QR land. The code in the address picks the team;
 * a code typed by hand in any case or with its dash is tidied into the one
 * address first.
 */
export default async function JoinCodePage({ params }: { params: Promise<{ code: string }> }) {
  if (!registrationOpen()) return <Closed />;

  const { code: raw } = await params;
  const code = codeFromPath(raw);
  if (isCode(code) && code !== raw) redirect(joinPath(code));

  const team = isCode(code) ? await getTeam(code) : null;

  return (
    <>
      <RegisterHeader back={{ href: "/register", label: "Register" }} />
      <main className="relative overflow-x-clip">
        {!isCode(code) ? (
          <JoinDoor title={"Not quite\na code."} note={"Six letters and\nnumbers. Try again?"} cat="cat-confused" />
        ) : !team ? (
          <JoinDoor title={"No team\nhere."} note={"Check the code\nwith your teammate."} cat="cat-confused">
            <Problem>
              Nothing answers to <span className="text-bone">{showCode(code)}</span>. Check it with your teammate: codes
              never use 0, O, 1, I or L.
            </Problem>
          </JoinDoor>
        ) : team.full ? (
          <JoinDoor title={"Team's\nfull."} note={`${team.name} already\nhas two.`} cat="cat-scared">
            <Problem>
              <span className="text-bone">{team.name}</span> has both its people. If that&rsquo;s your team, you&rsquo;re in:{" "}
              <a href={teamPath(code)} className="text-bone underline decoration-bone/35 underline-offset-[0.22em] hover:decoration-lime">
                see the team
              </a>
              . If not, check the code, or start a team of your own.
            </Problem>
          </JoinDoor>
        ) : (
          <JoinTeam team={team} preview={TEAMS_ARE_TEMPORARY} />
        )}
      </main>
    </>
  );
}

function Problem({ children }: { children: React.ReactNode }) {
  return (
    <p className="body-copy flex max-w-[34rem] gap-[0.9rem] text-[clamp(0.98rem,1.15vw,1.08rem)] text-bone/75">
      <span aria-hidden="true" className="mt-[0.55em] h-[0.42rem] w-[0.42rem] shrink-0 rotate-45 bg-lime" />
      <span>{children}</span>
    </p>
  );
}
