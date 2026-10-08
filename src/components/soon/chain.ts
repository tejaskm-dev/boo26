"use client";

import { CHAIN } from "@/lib/soon";
import { troll } from "./troll";

/**
 * "Tell a friend" as an old chain message (the words are CHAIN in soon.ts).
 *
 * The page keeps a note of what the visitor got up to on this visit — woke
 * the cat, found /shh, came back up through a card — so the message they
 * send can own up to it and dare whoever gets it to do better. Only while
 * the page is open: nothing is stored or sent anywhere.
 *
 * The link it sends ends in a number: how many times it's been passed on
 * (`/?n=3`). Whoever comes in on it is told, and their own share passes on
 * one more. The number is read once and taken out of the address, which
 * stays "/" (top.ts); search engines are told "/" either way.
 */

export type Feat = keyof typeof CHAIN.did;

const done = new Set<Feat>();

/** something worth owning up to, done — said in the message in CHAIN.did's order */
export function did(feat: Feat) {
  done.add(feat);
}

let place: number | null = null;

/**
 * Where this visitor is in the chain: how many times the link they came in
 * on had been passed on (0 if nobody sent them). Read from the address the
 * first time it's asked — early, on the way in — and the address put back to
 * plain "/".
 */
export function chainPlace(): number {
  if (place !== null) return place;
  place = 0;
  try {
    const url = new URL(window.location.href);
    const n = Number.parseInt(url.searchParams.get("n") ?? "", 10);
    if (Number.isFinite(n) && n > 0) place = Math.min(n, 999);
    if (url.searchParams.has("n")) {
      url.searchParams.delete("n");
      history.replaceState(history.state, "", url.pathname + url.search + url.hash);
    }
    // back from /shh (the page wipe is a full load, so this is how it's known)
    const from = document.referrer ? new URL(document.referrer) : null;
    if (from && from.origin === url.origin && from.pathname === "/shh") did("shh");
  } catch {
    // an address that won't parse: nobody sent them
  }
  return place;
}

/** the link to send: one further along than the one they came in on */
export function passOn(): string {
  return `${window.location.origin}/?n=${chainPlace() + 1}`;
}

const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

/** two of the dares, never the same one twice */
function dares(): string[] {
  const all = [...CHAIN.dares];
  const a = all.splice(Math.floor(Math.random() * all.length), 1)[0];
  return [a, pick(all)];
}

/** the message, written fresh: never quite the same one twice */
export function chainMessage(): string {
  const owned = (Object.keys(CHAIN.did) as Feat[]).filter((f) => done.has(f)).slice(0, 3);
  const steps = [CHAIN.open, ...dares(), CHAIN.pass].map((s, i) => `${i + 1}. ${s}`);
  return [
    pick(CHAIN.hooks),
    owned.length ? `${owned.map((f) => CHAIN.did[f]).join(" ")} ${CHAIN.turn}` : CHAIN.nothing,
    [CHAIN.steps, ...steps].join("\n"),
    pick(CHAIN.curses),
  ].join("\n\n");
}

let after = 0;

/** the beat after the first answer: once a visit, once the answer's toast has gone */
export function afterShare(line: string) {
  window.clearTimeout(after);
  after = window.setTimeout(() => troll("chain-after", line), 3600);
}
