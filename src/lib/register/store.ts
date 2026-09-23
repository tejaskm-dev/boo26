import "server-only";
import { connection } from "next/server";
import { newCode } from "./code";
import { del, read, run, usingDatabase, write } from "./db";
import { firstName, type Member, type TeamDetails } from "./fields";

/**
 * Where teams are kept.
 *
 * With SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set, that's the database in
 * db/schema.sql, which is what a deployment needs: a host runs the site on
 * more than one machine, and each has its own memory, so a team made on one
 * request is a stranger to the next.
 *
 * Without them — a laptop with no credentials — teams are kept in this
 * server's memory instead, so the whole flow still runs. They go when it
 * restarts, and the pages say so (teamsAreTemporary).
 *
 * Three functions are the whole contract either way, and nothing that calls
 * them knows which of the two is answering.
 */

export const TEAM_SIZE = 2;

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

/** the database and the memory both answer with these names */
const CLASH: Record<string, Clash> = {
  team_name: { on: "team", field: "name", message: "That name's taken. Try another." },
  email: { on: "member", field: "email", message: "This email is already registered." },
  phone: { on: "member", field: "phone", message: "This number is already registered." },
  college_id: { on: "member", field: "collegeId", message: "This college ID is already registered." },
};

const clashesFrom = (taken: string[]): Clash[] => taken.map((t) => CLASH[t]).filter(Boolean);

/** Whether a team made now might not be there later: no database, only memory. */
export function teamsAreTemporary(): boolean {
  return !usingDatabase;
}

/* ------------------------------------------------------------------ *
 * The database (db/schema.sql)
 * ------------------------------------------------------------------ */

type Row = { code: string; name: string; reaction: string; members: { name: string; seat: number }[] };
type Answer = { ok: true; code: string } | { ok: false; clashes?: string[]; reason?: "missing" | "full" };

/** what the sign-up asks for, under the names the database gives the columns */
const asRow = (m: Member) => ({
  name: m.name,
  email: m.email,
  phone: m.phone,
  college_id: m.collegeId,
  department: m.department,
  year: m.year,
});

/* ------------------------------------------------------------------ *
 * The memory, for a laptop without credentials
 * ------------------------------------------------------------------ */

type Team = { code: string; name: string; reaction: string; members: Member[] };
type Teams = Map<string, Team>;
const shared = globalThis as typeof globalThis & { __booTeams?: Teams };
// on globalThis, so a hot reload in development doesn't empty it
const kept: Teams = (shared.__booTeams ??= new Map());

/**
 * One person, one team: the same email, number or college ID can't be
 * registered twice. Every one that's taken comes back at once, so nobody fixes
 * one just to be told about the next. The database does this in SQL.
 */
function keptClashes(m: Member): string[] {
  const everyone = [...kept.values()].flatMap((t) => t.members);
  const taken: string[] = [];
  if (everyone.some((x) => x.email === m.email)) taken.push("email");
  if (everyone.some((x) => x.phone === m.phone)) taken.push("phone");
  if (everyone.some((x) => x.collegeId === m.collegeId)) taken.push("college_id");
  return taken;
}

/* ------------------------------------------------------------------ *
 * The three things the sign-up asks
 * ------------------------------------------------------------------ */

export async function getTeam(code: string): Promise<TeamView | null> {
  // read per request: never prerendered, never cached
  await connection();

  if (usingDatabase) {
    const rows = await read<Row[]>(
      `teams?code=eq.${encodeURIComponent(code)}&select=code,name,reaction,members(name,seat)&members.order=seat.asc&limit=1`,
    );
    const row = rows[0];
    if (!row) return null;
    const members = [...row.members].sort((a, b) => a.seat - b.seat);
    return {
      code: row.code,
      name: row.name,
      reaction: row.reaction,
      members: members.map((m) => firstName(m.name)),
      full: members.length >= TEAM_SIZE,
    };
  }

  const team = kept.get(code);
  if (!team) return null;
  return {
    code: team.code,
    name: team.name,
    reaction: team.reaction,
    members: team.members.map((m) => firstName(m.name)),
    full: team.members.length >= TEAM_SIZE,
  };
}

/** Starts a team with its captain. Both arrive already checked and cleaned. */
export async function addTeam(
  details: TeamDetails,
  captain: Member,
): Promise<{ ok: true; code: string } | { ok: false; clashes: Clash[] }> {
  if (usingDatabase) {
    // 'retry' means the code, or the same details a moment earlier, collided
    for (let tries = 0; tries < 4; tries++) {
      const answer = await run<Answer>("register_team", {
        p_code: newCode(),
        p_name: details.name,
        p_reaction: details.reaction,
        p_member: asRow(captain),
      });
      if (answer.ok) return { ok: true, code: answer.code };
      const taken = answer.clashes ?? [];
      if (!taken.includes("retry")) return { ok: false, clashes: clashesFrom(taken) };
    }
    throw new Error("register_team kept colliding");
  }

  const taken = keptClashes(captain);
  const name = details.name.toLowerCase();
  if ([...kept.values()].some((t) => t.name.toLowerCase() === name)) taken.unshift("team_name");
  if (taken.length) return { ok: false, clashes: clashesFrom(taken) };

  let code = newCode();
  while (kept.has(code)) code = newCode();
  kept.set(code, { code, name: details.name, reaction: details.reaction, members: [captain] });
  return { ok: true, code };
}

