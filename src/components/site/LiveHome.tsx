import SiteChrome from "@/components/site/SiteChrome";
import Hero from "@/components/hero/Hero";
import TheNight from "@/components/sections/TheNight";
import TheExperience from "@/components/sections/TheExperience";
import TwentyHours from "@/components/sections/TwentyHours";
import AfterDark from "@/components/sections/AfterDark";
import ThePeople from "@/components/sections/ThePeople";
import TheCrew from "@/components/sections/TheCrew";
import Build from "@/components/sections/Build";
import Faq from "@/components/sections/Faq";
import Ready from "@/components/sections/Ready";
import Footer from "@/components/site/Footer";
import Survival from "@/components/site/Survival";
import Notes from "@/components/fx/Notes";
import Nightfall from "@/components/fx/Nightfall";
import Peeker from "@/components/fx/Peeker";
import CornerEyes from "@/components/fx/CornerEyes";
import Watchers from "@/components/fx/Watchers";
import LivingEdges from "@/components/fx/LivingEdges";
import { GooFilter } from "@/components/fx/Goo";
import ScrollHealth from "@/components/soon/ScrollHealth";
import Awake from "@/components/soon/Awake";
import { EyeGlow } from "@/components/soon/InkEyes";
import { CREW, CREW_GHOSTS, CREW_WORDS, FOOTER, HERO, NAV, SURVIVAL, type TeamMember } from "@/lib/site";
import { teamMode } from "@/lib/team";
import "@/components/fx/fx.css";

/** the six the preview shows in the crew's place before their photos are in, one per ghost */
const STAND_INS: TeamMember[] = CREW_GHOSTS.map((companion, i) => ({
  name: CREW_WORDS.standIn.name,
  tagline: CREW_WORDS.standIn.tagline,
  companion,
  companionScale: 0.68,
  tilt: ["-rotate-[2deg]", "rotate-[1.4deg]", "-rotate-[1.2deg]", "rotate-[2deg]", "-rotate-[1.6deg]", "rotate-[1.2deg]"][i],
}));

/**
 * The full site's home page, whole: "/" once LIVE_STATUS is on, and the
 * dashboard's preview of it before then (/admin/preview). One component, so
 * the preview can never drift from what goes live.
 *
 * Which team it shows is TEAM_SECTION's (src/lib/team.ts): none, the core
 * team, or the core team and the crew. Leave the team out and the menu and
 * the section numbers close up round it.
 *
 * Round the sections, the page-wide things the teaser taught it, remade
 * without the sound (src/components/fx): the notes hidden on things, the
 * night falling as you scroll and the dawn at the end, the cat that peeks up
 * when you stop, the eyes in the corner while a scene holds the screen, the
 * eyes in the dark that watch you, and the edges between the fields moving
 * like the hero's ink. And the jokes (Survival.tsx).
 */
export default function LiveHome({ preview = false }: { preview?: boolean }) {
  const mode = teamMode();
  const team = mode > 0;
  const crew = mode === 2 ? (CREW.length ? CREW : preview ? STAND_INS : []) : [];
  const nav = team ? NAV : NAV.filter((n) => n.href !== "#team").map((n, i) => ({ ...n, index: String(i + 1).padStart(2, "0") }));
  const at = (href: string) => nav.find((n) => n.href === href)?.index ?? "";

  return (
    <>
      <SiteChrome items={nav} />
      <main className="relative overflow-x-clip">
        <Hero {...HERO} />
        <TheNight />
        <TheExperience />
        <TwentyHours />
        <AfterDark />
        {team ? <ThePeople index={at("#team")} /> : null}
        {crew.length ? <TheCrew members={crew} index={at("#team")} preview={!CREW.length} /> : null}
        <Build index={at("#build")} afterInk={!team || crew.length > 0} />
        <Faq index={at("#faq")} />
        <Ready />
      </main>
      <Footer content={FOOTER} lowDesk />
      <Survival />

      {/* the glow every pair of eyes sits in, and the goo every drip melts into: once each, for the page */}
      <EyeGlow />
      <GooFilter />
      <Notes />
      <Nightfall />
      <Peeker lines={SURVIVAL.peek} door={SURVIVAL.door} />
      <CornerEyes lines={SURVIVAL.wait} />
      <Watchers poke={SURVIVAL.poke} />
      <LivingEdges />
      <ScrollHealth />
      {/* the hero is shared with the teaser: this marks it awake, so its loops rest off screen */}
      <Awake target="#top" />
    </>
  );
}
