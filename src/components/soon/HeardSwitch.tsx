"use client";

import { useEffect, useRef } from "react";
import { BACK } from "@/lib/soon";
import { onBacktrack } from "./backtrack";

/**
 * Come back up to the rumours after the room and they're not the same: the
 * rumours have turned, the cat in the pumpkin has gone, the leaked page has
 * changed its mind, and one of the black bars has something to say.
 * All of it swapped while it's still out of sight above you.
 *
 * Heard is drawn on the server, so this reaches into it once, for good —
 * nothing in there is ever drawn again to undo it.
 */
export default function HeardSwitch() {
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = mark.current?.closest("section");
    if (!section) return;
    return onBacktrack(section, () => {
      section.querySelectorAll<HTMLElement>("[data-whisper]").forEach((el, i) => {
        if (BACK.whispers[i]) el.textContent = BACK.whispers[i];
      });
      section.querySelector<HTMLElement>(".soon-pumpkin")?.setAttribute("data-gone", "true");
      window.dispatchEvent(new Event("soon:back:heard"));
    });
  }, []);

  return <span ref={mark} hidden />;
}
