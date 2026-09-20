"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Not a hamburger. A small organic blob with four dashes inside, lifted from
 * the supplied header reference — the same amoeba language as the background
 * fields, so the control reads as part of the identity rather than a UI icon.
 */
const REST =
  "M43.35 29.4C42.07 32.41 33.38 35.48 29.39 37.59C25.4 39.7 22.11 43.23 19.42 42.07C16.72 40.9 15.25 34.86 13.24 30.59C11.22 26.32 6.38 19.47 7.3 16.47C8.23 13.46 15.12 14.37 18.8 12.54C22.48 10.71 26.34 4.32 29.39 5.49C32.44 6.65 34.78 15.55 37.11 19.54C39.43 23.52 44.64 26.39 43.35 29.4Z";
const FLEX =
  "M43.2 31.14C41.45 33.98 32.27 34.44 27.66 36.29C23.04 38.15 18.02 43.57 15.52 42.28C13.02 41 14.36 32.27 12.64 28.6C10.93 24.92 4.09 22.99 5.24 20.24C6.39 17.49 15.35 14.43 19.55 12.1C23.76 9.76 27.38 5.04 30.48 6.23C33.58 7.42 36.02 15.08 38.14 19.23C40.26 23.38 44.94 28.3 43.2 31.14Z";

type Props = {
  onClick: () => void;
  expanded: boolean;
  className?: string;
};

export default function MenuTrigger({ onClick, expanded, className = "" }: Props) {
  const shape = useRef<SVGPathElement>(null);
  const dashes = useRef<SVGGElement>(null);
  const root = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const enter = () => {
      gsap.to(shape.current, { attr: { d: FLEX }, duration: 0.5, ease: "power3.out" });
      gsap.to(el, { rotate: -8, scale: 1.06, duration: 0.5, ease: "power3.out" });
      gsap.to(dashes.current, { scaleX: 0.7, duration: 0.4, ease: "power3.out", transformOrigin: "50% 50%" });
    };
    const leave = () => {
      gsap.to(shape.current, { attr: { d: REST }, duration: 0.6, ease: "elastic.out(1, 0.7)" });
      gsap.to(el, { rotate: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.6)" });
      gsap.to(dashes.current, { scaleX: 1, duration: 0.5, ease: "back.out(2)", transformOrigin: "50% 50%" });
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
    };
  }, []);

  return (
    <button
      ref={root}
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls="site-nav"
      aria-label="Open menu"
      className={`menu-trigger group relative grid h-12 w-12 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-transparent md:h-[3.25rem] md:w-[3.25rem] ${className}`}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible" aria-hidden="true">
        <path
          ref={shape}
          d={REST}
          fill="var(--trigger-fill)"
          stroke="var(--trigger-stroke)"
          strokeWidth="var(--trigger-weight)"
          strokeLinejoin="round"
        />
        <g ref={dashes} className="transition-opacity duration-300">
          {[
            [18.5, 21.5],
            [26.5, 21.5],
            [18.5, 27],
            [26.5, 27],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={5} height={1.9} rx={0.95} fill="var(--trigger-dash)" />
          ))}
        </g>
      </svg>
    </button>
  );
}
