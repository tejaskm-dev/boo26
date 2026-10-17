"use client";

import { useRef, useState } from "react";
import GlitchWord from "@/components/fx/GlitchWord";
import { useBacktrack } from "@/components/fx/backtrack";

/**
 * The Night's one line, with its last word that won't hold still — and, for
 * one frame now and then, says what it really is. Come back up to it after
 * going all the way past and it's grown a sentence.
 */
export default function NightLine({ name, back }: { name: string; back: string }) {
  const el = useRef<HTMLParagraphElement>(null);
  const [after, setAfter] = useState(false);
  useBacktrack(el, () => setAfter(true));
  return (
    <p ref={el} data-anim="rise" className="display max-w-[16ch] text-[clamp(1.35rem,2.6vw,2.15rem)] leading-[1.12]">
      Most hackathons start with a problem. {name}&nbsp;starts with a <GlitchWord text="nightmare." alt="horror movie." />
      {after ? <span className="block text-ink/45">{back}</span> : null}
    </p>
  );
}
