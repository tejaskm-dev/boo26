"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";
import { setSound, subscribeSound } from "./sound";

/*
 * A drop of the site's ink, with the lime hairline every field carries. All
 * four shapes share one command structure, so GSAP can move between them
 * the way BlobButton moves its slab — no morph plugin.
 */
const SHAPES = [
  "M8 32C8 17 17 8 32 8C47 8 56 17 56 32C56 47 47 56 32 56C17 56 8 47 8 32Z",
  "M7 31C8 15 19 7 33 9C47 10 57 18 55 33C54 48 45 57 31 55C17 54 6 46 7 31Z",
  "M9 33C7 18 16 9 31 7C46 6 57 15 57 31C57 46 48 56 33 57C18 57 10 48 9 33Z",
  "M8 30C10 16 20 8 34 8C48 9 56 19 56 33C55 47 44 56 30 56C16 55 7 44 8 30Z",
];
/** the sound inside it: flat, or a wave going one way and the other */
const FLAT = "M19 32C23 32 28 32 32 32C36 32 41 32 45 32";
const WAVE = ["M19 32C23 23 28 23 32 32C36 41 41 41 45 32", "M19 32C23 41 28 41 32 32C36 23 41 23 45 32"];

/**
 * The sound switch: a living drop of ink in the corner rather than a button.
 * Off, it sits still with a flat line through it. On, it breathes — the drop
 * slowly changing shape — and the line becomes a wave that won't stop
 * moving. For a few seconds after the page opens, a note says it's worth it.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const [hint, setHint] = useState(false);
  const body = useRef<SVGPathElement>(null);
  const echo = useRef<SVGPathElement>(null);
  const wave = useRef<SVGPathElement>(null);

  useEffect(() => subscribeSound(setOn), []);

  useEffect(() => {
    let off = 0;
    const stop = whenOpen(() => {
      setHint(true);
      off = window.setTimeout(() => setHint(false), 6500);
    });
    return () => {
      stop();
      window.clearTimeout(off);
    };
  }, []);

  // alive while it's on
  useEffect(() => {
    if (prefersReducedMotion()) {
      gsap.set(wave.current, { attr: { d: on ? WAVE[0] : FLAT } });
      return;
    }
    if (!on) {
      gsap.to([body.current, echo.current], { attr: { d: SHAPES[0] }, duration: 0.8, ease: "power3.out", overwrite: true });
      gsap.to(wave.current, { attr: { d: FLAT }, duration: 0.5, ease: "power3.out", overwrite: true });
      return;
    }
    const breathe = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 1.6, ease: "sine.inOut" } });
    breathe.to([body.current, echo.current], { attr: { d: SHAPES[1] } }).to([body.current, echo.current], { attr: { d: SHAPES[2] } }).to([body.current, echo.current], { attr: { d: SHAPES[3] } });
    const ripple = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 0.42, ease: "sine.inOut" } });
    ripple.fromTo(wave.current, { attr: { d: WAVE[0] } }, { attr: { d: WAVE[1] } });
    return () => {
      breathe.kill();
      ripple.kill();
    };
  }, [on]);

  return (
    <div className="soon-sound">
      <p className={`soon-sound-hint hand ${hint && !on ? "is-shown" : ""}`} aria-hidden="true">
        better with sound ↓
      </p>
      <button
        type="button"
        onClick={() => {
          setHint(false);
          void setSound(!on);
        }}
        aria-pressed={on}
        aria-label={on ? "Turn the sound off" : "Turn the sound on"}
        className="soon-blob"
        data-on={on ? "true" : "false"}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path ref={echo} d={SHAPES[0]} className="soon-blob-echo" />
          <path ref={body} d={SHAPES[0]} className="soon-blob-body" />
          <path ref={wave} d={FLAT} className="soon-blob-wave" />
        </svg>
        <span className="soon-blob-label hand">{on ? "sound on" : "sound off"}</span>
      </button>
    </div>
  );
}
