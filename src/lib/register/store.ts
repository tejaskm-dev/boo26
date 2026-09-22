import "server-only";
import { connection } from "next/server";
import { newCode } from "./code";
import { firstName, type Member, type TeamDetails } from "./fields";

/**
 * Where teams are kept.
 *
 * For now that's the server's memory: enough to run the whole flow in the
 * preview (see mode.ts), and gone when the server restarts. Going live means
 * swapping the bodies of these three functions for a real database — their
 * signatures are the whole contract, and nothing that calls them changes.
 */

export const TEAM_SIZE = 2;

type Team = {
  code: string;
  name: string;
  reaction: string;
  /** the captain first */
  members: Member[];
  createdAt: number;
};

/**
 * What a page may show about a team. Anyone holding the code can see it, so
 * it carries first names only — nothing anyone could be contacted through.
 */
export type TeamView = {
  code: string;
  name: string;
  reaction: string;
  members: string[];
  full: boolean;
};

/** Something that has to be unique already is. `on` says which form it belongs to. */
export type Clash =
  | { on: "team"; field: keyof TeamDetails; message: string }
  | { on: "member"; field: keyof Member; message: string };

type Teams = Map<string, Team>;
const shared = globalThis as typeof globalThis & { __booTeams?: Teams };
// on globalThis, so a hot reload in development doesn't empty it
const teams: Teams = (shared.__booTeams ??= new Map());

function view(t: Team): TeamView {
  return {
    code: t.code,
    name: t.name,
    reaction: t.reaction,
    members: t.members.map((m) => firstName(m.name)),
    full: t.members.length >= TEAM_SIZE,
  };
}

/**
 * One person, one team: the same email, number or college ID can't be
 * registered twice. Every one that's taken comes back at once, so nobody fixes
 * one just to be told about the next — and none of them says which team has it.
 */
function clashes(m: Member): Clash[] {
  const everyone = [...teams.values()].flatMap((t) => t.members);
  const taken = (field: "email" | "phone" | "collegeId") => everyone.some((x) => x[field] === m[field]);
  const found: Clash[] = [];
  if (taken("email")) found.push({ on: "member", field: "email", message: "This email is already registered." });
  if (taken("phone")) found.push({ on: "member", field: "phone", message: "This number is already registered." });
  if (taken("collegeId")) found.push({ on: "member", field: "collegeId", message: "This college ID is already registered." });
  return found;
}

export async function getTeam(code: string): Promise<TeamView | null> {
  // read per request: never prerendered, never cached
  await connection();
  const t = teams.get(code);
  return t ? view(t) : null;
}

/** Starts a team with its captain. Both arrive already checked and cleaned. */
export async function addTeam(
  details: TeamDetails,
  captain: Member,
): Promise<{ ok: true; code: string } | { ok: false; clashes: Clash[] }> {
  const found = clashes(captain);
  const name = details.name.toLowerCase();
  if ([...teams.values()].some((t) => t.name.toLowerCase() === name)) {
    found.unshift({ on: "team", field: "name", message: "That name's taken. Try another." });
  }
  if (found.length) return { ok: false, clashes: found };

  let code = newCode();
  while (teams.has(code)) code = newCode();
  teams.set(code, { code, name: details.name, reaction: details.reaction, members: [captain], createdAt: Date.now() });
  return { ok: true, code };
}

/** Puts the second person on a team, if there's still room. */
export async function addMember(
  code: string,
  member: Member,
): Promise<{ ok: true } | { ok: false; reason: "missing" | "full" } | { ok: false; clashes: Clash[] }> {
  const t = teams.get(code);
  if (!t) return { ok: false, reason: "missing" };
  if (t.members.length >= TEAM_SIZE) return { ok: false, reason: "full" };
  const found = clashes(member);
  if (found.length) return { ok: false, clashes: found };
  t.members.push(member);
  return { ok: true };
}
