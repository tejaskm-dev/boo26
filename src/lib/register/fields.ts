/**
 * What registration asks for, and the checks on it. The same functions run in
 * the browser, to point at a mistake while it's still on screen, and in the
 * server action, which never trusts what the browser sent.
 *
 * Kept deliberately short: only what running the night needs. Adding a field
 * means adding it here, to the step that asks it (src/components/register),
 * and to /privacy, which lists what's collected.
 */

export const YEARS = [
  { value: "1", label: "1st" },
  { value: "2", label: "2nd" },
  { value: "3", label: "3rd" },
  { value: "4", label: "4th" },
] as const;

export type Year = (typeof YEARS)[number]["value"];

/** One person. The captain and the teammate each fill in one of these. */
export type Member = {
  name: string;
  email: string;
  /** ten digits, no country code */
  phone: string;
  department: string;
  year: Year | "";
  collegeId: string;
};

export type TeamDetails = {
  name: string;
  /** one of REACTIONS, or empty for "not sure yet" */
  reaction: string;
};

export type Errors<T> = Partial<Record<keyof T, string>>;

export const EMPTY_MEMBER: Member = {
  name: "",
  email: "",
  phone: "",
  department: "",
  year: "",
  collegeId: "",
};

export const EMPTY_TEAM: TeamDetails = { name: "", reaction: "" };

/** The fields each step asks, so an error found later can send the reader back to the right one. */
export const YOU_FIELDS = ["name", "email", "phone"] as const satisfies readonly (keyof Member)[];
export const CAMPUS_FIELDS = ["department", "year", "collegeId"] as const satisfies readonly (keyof Member)[];

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Indian mobile numbers, however they're typed: with +91 or 0 in front,
 * spaces, dashes. What's kept is the ten digits.
 */
export function cleanPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** The number field as it's typed: ten digits at most, read out in two fives. */
export function typePhone(input: string): string {
  const d = cleanPhone(input).slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

/** 9876543210 → +91 98765 43210 */
export function showPhone(phone: string): string {
  return phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
}

export function cleanMember(m: Member): Member {
  return {
    name: squash(m.name),
    email: m.email.trim().toLowerCase(),
    phone: cleanPhone(m.phone),
    department: squash(m.department),
    year: m.year,
    collegeId: squash(m.collegeId).toUpperCase(),
  };
}

export function cleanTeam(t: TeamDetails): TeamDetails {
  return { name: squash(t.name), reaction: t.reaction };
}

/** "Tejas K M" and "K M Tejas" both come out as "Tejas": the first word that isn't an initial. */
export function firstName(name: string): string {
  const words = squash(name).split(" ");
  return words.find((w) => w.replace(/\./g, "").length > 1) ?? words[0] ?? "";
}

export function checkYou(raw: Member): Errors<Member> {
  const m = cleanMember(raw);
  const e: Errors<Member> = {};
  if (!m.name) e.name = "Your name, please.";
  else if (m.name.length < 2) e.name = "That's a little short for a name.";
  else if (m.name.length > 60) e.name = "Keep it under 60 characters.";

  if (!m.email) e.email = "We need an email to reach you.";
  else if (m.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.email)) e.email = "That email doesn't look right.";

  if (!m.phone) e.phone = "A number we can reach you on, on the night.";
  else if (!/^[6-9]\d{9}$/.test(m.phone)) e.phone = "Ten digits, like 98765 43210.";
  return e;
}

export function checkCampus(raw: Member): Errors<Member> {
  const m = cleanMember(raw);
  const e: Errors<Member> = {};
  if (!m.department) e.department = "Which department are you in?";
  else if (m.department.length > 40) e.department = "Keep it under 40 characters.";

  if (!YEARS.some((y) => y.value === m.year)) e.year = "Pick your year.";

  if (!m.collegeId) e.collegeId = "It's on your college ID card.";
  else if (!/^[A-Z0-9][A-Z0-9/ .-]{2,23}$/.test(m.collegeId)) e.collegeId = "Letters and numbers, as printed on your card.";
  return e;
}

export function checkMember(m: Member): Errors<Member> {
  return { ...checkYou(m), ...checkCampus(m) };
}

export function checkTeam(raw: TeamDetails, reactions: readonly string[]): Errors<TeamDetails> {
  const t = cleanTeam(raw);
  const e: Errors<TeamDetails> = {};
  if (!t.name) e.name = "Your team needs a name.";
  else if (t.name.length < 2) e.name = "At least two characters.";
  else if (t.name.length > 32) e.name = "32 characters at most.";
  if (t.reaction && !reactions.includes(t.reaction)) e.reaction = "Pick one of these, or leave it.";
  return e;
}

/** a field's note is cleared by editing it, which leaves the key behind with nothing in it */
export const hasErrors = (e: object) => Object.values(e).some(Boolean);

/**
 * A request body, rebuilt field by field from whatever arrived. A server
 * action can be called with anything, so nothing in it is assumed to be the
 * right shape until it's been through here.
 */
export function asMember(input: unknown): Member {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const s = (k: keyof Member) => (typeof o[k] === "string" ? (o[k] as string).slice(0, 200) : "");
  return {
    name: s("name"),
    email: s("email"),
    phone: s("phone"),
    department: s("department"),
    year: s("year") as Member["year"],
    collegeId: s("collegeId"),
  };
}

export function asTeam(input: unknown): TeamDetails {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    name: typeof o.name === "string" ? o.name.slice(0, 200) : "",
    reaction: typeof o.reaction === "string" ? o.reaction.slice(0, 60) : "",
  };
}
