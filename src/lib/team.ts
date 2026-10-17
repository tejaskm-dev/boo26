/**
 * Which team section the full site shows, from TEAM_SECTION. Read where the
 * site is built, like LIVE_STATUS, so a change takes a new build (on Vercel,
 * a redeploy) — and only ever on the server: the pages work it out and hand
 * the result down.
 *
 *   TEAM_SECTION=0   no team section, and nothing on the site points to one
 *   TEAM_SECTION=1   the core team (also what unset, or anything else, means)
 *   TEAM_SECTION=2   the core team, then the crew (CREW in site.ts) — until
 *                    the crew's in there, the same as 1, so turning it on
 *                    early never shows an empty section
 */
export type TeamMode = 0 | 1 | 2;

export function parseTeamMode(value: string | undefined): TeamMode {
  const v = value?.trim();
  return v === "0" ? 0 : v === "2" ? 2 : 1;
}

export function teamMode(): TeamMode {
  return parseTeamMode(process.env.TEAM_SECTION);
}
