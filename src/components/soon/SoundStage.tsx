"use client";

import { useEffect } from "react";
import { scene, type Scene } from "./sound";

const SCENES: [string, Scene][] = [
  ["#heard", "heard"],
  ["#dark", "room"],
  ["#point", "point"],
  ["#not-yet", "finale"],
];

/**
 * Tells the score where you are: whichever section is across the middle of
 * the screen sets the scene (see sound.ts). One observer, on a line through
 * the middle of the viewport; nothing runs while you scroll.
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
    return () => io.disconnect();
  }, []);
  return null;
}
