"use server";

import { revalidatePath } from "next/cache";
import { currentAdmin } from "./session";
import { freeSeat, logAdmin, removeTeam } from "@/lib/register/store";
import { isCode } from "@/lib/register/code";

/**
 * The two changes the dashboard can make. Both check who's asking — a form
 * post is reachable without the page around it — and both are written down
 * with the name of whoever made them.
 *
 * Each ends by revalidating /admin: without it the change lands in the
 * database and the page goes on showing the team that was just deleted.
 */

export async function removeTeamAction(form: FormData) {
  const who = await currentAdmin();
  const code = String(form.get("code") ?? "");
  if (!who || !isCode(code)) return;
  await removeTeam(code);
  await logAdmin(who, "removed the team", code);
  revalidatePath("/admin");
}

export async function freeSeatAction(form: FormData) {
  const who = await currentAdmin();
  const code = String(form.get("code") ?? "");
  if (!who || !isCode(code)) return;
  await freeSeat(code);
  await logAdmin(who, "freed the second seat", code);
  revalidatePath("/admin");
}
