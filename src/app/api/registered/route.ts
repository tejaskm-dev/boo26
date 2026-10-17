import { idIsTaken } from "@/lib/register/store";
import { cleanId, looksLikeId } from "@/lib/register/fields";
import { registrationOpen } from "@/lib/register/mode";

/**
 * Is this college ID already registered? Yes or no, and nothing else.
 *
 * The form asks while somebody is still typing, so they find out before they
 * fill in the rest. It answers no more than the sign-up itself would on being
 * sent — never a name, never a team, never how many — because anyone at all
 * can ask this, and college IDs run in sequence.
 */
export async function GET(request: Request) {
  // the sign-up it answers for is closed (src/lib/register/mode.ts)
  if (!registrationOpen()) return new Response(null, { status: 404 });
  const asked = cleanId(new URL(request.url).searchParams.get("id") ?? "");
  if (!looksLikeId(asked)) return Response.json({ taken: false }, { headers: { "Cache-Control": "no-store" } });

  return Response.json({ taken: await idIsTaken(asked) }, { headers: { "Cache-Control": "no-store" } });
}
