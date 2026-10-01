"use client";

import { useEffect, useState } from "react";
import { whenOpen } from "@/lib/motion";
import { setSound, subscribeSound } from "./sound";

/**
 * The sound switch, in the bottom corner, off to begin with. For the first
 * few seconds after the page opens, a note says it's worth turning on.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const [hint, setHint] = useState(false);

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
        className="soon-sound-btn label"
        data-cursor
      >
        <span className="soon-eq" data-on={on ? "true" : "false"} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        {on ? "Sound on" : "Sound off"}
      </button>
    </div>
  );
}
