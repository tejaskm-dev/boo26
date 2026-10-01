"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { buzz } from "./troll";

/**
 * Makes a piece of artwork jump when it's poked. Nothing says it can be; it's
 * there for whoever tries. The jump is on this wrapper, so it never fights
 * the artwork's own drift and float.
 */
export default function Boing({
  children,
  className = "",
  hop = 30,
}: {
  children: React.ReactNode;
  className?: string;
  /** how high it goes, as a percentage of its own height */
  hop?: number;
}) {
  const poke = (el: HTMLElement) => {
    buzz(14);
    if (prefersReducedMotion() || typeof el.animate !== "function") return;
    el.animate(
      [
        { transform: "none" },
        { transform: "translateY(4%) scale(1.08, 0.9)", offset: 0.14 },
        { transform: `translateY(-${hop}%) rotate(-7deg) scale(0.96, 1.06)`, offset: 0.46 },
        { transform: "translateY(2%) scale(1.06, 0.94)", offset: 0.8 },
        { transform: "none" },
      ],
      { duration: 640, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" },
    );
  };
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={(e) => {
        // its own thing: whatever it's sitting on doesn't hear about it
        e.stopPropagation();
        poke(e.currentTarget);
      }}
      className={`block cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
