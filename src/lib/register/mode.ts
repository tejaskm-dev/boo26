/**
 * The switch for /register: the sign-up, or the coming-soon page.
 *
 *   BOO_REGISTRATION_OPEN=true    the whole flow — the fork, the rules, the
 *                                 judging, starting and joining a team
 *   BOO_REGISTRATION_OPEN=false   the coming-soon page on every /register path
 *
 * Unset, it's open. Set it to false to put the coming-soon page back without
 * touching any code — in .env.local here, or in the host's environment
 * variables for a deploy. The value is read where the pages are built, so a
 * change to it needs a new build (on Vercel, a redeploy).
 */
export function registrationOpen(): boolean {
  const set = process.env.BOO_REGISTRATION_OPEN?.trim().toLowerCase();
  if (set === "false" || set === "0" || set === "off" || set === "no") return false;
  return true;
}
