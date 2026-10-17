import SiteChrome from "@/components/site/SiteChrome";
import Hero from "@/components/hero/Hero";
import TheNight from "@/components/sections/TheNight";
import TheExperience from "@/components/sections/TheExperience";
import TwentyHours from "@/components/sections/TwentyHours";
import AfterDark from "@/components/sections/AfterDark";
import ThePeople from "@/components/sections/ThePeople";
import Build from "@/components/sections/Build";
import Faq from "@/components/sections/Faq";
import Ready from "@/components/sections/Ready";
import Footer from "@/components/site/Footer";
import { FOOTER, HERO } from "@/lib/site";

/**
 * The full site's home page, whole: "/" once LIVE_STATUS is on, and the
 * dashboard's preview of it before then (/admin/preview). One component, so
 * the preview can never drift from what goes live.
 */
export default function LiveHome() {
  return (
    <>
      <SiteChrome />
      <main className="relative overflow-x-clip">
        <Hero {...HERO} />
        <TheNight />
        <TheExperience />
        <TwentyHours />
        <AfterDark />
        <ThePeople />
        <Build />
        <Faq />
        <Ready />
      </main>
      <Footer content={FOOTER} />
    </>
  );
}
