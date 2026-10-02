"use client";

/**
 * Whether something's covering the whole screen (the teaser's title cards,
 * once their black is up): what's behind it can rest — nobody can see it
 * redrawn, and on a phone the frames are the card's.
 */
let covering = 0;

export const curtainUp = () => covering > 0;

/** a cover going up (true) or coming down (false) — always in pairs */
export function curtain(up: boolean) {
  covering = Math.max(0, covering + (up ? 1 : -1));
}
