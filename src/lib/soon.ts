import type { NavItem } from "./site";
import { BRAND as EVENT } from "./brand";

/**
 * Every word on the coming-soon teaser, in one place.
 *
 * The full site's words are in site.ts and stay there; nothing here is shared
 * with it, so either side can be rewritten without touching the other.
 *
 * Rules for any line added here, so the teaser keeps working as a teaser:
 *
 *  1. Every line is something overheard, something seen, or something said
 *     to the visitor. No line describes the event.
 *  2. Where is the only fact. Never when, what or how — no dates, times or
 *     durations, and nothing that implies one.
 *  3. One thing is explained, once: "make them look twice".
 *  4. Anything that isn't live says "not yet", never "coming soon".
 *  5. Never: Halloween, hackathon, treasure / hunt / clue / map, lab.
 *
 * The voice is the BOO! core team teasing its own campus — honest that it
 * isn't allowed to say more, because it isn't.
 */

export const SOON = {
  meta: {
    title: `${EVENT.name} ${EVENT.year} · ASIET, Kalady`,
    description: "Something's coming to ASIET. We're not allowed to say more.",
  },

  /** where the full site says what it is, the teaser whispers */
  format: "SOMETHING IS WAKING UP",

  /** the loading screen: its corner, and the line across the bottom */
  preloader: { corner: "SHH.", venue: EVENT.venue, line: "SOMETHING IS WAKING UP" },

  hero: {
    facts: [{ text: EVENT.venue }],
    cta: { label: "Come closer", href: "#heard" },
    next: { href: "#heard", label: "Skip ahead" },
  },

  nav: [
    { label: "Heard anything?", index: "01", href: "#heard" },
    { label: "In the dark", index: "02", href: "#dark" },
    { label: "The point", index: "03", href: "#point" },
    { label: "Not yet", index: "04", href: "#not-yet" },
  ] satisfies NavItem[],

  /** one per menu item: the longest labels get the narrowest cut */
  navLook: [
    { wdth: 84, size: 0.8, indent: 0, tilt: -1.6 },
    { wdth: 92, size: 0.92, indent: 3, tilt: 1.2 },
    { wdth: 112, size: 1.02, indent: 1.2, tilt: -0.8 },
    { wdth: 125, size: 1.18, indent: 5.2, tilt: 1.6 },
  ],

  /** 01 — the rumour */
  heard: {
    label: "Rumours",
    heading: "Heard\nanything?",
    body: "BOO! is coming to ASIET. That’s about all we’re allowed to tell you.",
    /** rumours in the dark — they only read clearly up close */
    whispers: [
      "no, we won’t tell you when.",
      "it’s not a seminar. promise.",
      "bring your weirdest idea.",
      "if you smell pala flowers, don’t turn around.",
      "who keeps leaving the lights on upstairs?",
      "the cats know something.",
    ],
    card: {
      rows: [
        { k: "What", hidden: "nice try" },
        { k: "When", hidden: "nice try", opens: "when you least expect it." },
        { k: "Why", hidden: "nice try" },
      ],
      where: EVENT.venue,
    },
    leak: { label: "leaked schedule", href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    /** what the black bars say back, on the bar itself — a little more each tap, across all three */
    taps: ["nice try.", "still no.", "bro really thought", "noted.", "stop.", "STOP.", "last warning."],
    /** after the last warning something comes out of them; then they say this */
    after: ["told you.", "again?", "you like this, huh."],
    /** tapping WHEN this many times finally opens it */
    whenOpensAfter: 10,
  },

  /** 02 — the room, with the lights off, and what's asleep in it */
  dark: {
    label: "In the dark",
    kicker: "LIGHTS OFF.\nEYES OPEN.",
    heading: "Don’t\nwake it.",
    /** by the torch, while it's asleep — and once it isn't */
    sleeping: "shh. it’s sleeping.",
    oops: "…oops.",
    handle: "drag me",
  },

  /** 03 — the only thing we explain */
  point: {
    label: "The point",
    fakeout: ["jump scare in 3…", "jump scare in 3… 2…", "jump scare in 3… 2… 1…"],
    relax: "relax.",
    words: { jump: "Jump.", freeze: "Freeze.", laugh: "Laugh.", lean: "lean in.", what: "What the—" },
    /** under FREEZE, where something only sees you while you're moving */
    still: "it can’t see you\nif you don’t move.",
    leanUp: "you just did.",
    /** scrawled round LAUGH. as it goes */
    ha: ["ha", "haha", "HA!", "ha ha", "hehe", "HAHAHA"],
    /** under the bar that cuts WHAT THE— off */
    language: "language.",
    why: "Why",
    reveal: "Make them\nlook twice.",
    note: "this time, you’re\nthe one doing it.",
  },

  /** 04 — what's next */
  notYet: {
    label: "Not yet",
    heading: "You’ll\nknow.",
    body: "Registration isn’t open, and we’re not saying when. This page will change. Keep an eye on it.",
    share: "Tell a friend",
    note: "keep it\nquiet.",
    /** what a share sends: the old chain-message curse */
    chain: "you’ve been visited by the BOO! cat. forward this to 3 friends or it sits on your keyboard forever.",
    band: [
      "SOMETHING IS WAKING UP",
      "ASIET, KALADY",
      "MAKE THEM LOOK TWICE",
      "DON’T LOOK AWAY",
      "IT’S NOT A SEMINAR",
      "NOT YET",
      "ASK THE CAT",
      "BOO! 2026",
    ],
  },

  /** the /register pages, while the teaser is up */
  closed: {
    kicker: "Registration\nisn’t open.",
    heading: "Not\nyet.",
    note: "you’ll know.",
    band: ["SOMETHING IS WAKING UP", "ASIET, KALADY", "NOT YET", "MAKE THEM LOOK TWICE", "BOO! 2026"],
  },

  footer: {
    kicker: "you didn’t\nhear it\nfrom us.",
    statement: "See you at",
    sub: "Keep it\nquiet.",
    updates: {
      title: "Don’t miss updates",
      note: "The day there’s something to tell, we’ll tell it. No spam, promise.",
    },
    nav: [
      {
        title: "Navigation",
        links: [
          { label: "Home", href: "#top" },
          { label: "Heard anything?", href: "#heard" },
          { label: "In the dark", href: "#dark" },
          { label: "Not yet", href: "#not-yet" },
        ],
      },
    ],
    details: { title: "Where", rows: [["Where", EVENT.venueLong]] as [string, string][] },
    credit: { before: `By the ${EVENT.name} core team,\nunder the `, after: " banner" },
    desk: "nothing to see\nhere. yet.",
    sign: "go touch grass.",
  },
} as const;

/**
 * The jokes. Each one fires at most once a page load, one toast at a time,
 * and never blocks anything — see src/components/soon/Eggs.tsx.
 */
export const TROLL = {
  closer: "not that close.",
  boo: "boo.",
  poke: "rude.",
  awake: "it’s awake.",
  fell: "you fell for it.",
  seen: "it saw that.",
  lightMode: "light mode? this part’s gonna hurt.",
  darkMode: "they’re here.",
  brave: "brave.",
  jump: "emotional damage.",
  cheating: "that’s cheating.",
  shared: "good. now act normal.",
  copied: "link copied. don’t tell everyone.",
  patience: ["patience.", "patience!!", "we said patience."],
  away: "come back.",
  back: "oh. you’re back.",
  walls: "i’m in your walls.",
  fast: "slow down. you’re missing stuff.",
  sideways: "turn it back. we’re not ready for that.",
  sleep: "go to sleep.",
  nerd: "ok nerd.",
  leaving: "ight imma head out.",
  notYet: "not yet.",
  ghosted: "you’ve been ghosted.",
} as const;
