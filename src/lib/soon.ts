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
    /* what a search result says under the name: the teaser's own line, nothing it doesn't already say */
    description: `${EVENT.name} ${EVENT.year} is coming to ASIET, Kalady. That’s about all we’re allowed to tell you.`,
  },

  /** where the full site says what it is, the teaser whispers */
  format: "SOMETHING IS WAKING UP",

  /** the loading screen: its corner, and the line across the bottom */
  preloader: {
    corner: "SHH.",
    venue: EVENT.venue,
    line: "SOMETHING IS WAKING UP",
    hint: "Wear headphones for a better experience",
    /** the way in, once it's loaded: with the sound (that click is what lets a browser play it), or without */
    enter: "Enter",
    quiet: "enter quietly",
  },

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
    /** the same heading, when you scroll back up to it after the room */
    again: "Heard\nthat?",
    body: "BOO! is coming to ASIET. That’s about all we’re allowed to tell you.",
    /**
     * The rumour, passed along a chain of eyes in the dark — a little
     * different every time it's passed on (Rumour.tsx)
     */
    rumour: ["psst. it’s not a seminar.", "bring your weirdest idea.", "and don’t come alone.", "says who?", "…the cats."],
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
    /** and once you have */
    woke: "You\nwoke it.",
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
    /** under "relax." — it's not true */
    promise: "no jump scares on this site. promise.",
    words: { lean: "lean in.", what: "What the—" },
    leanUp: "you just did.",
    /** under the bar that cuts WHAT THE— off */
    language: "language.",
    why: "Why",
    reveal: "Make them\nlook twice.",
    note: "this time, you’re\nthe one doing it.",
  },

  /** 04 — what's next */
  notYet: {
    label: "Not yet",
    /** the line before the big one — it and the heading are one sentence */
    kicker: "When it drops,",
    heading: "You’ll\nknow.",
    body: "Registration isn’t open, and we’re not saying when. This page will change. Keep an eye on it.",
    share: "Tell a friend",
    note: "keep it\nquiet.",
    band: [
      "SOMETHING IS WAKING UP",
      "ASIET, KALADY",
      "MAKE THEM LOOK TWICE",
      "DON’T LOOK AWAY",
      "IT’S NOT A SEMINAR",
      "NOT YET",
      "ASK THE CAT",
      "BOO! 2026",
      "µLEARN ASIET",
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
    /** the voices are ElevenLabs' free plan, which asks for "elevenlabs.io" wherever they're used */
    credit: { before: `By the ${EVENT.name} core team,\nunder the `, after: " banner\nvoices: elevenlabs.io" },
    desk: "nothing to see\nhere. yet.",
    sign: "go touch grass.",
  },
} as const;

/**
 * What changes when you scroll back up to somewhere you've already been —
 * swapped in just before it comes back into view, once, and left that way.
 */
export const BACK = {
  /** the rumour, now that you've been further in */
  rumour: ["you scrolled back. why?", "it heard you too.", "it’s still behind you.", "too late to unhear it.", "the cats know you’re here."],
  leak: "the schedule is a lie.",
  bar: "it’s behind you.",
  count: "you sure about that?",
  words: { lean: "lean out.", what: "Language!" },
  heading: "It\nknows.",
} as const;

/**
 * What comes up in the dark between acts (Cut.tsx), one line at a time —
 * and what comes up instead if you're going back the way you came.
 */
export const CUTS = {
  /** after the hero, into the rumours */
  open: ["SHH.", "DID YOU HEAR THAT?"],
  openBack: ["WRONG WAY."],
  /** into the room */
  dark: ["LIGHTS OFF.", "EYES OPEN.", "SOMETHING’S BREATHING."],
  darkBack: ["LEAVING SO SOON?", "IT FOLLOWED YOU."],
  /** into the end */
  /** a sentence of its own: the next one ("When it drops, / You'll know.") is the end's */
  drop: ["YOU MADE IT.", "MOST DON’T."],
  dropBack: ["BACK FOR MORE?"],
} as const;

/**
 * The lines hidden on things — hover with a mouse and a note appears by it,
 * or long-press on a phone. See HoverNotes.tsx.
 */
