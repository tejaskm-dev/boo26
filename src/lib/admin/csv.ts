import { joinPath, showCode } from "@/lib/register/code";
import { showPhone, YEARS } from "@/lib/register/fields";
import { creatorOf, stateLabel, type MemberRecord, type TeamRecord } from "@/lib/register/teams";

/**
 * The export, decided rather than assumed.
 *
 * What a spreadsheet of a night like this should look like depends entirely on
 * what it's for — a WhatsApp broadcast wants numbers with no punctuation, a
 * mail merge wants one row per person, a printed list wants one row per team
 * with both names on it, and Excel in some places won't read a comma at all.
 * So none of that is baked in: every column, the shape of a row, the way a
 * date and a number are written and the separator between them are all
 * chosen, and the same code builds the preview on the page and the file that
 * downloads.
 */

export type Rows = "person" | "team";
export type Dates = "readable" | "date" | "iso";
export type Phones = "plain" | "country" | "pretty";
export type Heading = "human" | "machine" | "none";

export type ExportOptions = {
  rows: Rows;
  fields: string[];
  dates: Dates;
  phone: Phones;
  sep: string;
  heading: Heading;
  bom: boolean;
};

type Field = {
  key: string;
  of: "team" | "person";
  label: string;
  machine: string;
  hint?: string;
};

/** Everything that can be put in a column. */
export const FIELDS: Field[] = [
  { key: "code", of: "team", label: "Team code", machine: "team_code" },
  { key: "team", of: "team", label: "Team name", machine: "team_name" },
  { key: "state", of: "team", label: "Review", machine: "review" },
  { key: "note", of: "team", label: "Note", machine: "note" },
  { key: "reaction", of: "team", label: "Going for", machine: "going_for" },
  { key: "created", of: "team", label: "Registered", machine: "registered" },
  { key: "size", of: "team", label: "People on it", machine: "people" },
  { key: "complete", of: "team", label: "Complete", machine: "complete" },
  { key: "creatorDept", of: "team", label: "Department (whoever started it)", machine: "team_department" },
  { key: "creatorYear", of: "team", label: "Year (whoever started it)", machine: "team_year" },
  { key: "invite", of: "team", label: "Invite link", machine: "invite_link" },
  { key: "seat", of: "person", label: "Seat", machine: "seat" },
  { key: "name", of: "person", label: "Name", machine: "name" },
  { key: "email", of: "person", label: "Email", machine: "email" },
  { key: "phone", of: "person", label: "Phone", machine: "phone" },
  { key: "collegeId", of: "person", label: "College ID", machine: "college_id" },
  { key: "department", of: "person", label: "Department", machine: "department" },
  { key: "year", of: "person", label: "Year", machine: "year" },
  { key: "joined", of: "person", label: "Joined", machine: "joined" },
];

export const DEFAULT_FIELDS = [
  "code",
  "team",
  "state",
  "seat",
  "name",
  "email",
  "phone",
  "collegeId",
  "department",
  "year",
];

export const DEFAULTS: ExportOptions = {
  rows: "person",
  fields: DEFAULT_FIELDS,
  dates: "readable",
  phone: "country",
  sep: ",",
  heading: "human",
  bom: true,
};

const fieldsBy = new Map(FIELDS.map((f) => [f.key, f]));

const year = (v: string) => YEARS.find((y) => y.value === v)?.label ?? v;

