"use client";

import { useState } from "react";
import { YOU_FIELDS, checkCampus, checkYou, type Errors, type Member } from "@/lib/register/fields";
import { ghostSays } from "@/lib/register/ghost";

/**
 * One person's half of a sign-up: what they've typed, and the notes on it.
 *
 * A note turns up when you leave a field, never while you're still typing in
 * it, and only once there's something in it to check: an empty field is
 * pointed at only when you try to move on. Editing a field clears its note.
 * A note the server left on a later step stays until that field is edited,
 * so it's still there when you get to it.
 */
export function useMember(initial: Member) {
  const [member, setMember] = useState(initial);
  const [errors, setErrors] = useState<Errors<Member>>({});

  const set = (field: keyof Member, value: string) => {
    setMember((m) => ({ ...m, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const problem = (field: keyof Member) =>
    ((YOU_FIELDS as readonly string[]).includes(field) ? checkYou : checkCampus)(member)[field];

  /** left a field: say what's wrong with it, if anything, once it's been filled in */
  const touch = (field: keyof Member) => {
    if (!member[field].trim()) return;
    setErrors((e) => ({ ...e, [field]: problem(field) }));
  };

  /** the answer checks out */
  const ok = (field: keyof Member) => !!member[field].trim() && !errors[field] && !problem(field);

  /** a step's own check joins the notes still standing; true if its fields are clear */
  const passes = (found: Errors<Member>, fields: readonly (keyof Member)[]) => {
    const notes = { ...errors, ...found };
    setErrors(notes);
    const clear = !fields.some((f) => notes[f]);
    if (!clear) ghostSays("scared");
    return clear;
  };

  return { member, errors, setErrors, set, touch, ok, passes };
}
