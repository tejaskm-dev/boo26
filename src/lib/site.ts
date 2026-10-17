import type { SpriteName } from "./sprites";
import type { HeroFact } from "@/components/hero/Hero";
import type { FooterContent } from "@/components/site/Footer";
import { BRAND, SOCIALS } from "./brand";

/**
 * The full site's words. Everything dated lives here, and the pieces the
 * coming-soon teaser shares with the full site (the hero, the menu, the
 * footer, the loading screen) are handed it as props by the full site's own
 * pages — so none of it is ever bundled into the teaser. What doesn't date
 * anything (name, venue, host, the channels) is in brand.ts.
 */
export const EVENT = {
  ...BRAND,
  date: "24–25 OCT 2026",
  dateLong: "24–25 October 2026",
  format: "HALLOWEEN-NIGHT CREATIVE TECHNOLOGY HACKATHON",
  /* No number on purpose: the schedule can still move, and "overnight"
     stays true whichever way it does. */
  duration: "OVERNIGHT",
  team: "2 PER TEAM",
  /* 05 PM on the day, which is when the timeline's first stop opens the doors
     (check-in; the build starts at 6). Kerala is UTC+5:30 and the offset is
     written out so the countdown means the same thing from anywhere. */
  startsAt: "2026-10-24T17:00:00+05:30",
  /* the next morning, once the last stop on the timeline is over */
  endsAt: "2026-10-25T09:30:00+05:30",
} as const;

/**
 * What search results and share cards say about the full site. The rest —
 * the address, the card, the structured data — is built in src/lib/seo.ts.
 */
export const SEO = {
  title: `${EVENT.name} ${EVENT.year} · Halloween-night hackathon at ASIET, Kalady`,
  description: `An overnight Halloween-night hackathon at ASIET, Kalady, on ${EVENT.dateLong}. Teams of two, one night, one prompt. Make it to morning.`,
  /** the share card's line */
  share: `Most hackathons start with a problem. ${EVENT.name} starts with a nightmare. ${EVENT.dateLong}, ASIET Kalady.`,
  keywords: [
    "hackathon",
    "Halloween hackathon",
    "overnight hackathon",
    "creative technology hackathon",
    "student hackathon",
    "hackathon in Kerala",
  ],
};

export { SOCIALS };

/**
 * The running bands. Facts only — the point of a band is that the answer to
 * "when", "where" and "how long" is never more than a screen away.
 */
export const BAND = [
  "24 OCT, 5 PM",
  "ASIET, KALADY",
  "OVERNIGHT",
  "2 PER TEAM",
  "µLEARN ASIET",
] as const;

export type NavItem = { label: string; index: string; href: string };

export const NAV: NavItem[] = [
  { label: "The Night", index: "01", href: "#night" },
  { label: "Experience", index: "02", href: "#experience" },
  { label: "No Sleep", index: "03", href: "#hours" },
  { label: "After Dark", index: "04", href: "#after-dark" },
  { label: "The People", index: "05", href: "#team" },
  { label: "Build", index: "06", href: "#build" },
  { label: "FAQ", index: "07", href: "#faq" },
];

/** The hero's words — see src/components/hero/Hero.tsx. */
export const HERO: {
  format: string;
  facts: HeroFact[];
  cta: { label: string; href: string };
  next: { href: string; label: string };
} = {
  format: EVENT.format,
  facts: [
    { text: EVENT.date },
    { text: EVENT.duration, phoneOnly: true },
    { text: EVENT.venue },
    { text: EVENT.team, phoneOnly: true },
  ],
  cta: { label: "Register now", href: EVENT.registerHref },
  next: { href: "#night", label: "Skip to The Night" },
};

/** The loading screen's corners — see src/components/fx/PageWipe.tsx. */
export const PRELOADER = { corner: EVENT.date, venue: EVENT.venue, line: EVENT.format };

/** 01 — THE NIGHT */
export const FACTS = [
  // non-breaking spaces, so a narrow column breaks after the comma and never inside "5 PM"
  { k: "Doors open", v: "24 OCT, 5 PM" },
  { k: "Duration", v: "OVERNIGHT" },
  { k: "Team size", v: "2 PEOPLE" },
  { k: "Venue", v: "ASIET, KALADY" },
] as const;

/** 02 — THE EXPERIENCE */
export const EXPERIENCE = [
  { index: "01", label: "Build", note: "One prompt. One night. Build whatever it takes to make it out alive." },
  { index: "02", label: "Play", note: "Step away from the build. A midnight carnival, and what's in it stays a secret." },
  { index: "03", label: "Survive", note: "Make it to morning. Then show the jury what kept you alive." },
] as const;