export const SECRETS = {
  heading: "we heard you heard.",
  body: "that’s genuinely all. we checked.",
  moon: "it’s always this full here.",
  /** one for each link of the rumour */
  rumour: ["pinky promise.", "weirder than that.", "someone to scream with.", "not us.", "ask them nicely."],
  /** the µ in µLearn's logo, wherever it is */
  mu: "µ: one millionth. about how much we’ve told you.",
  /** the tiny flag on the moon in 01 */
  flag: "µ means tiny. you found it anyway.",
  where: "that part’s real.",
  leak: "don’t.",
  window: "tap it. go on.",
  camera: "smile.",
  sleeper: "light sleeper.",
  lean: "closer. closer.",
  what: "we heard that.",
  why: "that’s the whole brief.",
  boo: "almost.",
  share: "they’ll thank you. maybe.",
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
  safe: "bro thought he was safe 💀",
  anyway: "oh no. anyway.",
  hello: "hello there.",
  peek: "they don’t know i’m here.",
  winning: "are you winning, son?",
  lightMode: "light mode? this part’s gonna hurt.",
  darkMode: "they’re here.",
  brave: "brave.",
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

/**
 * What "Tell a friend" sends (NotYet.tsx, chain.ts): the old chain-message
 * curse, written fresh every time it's sent. An opener; what the sender did
 * on their visit, said back as a dare; the steps to make it leave — every
 * one of them something that's really on the page — and what happens if you
 * skip one. Someone who comes in on a passed-on link is told how far it's
 * travelled. Like every line here: no when, and no what.
 */
export const CHAIN = {
  /** one of these opens it */
  hooks: [
    "you’ve been visited by the BOO! cat. 🐈‍⬛",
    "the BOO! cat is in this chat now. 🐈‍⬛",
    "the BOO! cat followed me here. now it’s yours. 🐈‍⬛",
  ],
  /** what the sender did on their visit, the worst first — up to three are owned up to */
  did: {
    shh: "i found the page i wasn’t supposed to.",
    woke: "i woke it.",
    face: "i saw its face.",
    up: "it followed me back up.",
    lights: "i turned the lights off.",
    end: "i made it to the end.",
    poke: "i poked it in the eye.",
    walls: "i went quiet. something noticed.",
    back: "i looked away. it waited.",
  },
  /** after what they did */
  turn: "your turn.",
  /** a sender who did none of it */
  nothing: "i didn’t find anything. that’s what it wanted.",
  steps: "to make it leave:",
  /** always the first step */
  open: "open the link. sound on.",
  /** two of these, different every time — every one is really there */
  dares: [
    "there’s something asleep in the dark. don’t wake it.",
    "find the page you weren’t supposed to. (shh.)",
    "scroll back up. see what changed.",
    "go quiet for a while. something will notice.",
    "poke the cat on the logo. three times.",
    "look away. then come back.",
  ],
  /** always the last step */
  pass: "send this to 3 friends.",
  /** one of these ends it */
  curses: [
    "skip one and it sits on your keyboard forever.",
    "skip one and it follows you home.",
    "skip one and it moves in. it’s already picked a spot.",
    "skip one and it knows.",
  ],
  /** the beat after it's sent — or, on a laptop, copied */
  sent: "…we’ll know if you didn’t.",
  copied: "…now paste it somewhere. we’ll know if you don’t.",
  /** for someone who came in on a passed-on link: how many times it's been passed on */
  arrived: (n: number) =>
    n === 1
      ? "someone passed it to you. you’re no. 1."
      : n < 5
        ? `you’re no. ${n}. it’s getting heavier.`
        : n < 10
          ? `${n} people before you. none of them got rid of it.`
          : `passed on ${n} times. it’s not leaving.`,
};

/**
 * The eyes in the corner (Waiting.tsx), there only while the page is being
 * held or a scene is pinned: the line round them fills while you wait (or
 * scroll), and when it closes you're through.
 */
export const WAIT = {
  /** the first time it holds you still */
  first: "wait for it…",
  /** scrolling while it's holding — one per try, a different one each time */
  push: ["not yet.", "it’s watching.", "shh.", "nice try.", "still no."],
  /** let go, and you haven't moved — or you'd been trying to */
  go: "now go",
  /** stopped partway through a pinned scene, or let go inside one */
  idle: {
    cut: "keep going",
    room: "tiptoe",
    /** the room, once it's awake */
    woke: "run.",
    drop: "almost",
  },
} as const;

/**
 * µLearn ASIET, whose banner this is under (MuLearn.tsx): the studio card
 * the trailer opens on, the credit it ends on, and what its eyes say when
 * they're poked.
 */
export const MU = {
  name: "µLearn ASIET",
  /** under the logo, on the first title card */
  presents: "presents",
  /** the end credit, either side of the logo */
  under: ["under the", "banner"],
  /** said as the banner goes over (no µ: the toast is set in capitals) */
  banner: "flying the banner. literally.",
} as const;
