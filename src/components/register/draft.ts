"use client";

import { useSyncExternalStore } from "react";
import { STORAGE } from "@/lib/storage";
import type { Member, TeamDetails } from "@/lib/register/fields";

/**
 * What's been typed into a sign-up so far, kept in this tab's session
 * storage: a reload, or a phone dropping the page while you look up your ID
 * number in another app, doesn't cost it. The person's details are shared by
 * both paths, so starting a team and then joining one instead keeps them.
 * It goes once the form goes through, and with the tab anyway.
 */
export type Draft = { member?: Member; team?: TeamDetails };

function read(): Draft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE.draft);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    /* storage blocked, or something unreadable in it: nothing to pick up */
    return null;
  }
}

// Read once, as the page found it. Later saves mustn't come back as a new
// draft, or the form would be thrown away and rebuilt on every keystroke.
let found: Draft | null | undefined;
const once = () => (found === undefined ? (found = read()) : found);
const still = () => () => {};

/** The draft this page opened with: undefined on the server and while the page hydrates. */
export function useOpeningDraft(): Draft | null | undefined {
  return useSyncExternalStore(still, once, () => undefined);
}

/** Keeps what's given, alongside whatever else is already saved. */
export function saveDraft(part: Draft) {
  try {
    sessionStorage.setItem(STORAGE.draft, JSON.stringify({ ...read(), ...part }));
  } catch {
    /* storage blocked: the form still works, it just won't survive a reload */
  }
}

export function dropDraft() {
  try {
    sessionStorage.removeItem(STORAGE.draft);
  } catch {
    /* nothing was kept */
  }
}
