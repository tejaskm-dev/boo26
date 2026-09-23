import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Closed from "@/components/register/Closed";
import JoinDoor from "@/components/register/JoinDoor";
import RegisterHeader from "@/components/register/RegisterHeader";
import TeamRoom from "@/components/register/TeamRoom";
import { codeFromPath, isCode, joinPath, teamPath } from "@/lib/register/code";
import { registrationOpen } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { getTeam, teamsAreTemporary } from "@/lib/register/store";
import { EVENT } from "@/lib/site";

export const metadata = registerMeta({
  title: `Your team — ${EVENT.name} ${EVENT.year}`,
  description: `A team for ${EVENT.name} ${EVENT.year}.`,
  robots: { index: false, follow: false },
});

/**
 * The team's page: where the captain lands after starting it, and the
 * teammate after joining. The invite link it hands out is built from the
 * address this page was asked for, so it's right on the live site, on a
 * preview deploy, and on a laptop's own address for a phone on the same Wi-Fi.
 */
export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!registrationOpen()) return <Closed />;

  const { code: raw } = await params;
  const code = codeFromPath(raw);
  if (isCode(code) && code !== raw) redirect(teamPath(code));

  const team = isCode(code) ? await getTeam(code) : null;
  if (!team) {
    return (
      <>
        <RegisterHeader back={{ href: "/register", label: "Register" }} />
        <main className="relative overflow-x-clip">
          <JoinDoor title={"No team\nhere."} note={"Check the code\nwith your teammate."} cat="cat-confused" />
        </main>
      </>
    );
  }

  const h = await headers();
  const host = h.get("x-forwarded-host")?.split(",")[0].trim() || h.get("host") || "localhost:3000";
  const local = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() || (local ? "http" : "https");
  const q = await searchParams;

  return (
    <>
      <RegisterHeader back={{ href: "/register", label: "Register" }} />
      <main className="relative overflow-x-clip">
        <TeamRoom
          team={team}
          link={`${proto}://${host}${joinPath(code)}`}
          arrived={q.new === "1" ? "new" : q.joined === "1" ? "joined" : null}
          preview={teamsAreTemporary()}
        />
      </main>
    </>
  );
}
