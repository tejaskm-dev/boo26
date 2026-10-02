/**
 * The switch between the full site and the coming-soon teaser.
 *
 *   LIVE_STATUS=true    the full site: the night, the schedule, the dates
 *   LIVE_STATUS=false   the teaser, and nothing that would date it
 *
 * Unset means the teaser. That way round on purpose: the organisers asked for
 * no dates or timings anywhere until it's announced, and a variable someone
 * forgot to set should never be the thing that publishes them.
 *
 * It's read where the pages are built, like BOO_REGISTRATION_OPEN, so flipping
 * it takes a new build (on Vercel, a redeploy). In exchange it costs nothing
 * when someone visits: no middleware, no check per request, nothing sent to
 * the browser. Both versions are plain static pages. next.config.ts reads the
 * same variable to decide which one "/" serves.
 */
export function siteLive(): boolean {
  return parseLive(process.env.LIVE_STATUS);
}

export function parseLive(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "on" || v === "yes";
}