/**
 * 03 — NO SLEEP. The organisers' plan, which can still move: check-in at 5,
 * the build from 6, dinner, the carnival from 9 to midnight, then building
 * till submissions close at 7, judging at 8 and the winners by 9:30. 3 AM
 * isn't on the plan. It happens anyway.
 *
 * `scale` is for the one cat whose art is drawn smaller than the rest.
 */
export const TIMELINE: { time: string; label: string; cat: SpriteName; scale?: number }[] = [
  { time: "05 PM", label: "The doors open", cat: "cat-excited" },
  { time: "06 PM", label: "The build begins", cat: "cat-stretch" },
  { time: "08 PM", label: "Dinner", cat: "cat-playful" },
  { time: "09 PM", label: "Midnight carnival", cat: "cat-skeleton", scale: 0.78 },
  { time: "03 AM", label: "Questionable decisions", cat: "cat-confused" },
  { time: "07 AM", label: "Pens down", cat: "cat-sleepy" },
  { time: "08 AM", label: "Who made it?", cat: "cat-box" },
];

/**
 * 04 — AFTER DARK. One scene now: the midnight carnival, the stretch of the
 * night (9 PM to midnight) set aside for not building. What's in it isn't
 * decided yet, so the copy keeps it loose and promises nothing specific —
 * no house, no hunt, no particular game.
 */
export const AFTER_DARK = {
  index: "01",
  title: ["Midnight", "Carnival"],
  note: "Late in the night.\nLeave the build.\nThe rest? A secret.",
  cta: "Let's go",
  aside: "The bugs\nwill wait.",
} as const;

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
    // deactivated for now; he's reactivating it before the event
    instagram: "https://www.instagram.com/m_dh_v.r_m/",
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
  { index: "01", label: "Idea", note: "Read the prompt" },
  { index: "02", label: "Build", note: "Make it real" },
  { index: "03", label: "Break", note: "Before it breaks you" },
  { index: "04", label: "Ship", note: "Make it to morning", lime: true },
];

/**
 * 07 — FAQ. A `tba` answer is set dimmed. An `action` without an href shows
 * the coming-soon toast; give it the href once the page it points at exists.
 */
export const FAQ: { q: string; a: string; tba?: boolean; action?: { label: string; href?: string } }[] = [
  { q: "When and where is BOO! 2026?", a: "BOO! 2026 takes place on October 24, 2026 at Adi Shankara Institute of Engineering and Technology, Kerala. The doors open at 5:00 PM, the build starts at 6:00 PM, and it runs overnight into the morning of October 25." },
  { q: "Who can participate?", a: "BOO! 2026 is currently open to students of Adi Shankara Institute of Engineering and Technology (ASIET)." },
  { q: "Team size?", a: "Teams are made up of 2 people. Rule one of every horror movie: never split up. Find your partner and stick together all night." },
  { q: "What can we build?", a: "Pretty much anything. Software, AI, games, hardware, robotics, electronics, weird experiments... There's one prompt, and you'll get it before the night. We can't say more yet. Just think about what you'd need to make it out alive." },
  { q: "Do we need to be from ASIET?", a: "For the current edition, yes. BOO! 2026 is currently limited to ASIET students." },
  { q: "Is there a registration fee?", a: "Yep. Registration is currently ₹200 per team of two. That's ₹100 each for a full night of questionable decisions." },
  { q: "Will food and accommodation be provided?", a: "Food, yes: dinner, midnight snacks and coffee to keep you going. Since BOO! takes place on campus and runs through the night, separate accommodation or sleeping facilities will not be provided. If you need a place to stay before the event, you'll need to make your own arrangements." },
  { q: "What should we bring?", a: "Bring your laptop, charger, whatever hardware or tools your project needs, and anything else you need to survive a long night of building. Don't forget your ID and your teammate. We'll get you on the Wi-Fi at check-in." },
  { q: "What about the non-coding events?", a: "BOO! isn't just about sitting in a lab and staring at your screen. Late in the night there's a midnight carnival to break up the build. What's in it? That stays a secret for now." },
  { q: "How does judging work?", a: "Submissions close at 7:00 AM, and that's a hard deadline: your repo, your pitch deck and a live link. Then the jury comes to your table for a live demo, a look at your code, and a few questions." },
  { q: "Do we get anything for surviving?", a: "Everyone who takes part gets a participation certificate, and the winners get prizes, handed out at the closing ceremony in the morning." },
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
      { label: "No Sleep", href: "#hours" },
      { label: "FAQ", href: "#faq" },
      { label: "Register", href: EVENT.registerHref },
    ],
  },
  {
    title: "The Experience",
    links: [
      { label: "Dusk till Dawn", href: "#hours" },
      { label: "After Dark", href: "#after-dark" },
      { label: "The Hackathon", href: "#build" },
    ],
  },
] as const;

