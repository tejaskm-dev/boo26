import type { SpriteName } from "@/lib/sprites";

/**
 * The words on the register pages, in one place like site.ts.
 *
 * Everything here is either already stated elsewhere on the site (the FAQ, the
 * terms, the Code of Conduct) or marked PROPOSED: a suggestion for the core
 * team to confirm, change or cut before registration opens. Nothing marked
 * PROPOSED should reach the live site unconfirmed.
 */

/** The reactions a team can say it's going for — the FAQ's own list. */
export const REACTIONS = [
  "What the hell?",
  "Jump",
  "Freeze",
  "Laugh nervously",
  "Get curious",
  "Feel uneasy",
  "How did you do that?",
] as const;

/** How the two-person sign-up works, as three stops. */
export const HOW = [
  { index: "01", label: "One of you starts", note: "Your details and a team name" },
  { index: "02", label: "Send the invite", note: "A code, a link or a QR" },
  { index: "03", label: "The other joins", note: "Then you're a team", lime: true },
] as const;

export type Rule = { title: string; body: string };

/** /register/rules — the rules themselves. */
export const RULES: Rule[] = [
  { title: "Two to a team", body: "Exactly two of you, and both of you ASIET students. No solo runs, no trios." },
  { title: "One challenge", body: "Build something that makes someone react. No problem statement. No required tech." },
  {
    title: "Any stack, any tools",
    body: "Software, AI, games, hardware, robotics, electronics, interactive experiences, weird experiments. If it causes a reaction, it counts.",
  },
  // PROPOSED — the terms leave "what you can prepare beforehand" to the guidelines
  {
    title: "Build it on the night",
    body: "Come with an idea, not a finished project. Plan all you like beforehand; the building happens in the 20 hours.",
  },
  {
    title: "Credit what isn't yours",
    body: "Using someone else's code, art, sound or data? Make sure you're allowed to, and say where it came from.",
  },
  { title: "It's yours", body: "Whatever your team builds belongs to your team." },
  {
    title: "Nothing dangerous",
    body: "No weapons, open flames or fuel. Heat, high voltage or sharp moving parts? Check with us before you bring them.",
  },
  { title: "Carry your ID", body: "Bring your college ID. You may be asked for it at any point in the night." },
  {
    title: "Scare responsibly",
    body: "The Code of Conduct and ASIET's campus rules apply all night. Every scare is opt-in, and “stop” means stop.",
  },
  {
    title: "The judges decide",
    body: "In the morning you put your build in front of people and watch them react. The judges' decisions are final.",
  },
];

/** The rules page's opening summary. */
export const RULES_SHORT = [
  "Two per team, both from ASIET.",
  "Build something that makes someone react.",
  "Nothing dangerous. Credit what isn't yours.",
  "Carry your college ID.",
];

/** The practical side of the night, under the rules. */
export const GUIDE: { title: string; body: string; sprite: SpriteName; scale: number }[] = [
  {
    title: "What to bring",
    body: "Your laptop and charger, whatever hardware or tools your project needs, your college ID. And your teammate.",
    sprite: "flashlight",
    scale: 0.22,
  },
  {
    title: "Food",
    body: "Provided through the night, and all of it's veg.",
    sprite: "can",
    scale: 0.19,
  },
  {
    title: "Sleep",
    body: "There's no accommodation and nowhere to sleep. If you need somewhere to stay before the event, that's yours to arrange.",
    sprite: "zzz",
    scale: 0.2,
  },
  {
    title: "The fee",
    body: "₹200 per team, which is ₹100 each. How and when to pay: coming soon.",
    sprite: "clue-note",
    scale: 0.36,
  },
  {
    title: "After dark",
    body: "A haunted house, a treasure hunt inside it, and midnight games. Joining them is up to you.",
    sprite: "door-haunted",
    scale: 0.2,
  },
];

export type Criterion = {
  name: string;
  weight: number;
  line: string;
  asks: string[];
  sprite: SpriteName;
};

/**
 * /register/judging.
 *
 * PROPOSED — all four criteria and their weights. The site only says the
 * criteria will be published and that the judges' decisions are final. These
 * follow the premise: the reaction is the point, so it carries the most.
 */
export const JUDGING: Criterion[] = [
  {
    name: "The Reaction",
    weight: 40,
    line: "Did it get one?",
    asks: [
      "Did someone actually react: jump, freeze, laugh, go “what the hell?”",
      "Was it the reaction you were going for?",
      "Does it still work on someone who didn't see it coming?",
    ],
    sprite: "mark-bang",
  },
  {
    name: "The Build",
    weight: 25,
    line: "Does it hold up?",
    asks: ["Does it work, live, in front of people?", "How much did two people make in 20 hours?"],
    sprite: "badge-build",
  },
  {
    name: "The Idea",
    weight: 20,
    line: "How weird? How new?",
    asks: ["Have we seen this before?", "Is the weirdness on purpose?"],
    sprite: "badge-ideas",
  },
  {
    name: "The Show",
    weight: 15,
    line: "How you set it up.",
    asks: ["Do you set the moment up well?", "Can you explain how it works, after?"],
    sprite: "badge-ship",
  },
];
