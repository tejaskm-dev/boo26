"use client";

import { useRef } from "react";
import { useGlitch } from "@/components/soon/glitch";

/**
 * A word that won't hold still: the teaser's torn lines (soon/glitch.ts),
 * for one word inside a sentence. Now and then — soon after it comes into
 * view, then at odd intervals, and whenever it's pointed at — it tears into
 * bands with a bone ghost, goes hollow, or for a single frame says something
 * else (`alt`). Between glitches nothing runs and nothing is drawn twice.
 */
export default function GlitchWord({ text, alt, min = 6000, max = 11000 }: { text: string; alt: string; min?: number; max?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  useGlitch(el, min, max);
  return (
    <span ref={el} className="fx-slices inline-block">
      <span className="fx-slice-row inline-block align-bottom">
        <span data-text={text} data-alt={alt} className="fx-slice inline-block text-center">
          {text}
        </span>
      </span>
    </span>
  );
}
