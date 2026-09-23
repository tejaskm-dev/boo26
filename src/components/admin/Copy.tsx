"use client";

import { useState } from "react";

/**
 * The one piece of JavaScript on the dashboard: copying a code or an invite
 * link, which a phone can't do from selected text in a hurry.
 */
export default function Copy({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          return;
        }
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
      className="label cursor-pointer text-bone/55 underline decoration-bone/25 underline-offset-4 outline-none transition-colors duration-200 hover:text-lime hover:decoration-lime focus-visible:text-lime"
    >
      {done ? "Copied" : label}
    </button>
  );
}
