import Shell from "./Shell";
import TeamDetail, { TeamHeading } from "./TeamDetail";
import { Said } from "./bits";
import type { AdminAction, TeamRecord } from "@/lib/register/teams";

/**
 * A team on its own page — the address the list's drawer shows, and what
 * anybody gets who opens a team in a new tab, follows a link, or has no
 * JavaScript. Same controls, more room.
 */
export default function TeamPage({
  who,
  team,
  history,
  origin,
  said,
  seat,
}: {
  who: string;
  team: TeamRecord;
  history: AdminAction[] | null;
  origin: string;
  said?: string;
  seat?: number;
}) {
  return (
    <Shell who={who} back>
      <div className="mx-auto max-w-[52rem]">
        <TeamHeading team={team} />
        <Said said={said} />
        <div className="card mt-6">
          <TeamDetail team={team} origin={origin} history={history} seat={seat} full from="page" />
        </div>
      </div>
    </Shell>
  );
}