/** The fine print: the footer's legal line, and the close of each of these pages. */
export const LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Code of Conduct", href: "/code-of-conduct" },
] as const;

/** the date on all three, until one of them changes on its own */
export const LEGAL_UPDATED = "17 Oct 2026";

/** Handwritten margin notes, kept in one place so they stay rationed. */
export const NOTES = {
  scroll: "Scroll\nif you dare",
  night: "One challenge:\nmake it to\nmorning.",
  hours: "A hackathon\nthat stays\nup late.",
  hoursAside: "Ideas sleep\nlater here.",
  survive: "Good ideas\nsurvive.",
  /** offered beside the Experience queue to a reader who stops mid-stack */
  more: "Keep scrolling",
  afterDark: "Meanwhile,\nthe campus\nwakes up.",
  build: "Weird ideas\nwelcome.",
  faq: "Questions?\nWe got you.",
  faqAside: "Still have\nquestions?\nReach out at\nour Discord!",
  ready: "Bring an idea.\nWe'll bring\nthe night.",
  footer: "Don't come alone.",
  footerLeft: "Made by dreamers\nfor the weird ones.",
  desk: "Find the\nway out.\nWork\nbackwards.",
  sign: "Good people\nscarier ideas.",
} as const;

/**
 * The full site's jokes (src/components/site/Survival.tsx) and the page the
 * console points to (/exit). Each one hints at what the night's prompt is
 * about — a horror story you're stuck in, and what you'd build to get out of
 * it — without saying so: the prompt says it, when it drops. Each fires at
 * most once a page load, one at a time, and only when something sets it off.
 */
export const SURVIVAL = {
  console: {
    cat: ["you opened the console.", "checking for exits? smart."],
    rules: [
      "rules for surviving a horror movie:",
      "  1. never split up. (that’s why teams are two.)",
      "  2. never say “i’ll be right back.”",
      "  3. keep your phone charged.",
      "  4. no way out? build one.",
    ],
    hint: "psst: /exit",
  },
  /** the tab's title while you're away from it */
  away: "don’t go out there.",
  back: "you came back. most don’t.",
  idle: "standing still never works in the movies.",
  fast: "never run in a horror movie. that’s when you trip.",
  /** past midnight, on the visitor's own clock */
  late: "up this late? you’d survive the first act.",
  /** a low battery, where the browser says (Chrome, Edge, Android) */
  battery: (pct: number) => `${pct}% battery. in a horror movie, that’s how it starts.`,
  konami: "+30 lives. you’re going to need them.",
  /** Escape, with no menu open to close */
  pause: "there’s no pause menu tonight.",
  /** typed anywhere on the page */
  typed: {
    help: "no one’s coming. build something.",
    exit: "the doors are locked. try building a way out.",
    escape: "the doors are locked. try building a way out.",
    save: "no save points tonight.",
  } as Record<string, string>,
  /** the cat on the logo, poked three times */
  lockup: "it knows the way out. it’s not telling.",
  /** after the lights go out (the wordmark seven times, or the code) */
  lights: "you’d need a flashlight. or you could build one.",
  end: "you made it to the end. the night is longer.",
  /** the hidden page */
  exit: {
    heading: "There’s no\nexit.",
    note: "you’ll have to build one.",
    after: "bring a teammate.",
    back: "Back inside",
  },
};

/** Everything the footer says — see src/components/site/Footer.tsx. */
export const FOOTER: FooterContent = {
  kicker: "Build\nbreak\nhaunt\nrepeat.",
  statement: "See you at",
  sub: "Come make it\nout alive.",
  updates: {
    title: "Don\u2019t miss updates",
    note: "Event updates, announcements and a few spooky surprises. No spam, promise.",
  },
  nav: FOOTER_NAV,
  details: {
    title: "Event details",
    rows: [
      ["Where", EVENT.venueLong],
      ["When", EVENT.dateLong],
      ["Runs", "Overnight, from 5 PM"],
      ["Teams", "2 per team"],
    ],
  },
  credit: { before: `A hackathon by the ${EVENT.name} core team\nunder the `, after: " banner" },
  legal: LEGAL,
  desk: NOTES.desk,
  sign: NOTES.footer,
};
