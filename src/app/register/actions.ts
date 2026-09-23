"use server";

import { REACTIONS } from "@/lib/register/content";
import { cleanCode, isCode } from "@/lib/register/code";
import { registrationMode } from "@/lib/register/mode";
import { addMember, addTeam, type Clash } from "@/lib/register/store";
import {
  asMember,
  asTeam,
  checkMember,
  checkTeam,
  cleanMember,
  cleanTeam,
  hasErrors,
  type Errors,
  type Member,
  type TeamDetails,
} from "@/lib/register/fields";

/**
 * The two things registration writes: a new team with its captain, and the
 * teammate joining it.
 *
 * These are public endpoints — anything can POST to them, with anything in
 * the body — so each one rebuilds its input field by field, checks it with the
 * same rules the form uses, and only then touches the store.
 */

export type Sent =
  | { ok: true; code: string }
  | {
      ok: false;
      message: string;
      /** per-field messages, to put back beside the field they belong to */
      team?: Errors<TeamDetails>;
      member?: Errors<Member>;
      /** the team itself is the problem: filled up meanwhile, or never there */
      gone?: "full" | "missing";
    };

const closed: Sent = { ok: false, message: "Registration isn't open yet." };
const unagreed: Sent = { ok: false, message: "Tick the box to say you've read the rules." };

const read = (input: unknown) => (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

/** what's already taken, each message put back beside its own field */
function taken(clashes: Clash[]): Sent {
  const team: Errors<TeamDetails> = {};
  const member: Errors<Member> = {};
  for (const c of clashes) {
    if (c.on === "team") team[c.field] = c.message;
    else member[c.field] = c.message;
  }
  const message = clashes.length > 1 ? "A few of these are already registered." : clashes[0].message;
  return { ok: false, message, team, member };
}

export async function createTeam(input: unknown): Promise<Sent> {
  if (registrationMode() === "soon") return closed;
  const body = read(input);
  const team = asTeam(body.team);
  const member = asMember(body.member);

  const teamErrors = checkTeam(team, REACTIONS);
  const memberErrors = checkMember(member);
  if (hasErrors(teamErrors) || hasErrors(memberErrors)) {
    return { ok: false, message: "A couple of things need fixing.", team: teamErrors, member: memberErrors };
  }
  if (body.agreed !== true) return unagreed;

  const made = await addTeam(cleanTeam(team), cleanMember(member));
  return made.ok ? { ok: true, code: made.code } : taken(made.clashes);
}

export async function joinTeam(input: unknown): Promise<Sent> {
  if (registrationMode() === "soon") return closed;
  const body = read(input);
  const code = typeof body.code === "string" ? cleanCode(body.code) : "";
  if (!isCode(code)) return { ok: false, message: "That team code doesn't look right." };
  const member = asMember(body.member);

  const memberErrors = checkMember(member);
  if (hasErrors(memberErrors)) return { ok: false, message: "A couple of things need fixing.", member: memberErrors };
  if (body.agreed !== true) return unagreed;

  const joined = await addMember(code, cleanMember(member));
  if (!joined.ok) {
    if ("clashes" in joined) return taken(joined.clashes);
    return {
      ok: false,
      message: joined.reason === "full" ? "Someone got there first: this team is full." : "There's no team with that code.",
      gone: joined.reason,
    };
  }
  return { ok: true, code };
}
