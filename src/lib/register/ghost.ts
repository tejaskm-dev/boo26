"use client";

/**
 * What the sign-up tells the ghost on the trail. The form doesn't hold a
 * reference to it; it says what happened and the ghost reacts in its own way.
 *
 *   nod     a key was pressed in a field: it bobs along as you type
 *   watch   a field has focus: it looks over at what you're writing
 *   away    focus left the form: it looks back at you
 *   scared  something's wrong with the answers: it shivers, eyes wide
 *   cheer   a step came out right: a little hop
 *   fly     the form went through: off it floats
 */
export type Mood = "nod" | "watch" | "away" | "scared" | "cheer" | "fly";

type Listener = (mood: Mood) => void;
const listeners = new Set<Listener>();

export function ghostSays(mood: Mood) {
  for (const fn of listeners) fn(mood);
}

export function onGhost(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
