import type { SpriteName } from "./sprites";

export const EVENT = {
  name: "BOO!",
  year: "2026",
  date: "24–25 OCT 2026",
  dateLong: "24–25 October 2026",
  venue: "ASIET, KALADY",
  venueLong: "Adi Shankara Institute of Engineering and Technology, Kalady, Kerala",
  format: "HALLOWEEN-NIGHT CREATIVE TECHNOLOGY HACKATHON",
  duration: "20 HOURS",
  team: "2 PER TEAM",
  /* Written out rather than as μLearn: every place this is set uppercases it,
     and an uppercased μ is the Greek capital, which reads as a plain M. */
  host: "MULEARN ASIET",
  /* 02 PM on the day, which is when the timeline's first stop opens the doors.
     Kerala is UTC+5:30 and the offset is written out so the countdown means
     the same thing from anywhere. */
  startsAt: "2026-10-24T14:00:00+05:30",
  registerHref: "#register",
  discordHref: "#",
} as const;

/**
 * The running bands. Facts only — the point of a band is that the answer to
 * "when", "where" and "how long" is never more than a screen away.
 */
export const BAND = [
  "24 OCT, 2 PM",
  "ASIET, KALADY",
  "20 HOURS",
  "2 PER TEAM",
  "MULEARN ASIET",
] as const;

export type NavItem = { label: string; index: string; href: string };

export const NAV: NavItem[] = [
  { label: "The Night", index: "01", href: "#night" },
  { label: "Experience", index: "02", href: "#experience" },
  { label: "20 Hours", index: "03", href: "#hours" },
  { label: "After Dark", index: "04", href: "#after-dark" },
  { label: "The People", index: "05", href: "#team" },
  { label: "Build", index: "06", href: "#build" },
  { label: "FAQ", index: "07", href: "#faq" },
];

export const SOCIALS = [
  { label: "Discord", href: "#", icon: "discord" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "YouTube", href: "#", icon: "youtube" },
] as const;

/** 01 — THE NIGHT */
export const FACTS = [
  // non-breaking spaces, so a narrow column breaks after the comma and never inside "2 PM"
  { k: "Starts", v: "24 OCT, 2 PM" },
  { k: "Duration", v: "20 HOURS" },
  { k: "Team size", v: "2 PEOPLE" },
  { k: "Venue", v: "ASIET, KALADY" },
] as const;

/** 02 — THE EXPERIENCE */
export const EXPERIENCE = [
  { index: "01", label: "Build", note: "Choose a reaction. Build whatever it takes to cause it. You have a night to make it real." },
  { index: "02", label: "Play", note: "Step away from the build. Midnight games. A haunted house with a treasure hunt inside." },
  { index: "03", label: "Survive", note: "Make it to morning. Then put your build in front of someone and watch them react." },
] as const;

/** 03 — THE 20 HOURS */
export const TIMELINE = [
  { time: "02 PM", label: "The doors open", cat: "cat-excited" },
  { time: "12 AM", label: "Midnight games", cat: "cat-playful" },
  { time: "03 AM", label: "Questionable decisions", cat: "cat-confused" },
  { time: "06 AM", label: "Still building", cat: "cat-sleepy" },
  { time: "10 AM", label: "Make them react.", cat: "cat-box" },
] as const;

/**
 * 04 — AFTER DARK. The house and the hunt are one experience told as two
 * scenes: the hunt runs inside the house, so the copy hands one to the other.
 * Nothing specific about either is confirmed yet, and the copy doesn't guess.
 */
export const AFTER_DARK = [
  {
    index: "01",
    title: ["Haunted", "House"],
    note: "Come in.\nSomething's hidden.",
    cta: "Enter",
    aside: "What's inside\nstays secret.\nFor now.",
  },
  {
    index: "02",
    title: ["Treasure", "Hunt"],
    note: "Enter the house.\nChase the clues.\nFind what's hidden.",
    cta: "Follow the trail",
    aside: "Signed up?\nThen you're\ngoing in.",
  },
  {
    index: "03",
    title: ["Midnight", "Games"],
    note: "Around midnight.\nSpooky games.\nOther humans.",
    cta: "Let's play",
    aside: "The bugs\nwill wait.",
  },
] as const;