/** Puts the second person on a team, if there's still room. */
export async function addMember(
  code: string,
  member: Member,
): Promise<{ ok: true } | { ok: false; reason: "missing" | "full" } | { ok: false; clashes: Clash[] }> {
  if (usingDatabase) {
    const answer = await run<Answer>("join_team", { p_code: code, p_member: asRow(member) });
    if (answer.ok) return { ok: true };
    if (answer.reason) return { ok: false, reason: answer.reason };
    return { ok: false, clashes: clashesFrom(answer.clashes ?? []) };
  }

  const team = kept.get(code);
  if (!team) return { ok: false, reason: "missing" };
  if (team.members.length >= TEAM_SIZE) return { ok: false, reason: "full" };
  const taken = keptClashes(member);
  if (taken.length) return { ok: false, clashes: clashesFrom(taken) };
  team.members.push(member);
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * What the core team sees (src/app/(admin))
 *
 * Everything above hands out first names only, because anyone with a code can
 * ask. These are for the dashboard, behind the sign-in: whole records, and
 * the two fixes an event needs on the night.
 * ------------------------------------------------------------------ */

export type TeamRecord = {
  code: string;
  name: string;
  reaction: string;
  createdAt: string;
  members: (Member & { seat: number; joinedAt: string })[];
};

export type AdminAction = { at: string; who: string; did: string; about: string };

type MemberRow = {
  seat: number;
  name: string;
  email: string;
  phone: string;
  college_id: string;
  department: string;
  year: string;
  created_at: string;
};

const asMemberRecord = (m: MemberRow) => ({
  seat: m.seat,
  name: m.name,
  email: m.email,
  phone: m.phone,
  collegeId: m.college_id,
  department: m.department,
  year: m.year as Member["year"],
  joinedAt: m.created_at,
});

/** Every team, newest first, with both people in full. */
export async function listTeams(): Promise<TeamRecord[]> {
  await connection();

  if (usingDatabase) {
    const rows = await read<
      { code: string; name: string; reaction: string; created_at: string; members: MemberRow[] }[]
    >(
      "teams?select=code,name,reaction,created_at,members(seat,name,email,phone,college_id,department,year,created_at)&order=created_at.desc",
    );
    return rows.map((t) => ({
      code: t.code,
      name: t.name,
      reaction: t.reaction,
      createdAt: t.created_at,
      members: [...t.members].sort((a, b) => a.seat - b.seat).map(asMemberRecord),
    }));
  }

  return [...kept.values()].reverse().map((t) => ({
    code: t.code,
    name: t.name,
    reaction: t.reaction,
    createdAt: new Date().toISOString(),
    members: t.members.map((m, i) => ({ ...m, seat: i + 1, joinedAt: new Date().toISOString() })),
  }));
}

/** Takes a team off the list — a duplicate, a test, a pair who dropped out. */
export async function removeTeam(code: string): Promise<void> {
  if (usingDatabase) {
    // the members go with it: the foreign key cascades
    await del(`teams?code=eq.${encodeURIComponent(code)}`);
    return;
  }
  kept.delete(code);
}

/** Empties the second seat, so someone else can take the invite. */
export async function freeSeat(code: string): Promise<void> {
  if (usingDatabase) {
    await del(`members?team_code=eq.${encodeURIComponent(code)}&seat=eq.2`);
    return;
  }
  const team = kept.get(code);
  if (team) team.members = team.members.slice(0, 1);
}

type Log = AdminAction[];
const loggedHere = ((globalThis as typeof globalThis & { __booAdminLog?: Log }).__booAdminLog ??= []);

/**
 * Writes down who changed what. The change itself has already happened by the
 * time this runs, so a log that won't write is reported to the server's own
 * logs and otherwise let go: losing the note is better than leaving the admin
 * with an error page after a fix that worked.
 */
export async function logAdmin(who: string, did: string, about: string): Promise<void> {
  const at = new Date().toISOString();
  if (usingDatabase) {
    try {
      await write("admin_log", { who, did, about });
    } catch (trouble) {
      console.error("admin_log", trouble);
    }
    return;
  }
  loggedHere.unshift({ at, who, did, about });
}

export async function recentAdminActions(limit = 20): Promise<AdminAction[]> {
  await connection();
  if (usingDatabase) {
    const rows = await read<{ at: string; who: string; did: string; about: string }[]>(
      `admin_log?select=at,who,did,about&order=at.desc&limit=${limit}`,
    );
    return rows;
  }
  return loggedHere.slice(0, limit);
}
