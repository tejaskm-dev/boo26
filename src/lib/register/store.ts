import "server-only";
import { connection } from "next/server";
import { newCode } from "./code";
import { del, patch, read, run, usingDatabase, write } from "./db";
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
 * The sign-up asks three things of this file; the dashboard asks the rest.
 * Nothing that calls either knows which of the two stores is answering.
 */

export const TEAM_SIZE = 2;

/** The seats, in order, whether or not anyone is in them. */
export const SEATS = [1, 2] as const;

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
 * Where a team is in the review
 *
 * One word per team, moved by hand from the dashboard. Every team starts at
 * 'new'; the rest are the core team's decisions, and nothing in the sign-up
 * reads them.
 * ------------------------------------------------------------------ */

export const STATES = [
  { value: "new", label: "New", hint: "Registered. Nobody has looked yet." },
  { value: "verified", label: "Verified", hint: "Details check out: real students, reachable." },
  { value: "shortlisted", label: "Shortlisted", hint: "They're in." },
  { value: "waitlisted", label: "Waitlisted", hint: "In if a place opens up." },
  { value: "rejected", label: "Rejected", hint: "Not taking part." },
] as const;

export type TeamState = (typeof STATES)[number]["value"];

export const isState = (v: string): v is TeamState => STATES.some((s) => s.value === v);

export const stateLabel = (v: string): string => STATES.find((s) => s.value === v)?.label ?? v;

/* ------------------------------------------------------------------ *
 * The database (db/schema.sql)
 * ------------------------------------------------------------------ */

type Row = { code: string; name: string; reaction: string; members: { name: string; seat: number }[] };
type Answer = { ok: true; code?: string } | { ok: false; clashes?: string[]; reason?: "missing" | "full" };

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

type Seated = Member & { seat: number; joinedAt: string };
type Team = {
  code: string;
  name: string;
  reaction: string;
  state: TeamState;
  note: string;
  createdAt: string;
  members: Seated[];
};
type Teams = Map<string, Team>;
const shared = globalThis as typeof globalThis & { __booTeams?: Teams };
// on globalThis, so a hot reload in development doesn't empty it
const kept: Teams = (shared.__booTeams ??= new Map());

/**
 * One person, one team: the same email, number or college ID can't be
 * registered twice. Every one that's taken comes back at once, so nobody fixes
 * one just to be told about the next. The database does this in SQL.
 *
 * `except` is whoever is being edited — their own details aren't a clash with
 * themselves.
 */
function keptClashes(m: Member, except?: { code: string; seat: number }): string[] {
  const everyone = [...kept.values()]
    .flatMap((t) => t.members.map((x) => ({ ...x, code: t.code })))
    .filter((x) => !(except && x.code === except.code && x.seat === except.seat));
  const taken: string[] = [];
  if (everyone.some((x) => x.email.toLowerCase() === m.email.toLowerCase())) taken.push("email");
  if (everyone.some((x) => x.phone === m.phone)) taken.push("phone");
  if (everyone.some((x) => x.collegeId.toUpperCase() === m.collegeId.toUpperCase())) taken.push("college_id");
  return taken;
}

/** The seat nobody is in, or nothing if the team is full. */
const freeSeatIn = (members: { seat: number }[]) => SEATS.find((s) => !members.some((m) => m.seat === s));

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
    members: [...team.members].sort((a, b) => a.seat - b.seat).map((m) => firstName(m.name)),
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
      if (answer.ok) return { ok: true, code: answer.code as string };
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
  const now = new Date().toISOString();
  kept.set(code, {
    code,
    name: details.name,
    reaction: details.reaction,
    state: "new",
    note: "",
    createdAt: now,
    members: [{ ...captain, seat: 1, joinedAt: now }],
  });
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
  const seat = freeSeatIn(team.members);
  if (!seat) return { ok: false, reason: "full" };
  const taken = keptClashes(member);
  if (taken.length) return { ok: false, clashes: clashesFrom(taken) };
  team.members.push({ ...member, seat, joinedAt: new Date().toISOString() });
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * What the core team works with (src/app/(admin))
 *
 * Everything above hands out first names only, because anyone with a code can
 * ask. These are for the dashboard, behind the sign-in: whole records, the
 * review, and the corrections a night like this needs to be able to make.
 * ------------------------------------------------------------------ */

export type MemberRecord = Member & { seat: number; joinedAt: string };

