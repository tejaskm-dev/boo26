/** The hero's narrowed cat eyes, drawn in a 134x68 box — the motif from the comps. */
const EYES = [
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
        {EYES.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
