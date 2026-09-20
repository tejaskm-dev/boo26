/**
 * Every piece of copy on the site lives here.
 *
 * Only confirmed event information is filled in. Anything still unannounced is
 * marked `tba` so it renders as a deliberate placeholder rather than invented
 * marketing copy — swap the value and the section fills itself in.
 */

export const EVENT = {
  name: "BOO!",
  year: "2026",
  date: "24 OCT 2026",
  dateLong: "24 October 2026",
  venue: "ASIET, KALADY",
  venueLong: "Adishankar Institute of Engineering and Technology, Kalady, Kerala",
  format: "20-HOUR CREATIVE TECHNOLOGY HACKATHON",
  duration: "20 HOURS",
  team: "2 PER TEAM",
  host: "MULEARN @ ASIET",
  /* 06 PM on the day, which is when the timeline's first stop opens the doors.
     Kerala is UTC+5:30 and the offset is written out so the countdown means
     the same thing from anywhere. */
  startsAt: "2026-10-24T18:00:00+05:30",
  registerHref: "#register",
  discordHref: "#",
} as const;

/**
 * The running bands. Facts only — the point of a band is that the answer to
 * "when", "where" and "how long" is never more than a screen away.
 */
export const BAND = [
  "24 OCT 2026",
  "ASIET, KALADY",
  "20 HOURS",
  "2 PER TEAM",
  "MULEARN @ ASIET",
] as const;

export type NavItem = { label: string; index: string; href: string };

export const NAV: NavItem[] = [
  { label: "The Night", index: "01", href: "#night" },
  { label: "Experience", index: "02", href: "#experience" },
  { label: "20 Hours", index: "03", href: "#hours" },
  { label: "After Dark", index: "04", href: "#after-dark" },
  { label: "Build", index: "05", href: "#build" },
  { label: "FAQ", index: "06", href: "#faq" },
];

export const SOCIALS = [
  { label: "Discord", href: "#", icon: "discord" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "YouTube", href: "#", icon: "youtube" },
] as const;

/** 01 — THE NIGHT */
export const FACTS = [
  { k: "Date", v: "24 OCT 2026" },
  { k: "Duration", v: "20 HOURS" },
  { k: "Team size", v: "2 PEOPLE" },
  { k: "Venue", v: "ASIET, KALADY" },
] as const;

/** 02 — THE EXPERIENCE */
export const EXPERIENCE = [
  { index: "01", label: "Build", note: "20 hours to make something worth showing." },
  { index: "02", label: "Play", note: "Midnight games, challenges and things that probably shouldn't happen at a hackathon." },
  { index: "03", label: "Survive", note: "Make it to morning. Ship something. Don't get haunted." },
] as const;

/** 03 — THE 20 HOURS */
export const TIMELINE = [
  { time: "06 PM", label: "The doors open", cat: "cat-excited" },
  { time: "10 PM", label: "Things get weird", cat: "cat-playful" },
  { time: "02 AM", label: "Questionable decisions", cat: "cat-confused" },
  { time: "06 AM", label: "Still building", cat: "cat-sleepy" },
  { time: "12 PM", label: "Ship it.", cat: "cat-box" },
] as const;

/** 04 — AFTER DARK */
export const AFTER_DARK = [
  {
    index: "01",
    title: ["Haunted", "House"],
    note: "Find your way out.\nIf you can.",
    cta: "Enter",
    aside: "Some doors shouldn't be opened.",
  },
  {
    index: "02",
    title: ["Treasure", "Hunt"],
    note: "Decode.\nExplore.\nFind what's hidden.",
    cta: "Follow the trail",
    aside: "Same campus. Different story.",
  },
  {
    index: "03",
    title: ["Midnight", "Games"],
    note: "Games, challenges and things that probably shouldn't happen at a hackathon.",
    cta: "Let's play",
    aside: "Good ideas also take breaks.",
  },
] as const;

/** 05 — BUILD */
export const BUILD_STEPS: { index: string; label: string; note: string; lime?: boolean }[] = [
  { index: "01", label: "Idea", note: "Start" },
  { index: "02", label: "Build", note: "Create" },
  { index: "03", label: "Break", note: "Play" },
  { index: "04", label: "Ship", note: "Demo", lime: true },
];

/** 06 — FAQ. Unconfirmed answers say so rather than guess. */
export const FAQ: { q: string; a: string; tba?: boolean }[] = [
  { q: "When and where is BOO! 2026?", a: "24 October 2026 at the Adishankar Institute of Engineering and Technology, Kalady, Kerala. It runs for 20 hours straight." },
  { q: "Who can participate?", a: "Announced soon.", tba: true },
  { q: "Team size?", a: "Two people per team." },
  { q: "What can we build?", a: "Announced soon.", tba: true },
  { q: "Do we need to be from ASIET?", a: "Announced soon.", tba: true },
  { q: "Is there a registration fee?", a: "Announced soon.", tba: true },
  { q: "Will food and accommodation be provided?", a: "Announced soon.", tba: true },
  { q: "What should we bring?", a: "Announced soon.", tba: true },
  { q: "What about the non-coding events?", a: "The night runs a haunted house, a campus treasure hunt and midnight games alongside the build. Details announced soon.", tba: true },
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
  night: "Ideas sleep\nlater here.",
  hours: "A hackathon\nthat stays\nup late.",
  survive: "Good ideas\nsurvive.",
  afterDark: "It's not just\na hackathon\nanymore.",
  build: "Good ideas\nwelcome.",
  faq: "Questions?\nWe got you.",
  faqAside: "Still have\nquestions?\nReach out at\nour Discord!",
  ready: "Let's build\nsomething\nunforgettable.",
  footer: "Til next night.",
  footerLeft: "Made by dreamers\nfor the weird ones.",
  desk: "Ideas outlive\ndeadlines.",
  sign: "Good people\nscarier ideas.",
} as const;
