"use client";

import { useRef, useState } from "react";
import { useBacktrack } from "./backtrack";

/**
 * A line that changes once: the first time you scroll back up to it after
 * going all the way past (backtrack.ts). It stays changed.
 */
export default function BackLine({ text, back, className = "" }: { text: string; back: string; className?: string }) {
  const el = useRef<HTMLParagraphElement>(null);
  const [after, setAfter] = useState(false);
  useBacktrack(el, () => setAfter(true));
  return (
    <p ref={el} className={className}>
      {after ? back : text}
    </p>
  );
}
