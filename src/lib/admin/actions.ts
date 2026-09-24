"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdmin } from "./session";
import { isCode } from "@/lib/register/code";
import { REACTIONS } from "@/lib/register/content";
import { asMember, checkMember, cleanMember, cleanTeam, hasErrors } from "@/lib/register/fields";
import {
  editMember,
  isState,
  logAdmin,
  removeMember,
  removeTeam,
  renameTeam,
  setNote,
  setState,
  setStateMany,
  stateLabel,
  type Clash,
} from "@/lib/register/store";

/**
 * Everything the dashboard can change.
 *
 * All of them check who's asking first — a form post is reachable without the
 * page around it — and all of them are written down with the name of whoever
 * made the change. Nothing here trusts the form: codes, seats and states are
 * checked against what they're allowed to be, and a person's details go
 * through the same cleaning and rules as the sign-up's own.
 *
 * What comes back is a word in the URL (`?said=`), which the page turns into a
 * sentence. That keeps every one of these working without any JavaScript: a
 * form post, a redirect, a fresh page.
 */

const teamPath = (code: string) => `/admin/team/${code}`;

/**
 * Where to land afterwards. A form on a team's own page goes back to it; the
 * same form in the drawer beside the list goes back to the list with that
 * team still open, so nobody is thrown out of what they were doing.
 */
const back = (form: FormData, code: string, said: string) =>
  String(form.get("from") ?? "") === "list"
    ? `/admin?team=${code}&said=${said}`
    : `${teamPath(code)}?said=${said}`;

/** Both pages show the same teams, so both are stale after a change. */
function refresh(code?: string) {
  revalidatePath("/admin");
  if (code) revalidatePath(teamPath(code));
}

/** Who's asking, and about which team — or nothing, if either is wrong. */
async function asking(form: FormData): Promise<{ who: string; code: string } | null> {
  const who = await currentAdmin();
  const code = String(form.get("code") ?? "");
  return who && isCode(code) ? { who, code } : null;
}

/** The first thing that clashed, as a word the team page knows. */
const saidFor = (clashes: Clash[]): string => {
  const first = clashes[0];
  if (!first) return "no";
  if (first.on === "team") return "name-taken";
  return { email: "email-taken", phone: "phone-taken", collegeId: "id-taken" }[first.field as string] ?? "no";
};

/* ------------------------------------------------------------------ *
 * The review
 * ------------------------------------------------------------------ */

export async function setStateAction(form: FormData) {
  const asked = await asking(form);
  const state = String(form.get("state") ?? "");
  if (!asked || !isState(state)) return;

  await setState(asked.code, state);
  await logAdmin(asked.who, `marked ${stateLabel(state).toLowerCase()}`, asked.code);
  refresh(asked.code);
}

/** The same word set on everything that was ticked in the list. */
export async function setStateManyAction(form: FormData) {
  const who = await currentAdmin();
  const state = String(form.get("state") ?? "");
  const codes = form.getAll("codes").map(String).filter(isCode);
  if (!who || !isState(state) || !codes.length) return;

  await setStateMany(codes, state);
  for (const code of codes) await logAdmin(who, `marked ${stateLabel(state).toLowerCase()}`, code);
  for (const code of codes) revalidatePath(teamPath(code));
  revalidatePath("/admin");
}

export async function setNoteAction(form: FormData) {
  const asked = await asking(form);
  if (!asked) return;

  // a note is for whoever reads it next, so it's kept as typed, only trimmed
  const note = String(form.get("note") ?? "").trim().slice(0, 500);
  await setNote(asked.code, note);
  await logAdmin(asked.who, note ? "wrote a note on" : "cleared the note on", asked.code);
  refresh(asked.code);
  redirect(back(form, asked.code, "saved"));
}

/* ------------------------------------------------------------------ *
 * Corrections
 * ------------------------------------------------------------------ */

export async function renameTeamAction(form: FormData) {
  const asked = await asking(form);
  if (!asked) return;

  const team = cleanTeam({
    name: String(form.get("name") ?? ""),
    reaction: String(form.get("reaction") ?? ""),
  });
  if (!team.name || team.name.length < 2 || team.name.length > 32) {
    redirect(back(form, asked.code, "name-no"));
  }
  if (team.reaction && !(REACTIONS as readonly string[]).includes(team.reaction)) {
    redirect(back(form, asked.code, "reaction-no"));
  }

  const answer = await renameTeam(asked.code, team.name, team.reaction);
  if (!answer.ok) redirect(back(form, asked.code, saidFor(answer.clashes)));

  await logAdmin(asked.who, `renamed the team to ${team.name}`, asked.code);
  refresh(asked.code);
  redirect(back(form, asked.code, "saved"));
}

export async function editMemberAction(form: FormData) {
  const asked = await asking(form);
  const seat = Number(form.get("seat"));
  if (!asked || (seat !== 1 && seat !== 2)) return;

  const member = cleanMember(
    asMember({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      collegeId: form.get("collegeId"),
      department: form.get("department"),
      year: form.get("year"),
    }),
  );
  // the same rules the sign-up holds people to, so a correction can't put in
  // what the form itself would have refused
  if (hasErrors(checkMember(member))) redirect(`${back(form, asked.code, "details-no")}&seat=${seat}`);

  const answer = await editMember(asked.code, seat, member);
  if (!answer.ok) redirect(`${back(form, asked.code, saidFor(answer.clashes))}&seat=${seat}`);

  await logAdmin(asked.who, `edited ${member.name} on`, asked.code);
  refresh(asked.code);
  redirect(back(form, asked.code, "saved"));
}

/* ------------------------------------------------------------------ *
 * Taking things off
 * ------------------------------------------------------------------ */

export async function removeMemberAction(form: FormData) {
  const asked = await asking(form);
  const seat = Number(form.get("seat"));
  const name = String(form.get("name") ?? "somebody");
  if (!asked || (seat !== 1 && seat !== 2)) return;

  await removeMember(asked.code, seat);
  await logAdmin(asked.who, `took ${name} off`, asked.code);
  refresh(asked.code);
  redirect(back(form, asked.code, "removed"));
}

export async function removeTeamAction(form: FormData) {
  const asked = await asking(form);
  if (!asked) return;

  await removeTeam(asked.code);
  await logAdmin(asked.who, "removed the team", asked.code);
  refresh(asked.code);
  // the page it was changed from is gone with it
  redirect("/admin?said=team-removed");
}
