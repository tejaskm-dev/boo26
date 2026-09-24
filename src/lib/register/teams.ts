import type { Member } from "./fields";

/**
 * What a team is, in the words both sides use.
 *
 * The store itself is server-only — it holds the key to the database — but
 * the dashboard's list runs in the browser, so the vocabulary it needs lives
 * here instead: the seats, the review, and the shape of a record. No imports
 * beyond the field types, and nothing that touches a network.
 */

export const TEAM_SIZE = 2;

/** The seats, in order, whether or not anyone is in them. */
export const SEATS = [1, 2] as const;

/**
 * Where a team is in the review. One word per team, moved by hand from the
 * dashboard; every team starts at 'new' and the sign-up never reads any of it.
 */
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

/** Whoever started it: the earliest to join, whatever seat they ended up in. */
export const creatorOf = (t: TeamRecord): MemberRecord | undefined =>
  [...t.members].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