const when = (iso: string, how: Dates) => {
  if (!iso) return "";
  if (how === "iso") return iso;
  const date = new Date(iso);
  if (how === "date") {
    // the day as the day is written here, which sorts as text the same way
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const number = (phone: string, how: Phones) =>
  how === "plain" ? phone : how === "country" ? `91${phone}` : showPhone(phone);

/** A note is one line by the time it's in a cell, whatever was typed into it. */
const flat = (text: string) => text.replace(/\s+/g, " ").trim();

function teamCell(key: string, team: TeamRecord, options: ExportOptions, origin: string): string {
  switch (key) {
    case "code":
      return showCode(team.code);
    case "team":
      return team.name;
    case "state":
      return stateLabel(team.state);
    case "note":
      return flat(team.note);
    case "reaction":
      return team.reaction;
    case "created":
      return when(team.createdAt, options.dates);
    case "size":
      return String(team.members.length);
    case "complete":
      return team.members.length >= 2 ? "yes" : "no";
    case "creatorDept":
      return creatorOf(team)?.department.toUpperCase() ?? "";
    case "creatorYear": {
      const y = creatorOf(team)?.year;
      return y ? year(y) : "";
    }
    case "invite":
      return team.members.length >= 2 ? "" : `${origin}${joinPath(team.code)}`;
    default:
      return "";
  }
}

function personCell(key: string, member: MemberRecord | undefined, options: ExportOptions): string {
  if (!member) return "";
  switch (key) {
    case "seat":
      return String(member.seat);
    case "name":
      return member.name;
    case "email":
      return member.email;
    case "phone":
      return number(member.phone, options.phone);
    case "collegeId":
      return member.collegeId;
    case "department":
      return member.department.toUpperCase();
    case "year":
      return year(member.year);
    case "joined":
      return when(member.joinedAt, options.dates);
    default:
      return "";
  }
}

/** The headings, in the order the columns will come. */
export function headings(options: ExportOptions): string[] {
  const chosen = options.fields.map((k) => fieldsBy.get(k)).filter(Boolean) as Field[];
  const name = (f: Field, suffix = "") =>
    options.heading === "machine" ? `${f.machine}${suffix ? `_${suffix}` : ""}` : `${f.label}${suffix ? ` ${suffix}` : ""}`;

  if (options.rows === "person") return chosen.map((f) => name(f));

  // one row per team: the team's columns once, then each person's twice over
  const team = chosen.filter((f) => f.of === "team").map((f) => name(f));
  const person = chosen.filter((f) => f.of === "person");
  return [...team, ...person.map((f) => name(f, "1")), ...person.map((f) => name(f, "2"))];
}

/** The rows themselves, in the order the list has them. */
export function rowsFor(teams: TeamRecord[], options: ExportOptions, origin: string): string[][] {
  const chosen = options.fields.map((k) => fieldsBy.get(k)).filter(Boolean) as Field[];

  if (options.rows === "person") {
    return teams.flatMap((team) => {
      // a team with nobody on it still says so, rather than vanishing
      const people: (MemberRecord | undefined)[] = team.members.length ? team.members : [undefined];
      return people.map((member) =>
        chosen.map((f) => (f.of === "team" ? teamCell(f.key, team, options, origin) : personCell(f.key, member, options))),
      );
    });
  }

  const teamFields = chosen.filter((f) => f.of === "team");
  const personFields = chosen.filter((f) => f.of === "person");
  return teams.map((team) => [
    ...teamFields.map((f) => teamCell(f.key, team, options, origin)),
    ...personFields.map((f) => personCell(f.key, team.members.find((m) => m.seat === 1), options)),
    ...personFields.map((f) => personCell(f.key, team.members.find((m) => m.seat === 2), options)),
  ]);
}

/**
 * One cell. Quoted when it has to be, and anything that opens like a formula
 * marked as text first — a team name is typed by a student, and a spreadsheet
 * will happily run `=1+1` as arithmetic. Numbers written for WhatsApp start
 * with a digit precisely so they don't need that mark.
 */
function cell(value: string, sep: string): string {
  const risky = /^[=@\t\r]/.test(value) || (/^[+-]/.test(value) && !/^\+?\d[\d ]*$/.test(value));
  const text = risky ? `'${value}` : value;
  return /["\n\r]/.test(text) || text.includes(sep) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The file, as a string. */
export function toCsv(teams: TeamRecord[], options: ExportOptions, origin: string): string {
  const lines: string[][] = [];
  if (options.heading !== "none") lines.push(headings(options));
  lines.push(...rowsFor(teams, options, origin));

  const body = lines.map((line) => line.map((v) => cell(v, options.sep)).join(options.sep)).join("\r\n");
  return options.bom ? `﻿${body}` : body;
}

/** What the options are, read from a query string. */
export function optionsFrom(query: URLSearchParams): ExportOptions {
  const one = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const value = query.get(key) as T | null;
    return value && allowed.includes(value) ? value : fallback;
  };
  const fields = (query.get("fields") ?? "").split(",").filter((k) => fieldsBy.has(k));
  const sep = query.get("sep");

  return {
    rows: one("rows", ["person", "team"] as const, DEFAULTS.rows),
    fields: fields.length ? fields : DEFAULTS.fields,
    dates: one("dates", ["readable", "date", "iso"] as const, DEFAULTS.dates),
    phone: one("phone", ["plain", "country", "pretty"] as const, DEFAULTS.phone),
    sep: sep === "tab" ? "\t" : sep === ";" ? ";" : ",",
    heading: one("heading", ["human", "machine", "none"] as const, DEFAULTS.heading),
    bom: query.get("bom") !== "no",
  };
}

/** …and the other way round, for the link that downloads them. */
export function queryFrom(options: ExportOptions): string {
  const query = new URLSearchParams();
  if (options.rows !== DEFAULTS.rows) query.set("rows", options.rows);
  if (options.fields.join(",") !== DEFAULTS.fields.join(",")) query.set("fields", options.fields.join(","));
  if (options.dates !== DEFAULTS.dates) query.set("dates", options.dates);
  if (options.phone !== DEFAULTS.phone) query.set("phone", options.phone);
  if (options.sep !== ",") query.set("sep", options.sep === "\t" ? "tab" : options.sep);
  if (options.heading !== DEFAULTS.heading) query.set("heading", options.heading);
  if (!options.bom) query.set("bom", "no");
  return query.toString();
}
