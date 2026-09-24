import { currentAdmin } from "@/lib/admin/session";
import { cleanId, looksLikeId } from "@/lib/register/fields";
import { whoHasId } from "@/lib/register/store";

/**
 * Who holds a college ID, for the dashboard's own forms. Behind the sign-in,
 * so it can say the name and the team — everything it answers with is already
 * on the page the admin is looking at. The public check (/api/registered)
 * says only yes or no, and that's why the two are separate.
 *
 * `code` and `seat` are whoever is being edited: their own ID isn't a clash
 * with themselves.
 */
export async function GET(request: Request) {
  if (!(await currentAdmin())) return new Response("Not signed in", { status: 401 });

  const asked = new URL(request.url).searchParams;
  const id = cleanId(asked.get("id") ?? "");
  const no = Response.json({ taken: false }, { headers: { "Cache-Control": "no-store" } });
  if (!looksLikeId(id)) return no;

  const holder = await whoHasId(id);
  if (!holder) return no;
  if (holder.code === asked.get("code") && String(holder.seat) === asked.get("seat")) return no;

  return Response.json(
    { taken: true, name: holder.name, team: holder.team, code: holder.code },
    { headers: { "Cache-Control": "no-store" } },
  );
}
