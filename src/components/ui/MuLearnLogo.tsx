"use client";

import { useRef, useState, useId } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  className?: string;
  href?: string;
};

/**
 * The logo's own holes, as percentages of its viewBox (45 138 1945 524) —
 * the eye of the 'e' and the bowl of the 'a'.
 */
const HOLES = {
  e: { x: 37.89, y: 14.31, w: 8.59, h: 11.84 },
  a: { x: 55.84, y: 14.89, w: 9.82, h: 36.45 },
} as const;

/**
 * A cat's eye for each hole:
 * - A squint for the 'e' slot (100x37)
 * - A rounder eye for the 'a' bowl (100x100)
 */
const EYE = {
  e: {
    box: "0 0 100 37",
    lid: "M3 18.5C25 1 75 1 97 18.5 75 36 25 36 3 18.5Z",
    cx: 50,
    cy: 18.5,
    rx: 5.5,
    ry: 14,
    reach: [26, 4] as const,
  },
  a: {
    box: "0 0 100 100",
    lid: "M6 50C20 13 80 13 94 50 80 87 20 87 6 50Z",
    cx: 50,
    cy: 50,
    rx: 8,
    ry: 29,
    reach: [22, 12] as const,
  },
} as const;

/**
 * µLearn ASIET logo for the navbar — adaptive to the underlying field tone
 * (ink on bone, bone on ink) through `var(--head-fg-right)`.
 *
 * On hover, the lime eyes hidden inside the 'e' and 'a' slowly open and peer
 * out, following the pointer.
 */
export default function MuLearnLogo({ className = "", href }: Props) {
  const uid = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const pupils = useRef<{ e?: SVGGElement | null; a?: SVGGElement | null }>({});

  const onPointerMove = (e: React.PointerEvent) => {
    if (prefersReducedMotion() || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(1, dist / (rect.width * 0.5));

    (["e", "a"] as const).forEach((k) => {
      const g = pupils.current[k];
      if (!g) return;
      const [rx, ry] = EYE[k].reach;
      const tx = ((dx / dist) * pull * rx).toFixed(1);
      const ty = ((dy / dist) * pull * ry).toFixed(1);
      g.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  };

  const onPointerLeave = () => {
    setHovered(false);
    (["e", "a"] as const).forEach((k) => {
      const g = pupils.current[k];
      if (g) g.style.transform = "translate(0px, 0px)";
    });
  };

  const content = (
    <span
      ref={root}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      className="relative block h-[clamp(1.35rem,2vw,1.85rem)] aspect-[1945/524] select-none"
    >
      {/* The logo vector letters rendered via mask with adaptive currentColor */}
      <span
        role="img"
        aria-label="µLearn ASIET"
        className="absolute inset-0 block bg-current transition-colors duration-300"
        style={{
          mask: 'url("/assets/mulearn-logo.svg") center / contain no-repeat',
          WebkitMask: 'url("/assets/mulearn-logo.svg") center / contain no-repeat',
        }}
      />

      {/* The glowing eyes hiding in the holes of 'e' and 'a', slowly opening on hover */}
      {(["e", "a"] as const).map((k) => (
        <span
          key={k}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: `${HOLES[k].x}%`,
            top: `${HOLES[k].y}%`,
            width: `${HOLES[k].w}%`,
            height: `${HOLES[k].h}%`,
          }}
        >
          <svg
            viewBox={EYE[k].box}
            className={`absolute left-1/2 top-1/2 overflow-visible origin-[50%_60%] -translate-x-1/2 -translate-y-1/2 transition-all ${
              k === "a" ? "delay-[75ms]" : "delay-0"
            } ${
              hovered
                ? "scale-y-100 opacity-100 duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                : "scale-y-[0.03] opacity-0 duration-[400ms] ease-in"
            }`}
            style={{
              width: k === "e" ? "95%" : "88%",
              height: k === "e" ? "92%" : "88%",
            }}
          >
            <defs>
              <filter id={`${uid}-glow-${k}`} x="-40%" y="-60%" width="180%" height="220%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={EYE[k].lid}
              fill="var(--color-lime)"
              filter={`url(#${uid}-glow-${k})`}
            />
            <g
              ref={(n) => {
                pupils.current[k] = n;
              }}
              data-pupil={k}
              className="transition-transform duration-200 ease-out"
            >
              <ellipse
                cx={EYE[k].cx}
                cy={EYE[k].cy}
                rx={EYE[k].rx}
                ry={EYE[k].ry}
                fill="#0b0b0b"
                className={`transition-all duration-300 ${hovered ? "scale-x-125" : "scale-x-100"}`}
                style={{ transformOrigin: `${EYE[k].cx}px ${EYE[k].cy}px` }}
              />
            </g>
          </svg>
        </span>
      ))}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        aria-label="µLearn ASIET"
        className={`group inline-flex items-center text-[var(--head-fg-right)] outline-none transition-colors duration-300 hover:text-lime focus-visible:text-lime ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={`group inline-flex items-center text-[var(--head-fg-right)] transition-colors duration-300 hover:text-lime ${className}`}
    >
      {content}
    </span>
  );
}
