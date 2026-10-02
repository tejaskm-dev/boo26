import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/hero/Hero";
import Footer from "@/components/site/Footer";
import SoonChrome from "@/components/soon/SoonChrome";
import Heard from "@/components/soon/Heard";
import InTheDark from "@/components/soon/InTheDark";
import ThePoint from "@/components/soon/ThePoint";
import NotYet from "@/components/soon/NotYet";
import Eggs from "@/components/soon/Eggs";
import JumpScareHost from "@/components/soon/JumpScare";
import HoverNotes from "@/components/soon/HoverNotes";
import SoundToggle from "@/components/soon/SoundToggle";
import SoundStage from "@/components/soon/SoundStage";
import Peeker from "@/components/soon/Peeker";
import Dread from "@/components/soon/Dread";
import ScrollHealth from "@/components/soon/ScrollHealth";
import Awake from "@/components/soon/Awake";
import Waiting from "@/components/soon/Waiting";
import MuLearn from "@/components/soon/MuLearn";
import Banner from "@/components/soon/Banner";
import { EyeGlow } from "@/components/soon/InkEyes";
import { SOON } from "@/lib/soon";
import { LEGAL } from "@/lib/site";
import { siteLive } from "@/lib/live";
import "@/components/soon/soon.css";

export const metadata: Metadata = {
  title: SOON.meta.title,
  description: SOON.meta.description,
  openGraph: { title: SOON.meta.title, description: SOON.meta.description, type: "website" },
};

/** only the privacy policy: the terms and the code of conduct describe the night */
const LEGAL_SOON = LEGAL.filter((l) => l.href === "/privacy");

/**
 * The coming-soon teaser. While LIVE_STATUS isn't true, "/" serves this page
 * (next.config.ts), and the address stays "/".
 *
 * Its own page on purpose: it loads only its own sections, so it never
 * downloads the full site's — and none of the full site's words are bundled
 * with it (see src/lib/brand.ts). Everything it says is in src/lib/soon.ts.
 *
 * In `next dev` it's always here at /soon, so it can be worked on while the
 * full site is the one on "/". In a production build with the site live, it
 * doesn't exist.
 */
export default function SoonPage() {
  if (siteLive() && process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <EyeGlow />
      <SoonChrome />
      <main className="relative overflow-x-clip">
        <Hero format={SOON.format} facts={SOON.hero.facts} cta={SOON.hero.cta} next={SOON.hero.next} />
        <Heard />
        <InTheDark />
        <ThePoint />
        <NotYet />
      </main>
      <Footer content={{ ...SOON.footer, legal: LEGAL_SOON }} mark={<MuLearn className="w-[clamp(4.8rem,6vw,5.8rem)]" />} />
      <Eggs />
      <JumpScareHost />
      <HoverNotes />
      <SoundToggle />
      <Waiting />
      <Banner />
      <SoundStage />
      <Peeker />
      <Dread />
      <ScrollHealth />
      {/* the hero is the full site's: this marks it awake, so its loops rest off screen */}
      <Awake target="#top" />
      {/* for anyone reading the source */}
      <div hidden dangerouslySetInnerHTML={{ __html: "<!-- stop reading the source. (keep going.) -->" }} />
    </>
  );
}
