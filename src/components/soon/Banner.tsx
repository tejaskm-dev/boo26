"use client";

import { useEffect, useState } from "react";
import Sprite from "@/components/ui/Sprite";
import { prefersReducedMotion } from "@/lib/motion";
import { MU } from "@/lib/soon";
import MuLearn from "./MuLearn";
import { cue, say } from "./sound";
import { answer } from "./troll";

/**
 * "Under the µLearn banner" — literally. Two of the cat-bats tow a lime
 * banner with µLearn's logo on it across the top of the screen, once.
 *
 * It's sent for (a "soon:banner" event on window) by the third poke on any
 * of µLearn's logos (MuLearn.tsx), or by typing its name (Eggs.tsx). Not
 * more than once every few seconds; never with motion turned down. All of
 * it moves by transform, and it's gone from the page when it's gone from
 * the screen.
 */
export default function Banner() {
  const [flight, setFlight] = useState(0);

  useEffect(() => {
    let last = -Infinity;
    const send = () => {
      const now = performance.now();
      if (prefersReducedMotion() || now - last < 9000) return;
      last = now;
      setFlight((n) => n + 1);
      cue("musicbox");
      // a laugh as it comes over, then the line, as the toast says it
      say("banner");
      window.setTimeout(() => answer(MU.banner), 900);
    };
    window.addEventListener("soon:banner", send);
    return () => window.removeEventListener("soon:banner", send);
  }, []);

  if (!flight) return null;
  return (
    <div key={flight} className="soon-banner" aria-hidden="true" onAnimationEnd={(e) => e.target === e.currentTarget && setFlight(0)}>
      <div className="soon-banner-bob">
        <svg className="soon-banner-strings" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M12 22 25 37" />
          <path d="M57 16 93 37" />
        </svg>
        {/* its eyes open for the flight: slits, peering out of the holes */}
        <span className="soon-banner-cloth" data-mu-open="true">
          <MuLearn tone="ink" alive={false} className="w-[80%]" />
        </span>
        {[
          { left: "-2%", top: "-6%", width: "28%" },
          { left: "44%", top: "-10%", width: "25%" },
        ].map((at, i) => (
          <span key={i} className="soon-banner-bat" style={at}>
            {(["bat-up", "bat-level", "bat-down"] as const).map((frame) => (
              <span key={frame}>
                <Sprite name={frame} scale={0.4} style={{ width: "100%" }} />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
