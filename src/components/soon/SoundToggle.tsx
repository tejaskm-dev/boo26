"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion, whenOpen } from "@/lib/motion";
import { isTouch } from "@/lib/tier";
import { listenForFirstTap, setSound, soundWanted, subscribeSound } from "./sound";

/*
 * The site's own button, the melted slab "Come closer" is made of
 * (BlobButton): the same two shapes, the same melt on hover, the same glow.
 * Sound on, it breathes between them on its own.
 */
const REST =
  "M6 36C6 16 20 7 44 6C78 5 96 15 120 15C144 15 162 5 196 6C220 7 234 16 234 36C234 56 220 65 196 66C162 67 144 57 120 57C96 57 78 67 44 66C20 65 6 56 6 36Z";
const HOVER =
  "M3 36C3 12 21 3 44 2C78 1 96 8 120 8C144 8 162 1 196 2C219 3 237 12 237 36C237 60 219 69 196 70C162 71 144 64 120 64C96 64 78 71 44 70C21 69 3 60 3 36Z";

/**
 * The sound switch, in the bottom corner — the site's lime slab, saying
 * SOUND ON or SOUND OFF, with a little wave of bars that lies flat until
 * there's sound and won't keep still while there is.
 *
 * The sound's on by default, but a browser won't play any before the
 * visitor's first tap or click — so until then the switch says SOUND ON with
 * its bars still, and a note above it says so ("tap anywhere for sound") for
 * a few seconds after the page opens. That first tap anywhere starts it; a
 * tap on the switch before then starts it too (it already says on), and
 * once it's playing, the switch turns it off.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  /** the note: how you'd start it here (a tap, or a click), while it's showing */
  const [hint, setHint] = useState<"tap" | "click" | null>(null);
  const root = useRef<HTMLButtonElement>(null);
  const shape = useRef<SVGPathElement>(null);
  const glow = useRef<HTMLSpanElement>(null);

  useEffect(() => subscribeSound(setOn), []);
  // on, from the first tap anywhere
  useEffect(() => listenForFirstTap(), []);

  useEffect(() => {
    let off = 0;
    const stop = whenOpen(() => {
      setHint(isTouch() ? "tap" : "click");
      off = window.setTimeout(() => setHint(null), 6500);
    });
    return () => {
      stop();
      window.clearTimeout(off);
    };
  }, []);

  // the melt on hover, as BlobButton does it
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const enter = () => {
      gsap.to(shape.current, { attr: { d: HOVER }, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      gsap.to(glow.current, { opacity: 0.9, scale: 1.2, duration: 0.55, ease: "power3.out" });
    };
    const leave = () => {
      gsap.to(shape.current, { attr: { d: REST }, duration: 0.75, ease: "elastic.out(1, 0.65)", overwrite: "auto" });
      gsap.to(glow.current, { opacity: 0.35, scale: 1, duration: 0.6, ease: "power3.out" });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
    };
  }, []);

  // sound on: the slab breathes, slowly, and the glow with it
  useEffect(() => {
    const g = glow.current;
    if (!on || !g || prefersReducedMotion()) return;
    const breathe = gsap.to(g, { opacity: 0.75, scale: 1.25, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true });
    return () => {
      breathe.kill();
      gsap.to(g, { opacity: 0.35, scale: 1, duration: 0.4 });
    };
  }, [on]);

  return (
    <div className="soon-sound" data-sound="">
      <p className={`soon-sound-hint hand ${hint && !on && soundWanted() ? "is-shown" : ""}`} aria-hidden="true">
        {hint ?? "tap"} anywhere for sound
      </p>
      <button
        ref={root}
        type="button"
        onClick={() => {
          setHint(null);
          // nothing playing yet (or turned off): start it; playing: stop it
          void setSound(!on);
        }}
        aria-pressed={on}
        aria-label={on ? "Turn the sound off" : "Turn the sound on"}
        className="group relative isolate inline-flex cursor-pointer items-center justify-center px-5 py-3 outline-none md:px-6 md:py-3.5"
      >
        <span
          ref={glow}
          aria-hidden="true"
          className="pointer-events-none absolute inset-[16%] -z-10 rounded-[50%] bg-lime opacity-35 blur-2xl"
        />
        <svg viewBox="0 0 240 72" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full">
          <path ref={shape} d={REST} fill="var(--color-lime)" />
        </svg>
        <span className="label relative flex items-center gap-2.5 whitespace-nowrap text-[0.62rem] text-ink group-focus-visible:underline group-focus-visible:underline-offset-4 md:text-[0.68rem]">
          <span className="soon-bars" data-on={on ? "true" : "false"} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          {on || soundWanted() ? "Sound on" : "Sound off"}
        </span>
      </button>
    </div>
  );
}
