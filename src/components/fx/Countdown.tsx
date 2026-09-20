"use client";

import { useEffect, useRef } from "react";

/**
 * How long until the doors open.
 *
 * This is the one thing on the page that is different every time you look at
 * it, which is why it earns the empty measure it sits in — it is information
 * rather than decoration, and it makes the page feel like it is running.
 *
 * The digits are written straight into the DOM once a second rather than
 * through React state, so the tick never re-renders the tree around it. The
 * markup is rendered with dashes and filled in on mount: the server has no
 * idea what time it is where the visitor is, and rendering a real number there
 * would be a hydration mismatch.
 */
const UNITS = [
  { key: "days", label: "Days", ms: 86_400_000 },
  { key: "hours", label: "Hours", ms: 3_600_000 },
  { key: "minutes", label: "Minutes", ms: 60_000 },
  { key: "seconds", label: "Seconds", ms: 1000 },
] as const;

export default function Countdown({
  target,
  className = "",
}: {
  /** ISO 8601 with an explicit offset */
  target: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    if (Number.isNaN(end)) return;

    const write = () => {
      const el = root.current;
      if (!el) return;
      let left = Math.max(0, end - Date.now());
      for (const unit of UNITS) {
        const value = Math.floor(left / unit.ms);
        left -= value * unit.ms;
        const slot = el.querySelector<HTMLElement>(`[data-unit="${unit.key}"]`);
        const next = String(value).padStart(2, "0");
        if (slot && slot.textContent !== next) slot.textContent = next;
      }
    };

    write();
    // aligned to the second boundary so the digits turn over together
    let interval = 0;
    const align = window.setTimeout(() => {
      write();
      interval = window.setInterval(write, 1000);
    }, 1000 - (Date.now() % 1000));

    return () => {
      window.clearTimeout(align);
      window.clearInterval(interval);
    };
  }, [target]);

  return (
    <div
      ref={root}
      className={`flex flex-wrap items-end gap-[clamp(1.25rem,4vw,3.5rem)] ${className}`}
      role="timer"
      aria-label="Time until the doors open"
    >
      {UNITS.map((unit) => (
        <div key={unit.key} className="flex flex-col gap-[clamp(0.35rem,1vh,0.6rem)]">
          <span
            data-unit={unit.key}
            suppressHydrationWarning
            className="display block text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.82] tabular-nums tracking-[-0.03em]"
          >
            ––
          </span>
          <span className="label opacity-45">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
