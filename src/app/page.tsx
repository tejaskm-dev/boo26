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

export default function Page() {
  return (
    <>
      <SiteChrome />
      <main className="relative overflow-x-clip">
        <Hero />
        <TheNight />
        <TheExperience />
        <TwentyHours />
        <AfterDark />
        <ThePeople />
        <Build />
        <Faq />
        <Ready />
      </main>
      <Footer />
    </>
  );
}
