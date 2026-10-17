/**
 * Registering happens somewhere else: an outside page (a form, an event
 * platform), not this site. REGISTER_URL is its address.
 *
 *   REGISTER_URL=https://…   every /register address redirects there
 *   unset                    /register is the "isn't open yet" page
 *
 * Every Register button on the site points at /register rather than at the
 * outside page itself, so the address on a poster stays boo26.live/register
 * whatever the outside page turns out to be, and changing it is one variable.
 * The redirect is in next.config.ts, and only while the full site is live:
 * the teaser doesn't send anyone to a sign-up.
 *
 * Read where the site is built, like LIVE_STATUS, so a change takes a new
 * build (on Vercel, a redeploy). No path aliases in here: next.config.ts
 * imports it.
 */
export function parseRegisterUrl(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function registerUrl(): string | null {
  return parseRegisterUrl(process.env.REGISTER_URL);
}

/**
 * The same address, safe to hand Next as a redirect's destination. Next reads
 * a destination's path as a pattern, where ":word" is a parameter and ( ) { }
 * * + are syntax: a link with any of them in its path would fail every
 * request to /register. Percent-encoded, they're plain characters again.
 */
export function redirectTarget(url: string): string {
  const u = new URL(url);
  const path = u.pathname.replace(/[:(){}*+]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `${u.origin}${path}${u.search}${u.hash}`;
}
