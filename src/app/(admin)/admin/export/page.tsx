import ExportSetup from "@/components/admin/ExportSetup";
import Shell from "@/components/admin/Shell";
import SignIn from "@/components/admin/SignIn";
import Trouble from "@/components/admin/Trouble";
import { currentAdmin, missingSetup } from "@/lib/admin/session";
import { isState, listTeams } from "@/lib/register/store";
import { origin } from "@/lib/origin";

/**
 * Deciding what the spreadsheet should be, with the first few rows of it on
 * screen while you decide. Nothing here is saved: the choices live in the
 * address, so a particular export is a link somebody can be sent.
 */

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function ExportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const who = await currentAdmin();
  if (!who) return <SignIn missing={missingSetup()} />;

  const [asked, where] = await Promise.all([
    listTeams().then(
      (rows) => ({ rows }),
      (trouble: unknown) => ({ trouble }),
    ),
    origin(),
  ]);

  if (!("rows" in asked)) {
    const trouble = asked.trouble;
    return <Trouble message={trouble instanceof Error ? trouble.message : String(trouble)} />;
  }

  const seats = one(query.seats);
  const sort = one(query.sort);
  const params = {
    q: one(query.q),
    state: one(query.state).split(",").filter(isState).join(","),
    seats: seats === "complete" || seats === "waiting" ? seats : "any",
    sort: sort === "year" || sort === "dept" ? sort : "new",
    group: "none",
  };

  return (
    <Shell who={who} back>
      <ExportSetup teams={asked.rows} params={params} origin={where} />
    </Shell>
  );
}
