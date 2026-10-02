/** The hero's narrowed cat eyes, drawn in a 134x68 box — the motif from the comps. */
export const EYES = [
  "M7 5 57 47C45 63 19 61 9 47 2 38 4 15 7 5Z",
  "M127 27 77 63C87 79 113 77 123 63 130 54 129 37 127 27Z",
];

/**
 * A pair of the hero's eyes, for setting into the teaser's ink. They open
 * while their section is on screen, or — inside anything marked
 * `data-look` — only while that says "true". Critters can make them follow
 * the cursor and shut when it's too close (`watch`). See soon.css.
 */
export default function InkEyes({
  className = "",
  tilt = 0,
  blink = 6,
  delay = 0,
  watch = false,
}: {
  className?: string;
  tilt?: number;
  /** seconds between blinks, so no two pairs blink together */
  blink?: number;
  /** how long after the rest these open */
  delay?: number;
  /** for Critters: follow the cursor, shut when it's close */
  watch?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      {...(watch ? { "data-eye": "" } : {})}
      className={`soon-inkeyes absolute ${className}`}
      style={{ rotate: `${tilt}deg`, "--d": `${delay}s` } as React.CSSProperties}
    >
      <svg viewBox="0 0 134 68" className="soon-loop" style={{ animationDuration: `${blink}s`, animationDelay: `${-delay * 3}s` }}>
        <g filter="url(#soon-eye-glow)">
          {EYES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </span>
  );
}

/**
 * The glow every pair of eyes sits in, defined once for the page. It's part
 * of what each pair draws, so it's drawn once with it — a glow done in CSS
 * (drop-shadow) was blurred again on every frame of every blink, for every
 * pair on screen. In the eyes' own units, so it scales with them.
 */
export function EyeGlow() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="pointer-events-none absolute">
      <defs>
        <filter id="soon-eye-glow" x="-60%" y="-120%" width="220%" height="340%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="near" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="far" />
          <feComponentTransfer in="near" result="nearSoft">
            <feFuncA type="linear" slope="0.6" />
          </feComponentTransfer>
          <feComponentTransfer in="far" result="farSoft">
            <feFuncA type="linear" slope="0.32" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="farSoft" />
            <feMergeNode in="nearSoft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
