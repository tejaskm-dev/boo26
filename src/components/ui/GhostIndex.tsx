/**
 * The section's own number, drawn enormous and hollow in the empty measure.
 *
 * These pages carry one idea and a lot of air, and the air was reading as
 * nothing rather than as room. An outlined numeral fills it with something
 * that belongs to the page — it says where you are, at a size that is clearly
 * decoration rather than a label competing with the heading.
 *
 * Stroked, never filled, so it sits behind the content as structure instead of
 * a second thing to read.
 */
export default function GhostIndex({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`ghost-index pointer-events-none absolute select-none ${className}`}
    >
      {children}
    </span>
  );
}
