import { currentAdmin } from "@/lib/admin/session";
import { listTeams } from "@/lib/register/store";

const HEAD = [
  "team_code",
  "team_name",
  "state",
  "note",
  "reaction",
  "seat",
  "name",
  "email",
  "phone",
  "college_id",
  "department",
  "year",
  "joined_at",
];

/**
 * One cell, quoted — and anything that opens like a formula (a team name
 * someone typed, the +91 on a number) marked as text first, so a spreadsheet
 * shows what's written instead of running it.
 */
const cell = (v: unknown) => {
  const s = String(v ?? "");
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

/** Everyone registered, as a spreadsheet: the night's list. */
export async function GET() {
  if (!(await currentAdmin())) return new Response("Not signed in", { status: 401 });

  let teams;
  try {
    teams = await listTeams();
  } catch (trouble) {
    return new Response(`Couldn't read the registrations: ${trouble instanceof Error ? trouble.message : trouble}`, {
      status: 503,
    });
  }

  const rows = [HEAD.join(",")];
  for (const t of teams) {
    for (const m of t.members) {
      rows.push(
        [t.code, t.name, t.state, t.note, t.reaction, m.seat, m.name, m.email, `+91${m.phone}`, m.collegeId, m.department, m.year, m.joinedAt]
          .map(cell)
          .join(","),
      );
    }
  }

  const day = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${rows.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="boo-2026-registrations-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
