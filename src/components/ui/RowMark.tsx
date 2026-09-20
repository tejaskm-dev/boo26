/**
 * The stroke that wipes in behind a row on hover.
 *
 * Drawn, not filled: an uneven marker line with a thick round cap, so a row
 * lighting up reads as the same hand that drew the headline rather than a
 * highlight rectangle. It scales from the left under CSS control — this
 * component only supplies the shape.
 */
export default function RowMark({ seed = 0 }: { seed?: number }) {
  // three cuts of the same gesture, so a list never strokes identically twice
  const d = [
    "M4 22C58 9 122 30 196 17C270 4 330 27 396 15",
    "M4 18C64 31 128 8 198 21C268 34 332 11 396 24",
    "M4 25C52 12 118 26 190 14C262 2 336 25 396 13",
  ][seed % 3];

  return (
    <svg
      viewBox="0 0 400 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="row-mark w-[calc(100%+1.1rem)]"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={26}
        strokeLinecap="round"
      />
    </svg>
  );
}
