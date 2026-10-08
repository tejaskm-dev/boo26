import type { Metadata } from "next";
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
import JsonLd from "@/components/site/JsonLd";
import { siteLive } from "@/lib/live";
import { EVENT, FOOTER, HERO, SEO } from "@/lib/site";
import { ALSO, KEYWORDS, NAME, ORG_ID, PLACE, SHARE_IMAGE, absolute, pageMeta, siteGraph } from "@/lib/seo";

// (while the teaser is up this page is only ever built as a 404, so it says
// nothing of its own and carries the teaser's words from the layout)
export const metadata: Metadata = !siteLive()
  ? {}
  : pageMeta({ title: SEO.title, description: SEO.description, share: SEO.share, path: "/", keywords: [...KEYWORDS, ...SEO.keywords] });

/** the night itself, for search: what, when, where, and who's behind it */
const NIGHT = {
  "@type": "Event",
  "@id": absolute("/#event"),
  name: NAME,
  alternateName: ALSO,
  description: SEO.description,
  url: absolute("/"),
  image: [SHARE_IMAGE],
  startDate: EVENT.startsAt,
  endDate: EVENT.endsAt,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: PLACE,
  organizer: { "@id": ORG_ID },
  inLanguage: "en",
};

export default function Page() {
  // While the teaser is up, "/" is rewritten to it and never reaches this
  // page. Not rendering it at all means no copy of the dated page is built
  // to be found some other way.
  if (!siteLive()) notFound();

  return (
    <>
      <JsonLd graph={[...siteGraph(SEO.description), NIGHT]} />
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
