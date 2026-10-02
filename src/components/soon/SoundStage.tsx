"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/lenis";
import { flow, scene, type Scene } from "./sound";

const SCENES: [string, Scene][] = [
  ["#heard", "heard"],
  ["#dark", "room"],
  ["#point", "point"],
  ["#not-yet", "finale"],
];

/**
 * Tells the score where you are and how you're moving: whichever section is
 * across the middle of the screen sets the scene (one observer, on a line
 * through the middle of the viewport), and the scroll's speed moves the
 * wind (see sound.ts). When the scroll stops, the wind settles on its own.
 */
export default function SoundStage() {
  useEffect(() => {
    const on = new Set<Scene>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const s = (e.target as HTMLElement).dataset.scene as Scene;
          if (e.isIntersecting) on.add(s);
          else on.delete(s);
        }
        const now = SCENES.map(([, s]) => s).find((s) => on.has(s));
        scene(now ?? "none");
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const [sel, s] of SCENES) {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) continue;
      el.dataset.scene = s;
      io.observe(el);
    }
    let still = 0;
    const onScroll = ({ velocity }: { velocity: number }) => {
      flow(velocity);
      window.clearTimeout(still);
      still = window.setTimeout(() => flow(0), 160);
    };
    // the smooth scroll starts up after this does (its effect is the layout's)
    let lenis = getLenis();
    const wait = window.setTimeout(() => {
      lenis ??= getLenis();
      lenis?.on("scroll", onScroll);
    }, 0);
    return () => {
      io.disconnect();
      window.clearTimeout(wait);
      lenis?.off("scroll", onScroll);
      window.clearTimeout(still);
    };
  }, []);
  return null;
}
