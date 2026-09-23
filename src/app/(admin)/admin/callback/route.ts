import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STATE_COOKIE, emailFromCode } from "@/lib/admin/google";
import { isAdmin, startSession } from "@/lib/admin/session";
import { origin } from "@/lib/origin";

/**
 * Back from Google. The state has to match the one that went out, the code
 * has to buy a verified email, and that email has to be on the list — any of
 * the three failing lands back on the sign-in with nothing granted.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete({ name: STATE_COOKIE, path: "/admin" });

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !expected || state !== expected) redirect("/admin?trouble=state");

  const email = await emailFromCode(code, `${await origin()}/admin/callback`);
  if (!email) redirect("/admin?trouble=google");
  if (!isAdmin(email)) redirect("/admin?trouble=denied");

  await startSession(email);
  redirect("/admin");
}
