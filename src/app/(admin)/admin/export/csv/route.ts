import { currentAdmin } from "@/lib/admin/session";
import { optionsFrom, toCsv } from "@/lib/admin/csv";
import { pick } from "@/lib/admin/view";
import { isState, listTeams } from "@/lib/register/store";
import { origin } from "@/lib/origin";

/**
 * The file itself. Everything about it — the columns, the shape of a row, how
 * a date and a number are written, the separator — comes in the query, which
 * is what the page at /admin/export builds while you watch the preview
 * change. The same builder makes both, so what downloads is what was shown.
 */
export async function GET(request: Request) {
  if (!(await currentAdmin())) return new Response("Not signed in", { status: 401 });

  const query = new URL(request.url).searchParams;
  const options = optionsFrom(query);

  let teams;
  try {
    teams = await listTeams();
  } catch (trouble) {
    return new Response(`Couldn't read the registrations: ${trouble instanceof Error ? trouble.message : trouble}`, {
      status: 503,
    });
  }

  const seats = query.get("seats") ?? "any";
  const sort = query.get("sort") ?? "new";
  const state = (query.get("state") ?? "").split(",").filter(isState).join(",");
  const params = {
    q: query.get("q") ?? "",
    state,
    seats: seats === "complete" || seats === "waiting" ? seats : "any",
    sort: sort === "year" || sort === "dept" ? sort : "new",
    group: "none",
  };

  // "everything" means everything; otherwise it's the view that asked for it
  const wanted = query.get("all") === "1" ? teams : pick(teams, params);
  const file = toCsv(wanted, options, await origin());

  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const named = state ? state.split(",").join("-") : query.get("all") === "1" ? "all" : "registrations";
  const extension = options.sep === "\t" ? "tsv" : "csv";

  return new Response(file, {
    headers: {
      "Content-Type": `text/${extension === "tsv" ? "tab-separated-values" : "csv"}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="boo-2026-${named}-${day}.${extension}"`,
      "Cache-Control": "no-store",
    },
  });
}
