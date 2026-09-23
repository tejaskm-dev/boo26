import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STATE_COOKIE, newState, signInUrl } from "@/lib/admin/google";
import { missingSetup } from "@/lib/admin/session";
import { origin } from "@/lib/origin";

/** Off to Google, with a one-time state kept here to recognise the way back. */
export async function GET() {
  if (missingSetup().length) redirect("/admin");
  const state = newState();
  (await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 600,
  });
  redirect(signInUrl(`${await origin()}/admin/callback`, state));
}
