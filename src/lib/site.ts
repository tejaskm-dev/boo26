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
  /* The µ is U+00B5, the micro sign: it is in the Latin subset the fonts load
     and the Greek mu is not. Anywhere the type is uppercased it has to go
     through <Micro>, or it renders as a plain M. */
  host: "µLearn ASIET",
  /* 02 PM on the day, which is when the timeline's first stop opens the doors.
     Kerala is UTC+5:30 and the offset is written out so the countdown means
     the same thing from anywhere. */
  startsAt: "2026-10-24T14:00:00+05:30",
  /* Registration isn't open yet, so every register CTA lands on the
     coming-soon page. Point this at the real form when it exists. */
  registerHref: "/register",
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
  "µLEARN ASIET",
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

/**
 * BOO!'s own channels. None are live yet, so none has an href: without one,
 * each shows the coming-soon toast instead of linking anywhere. Add the URL
 * here when a channel goes live.
 */
export const SOCIALS: { label: string; icon: string; href?: string }[] = [
  { label: "Discord", icon: "discord" },
  { label: "Instagram", icon: "instagram" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "YouTube", icon: "youtube" },
];

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
  /** left out for anyone without one, which drops the icon from their card */
  instagram?: string;
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
    linkedin: "https://www.linkedin.com/in/sufiyan-shiraj-mohammed/",
    instagram: "https://www.instagram.com/sufiyan.shiraj/",
    companion: "cat-pop-jump",
    companionScale: 0.35,
    tilt: "-rotate-[2.2deg]",
  },
  {
    name: "Tejas K M",
    tagline: "building at 3am.",
    image: "/assets/team/tejas km.PNG",
    imagePosition: "center 20%",
    linkedin: "https://www.linkedin.com/in/tejas-km-73436237b/",
    instagram: "https://www.instagram.com/tejas_km_dev/",
    companion: "cat-pop-coder",
    companionScale: 0.35,
    tilt: "rotate-[1.6deg]",
  },
  {
    name: "Sreehari K A",
    tagline: "gaming the system.",
    image: "/assets/team/sreehari ka.png",
    imagePosition: "center 20%",
    linkedin: "https://www.linkedin.com/in/sreehari-k-a-9310b7386/",
    instagram: "https://www.instagram.com/_sreehari._13/",
    companion: "cat-pop-gamer",
    companionScale: 0.35,
    tilt: "-rotate-[1.4deg]",
  },
  {
    name: "Ram Madhav R Kammath",
    tagline: "crafting the aesthetics.",
    image: "/assets/team/ram madhav.jpg",
    imagePosition: "center 22%",
    linkedin: "https://www.linkedin.com/in/ram-madhav-r-kammath-b21150349/",
    // no Instagram: the account is deactivated
    companion: "cat-pop-artist",
    companionScale: 0.35,
    tilt: "rotate-[2.2deg]",
  },
  {
    name: "Sreenanda K Sahajan",
    tagline: "calm amidst the storm.",
    image: "/assets/team/sreenanda k sahajan.jpg",
    imagePosition: "center 30%",
    linkedin: "https://www.linkedin.com/in/sreenanda-k-sahajan-484274375/",
    instagram: "https://www.instagram.com/_sreenandaaa_/",
    companion: "cat-pop-sleepy",
    companionScale: 0.35,
    tilt: "-rotate-[1.8deg]",
  },
  {
    name: "Rosphil Maria",
    tagline: "debugging the universe.",
    image: "/assets/team/rosphil mariya.jpg",
    imagePosition: "center 20%",
    linkedin: "https://www.linkedin.com/in/rosphil-maria-ros310707/",
    instagram: "https://www.instagram.com/rosphilmaria/",
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

/**
 * 07 — FAQ. A `tba` answer is set dimmed. An `action` without an href shows
 * the coming-soon toast; give it the href once the page it points at exists.
 */
export const FAQ: { q: string; a: string; tba?: boolean; action?: { label: string; href?: string } }[] = [
  { q: "When and where is BOO! 2026?", a: "BOO! 2026 takes place on October 24, 2026 at Adi Shankara Institute of Engineering and Technology, Kerala. The event kicks off at 2:00 PM and runs overnight into the morning of October 25." },
  { q: "Who can participate?", a: "BOO! 2026 is currently open to students of Adi Shankara Institute of Engineering and Technology (ASIET)." },
  { q: "Team size?", a: "Teams are made up of 2 people. Find your partner, pick your poison, and build something unforgettable." },
  { q: "What can we build?", a: "Pretty much anything. Software, AI, games, hardware, robotics, electronics, interactive experiences, weird experiments... Build something that makes someone go “WHAT THE HELL?”, jump, freeze, laugh nervously, get curious, feel uneasy, or wonder how the hell you pulled it off." },
  { q: "Do we need to be from ASIET?", a: "For the current edition, yes. BOO! 2026 is currently limited to ASIET students." },
  { q: "Is there a registration fee?", a: "Yep. Registration is currently ₹200 per team of two. That's ₹100 each for a full night of questionable decisions." },
  { q: "Will food and accommodation be provided?", a: "Food will be provided during the overnight event. Since BOO! takes place on campus and runs through the night, separate accommodation or sleeping facilities will not be provided. If you need a place to stay before the event, you'll need to make your own arrangements." },
  { q: "What should we bring?", a: "Bring your laptop, charger, whatever hardware or tools your project needs, and anything else you need to survive a long night of building. Don't forget your ID and your teammate." },
  { q: "What about the non-coding events?", a: "BOO! isn't just about sitting in a lab and staring at your screen. Throughout the night, there'll be a haunted house, a treasure hunt inside it, and spooky midnight activities to break up the build." },
  {
    q: "Where can we find the event guidelines?",
    a: "Detailed event guidelines, judging criteria, submission requirements, safety information, and other important details will be available through the registration portal.",
    // no href until the registration portal exists
    action: { label: "View guidelines" },
  },
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
      { label: "Register", href: EVENT.registerHref },
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

/** None of these pages exist yet — without an href each shows the coming-soon toast. */
export const FOOTER_LEGAL: { label: string; href?: string }[] = [
  { label: "Privacy Policy" },
  { label: "Terms of Service" },
  { label: "Code of Conduct" },
];

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
