import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/admin/session";

/**
 * The dashboard's preview of the full site (/admin/preview), checked before
 * it's rendered at all.
 *
 * Each preview page checks the session itself too (src/lib/admin/preview.ts),
 * but a page that finds no admin can only answer with a redirect *after*
 * the route has started — and Next still lists that route's scripts in the
 * redirect it sends, which for the preview are the full site's, dates and
 * all. Turned away here, nobody signed out gets as far as the route.
 *
 * Only these addresses run through it (the matcher): the site itself, and
 * the rest of /admin, never do.
 */
export async function proxy(request: NextRequest) {
  if (await readSession(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin", request.url));
}

export const config = {
  matcher: "/admin/preview/:path*",
};
