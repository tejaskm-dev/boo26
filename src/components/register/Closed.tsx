import ComingSoon from "@/components/sections/ComingSoon";
import { siteLive } from "@/lib/live";
import { SOON } from "@/lib/soon";

/**
 * Every page under /register, until registration is open: the coming-soon
 * page — in the teaser's own words while the teaser is up (no date on the
 * band, and "not yet" rather than "coming soon").
 */
export default function Closed() {
  return (
    <main className="relative overflow-x-clip">
      {siteLive() ? <ComingSoon /> : <ComingSoon {...SOON.closed} />}
    </main>
  );
}
