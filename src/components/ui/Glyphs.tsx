/** Small drawn marks that belong to the identity — reused across sections. */

export function Sparkle({ className = "", ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      <path
        d="M12 0c1.1 7.1 4.9 10.9 12 12-7.1 1.1-10.9 4.9-12 12-1.1-7.1-4.9-10.9-12-12C7.1 10.9 10.9 7.1 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Eyes glowing out of a black field. Two cuts, both taken off the supplied
 * comp: `sly` is the narrowed pair on the cat-head silhouette, `wink` the
 * almond-and-crescent pair squinting out of the big field.
 */
export function GlowEyes({
  variant = "sly",
  className = "",
  glowId = "glow-eyes",
  opacity = 1,
}: {
  variant?: "sly" | "wink";
  className?: string;
  glowId?: string;
  opacity?: number;
}) {
  const box = variant === "sly" ? "0 0 134 68" : "0 0 200 124";
  return (
    <svg viewBox={box} className={className} aria-hidden="true" opacity={opacity}>
      <defs>
        <filter id={glowId} x="-70%" y="-90%" width="240%" height="280%">
          <feGaussianBlur stdDeviation="5" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="var(--color-lime)" filter={`url(#${glowId})`}>
        {variant === "sly" ? (
          <>
            <path d="M7 5 57 47C45 63 19 61 9 47 2 38 4 15 7 5Z" />
            <path d="M127 27 77 63C87 79 113 77 123 63 130 54 129 37 127 27Z" />
          </>
        ) : (
          <>
            <path d="M158 4C176 26 180 64 163 90 146 64 143 26 158 4Z" />
            <path d="M6 66C30 44 80 43 103 69 76 89 29 90 6 66Z" />
            <path d="M113 64C124 68 133 77 135 88 124 90 115 84 111 75Z" />
          </>
        )}
      </g>
    </svg>
  );
}

/** The ghost's outline, on a 64 x 60 box. The QR code's centre draws it too. */
export const GHOST_BODY =
  "M32 2c15 0 25 11 25 25 0 7-2 11-2 16s3 7 1 10-8 1-11-2-5-4-8-1-6 6-10 4-4-6-8-6-7 4-10 2-1-8 0-12-2-6-2-11C7 13 17 2 32 2Z";

/** The little melted ghost that shows up at the edge of a field. */
export function Ghost({
  className = "",
  on = "bone",
}: {
  className?: string;
  /** the field it sits on — the ghost takes the opposite ink */
  on?: "bone" | "ink";
}) {
  const body = on === "bone" ? "var(--color-ink)" : "var(--color-bone)";
  const eyes = on === "bone" ? "var(--color-bone)" : "var(--color-ink)";
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden="true">
      <path d={GHOST_BODY} fill={body} />
      <ellipse cx="24" cy="26" rx="4" ry="5.4" fill={eyes} />
      <ellipse cx="40" cy="26" rx="4" ry="5.4" fill={eyes} />
    </svg>
  );
}