export type TeamRecord = {
  code: string;
  name: string;
  reaction: string;
  state: TeamState;
  note: string;
  createdAt: string;
  members: MemberRecord[];
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

type TeamRow = {
  code: string;
  name: string;
  reaction: string;
  state: string;
  note: string | null;
  created_at: string;
  members: MemberRow[];
};

const TEAM_COLUMNS =
  "code,name,reaction,state,note,created_at,members(seat,name,email,phone,college_id,department,year,created_at)";

const asMemberRecord = (m: MemberRow): MemberRecord => ({
  seat: m.seat,
  name: m.name,
  email: m.email,
  phone: m.phone,
  collegeId: m.college_id,
  department: m.department,
  year: m.year as Member["year"],
  joinedAt: m.created_at,
});

const asTeamRecord = (t: TeamRow): TeamRecord => ({
  code: t.code,
  name: t.name,
  reaction: t.reaction,
  state: isState(t.state) ? t.state : "new",
  note: t.note ?? "",
  createdAt: t.created_at,
  members: [...t.members].sort((a, b) => a.seat - b.seat).map(asMemberRecord),
});

const asRecord = (t: Team): TeamRecord => ({
  code: t.code,
  name: t.name,
  reaction: t.reaction,
  state: t.state,
  note: t.note,
  createdAt: t.createdAt,
  members: [...t.members].sort((a, b) => a.seat - b.seat),
});

/** Every team, newest first, with both people in full. */
export async function listTeams(): Promise<TeamRecord[]> {
  await connection();

  if (usingDatabase) {
    const rows = await read<TeamRow[]>(`teams?select=${TEAM_COLUMNS}&order=created_at.desc`);
    return rows.map(asTeamRecord);
  }

  return [...kept.values()].reverse().map(asRecord);
}

/** One team, in full. */
export async function getTeamRecord(code: string): Promise<TeamRecord | null> {
  await connection();

  if (usingDatabase) {
    const rows = await read<TeamRow[]>(`teams?code=eq.${encodeURIComponent(code)}&select=${TEAM_COLUMNS}&limit=1`);
    return rows[0] ? asTeamRecord(rows[0]) : null;
  }

  const team = kept.get(code);
  return team ? asRecord(team) : null;
}

/** Moves a team along the review. */
export async function setState(code: string, state: TeamState): Promise<void> {
  if (usingDatabase) {
    await patch(`teams?code=eq.${encodeURIComponent(code)}`, { state });
    return;
  }
  const team = kept.get(code);
  if (team) team.state = state;
}

/** The same, to everything that was ticked. */
export async function setStateMany(codes: string[], state: TeamState): Promise<number> {
  const wanted = codes.filter(Boolean);
  if (!wanted.length) return 0;

  if (usingDatabase) {
    const list = wanted.map((c) => `"${encodeURIComponent(c)}"`).join(",");
    await patch(`teams?code=in.(${list})`, { state });
    return wanted.length;
  }

  let touched = 0;
  for (const code of wanted) {
    const team = kept.get(code);
    if (team) {
      team.state = state;
      touched++;
    }
  }
  return touched;
}

/** The note beside a team: whatever the core team needs to remember about it. */
export async function setNote(code: string, note: string): Promise<void> {
  if (usingDatabase) {
    await patch(`teams?code=eq.${encodeURIComponent(code)}`, { note });
    return;
  }
  const team = kept.get(code);
  if (team) team.note = note;
}

/** A team renamed, or its answer changed. One team per name still holds. */
export async function renameTeam(
  code: string,
  name: string,
  reaction: string,
): Promise<{ ok: true } | { ok: false; clashes: Clash[] }> {
  if (usingDatabase) {
    const answer = await run<Answer>("rename_team", { p_code: code, p_name: name, p_reaction: reaction });
    return answer.ok ? { ok: true } : { ok: false, clashes: clashesFrom(answer.clashes ?? []) };
  }

  const team = kept.get(code);
  if (!team) return { ok: false, clashes: [] };
  const wanted = name.trim().toLowerCase();
  if ([...kept.values()].some((t) => t.code !== code && t.name.trim().toLowerCase() === wanted)) {
    return { ok: false, clashes: clashesFrom(["team_name"]) };
  }
  team.name = name.trim();
  team.reaction = reaction;
  return { ok: true };
}

/** Somebody's details corrected. Their own details aren't a clash with themselves. */
export async function editMember(
  code: string,
  seat: number,
  member: Member,
): Promise<{ ok: true } | { ok: false; clashes: Clash[] }> {
  if (usingDatabase) {
    const answer = await run<Answer>("edit_member", { p_code: code, p_seat: seat, p_member: asRow(member) });
    return answer.ok ? { ok: true } : { ok: false, clashes: clashesFrom(answer.clashes ?? []) };
  }

  const team = kept.get(code);
  const at = team ? team.members.findIndex((m) => m.seat === seat) : -1;
  if (!team || at < 0) return { ok: false, clashes: [] };
  const taken = keptClashes(member, { code, seat });
  if (taken.length) return { ok: false, clashes: clashesFrom(taken) };
  team.members[at] = { ...member, seat, joinedAt: team.members[at].joinedAt };
  return { ok: true };
}

/** Takes one person off a team. The seat they leave can be filled again. */
export async function removeMember(code: string, seat: number): Promise<void> {
  if (usingDatabase) {
    await del(`members?team_code=eq.${encodeURIComponent(code)}&seat=eq.${seat}`);
    return;
  }
  const team = kept.get(code);
  if (team) team.members = team.members.filter((m) => m.seat !== seat);
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
    return read<AdminAction[]>(`admin_log?select=at,who,did,about&order=at.desc&limit=${limit}`);
  }
  return loggedHere.slice(0, limit);
}

/** Everything that has been done to one team. */
export async function teamHistory(code: string, limit = 20): Promise<AdminAction[]> {
  await connection();
  if (usingDatabase) {
    return read<AdminAction[]>(
      `admin_log?about=eq.${encodeURIComponent(code)}&select=at,who,did,about&order=at.desc&limit=${limit}`,
    );
  }
  return loggedHere.filter((e) => e.about === code).slice(0, limit);
}