/** 05 — THE PEOPLE */
export interface TeamMember {
  name: string;
  role?: string;
  tagline: string;
  image: string;
  imagePosition?: string;
  linkedin?: string;
  email?: string;
  moniker?: string;
  companion: SpriteName;
  companionScale: number;
  tilt: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Sufiyan Shiraj Mohammed",
    tagline: "fueling the chaos.",
    image: "/assets/team/sufiyan shiraj mohammed.jpg",
    imagePosition: "center 25%",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@boo2026.com",
    companion: "cat-pop-jump",
    companionScale: 0.35,
    tilt: "-rotate-[2.2deg]",
  },
  {
    name: "Tejas K M",
    tagline: "building at 3am.",
    image: "/assets/team/tejas km.PNG",
    imagePosition: "center 20%",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@boo2026.com",
    companion: "cat-pop-coder",
    companionScale: 0.35,
    tilt: "rotate-[1.6deg]",
  },
  {
    name: "Sreehari K A",
    tagline: "gaming the system.",
    image: "/assets/team/sreehari ka.png",
    imagePosition: "center 20%",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@boo2026.com",
    companion: "cat-pop-gamer",
    companionScale: 0.35,
    tilt: "-rotate-[1.4deg]",
  },
  {
    name: "Ram Madhav R Kammath",
    tagline: "crafting the aesthetics.",
    image: "/assets/team/ram madhav.jpg",
    imagePosition: "center 22%",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@boo2026.com",
    companion: "cat-pop-artist",
    companionScale: 0.35,
    tilt: "rotate-[2.2deg]",
  },
  {
    name: "Sreenanda K Sahajan",
    tagline: "calm amidst the storm.",
    image: "/assets/team/sreenanda k sahajan.jpg",
    imagePosition: "center 30%",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@boo2026.com",
    companion: "cat-pop-sleepy",
    companionScale: 0.35,
    tilt: "-rotate-[1.8deg]",
  },
  {
    name: "Rosphil Maria",
    tagline: "debugging the universe.",
    image: "/assets/team/rosphil mariya.jpg",
    imagePosition: "center 20%",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@boo2026.com",
    companion: "cat-pop-detective",
    companionScale: 0.35,
    tilt: "rotate-[1.5deg]",
  },
];

/** 06 — BUILD */
export const BUILD_STEPS: { index: string; label: string; note: string; lime?: boolean }[] = [
  { index: "01", label: "Idea", note: "Pick a reaction" },
  { index: "02", label: "Build", note: "Make it real" },
  { index: "03", label: "Break", note: "Test it on people" },
  { index: "04", label: "Ship", note: "Watch them react", lime: true },
];

/** 07 — FAQ. Unconfirmed answers say so rather than guess. */
export const FAQ: { q: string; a: string; tba?: boolean }[] = [
  { q: "When and where is BOO! 2026?", a: "It starts at 2:00 PM on 24 October 2026 and runs through the night, wrapping up around 10–11 AM on 25 October. It happens at Adi Shankara Institute of Engineering and Technology (ASIET), Kalady, Kerala." },
  { q: "Who can participate?", a: "Announced soon.", tba: true },
  { q: "Team size?", a: "Two people per team. Pick someone you'd happily spend a strange night building with." },
  { q: "What can we build?", a: "Anything that makes someone react. There's no problem statement, no required tech and no list of categories to pick from. A weird website, a game, an AI experience, a piece of hardware, an installation, or something that fits none of those. It can be scary, funny, strange or just unexpected. What matters is that someone reacts." },
  { q: "Do we need to be from ASIET?", a: "Announced soon.", tba: true },
  { q: "Is there a registration fee?", a: "Announced soon.", tba: true },
  { q: "Will food and accommodation be provided?", a: "Breakfast is part of the morning. Everything else about food, and anything about accommodation, will be announced soon." },
  { q: "What should we bring?", a: "Announced soon.", tba: true },
  { q: "What else happens during the night?", a: "Around midnight there are spooky games and other Halloween activities. There's also a treasure hunt that runs inside a haunted house, so signing up for the hunt means going through the house. The rest stays under wraps for now." },
  { q: "Any rules we should know?", a: "Announced soon.", tba: true },
];

/** Footer navigation */
export const FOOTER_NAV = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "#top" },
      { label: "The Night", href: "#night" },
      { label: "20 Hours", href: "#hours" },
      { label: "FAQ", href: "#faq" },
      { label: "Register", href: "#register" },
    ],
  },
  {
    title: "The Experience",
    links: [
      { label: "The 20 Hours", href: "#hours" },
      { label: "After Dark", href: "#after-dark" },
      { label: "The Hackathon", href: "#build" },
    ],
  },
] as const;

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Code of Conduct", href: "#" },
] as const;

/** Handwritten margin notes, kept in one place so they stay rationed. */
export const NOTES = {
  scroll: "Scroll\nif you dare",
  night: "One challenge:\nmake someone\nreact.",
  hours: "A hackathon\nthat stays\nup late.",
  hoursAside: "Ideas sleep\nlater here.",
  survive: "Good ideas\nsurvive.",
  afterDark: "Meanwhile,\nthe campus\nwakes up.",
  build: "Weird ideas\nwelcome.",
  faq: "Questions?\nWe got you.",
  faqAside: "Still have\nquestions?\nReach out at\nour Discord!",
  ready: "Bring an idea.\nWe'll bring\nthe night.",
  footer: "Don't come alone.",
  footerLeft: "Made by dreamers\nfor the weird ones.",
  desk: "Start with\nthe reaction.\nWork\nbackwards.",
  sign: "Good people\nscarier ideas.",
} as const;
