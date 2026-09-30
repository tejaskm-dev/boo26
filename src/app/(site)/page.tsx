import { notFound } from "next/navigation";
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
import { siteLive } from "@/lib/live";
import { FOOTER, HERO } from "@/lib/site";

export default function Page() {
  // While the teaser is up, "/" is rewritten to it and never reaches this
  // page. Not rendering it at all means no copy of the dated page is built
  // to be found some other way.
  if (!siteLive()) notFound();

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
