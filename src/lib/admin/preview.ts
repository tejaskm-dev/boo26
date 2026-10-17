import "server-only";
import { redirect } from "next/navigation";
import { currentAdmin } from "./session";

/**
 * The preview of the full site (/admin/preview) is for the core team only:
 * anyone else is sent to the sign-in. Every preview page asks for itself,
 * not just the layout — a layout isn't re-run when the router fetches one
 * page from inside another, so a check there alone could be stepped around.
 *
 * It lives under /admin so the session cookie, scoped to /admin, comes with
 * the request; the rest of the site never sees that cookie at all.
 */
export async function adminOnly(): Promise<string> {
  const who = await currentAdmin();
  if (!who) redirect("/admin");
  return who;
}
